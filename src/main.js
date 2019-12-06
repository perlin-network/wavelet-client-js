import axios from "axios";
import atob from "atob";
import nacl from "tweetnacl";
import url from "url";
import { blake2b } from "blakejs";
import * as payloads from "./payloads";
import JSBI from "jsbi";
import JSONbig from "json-bigint";
import WebSocket from "websocket";
const WebSocketClient = WebSocket.w3cwebsocket;

const TAG_TRANSFER = 1;
const TAG_CONTRACT = 2;
const TAG_STAKE = 3;
const TAG_BATCH = 4;

if (typeof window === 'undefined') {
    var window = window || {};
    var global = global || window;
}
const BigInt = window && window.useNativeBigIntsIfAvailable ? BigInt : JSBI.BigInt;

/**
 * Converts a string to a Buffer.
 *
 * @param {string} str
 * @returns {ArrayBuffer}
 */
const str2ab = str => {
    const buf = new ArrayBuffer(str.length);
    const view = new Uint8Array(buf);
    for (var i = 0, len = str.length; i < len; i++) {
        view[i] = str.charCodeAt(i);
    }
    return buf;
};

DataView.prototype._setBigUint64 = DataView.prototype.setBigUint64;
DataView.prototype.setBigUint64 = function (byteOffset, value, littleEndian) {
    if (typeof value === 'bigint' && typeof this._setBigUint64 !== 'undefined') {
        this._setBigUint64(byteOffset, value, littleEndian);
    } else if (value.constructor === JSBI && typeof value.sign === 'bigint' && typeof this._setBigUint64 !== 'undefined') {
        this._setBigUint64(byteOffset, value.sign, littleEndian);
    } else if (value.constructor === JSBI || (value.constructor && typeof value.constructor.BigInt === 'function')) {
        let lowWord = value[0], highWord = value.length >= 2 ? value[1] : 0;

        this.setUint32(littleEndian ? byteOffset : byteOffset + 4, lowWord, littleEndian);
        this.setUint32(littleEndian ? byteOffset + 4 : byteOffset, highWord, littleEndian);
    } else {
        throw TypeError('Value needs to be BigInt or JSBI');
    }
}

DataView.prototype._getBigUint64 = DataView.prototype.getBigUint64;
DataView.prototype.getBigUint64 = function (byteOffset, littleEndian) {
    if (typeof this._getBigUint64 !== 'undefined' && window.useNativeBigIntsIfAvailable) {
        return this._getBigUint64(byteOffset, littleEndian);
    } else {
        let lowWord = this.getUint32(littleEndian ? byteOffset : byteOffset + 4, littleEndian);
        let highWord = this.getUint32(littleEndian ? byteOffset + 4 : byteOffset, littleEndian);

        const result = new JSBI(2, false);
        result.__setDigit(0, lowWord);
        result.__setDigit(1, highWord);
        return result;
    }
}

if (!global.TextDecoder) {
    global.TextDecoder = require("text-encoding").TextDecoder;
}

if (!ArrayBuffer.transfer) { // Polyfill just in-case.
    /**
     * The static ArrayBuffer.transfer() method returns a new ArrayBuffer whose contents have
     * been taken from the oldBuffer's data and then is either truncated or zero-extended by
     * newByteLength. If newByteLength is undefined, the byteLength of the oldBuffer is used.
     *
     * This operation leaves oldBuffer in a detached state.
     *
     * @param {Uint8Array} oldBuffer
     * @param {number} newByteLength
     * @returns {ArrayBufferLike}
     */
    ArrayBuffer.transfer = (oldBuffer, newByteLength) => {
        if (!(oldBuffer instanceof ArrayBuffer))
            throw new TypeError('Source must be an instance of ArrayBuffer');

        if (newByteLength <= oldBuffer.byteLength)
            return oldBuffer.slice(0, newByteLength);

        const destView = new Uint8Array(new ArrayBuffer(newByteLength));
        destView.set(new Uint8Array(oldBuffer));

        return destView.buffer;
    };
}



class Contract {
    /**
     * A Wavelet smart contract execution simulator.
     *
     * @param {Wavelet} client Client instance which is connected to a single Wavelet node.
     * @param {string} contract_id Hex-encoded ID of a smart contract.
     */
    constructor(client, contract_id) {
        this.client = client;
        this.contract_id = contract_id;

        this.contract_payload = {
            round_idx: BigInt(0),
            round_id: "0000000000000000000000000000000000000000000000000000000000000000",
            transaction_id: "0000000000000000000000000000000000000000000000000000000000000000",
            sender_id: "0000000000000000000000000000000000000000000000000000000000000000",
            amount: BigInt(0),
            params: new Uint8Array(new ArrayBuffer(0)),
        };

        this.decoder = new global.TextDecoder();

        this.result = null;
        this.logs = [];

        this.contract_payload_buf = payloads.rebuildContractPayload(this.contract_payload);
    }

    /**
     * Sets the consensus round index for all future simulated smart contract calls.
     *
     * @param {bigint} round_idx Consensus round index.
     */
    setRoundIndex(round_idx) {
        this.contract_payload.round_idx = round_idx;
    }

    /**
     * Sets the consensus round ID for all future simulated smart contract calls.
     *
     * @param {string} round_id A 64-letter hex-encoded consensus round ID.
     */
    setRoundID(round_id) {
        if (round_id.length !== 64) throw new Error("round id must be 64 letters and hex-encoded");
        this.contract_payload.round_id = round_id;
    }

    /**
     * Sets the ID of the transaction used to make all future simulated smart contract calls.
     *
     * @param {string} transaction_id A 64-letter ex-encoded transaction ID.
     */
    setTransactionID(transaction_id) {
        if (transaction_id.length !== 64) throw new Error("transaction id must be 64 letters and hex-encoded");
        this.contract_payload.transaction_id = transaction_id;
    }

    /**
     * Sets the sender ID for all future simulated smart contract calls.
     *
     * @param {string} sender_id A 64-letter hex-encoded sender wallet address ID.
     */
    setSenderID(sender_id) {
        if (sender_id.length !== 64) throw new Error("sender id must be 64 letters and hex-encoded");
        this.contract_payload.sender_id = sender_id;
    }

    /**
     * Simulates a call to the smart contract. init() must be called to initialize the WebAssembly VM
     * before calls may be performed against this specified smart contract.
     *
     * @param {string} func_name Name of the smart contract function to call.
     * @param {bigint} amount_to_send Amount of PERLs to send simultaneously to the smart contract
     *  while calling a function.
     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} func_params Variadic list of arguments.
     * @returns {{result: string|undefined, logs: Array<string>}}
     */
    test(wallet, func_name, amount_to_send, ...func_params) {
        if (this.vm === undefined) throw new Error("init() needs to be called before calling test()");

        func_name = "_contract_" + func_name;

        if (!(func_name in this.vm.instance.exports)) {
            throw new Error("could not find function in smart contract");
        }

        this.contract_payload.params = payloads.parseFunctionParams(...func_params);
        this.contract_payload.amount = amount_to_send;
        this.contract_payload.sender_id = Buffer.from(wallet.publicKey).toString("hex");
        this.contract_payload_buf = payloads.rebuildContractPayload(this.contract_payload);

        // Clone the current browser VM's memory.
        const copy = ArrayBuffer.transfer(this.vm.instance.exports.memory.buffer, this.vm.instance.exports.memory.buffer.byteLength);

        // Call the function.
        this.vm.instance.exports[func_name]();

        // Collect simulated execution results.
        const res = {result: this.result, logs: this.logs};

        // Reset the browser VM.
        new Uint8Array(this.vm.instance.exports.memory.buffer, 0, copy.byteLength).set(copy);

        // Reset all func_params and results and logs.
        this.contract_payload.params = new Uint8Array(new ArrayBuffer(0));
        this.result = null;
        this.logs = [];

        return res;
    }

    /**
     * Performs an official call to a specified smart contract function with a provided gas limit, and a variadic list
     * of arguments under a provided Wavelet wallet instance.
     *
     * @param wallet Wavelet wallet.
     * @param func_name Name of the smart contract function to call.
     * @param amount_to_send Amount of PERLs to send simultaneously to the smart contract while
     * calling a function.
     * @param gas_limit Gas limit to expend for invoking a smart contract function.
     * @param gas_deposit Amount of gas fees to deposit into the smart contract.
     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} func_params Variadic list of arguments.
     * @returns {Promise<Object>} Response from the Wavelet node.
     */
    async call(wallet, func_name, amount_to_send, gas_limit, gas_deposit, ...func_params) {
        return await this.client.transfer(wallet, this.contract_id, amount_to_send, gas_limit, gas_deposit, func_name, payloads.parseFunctionParams(...func_params));
    }

   

   

    /**
     * Fetches and re-loads the memory of the backing WebAssembly VM for this smart contract; optionally
     * growing the number of memory pages associated to the VM should there be not enough memory to hold
     * any new updates to the smart contracts memory. init() must be called before this function may be
     * called.
     *
     * @returns {Promise<void>}
     */
    async fetchAndPopulateMemoryPages() {
        if (this.vm === undefined) throw new Error("init() needs to be called before calling fetchAndPopulateMemoryPages()");

        const account = await this.client.getAccount(this.contract_id);
        const loaded_memory = await this.client.getMemoryPages(account.public_key, account.num_mem_pages);

        const num_mem_pages = this.vm.instance.exports.memory.buffer.byteLength / 65536;
        const num_loaded_mem_pages = loaded_memory.byteLength / 65536;
        if (num_mem_pages < num_loaded_mem_pages) {
            this.vm.instance.exports.memory.grow(num_loaded_mem_pages - num_mem_pages);
        }

        new Uint8Array(this.vm.instance.exports.memory.buffer, 0, loaded_memory.byteLength).set(loaded_memory);
    }

    /**
     * Downloads smart contract code from the Wavelet node if available, and initializes
     * a WebAssembly VM to simulate function calls against the contract.
     *
     * @returns {Promise<void>}
     */
    async init() {
        this.code = await this.client.getCode(this.contract_id);

        const imports = {
            env: {
                abort: () => {
                },
                _send_transaction: (tag, payload_ptr, payload_len) => {
                    const payload_view = new Uint8Array(this.vm.instance.exports.memory.buffer, payload_ptr, payload_len);
                    const payload = this.decoder.decode(payload_view);
                    console.log(`Sent transaction with tag ${tag} and payload ${params}.`);
                },
                _payload_len: () => {
                    return this.contract_payload_buf.byteLength;
                },
                _payload: payload_ptr => {
                    const view = new Uint8Array(this.vm.instance.exports.memory.buffer, payload_ptr, this.contract_payload_buf.byteLength);
                    view.set(this.contract_payload_buf);
                },
                _result: (ptr, len) => {
                    this.result = this.decoder.decode(new Uint8Array(this.vm.instance.exports.memory.buffer, ptr, len));
                },
                _log: (ptr, len) => {
                    const view = new Uint8Array(this.vm.instance.exports.memory.buffer, ptr, len);
                    this.logs.push(this.decoder.decode(view));
                },
                _verify_ed25519: () => {
                },
                _hash_blake2b_256: () => {
                },
                _hash_sha256: () => {
                },
                _hash_sha512: () => {
                },
            }
        };

        this.vm = await WebAssembly.instantiate(this.code, imports);
        await this.fetchAndPopulateMemoryPages();
    }
}

class Wavelet {
    /**
     * A client for interacting with the HTTP API of a Wavelet node.
     *
     * @param {string} host Address to the HTTP API of a Wavelet node.
     * @param {Object=} opts Default options to be passed for making any HTTP request calls using this client instance (optional).
     */
    constructor(host, opts = {}, useMoonlet = false) {
        this.host = host;
        this.initLastBlock();

        this.opts = {
            ...opts, 
            transformRequest: [(data, headers) => {
                headers.common = {};

                return data;
            }],
            transformResponse: [(data) => {
                return JSONbig.parse(data);
            }]
        };
    }

   
    async initLastBlock() {
        const { block } = await this.getNodeInfo();
        this.lastBlock = block.height;
    }
    /**
     * Query for information about the node you are connected to.
     *
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<Object>}
     */
    async getNodeInfo(opts) {
        return (await axios.get(`${this.host}/ledger`, {...this.opts, ...opts})).data;
    }

    /**
     * Query for details of a transaction.
     *
     * @param {string} id Hex-encoded transaction ID.
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<Object>}
     */
    async getTransaction(id, opts = {}) {
        return (await axios.get(`${this.host}/tx/${id}`, {...this.opts, ...opts})).data;
    }

    /**
     * Query for details of an account; whether it be a smart contract or a user.
     *
     * @param {string} id Hex-encoded account/smart contract address.
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<{public_key: string, nonce: bigint, balance: bigint, stake: bigint, reward: bigint, is_contract: boolean, num_mem_pages: bigint}>}
     */
    async getAccount(id, opts = {}) {
        const response = await axios.get(`${this.host}/accounts/${id}`, {...this.opts, ...opts});
        return response.data;
    }

    /**
     * Query for the raw WebAssembly code of a smart contract.
     *
     * @param string} id Hex-encoded ID of the smart contract.
     * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<Uint8Array>}
     */
    async getCode(id, opts = {}) {
        return new Uint8Array((await axios.get(`${this.host}/contract/${id}`, {
            ...this.opts, ...opts,
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        })).data);
    }

    /**
     * Query for the amalgamated WebAssembly VM memory of a given smart contract.
     *
     * @param {string} id Hex-encoded ID of the smart contract.
     * @param {number} num_mem_pages Number of memory pages the smart contract has.
     * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<Uint8Array>} The memory of the given smart contract, which may be used to
     *  initialize a WebAssembly VM with (either on browser/desktop).
     */
    async getMemoryPages(id, num_mem_pages, opts = {}) {
        if (num_mem_pages === 0) throw new Error("num pages cannot be zero");

        const memory = new Uint8Array(new ArrayBuffer(65536 * num_mem_pages));
        const reqs = [];

        for (let idx = 0; idx < num_mem_pages; idx++) {
            reqs.push((async () => {
                try {
                    const res = await axios.get(`${this.host}/contract/${id}/page/${idx}`, {
                        ...this.opts, ...opts,
                        responseType: 'arraybuffer',
                        responseEncoding: 'binary'
                    });

                    if (res.status === 200) {
                        const page = new Uint8Array(res.data);
                        memory.set(page, 65536 * idx);
                    }
                } catch (error) {
                }
            })());
        }

        await Promise.all(reqs);

        return memory;
    }

    /**
     * Transfer some amount of PERLs to a recipient, or invoke a function on
     * a smart contract should the recipient specified be a smart contract.
     *
     * @param {nacl.SignKeyPair} wallet
     * @param {string} recipient Hex-encoded recipient/smart contract address.
     * @param {bigint} amount Amount of PERLs to send.
     * @param {bigint=} gas_limit Gas limit to expend for invoking a smart contract function (optional).
     * @param {bigint=} gas_deposit Amount of gas to deposit into a smart contract (optional).
     * @param {string=} func_name Name of the function to invoke on a smart contract (optional).
     * @param {Uint8Array=} func_payload Binary-serialized parameters to be used to invoke a smart contract function (optional).
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<Object>}
     */
    async transfer(wallet, recipient, amount, gas_limit = BigInt(0), gas_deposit = BigInt(0), func_name = "", func_payload = new Uint8Array(new ArrayBuffer(0)), opts = {}) {
        
        const payload = this.generatePayload(TAG_TRANSFER, recipient, amount, gas_limit, gas_deposit, func_name, func_payload);
        
        return await this.sendTransaction(wallet, TAG_TRANSFER, payload, opts);
    }

    /**
     * Stake some amount of PERLs which is deducted from your wallets balance.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     * @param {bigint} amount Amount of PERLs to stake.
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async placeStake(wallet, amount, opts = {}) {
        const PLACE_STAKE = 1;
        const payload = this.generatePayload(TAG_STAKE, PLACE_STAKE, amount);

        return await this.sendTransaction(wallet, TAG_STAKE, payload, opts);
    }

    /**
     * Withdraw stake, which is immediately converted into PERLS into your balance.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     * @param {bigint} amount Amount of PERLs to withdraw from your stake.
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async withdrawStake(wallet, amount, opts = {}) {
        const WITHDRAW_STAKE = 0;

        const payload = this.generatePayload(TAG_STAKE, WITHDRAW_STAKE, amount);

        return await this.sendTransaction(wallet, TAG_STAKE, payload, opts);
    }

    /**
     * Request a withdrawal of reward; which after some number of consensus
     * rounds will then convert into PERLs into your balance.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     * @param {bigint} amount Amount of PERLs to request to withdraw from your rewards.
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async withdrawReward(wallet, amount, opts = {}) {
        const WITHDRAW_REWARD = 2;
        
        const payload = this.generatePayload(TAG_STAKE, WITHDRAW_REWARD, amount);

        return await this.sendTransaction(wallet, TAG_STAKE, payload, opts);
    }

    /**
     * Deploy a smart contract with a specified gas limit and set of parameters.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     * @param {Uint8Array} code Binary of your smart contracts WebAssembly code.
     * @param {bigint} gas_limit Gas limit to expend for creating your smart contract, and invoking its init() function.
     * @param {bigint=} gas_deposit Amount of gas fees to deposit into a smart contract.
     * @param {Object=} params Parameters to be used for invoking your smart contracts init() function.
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async deployContract(wallet, code, gas_limit, gas_deposit = 0, params = [], opts = {}) {
        const payload = this.generatePayload(TAG_CONTRACT, code, gas_limit, gas_deposit, params);

        return await this.sendTransaction(wallet, TAG_CONTRACT, payload, opts);
    }

    
    /**
     * Calculates the transaction fee based on the payload
     *
     * @param {Uint8Array} payload Binary payload of the transaction.
     * @returns {number}
     */
    calculateFee(tag, ...args) {
        const payload = this.generatePayload(tag, ...args);
        return payload.byteLength / 100 * 5;
    }


    /**
     * Generates payload based on the tag
     *
     * @param {number} tag Tag of the transaction.
     * @returns {Uint8Array}
     */
    generatePayload(tag, ...args) {
        switch(tag) {
            case TAG_TRANSFER: 
                return payloads.getTransfer(...args);
            case TAG_CONTRACT:
                return payloads.getContract(...args);
            case TAG_STAKE:
                return payloads.getStake(...args);
            default:
                throw Error(`No payload type found for ${tag}`);
        }
    }
    /**
     * Send a transaction on behalf of a specified wallet with a designated
     * tag and payload.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     * @param {number} tag Tag of the transaction.
     * @param {Uint8Array} payload Binary payload of the transaction.
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async sendTransaction(wallet, tag, payload, opts = {}) {
        const payload_hex = Buffer.from(payload).toString("hex");
        const sender = Buffer.from(wallet.publicKey).toString("hex");
        
        if (typeof this.lastBlock === "undefined") {
            await this.initLastBlock();
        }

        const nonce = Date.now();
        const block = this.lastBlock;
        
        const signPayload = payloads.getTransaction(tag, nonce, block, payload);
        const signature = Buffer.from(nacl.sign.detached(signPayload, wallet.secretKey)).toString("hex");

        const req = {
            sender, 
            block,
            nonce,
            tag,
            payload: payload_hex, 
            signature
        };

        const data = (await axios.post(`${this.host}/tx/send`, JSON.stringify(req), {...this.opts, ...opts})).data;
        return {
            ...data,
            get tx_id() {
                console.warn("tx_id will be dreprecated. Please use id.");
                return data.id
            }
        };
    }

    /**
     * Poll for updates to accounts.
     *
     * @param callbacks
     * @param {{id: string|undefined}} opts
     * @returns {Promise<WebSocketClient>} Websocket client.
     */
    async pollAccounts(callbacks = {}, opts = {}) {
        let params = {};
        if (opts && opts.id && typeof opts.id === "string" && opts.id.length === 64) params.id = opts.id;

        return await this.pollWebsocket('/poll/accounts', params, data => {
            if (!Array.isArray(data)) {
                data = [data];
            }
            if (callbacks && callbacks.onAccountUpdated) {
                data.forEach(item => {   
                    callbacks.onAccountUpdated(item)
                });
            }
        })
    }

    /**
     * Poll for updates to either all transactions in the ledger, or transactions made by a certain sender, or
     * transactions made by a certain creator, or transactions with a specific tag, or just a single transaction.
     *
     * @param callbacks
     * @param {{id: string|undefined, tag: number|undefined, sender: string|undefined, creator: string|undefined}} opts
     * @returns {Promise<WebSocketClient>} Websocket client.
     */
    async pollTransactions(callbacks = {}, opts = {}) {
        let params = {};
        if (opts && opts.id && typeof opts.id === "string" && opts.id.length === 64) params.id = opts.id;
        if (opts && opts.tag && typeof opts.tag === "number") params.tag = opts.tag;
        if (opts && opts.sender && typeof opts.sender === "string" && opts.sender.length === 64) params.sender = opts.sender;
        if (opts && opts.creator && typeof opts.creator === "string" && opts.creator.length === 64) params.creator = opts.creator;
        return await this.pollWebsocket('/poll/tx', params, data => {
            if (!Array.isArray(data)) {
                data = [data];
            }
            data.forEach(item => {
                switch (item.event) {
                    case "failed":
                    case "error":
                        if (callbacks && callbacks.onTransactionRejected) {
                            callbacks.onTransactionRejected(item);
                        }
                        break;
                    case "applied":
                        if (callbacks && callbacks.onTransactionApplied) {
                            callbacks.onTransactionApplied(item);
                        }
                        break;
                }
            });
        })
    }

    /**
     * Poll for finality of consensus rounds, or the pruning of consensus rounds.
     *
     * @param callbacks
     * @returns {Promise<WebSocketClient>} Websocket client.
     */
    async pollConsensus(callbacks = {}) {
        return await this.pollWebsocket('/poll/consensus', {}, data => {
            switch (data.event) {
                case "finalized":
                    this.lastBlock = data.new_block_height;
                    if (callbacks && callbacks.onRoundEnded) {
                        callbacks.onRoundEnded(data);
                    }
                    break;
                case "proposal":
                    this.lastBlock = data.block_index;
                    if (callbacks && callbacks.onRoundProposal) {
                        callbacks.onRoundProposal(data);
                    }
                    break;
            }
        });
    }

    /**
     * A generic setup function for listening for websocket events from a Wavelet node.
     *
     * @param {string} endpoint Websocket endpoint.
     * @param {Object=} params Query parameters to connect to the endpoint with.
     * @param {Object=} callback Callback function for each new event from the websocket.
     * @returns {Promise<WebSocketClient>} Websocket client.
     */
    pollWebsocket(endpoint, params = {}, callback = {}) {
        let info = url.parse(this.host);
        info.protocol = info.protocol === "https:" ? "wss:" : "ws:";
        info.pathname = endpoint;
        info.query = params;

        return new Promise((resolve, reject) => {
            const client = new WebSocketClient(url.format(info));

            client.onopen = () => {
                resolve(client);
            }

            client.onerror = () => {
                reject(new Error(`Failed to connect to ${url.format(info)}.`));
            };

            client.onmessage = msg => {
                if (typeof msg.data !== 'string') return;
                if (callback) callback(JSONbig.parse(msg.data));
            };
        });
    }

    /**
     * Randomly generate a new Wavelet wallet.
     *
     * @returns {nacl.SignKeyPair}
     */
    static generateNewWallet() {
        const c1 = 1;
        let generatedKeys;
        let checksum;
    
        const prefixLen = (buf) => {
            for (let i = 0; i < buf.length; i++) {
                const b = buf[i];
                if (b !== 0) {
                    // b.toString(2) removes leading 0s; so we just see how many were removed
                    const leadingZeros = 8 - b.toString(2).length;
    
                    return i * 8 + leadingZeros;
                }
            }
    
            return buf.length * 8 - 1;
        };
    
        do {
            generatedKeys = nacl.sign.keyPair();
    
            const id = blake2b(generatedKeys.publicKey, undefined, 32);
            checksum = blake2b(id, undefined, 32);
        } while (prefixLen(checksum) < c1);
    
        return generatedKeys;
    }

    /**
     * Load a Wavelet wallet given a hex-encoded private key.
     *
     * @param {string} private_key_hex Hex-encoded private key.
     * @returns {nacl.SignKeyPair} Wavelet wallet.
     */
    static loadWalletFromPrivateKey(private_key_hex) {
        return nacl.sign.keyPair.fromSecretKey(Buffer.from(private_key_hex, "hex"));
    }

    /**
     * Parse a transactions payload content into JSON.
     *
     * @param {(TAG_TRANSFER|TAG_CONTRACT|TAG_STAKE|TAG_BATCH)} tag Tag of a transaction.
     * @param {string} payload Binary-serialized payload of a transaction.
     * @returns {{amount: bigint, recipient: string}|{}|Array|{amount: bigint}} Decoded payload of a transaction.
     */
    static parseTransaction(tag, payload) {
        switch (tag) {
            case TAG_TRANSFER: {
                const buf = str2ab(atob(payload));

                if (buf.byteLength < 32 + 8) {
                    throw new Error("transfer: payload does not contain recipient id or amount");
                }

                const view = new DataView(buf);

                const recipient = Buffer.from(new Uint8Array(buf, 0, 32)).toString('hex');
                const amount = view.getBigUint64(32, true);

                let tx = {recipient, amount};

                if (buf.byteLength > 32 + 8) {
                    tx.gasLimit = view.getBigUint64(32 + 8, true);
                    tx.gasDeposit = view.getBigUint64(32 + 8 + 8, true);

                    const funcNameLen = view.getUint32(32 + 8 + 8 + 8, true);
                    tx.funcName = Buffer.from(new Uint8Array(buf, 32 + 8 + 8 + 8 + 4, funcNameLen)).toString("utf8");

                    const funcPayloadLen = view.getUint32(32 + 8 + 8 + 8 + 4 + funcNameLen, true);
                    tx.payload = Buffer.from(new Uint8Array(buf, 32 + 8 + 8 + 8 + 4 + funcNameLen + 4, funcPayloadLen));
                }

                return tx;
            }
            case TAG_CONTRACT: {
                const buf = str2ab(atob(payload));

                if (buf.byteLength < 12) {
                    throw new Error("contract: payload is malformed");
                }

                const view = new DataView(buf);

                let tx = {};

                tx.gasLimit = view.getBigUint64(0, true);
                tx.gasDeposit = view.getBigUint64(8, true);

                const payloadLen = view.getUint32(8 + 8, true);

                tx.payload = Buffer.from(new Uint8Array(buf, 8 + 8 + 4, payloadLen));
                tx.code = Buffer.from(new Uint8Array(buf, 8 + 8 + 4 + payloadLen));

                return tx;
            }
            case TAG_STAKE: {
                const buf = str2ab(atob(payload));

                if (buf.byteLength !== 9) {
                    throw new Error("stake: payload must be exactly 9 bytes");
                }

                const view = new DataView(buf);
                const opcode = view.getUint8(0);

                if (opcode < 0 || opcode > 2) {
                    throw new Error("stake: opcode must be between 0 to 2")
                }

                const amount = view.getBigUint64(1, true);

                let tx = {amount};

                switch (opcode) {
                    case 0:
                        tx.op = "withdraw_stake";
                        break;
                    case 1:
                        tx.op = "place_stake";
                        break;
                    case 2:
                        tx.op = "withdraw_reward";
                        break;
                }

                return tx;
            }
            case TAG_BATCH: {
                const buf = str2ab(atob(payload));
                const view = new DataView(buf);

                const len = view.getUint8(0);

                let transactions = [];

                for (let i = 0, offset = 1; i < len; i++) {
                    const tag = view.getUint8(offset);
                    offset += 1;

                    const payloadLen = view.getUint32(offset, true);
                    offset += 4;

                    const payload = Buffer.from(new Uint8Array(buf, offset, payloadLen));
                    offset += payloadLen;

                    transactions.push(this.parseTransaction(tag, payload));
                }

                return transactions;
            }
            default:
                throw new Error(`unknown tag type: ${tag}`);
        }
    }
}

export { Wavelet, Contract, TAG_TRANSFER, TAG_CONTRACT, TAG_STAKE, TAG_BATCH, JSBI };

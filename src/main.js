const axios = require("axios");
const atob = require("atob");
const nacl = require("tweetnacl");
const url = require("url");

const WebSocket = require("websocket");
const WebSocketClient = WebSocket.w3cwebsocket;

const TAG_NOP = 0;
const TAG_TRANSFER = 1;
const TAG_CONTRACT = 2;
const TAG_STAKE = 3;
const TAG_BATCH = 4;

const JSBI = require('jsbi');

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

class PayloadBuilder {
    /**
     * A payload builder made for easier handling of binary serialization of
     * data for Wavelet to ingest.
     */
    constructor() {
        this.buf = new ArrayBuffer(0);
        this.view = new DataView(this.buf);
        this.offset = 0;
    }

    /**
     * Resizes the underlying buffer should it not be large enough to handle
     * some chunk of data to be appended to buffer.
     *
     * @param {number} size Size of data to be appended to the buffer.
     */
    resizeIfNeeded(size) {
        if (this.offset + size > this.buf.byteLength) {
            this.buf = ArrayBuffer.transfer(this.buf, this.offset + size);
            this.view = new DataView(this.buf);
        }
    }

    /**
     * Write a single byte to the payload buffer.
     *
     * @param {number} n A single byte.
     */
    writeByte(n) {
        this.resizeIfNeeded(1);
        this.view.setUint8(this.offset, n);
        this.offset += 1;
    }

    /**
     * Write an signed little-endian 16-bit integer to the payload buffer.
     *
     * @param {number} n
     */
    writeInt16(n) {
        this.resizeIfNeeded(2);
        this.view.setInt16(this.offset, n, true);
        this.offset += 2;
    }

    /**
     * Write an signed little-endian 32-bit integer to the payload buffer.
     *
     * @param {number} n
     */
    writeInt32(n) {
        this.resizeIfNeeded(4);
        this.view.setInt32(this.offset, n, true);
        this.offset += 4;
    }

    /**
     * Write a signed little-endian 64-bit integer to the payload buffer.
     *
     * @param {bigint} n
     */
    writeInt64(n) {
        this.resizeIfNeeded(8);
        this.view.setBigInt64(this.offset, n, true);
        this.offset += 8;
    }

    /**
     * Write an unsigned little-endian 16-bit integer to the payload buffer.
     *
     * @param {number} n
     */
    writeUint16(n) {
        this.resizeIfNeeded(2);
        this.view.setUint16(this.offset, n, true);
        this.offset += 2;
    }

    /**
     * Write an unsigned little-endian 32-bit integer to the payload buffer.
     *
     * @param {number} n
     */
    writeUint32(n) {
        this.resizeIfNeeded(4);
        this.view.setUint32(this.offset, n, true);
        this.offset += 4;
    }

    /**
     * Write an unsigned little-endian 64-bit integer to the payload buffer.
     *
     * @param {bigint} n
     */
    writeUint64(n) {
        this.resizeIfNeeded(8);
        this.view.setBigUint64(this.offset, n, true);
        this.offset += 8;
    }

    /**
     * Write a series of bytes to the payload buffer.
     *
     * @param {ArrayBufferLike} buf
     */
    writeBytes(buf) {
        this.resizeIfNeeded(buf.byteLength);
        new Uint8Array(this.buf, this.offset, buf.byteLength).set(buf);
        this.offset += buf.byteLength;
    }

    /**
     * Returns the raw bytes of the payload buffer.
     *
     * @returns {Uint8Array}
     */
    getBytes() {
        return new Uint8Array(this.buf.slice(0, this.offset));
    }
}
/**
* Sets value for custom option key
*
* @param {bigint} round_idx Consensus round index.
*/
const SetOption = (key, value) => {
    return config => {
        config[key] = value;
    };
};

class Contract {

    static Amount(value) {
        return config => {
            config.amount = BigInt(value);
        };
    }

    static Recipient(value) {
        return config => {
            config.recipient = value;
        }
    }

    static ContractId(value) {
        return config => {
            config.contract_id = value;
        }
    }

    static GasLimit(value) {
        return config => {
            config.gas_limit = BigInt(value);
        };
    }

    static GasDeposit(value) {
        return config => {
            config.gas_deposit = BigInt(value);
        };
    }

    static Params(value) {
        return config => {
            config.params = value;
        };
    }

    static Int16(value) {
        return {
            type: 'int16',
            value
        }
    }
    static Int32(value) {
        return {
            type: 'int32',
            value
        }
    }
    static Int64(value) {
        return {
            type: 'int64',
            value: BigInt(value)
        }
    }
    static Uint16(value) {
        return {
            type: 'uint16',
            value
        }
    }
    static Uint32(value) {
        return {
            type: 'uint32',
            value
        }
    }
    static Uint64(value) {
        return {
            type: 'uint64',
            value
        }
    }
    static Byte(value) {
        return {
            type: 'byte',
            value
        }
    }

    static bytes(value) {
        return {
            type: 'bytes',
            value
        }
    }
    static string(value) {
        return {
            type: 'string',
            value
        }
    }

    static Raw(value) {
        return {
            type: 'raw',
            value
        };
    }
    /**
     * A Wavelet smart contract execution simulator.
     *
     * @param {Wavelet} client Client instance which is connected to a single Wavelet node.
     * @param {string} contract_id Hex-encoded ID of a smart contract.
     */
    constructor(client, ...opts) {
        this.client = client;
        opts.forEach(opt => {
            opt(this);
        });
        // this.contract_id = contract_id;

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

        this.rebuildContractPayload();
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
    test(wallet, func_name, ...opts) {

        const config = {
            gas_deposit: JSBI.BigInt(0),
            gas_limit: JSBI.BigInt(0),
            amount: JSBI.BigInt(0),
            params: [],
            sender_id: Buffer.from(wallet.publicKey).toString("hex")
        };
        opts.forEach(opt => {
            opt(config);
        });

        if (this.vm === undefined) throw new Error("init() needs to be called before calling test()");

        func_name = "_contract_" + func_name;

        if (!(func_name in this.vm.instance.exports)) {
            throw new Error("could not find function in smart contract");
        }

        this.contract_payload.params = this.parseFunctionParams(...config.params);
        this.contract_payload.amount = config.amount;
        this.contract_payload.sender_id = config.sender_id;
        this.rebuildContractPayload();

        // Clone the current browser VM's memory.
        const copy = ArrayBuffer.transfer(this.vm.instance.exports.memory.buffer, this.vm.instance.exports.memory.buffer.byteLength);

        // Call the function.
        this.vm.instance.exports[func_name]();

        // Collect simulated execution results.
        const res = { result: this.result, logs: this.logs };

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
    async call(wallet, func_name, ...opts) {
        // amount_to_send, gas_limit, gas_deposit, ...func_params
        const config = {
            func_name,
            recipient: this.contract_id,
            wallet,
            gas_deposit: JSBI.BigInt(0),
            gas_limit: JSBI.BigInt(0),
            amount: JSBI.BigInt(0),
            params: []
        };
        opts.forEach(opt => opt(config));
        config.params = this.parseFunctionParams(...config.params);

        return await this.client._send(config);
    }

    /**
     * Parses smart contract function parameters as a variadic list of arguments, and translates
     * them into an array of bytes suitable for passing on to a single smart contract invocation call.
     *
     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} params Variadic list of arguments.
     * @returns {Uint8Array} Parameters serialized into bytes.
     */
    parseFunctionParams(...params) {
        const builder = new PayloadBuilder();

        params.forEach(param => {
            switch (param.type) {
                case "int16":
                    builder.writeInt16(param.value);
                    break;
                case "int32":
                    builder.writeInt32(param.value);
                    break;
                case "int64":
                    builder.writeInt64(param.value);
                case "uint16":
                    builder.writeUint16(param.value);
                    break;
                case "uint32":
                    builder.writeUint32(param.value);
                    break;
                case "uint64":
                    builder.writeUint64(param.value);
                    break;
                case "byte":
                    builder.writeByte(param.value);
                    break;
                case "raw":
                    if (typeof param.value === "string") { // Assume that it is hex-encoded.
                        param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
                    }

                    builder.writeBytes(param.value);
                    break;
                case "bytes":
                    if (typeof param.value === "string") { // Assume that it is hex-encoded.
                        param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
                    }

                    builder.writeUint32(param.value.byteLength);
                    builder.writeBytes(param.value);
                    break;
                case "string":
                    builder.writeBytes(Buffer.from(param.value, 'utf8'));
                    builder.writeByte(0);
                    break;
            }
        });

        return builder.getBytes();
    }

    /**
     * Based on updates to simulation settings for this smart contract, re-build the
     * smart contracts payload.
     */
    rebuildContractPayload() {
        const builder = new PayloadBuilder();
        builder.writeUint64(this.contract_payload.round_idx);
        builder.writeBytes(Buffer.from(this.contract_payload.round_id, "hex"));
        builder.writeBytes(Buffer.from(this.contract_payload.transaction_id, "hex"));
        builder.writeBytes(Buffer.from(this.contract_payload.sender_id, "hex"));
        builder.writeUint64(this.contract_payload.amount);
        builder.writeBytes(this.contract_payload.params);

        this.contract_payload_buf = builder.getBytes();
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
    static Http(value) {
        return config => {
            config.http = value;
        };
    }
    static Amount(value) {
        return config => {
            config.amount = BigInt(value);
        };
    }
    static Creator(value) {
        return config => {
            config.creator = value;
        };
    }
    static Sender(value) {
        return config => {
            config.sender = value;
        };
    }
    static Tag(value) {
        return config => {
            config.tag = value;
        };
    }
    static Payload(value) {
        return config => {
            config.payload = value;
        };
    }
    static Id(value) {
        return config => {
            config.id = value;
        };
    }
    static TransactionApplied(fn) {
        return config => {
            config.onTransactionApplied = fn;
        };
    }
    static TransactionRejected(fn) {
        return config => {
            config.onTransactionRejected = fn;
        };
    }
    static RoundEnded(fn) {
        return config => {
            config.onRoundEnded = fn;
        };
    }
    static RoundPruned(fn) {
        return config => {
            config.onRoundPruned = fn;
        };
    }
    static AccountUpdated(fn) {
        return config => {
            config.onAccountUpdated = fn;
        };
    }

    /**
     * A client for interacting with the HTTP API of a Wavelet node.
     *
     * @param {string} host Address to the HTTP API of a Wavelet node.
     * @param {Object=} opts Default options to be passed for making any HTTP request calls using this client instance (optional).
     */
    constructor(host, ...opts) {
        this.host = host;

        opts.forEach(opt => {
            opt(this);
        });

        this.http = {
            ...this.http,
            transformRequest: [(data, headers) => {
                headers.common = {};

                return data
            }]
        };
    }

    /**
     * Query for information about the node you are connected to.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{http: Object=}} opts Options to be passed
     * @returns {Promise<Object>}
     */
    async getNodeInfo(...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));
        return (await axios.get(`${this.host}/ledger`, { ...this.http, ...config.http })).data;
    }

    /**
     * Query for details of a transaction.
     *
     * @param {string} id Hex-encoded transaction ID.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{http: Object=}} opts Options to be passed
     * @returns {Promise<Object>}
     */
    async getTransaction(id, ...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));

        return (await axios.get(`${this.host}/tx/${id}`, { ...this.http, ...config.http })).data;
    }

    /**
     * Query for details of an account; whether it be a smart contract or a user.
     *
     * @param {string} id Hex-encoded account/smart contract address.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{http: Object=}} opts Options to be passed
     * @returns {Promise<{public_key: string, nonce: bigint, balance: bigint, stake: bigint, reward: bigint, is_contract: boolean, num_mem_pages: bigint}>}
     */
    async getAccount(id, ...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));

        return (await axios.get(`${this.host}/accounts/${id}`, { ...this.http, ...config.http })).data;
    }

    /**
     * Query for the raw WebAssembly code of a smart contract.
     *
     * @param string} id Hex-encoded ID of the smart contract.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{http: Object=}} opts Options to be passed
     * @returns {Promise<Uint8Array>}
     */
    async getCode(id, ...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));

        return new Uint8Array((await axios.get(`${this.host}/contract/${id}`, {
            ...this.http, ...config.http,
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        })).data);
    }

    /**
     * Query for the amalgamated WebAssembly VM memory of a given smart contract.
     *
     * @param {string} id Hex-encoded ID of the smart contract.
     * @param {number} num_mem_pages Number of memory pages the smart contract has.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{http: Object}} opts
     * @returns {Promise<Uint8Array>} The memory of the given smart contract, which may be used to
     *  initialize a WebAssembly VM with (either on browser/desktop).
     */
    async getMemoryPages(id, num_mem_pages, ...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));

        if (num_mem_pages === 0) throw new Error("num pages cannot be zero");

        const memory = new Uint8Array(new ArrayBuffer(65536 * num_mem_pages));
        const reqs = [];

        for (let idx = 0; idx < num_mem_pages; idx++) {
            reqs.push((async () => {
                try {
                    const res = await axios.get(`${this.host}/contract/${id}/page/${idx}`, {
                        ...this.http, ...config.http,
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
     ** amount - Amount of PERLs to send.
     ** gas_limit - Gas limit to expend for invoking a smart contract function (optional).
     ** gas_deposit - Amount of gas to deposit into a smart contract (optional).
     ** func_name - Name of the function to invoke on a smart contract (optional).
     ** func_payload - Binary-serialized parameters to be used to invoke a smart contract function (optional).
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{func_payload: Uint8Array=, gas_deposit: bigint=, gas_limit: bigint=, amount: bigint=, http: Object=}} opts
     * @returns {Promise<Object>}
     */
    async transfer(wallet, recipient, ...opts) {

        const config = {
            recipient,
            wallet,
            http: {}
        };
        opts.forEach(opt => opt(config));
        return this._send(config);
    }

    async _send(config) {
        const builder = new PayloadBuilder();

        const {
            recipient,
            amount,
            gas_deposit = 0,
            gas_limit = 0,
            func_payload = new Uint8Array(new ArrayBuffer(0)),
            wallet
        } = config;

        let { func_name = "" } = config;

        builder.writeBytes(Buffer.from(recipient, "hex"));
        builder.writeUint64(amount);

        if (JSBI.GT(gas_limit, BigInt(0)) || func_name.length > 0 || func_payload.length > 0) {
            if (func_name.length === 0) { // Default to 'on_money_received' if no func name is specified.
                func_name = "on_money_received";
            }

            const func_name_buf = Buffer.from(func_name, 'utf8');
            const func_payload_buf = new Uint8Array(func_payload);

            builder.writeUint64(gas_limit);
            builder.writeUint64(gas_deposit);

            builder.writeUint32(func_name_buf.byteLength);
            builder.writeBytes(func_name_buf);

            builder.writeUint32(func_payload_buf.byteLength);
            builder.writeBytes(func_payload_buf);
        }

        return await this.sendTransaction(wallet, Wavelet.Tag(TAG_TRANSFER), Wavelet.Payload(builder.getBytes()), Wavelet.Http(config.http));
    }

    /**
     * Stake some amount of PERLs which is deducted from your wallets balance.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     ** amount - Amount of PERLs to place to your stake.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{amount: bigint, http: Object=}} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async placeStake(wallet, ...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));

        const builder = new PayloadBuilder();

        builder.writeByte(1);
        builder.writeUint64(config.amount);

        return await this.sendTransaction(wallet, Wavelet.Tag(TAG_STAKE), Wavelet.Payload(builder.getBytes()), Wavelet.Http(config.http));
    }

    /**
     * Withdraw stake, which is immediately converted into PERLS into your balance.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     ** amount - Amount of PERLs to withdraw from your stake.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{amount: bigint, http: Object=}} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async withdrawStake(wallet, ...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));

        const builder = new PayloadBuilder();

        builder.writeByte(0);
        builder.writeUint64(config.amount);

        return await this.sendTransaction(wallet, Wavelet.Tag(TAG_STAKE), Wavelet.Payload(builder.getBytes()), Wavelet.Http(config.http));
    }

    /**
     * Request a withdrawal of reward; which after some number of consensus
     * rounds will then convert into PERLs into your balance.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     ** amount - Amount of PERLs to request to withdraw from your rewards.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{amount: bigint, http: Object=}} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<*>}
     */
    async withdrawReward(wallet, ...opts) {
        const config = {
            http: {}
        };
        opts.forEach(opt => opt(config));

        const builder = new PayloadBuilder();

        builder.writeByte(2);
        builder.writeUint64(config.amount);

        return await this.sendTransaction(wallet, Wavelet.Tag(TAG_STAKE), Wavelet.Payload(builder.getBytes()), Wavelet.Http(config.http));
    }

    /**
     * Deploy a smart contract with a specified gas limit and set of parameters.
     *
     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
     * @param {Uint8Array} code Binary of your smart contracts WebAssembly code.
     ** gas_limit - Gas limit to expend for creating your smart contract, and invoking its init() function.
     ** gas_deposit - Amount of gas fees to deposit into a smart contract.
     ** params - Parameters to be used for invoking your smart contracts init() function.
     ** http - Options to be passed on for making the specified HTTP request call (optional).
     * @param {{gas_limit: bigint, gas_deposit: bigint=, params: Object=, http: Object= }} opts
     * @returns {Promise<*>}
     */
    async deployContract(wallet, code, ...opts) {

        const config = {
            recipient: this.contract_id,
            wallet,
            gas_deposit: JSBI.BigInt(0),
            gas_limit: JSBI.BigInt(0),
            params: [],
            http: {}
        };
        opts.forEach(opt => opt(config));

        config.params = new Uint8Array(config.params);
        code = new Uint8Array(code);

        const builder = new PayloadBuilder();

        builder.writeUint64(config.gas_limit);
        builder.writeUint64(config.gas_deposit);
        builder.writeUint32(config.params.byteLength);
        builder.writeBytes(config.params);
        builder.writeBytes(code);

        return await this.sendTransaction(wallet, Wavelet.Tag(TAG_CONTRACT), Wavelet.Payload(builder.getBytes()), Wavelet.Http(config.http));
    }

    /**
   * Send a transaction on behalf of a specified wallet with a designated
   * tag and payload.
   *
   * @param {nacl.SignKeyPair} wallet Wavelet wallet.
   ** tag - Tag of the transaction.
   ** payload - Binary payload of the transaction.
   ** dontSend - Flag to true to prevent request and get built payload
   ** http - Options to be passed on for making the specified HTTP request call (optional).
   * @param {tag: number, payload: Uint8Array, dontSend: boolean, http: Object=} opts
   * @returns {Promise<*>}
   */
    async sendTransaction(wallet, ...opts) {
        const builder = new PayloadBuilder();
        const config = {
            http: {},
            dontSend: false,
            sender: Buffer.from(wallet.publicKey).toString("hex")
        };

        opts.forEach(opt => opt(config));

        builder.writeUint64(BigInt(0));
        builder.writeByte(config.tag);
        builder.writeBytes(config.payload);

        if (dontSend) {
            return builder;
        }
        const req = {
            sender: config.sender,
            tag: config.tag,
            payload: Buffer.from(config.payload).toString("hex"),
            signature: Buffer.from(nacl.sign.detached(builder.getBytes(), wallet.secretKey)).toString("hex")
        };

        return (await axios.post(`${this.host}/tx/send`, JSON.stringify(req), { ...this.http, ...config.http })).data;
    }



    /**
     * Poll for updates to accounts.
     *
     * @param {{id: string|undefined, onAccountUpdated: Function}} opts
     * @returns {Promise<WebSocketClient>} Websocket client.
     */
    async pollAccounts(...opts) {
        const config = {
            params: {}
        };
        opts.forEach(opt => opt(config));

        if (config && config.id && typeof config.id === "string" && config.id.length === 64) config.params.id = config.id;

        return await this.pollWebsocket('/poll/accounts', config.params, data => {
            if (config.onAccountUpdated) {
                if (!Array.isArray(data)) {
                    data = [data];
                }
                data.forEach(item => config.onAccountUpdated(item));
            }
        })
    }

    /**
     * Poll for updates to either all transactions in the ledger, or transactions made by a certain sender, or
     * transactions made by a certain creator, or transactions with a specific tag, or just a single transaction.
     *
     * @param {{id: string|undefined, onTransactionApplied:, onTransactionRejected: Function, tag: number|undefined, sender: string|undefined, creator: string|undefined}} opts
     * @returns {Promise<WebSocketClient>} Websocket client.
     */
    async pollTransactions(...opts) {
        const config = {
            params: {}
        };
        opts.forEach(opt => opt(config));

        if (config && config.id && typeof config.id === "string" && config.id.length === 64) config.params.id = config.id;
        if (config && config.tag && typeof config.tag === "number") config.params.tag = config.tag;
        if (config && config.sender && typeof config.sender === "string" && config.sender.length === 64) config.params.sender = config.sender;
        if (config && config.creator && typeof config.creator === "string" && config.creator.length === 64) config.params.creator = config.creator;

        return await this.pollWebsocket('/poll/tx', config.params, data => {
            if (!Array.isArray(data)) {
                data = [data];
            }
            data.forEach(item => {
                switch (item.event) {
                    case "rejected":
                        if (config.onTransactionRejected) {
                            config.onTransactionRejected(item);
                        }
                        break;
                    case "applied":
                        if (config.onTransactionApplied) {
                            config.onTransactionApplied(item);
                        }
                        break;
                }
            });
        })
    }

    /**
     * Poll for finality of consensus rounds, or the pruning of consensus rounds.
     *
     * @param {{onRoundEnded: Function, onRoundPruned: Function}} opts
     * @returns {Promise<WebSocketClient>} Websocket client.
     */
    async pollConsensus(...opts) {
        const config = {};
        opts.forEach(opt => opt(config));
        return await this.pollWebsocket('/poll/consensus', {}, data => {
            switch (data.event) {
                case "round_end":
                    if (config.onRoundEnded) {
                        config.onRoundEnded(data);
                    }
                    break;
                case "prune":
                    if (config.onRoundPruned) {
                        config.onRoundPruned(data);
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
    pollWebsocket(endpoint, params = {}, callback) {
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
                if (callback) callback(JSON.parse(msg.data));
            };
        });
    }

    /**
     * Randomly generate a new Wavelet wallet.
     *
     * @returns {nacl.SignKeyPair}
     */
    static generateNewWallet() {
        return nacl.sign.keyPair();
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
     ** tag - Tag of the transaction.
     ** payload - Binary-serialized payload of a transaction.
     * @param {{payload: string, tag: (TAG_NOP|TAG_TRANSFER|TAG_CONTRACT|TAG_STAKE|TAG_BATCH)}} otps
     * @returns {{amount: bigint, recipient: string}|{}|Array|{amount: bigint}} Decoded payload of a transaction.
     */
    static parseTransaction(...opts) {
        const config = {
            payload: ""
        };
        opts.forEach(opt => opt(config));
        const { tag, payload } = config;

        switch (tag) {
            case TAG_NOP: {
                return {}
            }
            case TAG_TRANSFER: {
                const buf = str2ab(atob(payload));

                if (buf.byteLength < 32 + 8) {
                    throw new Error("transfer: payload does not contain recipient id or amount");
                }

                const view = new DataView(buf);

                const recipient = Buffer.from(new Uint8Array(buf, 0, 32)).toString('hex');
                const amount = view.getBigUint64(32, true);

                let tx = { recipient, amount };

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

                let tx = { amount };

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

                    transactions.push(this.parseTransaction(Wavelet.Tag(tag), Wavelet.Payload(payload)));
                }

                return transactions;
            }
            default:
                throw new Error(`unknown tag type: ${tag}`);
        }
    }
}

export default { PayloadBuilder, Wavelet, Contract, TAG_NOP, TAG_TRANSFER, TAG_CONTRACT, TAG_STAKE, TAG_BATCH, SetOption };

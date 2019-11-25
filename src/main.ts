import axios, { AxiosRequestConfig } from "axios";
import atob from "atob";
import nacl from "tweetnacl";
import url from "url";
import { blake2b } from "blakejs";
import JSBI from "jsbi";
import WebSocket from "websocket";
const WebSocketClient = WebSocket.w3cwebsocket;

const TAG_TRANSFER = 1;
const TAG_CONTRACT = 2;
const TAG_STAKE = 3;
const TAG_BATCH = 4;

if (typeof window === "undefined") {
  var window: any = window || {};
  var global: any = global || window;
}

const BigInt =
  window && window.useNativeBigIntsIfAvailable ? window.BigInt : JSBI.BigInt;

/**
 * Converts a string to a Buffer.
 */
const str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const view = new Uint8Array(buf);
  for (var i = 0, len = str.length; i < len; i++) {
    view[i] = str.charCodeAt(i);
  }
  return buf;
};

DataView.prototype._setBigUint64 = DataView.prototype.setBigUint64;
DataView.prototype.setBigUint64 = function(
  byteOffset: number,
  value: JSBI,
  littleEndian: boolean
) {
  if (typeof value === "bigint" && typeof this._setBigUint64 !== "undefined") {
    this._setBigUint64(byteOffset, value, littleEndian);
  } else if (
    value.constructor === JSBI &&
    typeof value["sign"] === "bigint" &&
    typeof this._setBigUint64 !== "undefined"
  ) {
    this._setBigUint64(byteOffset, value["sign"], littleEndian);
  } else if (
    value.constructor === JSBI ||
    (value.constructor && typeof value.constructor["BigInt"] === "function")
  ) {
    let lowWord = value[0],
      highWord = value["length"] >= 2 ? value[1] : 0;

    this.setUint32(
      littleEndian ? byteOffset : byteOffset + 4,
      lowWord,
      littleEndian
    );
    this.setUint32(
      littleEndian ? byteOffset + 4 : byteOffset,
      highWord,
      littleEndian
    );
  } else {
    throw TypeError("Value needs to be BigInt or JSBI");
  }
};

DataView.prototype._getBigUint64 = DataView.prototype.getBigUint64;
DataView.prototype.getBigUint64 = function(
  byteOffset: number,
  littleEndian: boolean
) {
  if (
    typeof this._getBigUint64 !== "undefined" &&
    window.useNativeBigIntsIfAvailable
  ) {
    return this._getBigUint64(byteOffset, littleEndian);
  } else {
    let lowWord = this.getUint32(
      littleEndian ? byteOffset : byteOffset + 4,
      littleEndian
    );
    let highWord = this.getUint32(
      littleEndian ? byteOffset + 4 : byteOffset,
      littleEndian
    );

    // @ts-ignore
    const result = new JSBI(2, false);
    result.__setDigit(0, lowWord);
    result.__setDigit(1, highWord);
    return result;
  }
};

if (!global.TextDecoder) {
  global.TextDecoder = require("text-encoding").TextDecoder;
}

if (!ArrayBuffer["transfer"]) {
  // Polyfill just in-case.
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
  ArrayBuffer["transfer"] = (
    oldBuffer: Uint8Array,
    newByteLength: number
  ): ArrayBuffer => {
    if (!(oldBuffer instanceof ArrayBuffer))
      throw new TypeError("Source must be an instance of ArrayBuffer");

    if (newByteLength <= oldBuffer.byteLength)
      return oldBuffer.slice(0, newByteLength);

    const destView = new Uint8Array(new ArrayBuffer(newByteLength));
    destView.set(new Uint8Array(oldBuffer));

    return destView.buffer;
  };
}

class PayloadBuilder {
  private buf: ArrayBuffer;
  private view: DataView;
  private offset: number;
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
   */
  resizeIfNeeded(size: number) {
    if (this.offset + size > this.buf.byteLength) {
      this.buf = ArrayBuffer["transfer"](this.buf, this.offset + size);
      this.view = new DataView(this.buf);
    }
  }

  /**
   * Write a single byte to the payload buffer.
   */
  writeByte(n: number) {
    this.resizeIfNeeded(1);
    this.view.setUint8(this.offset, n);
    this.offset += 1;
  }

  /**
   * Write an signed little-endian 16-bit integer to the payload buffer.
   */
  writeInt16(n: number) {
    this.resizeIfNeeded(2);
    this.view.setInt16(this.offset, n, true);
    this.offset += 2;
  }

  /**
   * Write an signed little-endian 32-bit integer to the payload buffer.
   */
  writeInt32(n: number) {
    this.resizeIfNeeded(4);
    this.view.setInt32(this.offset, n, true);
    this.offset += 4;
  }

  /**
   * Write a signed little-endian 64-bit integer to the payload buffer.
   */
  writeInt64(n: BigInt) {
    this.resizeIfNeeded(8);
    this.view.setBigInt64(this.offset, n as bigint, true);
    this.offset += 8;
  }

  /**
   * Write an unsigned little-endian 16-bit integer to the payload buffer.
   */
  writeUint16(n: number) {
    this.resizeIfNeeded(2);
    this.view.setUint16(this.offset, n, true);
    this.offset += 2;
  }

  /**
   * Write an unsigned little-endian 32-bit integer to the payload buffer.
   */
  writeUint32(n: number) {
    this.resizeIfNeeded(4);
    this.view.setUint32(this.offset, n, true);
    this.offset += 4;
  }

  /**
   * Write an unsigned little-endian 64-bit integer to the payload buffer.
   */
  writeUint64(n: BigInt) {
    this.resizeIfNeeded(8);
    this.view.setBigUint64(this.offset, n as bigint, true);
    this.offset += 8;
  }

  /**
   * Write a series of bytes to the payload buffer.
   */
  writeBytes(buf: Uint8Array) {
    this.resizeIfNeeded(buf.byteLength);
    new Uint8Array(this.buf, this.offset, buf.byteLength).set(buf);
    this.offset += buf.byteLength;
  }

  /**
   * Returns the raw bytes of the payload buffer.
   */
  getBytes(): Uint8Array {
    return new Uint8Array(this.buf.slice(0, this.offset));
  }
}

class Contract {
  private contract_payload_buf: Uint8Array;
  private client: Wavelet;
  private contract_id: string;
  private contract_payload: any;
  private decoder: TextDecoder;
  private result: any;
  private logs: any[];
  private code: any;
  public vm: any;
  /**
   * A Wavelet smart contract execution simulator.
   *
   * client - Client instance which is connected to a single Wavelet node.
   * contract_id - Hex-encoded ID of a smart contract.
   */
  constructor(client: Wavelet, contract_id: string) {
    this.client = client;
    this.contract_id = contract_id;

    this.contract_payload = {
      round_idx: BigInt(0),
      round_id:
        "0000000000000000000000000000000000000000000000000000000000000000",
      transaction_id:
        "0000000000000000000000000000000000000000000000000000000000000000",
      sender_id:
        "0000000000000000000000000000000000000000000000000000000000000000",
      amount: BigInt(0),
      params: new Uint8Array(new ArrayBuffer(0))
    };

    this.decoder = new global.TextDecoder();

    this.result = null;
    this.logs = [];

    this.rebuildContractPayload();
  }

  /**
   * Sets the consensus round index for all future simulated smart contract calls.
   *
   *  round_idx - Consensus round index.
   */
  setRoundIndex(round_idx: BigInt) {
    this.contract_payload.round_idx = round_idx;
  }

  /**
   * Sets the consensus round ID for all future simulated smart contract calls.
   *
   *  round_id - A 64-letter hex-encoded consensus round ID.
   */
  setRoundID(round_id: string) {
    if (round_id.length !== 64)
      throw new Error("round id must be 64 letters and hex-encoded");
    this.contract_payload.round_id = round_id;
  }

  /**
   * Sets the ID of the transaction used to make all future simulated smart contract calls.
   *
   *  transaction_id - A 64-letter ex-encoded transaction ID.
   */
  setTransactionID(transaction_id: string) {
    if (transaction_id.length !== 64)
      throw new Error("transaction id must be 64 letters and hex-encoded");
    this.contract_payload.transaction_id = transaction_id;
  }

  /**
   * Sets the sender ID for all future simulated smart contract calls.
   *
   * ¸sender_id - A 64-letter hex-encoded sender wallet address ID.
   */
  setSenderID(sender_id: string) {
    if (sender_id.length !== 64)
      throw new Error("sender id must be 64 letters and hex-encoded");
    this.contract_payload.sender_id = sender_id;
  }

  /**
   * Simulates a call to the smart contract. init() must be called to initialize the WebAssembly VM
   * before calls may be performed against this specified smart contract.
   *
   * func_name - Name of the smart contract function to call.
   * amount_to_send - Amount of PERLs to send simultaneously to the smart contract while calling a function.
   * func_params - Variadic list of arguments.
   */
  test(
    wallet: nacl.SignKeyPair,
    func_name: string,
    amount_to_send: BigInt,
    ...func_params: any[]
  ): IContractResult {
    if (this.vm === undefined)
      throw new Error("init() needs to be called before calling test()");

    func_name = "_contract_" + func_name;

    if (!(func_name in this.vm.instance.exports)) {
      throw new Error("could not find function in smart contract");
    }

    this.contract_payload.params = this.parseFunctionParams(...func_params);
    this.contract_payload.amount = amount_to_send;
    this.contract_payload.sender_id = Buffer.from(wallet.publicKey).toString(
      "hex"
    );
    this.rebuildContractPayload();

    // Clone the current browser VM's memory.
    const copy = ArrayBuffer["transfer"](
      this.vm.instance.exports.memory.buffer,
      this.vm.instance.exports.memory.buffer.byteLength
    );

    // Call the function.
    this.vm.instance.exports[func_name]();

    // Collect simulated execution results.
    const res = { result: this.result, logs: this.logs };

    // Reset the browser VM.
    new Uint8Array(
      this.vm.instance.exports.memory.buffer,
      0,
      copy.byteLength
    ).set(copy);

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
   * wallet - Wavelet wallet.
   * func_name - Name of the smart contract function to call.
   * amount_to_send - Amount of PERLs to send simultaneously to the smart contract while calling a function.
   * gas_limit - Gas limit to expend for invoking a smart contract function.
   * gas_deposit - Amount of gas fees to deposit into the smart contract.
   * func_params - Variadic list of arguments.
   */
  async call(
    wallet: nacl.SignKeyPair,
    func_name: string,
    amount_to_send: BigInt,
    gas_limit: BigInt,
    gas_deposit: BigInt,
    ...func_params: any[]
  ): Promise<Object> {
    return await this.client.transfer(
      wallet,
      this.contract_id,
      amount_to_send,
      gas_limit,
      gas_deposit,
      func_name,
      this.parseFunctionParams(...func_params)
    );
  }

  /**
   * Parses smart contract function parameters as a variadic list of arguments, and translates
   * them into an array of bytes suitable for passing on to a single smart contract invocation call.
   *
   * params - Variadic list of arguments.
   */
  parseFunctionParams(...params: IFunctionParam[]): Uint8Array {
    const builder = new PayloadBuilder();

    params.forEach((param: IFunctionParam) => {
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
          if (typeof param.value === "string") {
            // Assume that it is hex-encoded.
            param.value = new Uint8Array(
              param.value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))
            );
          }

          builder.writeBytes(param.value);
          break;
        case "bytes":
          if (typeof param.value === "string") {
            // Assume that it is hex-encoded.
            param.value = new Uint8Array(
              param.value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))
            );
          }

          builder.writeUint32(param.value.byteLength);
          builder.writeBytes(param.value);
          break;
        case "string":
          builder.writeBytes(Buffer.from(param.value, "utf8"));
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
    builder.writeBytes(
      Buffer.from(this.contract_payload.transaction_id, "hex")
    );
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
   */
  async fetchAndPopulateMemoryPages(): Promise<void> {
    if (this.vm === undefined)
      throw new Error(
        "init() needs to be called before calling fetchAndPopulateMemoryPages()"
      );

    const account = await this.client.getAccount(this.contract_id);
    const loaded_memory = await this.client.getMemoryPages(
      account.public_key,
      account.num_mem_pages
    );

    const num_mem_pages =
      this.vm.instance.exports.memory.buffer.byteLength / 65536;
    const num_loaded_mem_pages = loaded_memory.byteLength / 65536;
    if (num_mem_pages < num_loaded_mem_pages) {
      this.vm.instance.exports.memory.grow(
        num_loaded_mem_pages - num_mem_pages
      );
    }

    new Uint8Array(
      this.vm.instance.exports.memory.buffer,
      0,
      loaded_memory.byteLength
    ).set(loaded_memory);
  }

  /**
   * Downloads smart contract code from the Wavelet node if available, and initializes
   * a WebAssembly VM to simulate function calls against the contract.
   *
   */
  async init(): Promise<void> {
    this.code = await this.client.getCode(this.contract_id);

    const imports = {
      env: {
        abort: () => {},
        _send_transaction: (
          tag: number,
          payload_ptr: number,
          payload_len: number
        ) => {
          const payload_view = new Uint8Array(
            this.vm.instance.exports.memory.buffer,
            payload_ptr,
            payload_len
          );
          const payload = this.decoder.decode(payload_view);
          console.log(
            `Sent transaction with tag ${tag} and payload ${payload}.`
          );
        },
        _payload_len: () => {
          return this.contract_payload_buf.byteLength;
        },
        _payload: (payload_ptr: number) => {
          const view = new Uint8Array(
            this.vm.instance.exports.memory.buffer,
            payload_ptr,
            this.contract_payload_buf.byteLength
          );
          view.set(this.contract_payload_buf);
        },
        _result: (ptr: number, len: number) => {
          this.result = this.decoder.decode(
            new Uint8Array(this.vm.instance.exports.memory.buffer, ptr, len)
          );
        },
        _log: (ptr: number, len: number) => {
          const view = new Uint8Array(
            this.vm.instance.exports.memory.buffer,
            ptr,
            len
          );
          this.logs.push(this.decoder.decode(view));
        },
        _verify_ed25519: () => {},
        _hash_blake2b_256: () => {},
        _hash_sha256: () => {},
        _hash_sha512: () => {}
      }
    };

    this.vm = await WebAssembly.instantiate(this.code, imports);
    await this.fetchAndPopulateMemoryPages();
  }
}

class Wavelet {
  private host: string;
  private nonceCache: Object;
  private lastBlock: number;
  private opts: AxiosRequestConfig;
  /**
   * A client for interacting with the HTTP API of a Wavelet node.
   *
   * host - Address to the HTTP API of a Wavelet node.
   * opts - Default options to be passed for making any HTTP request calls using this client instance (optional).
   */
  constructor(host: string, opts: AxiosRequestConfig = {}) {
    this.host = host;
    this.nonceCache = {};
    this.lastBlock = 0;

    this.opts = {
      ...opts,
      transformRequest: [
        (data: any, headers: any) => {
          headers.common = {};

          return data;
        }
      ]
    };
  }

  /**
   * Query for information about the node you are connected to.
   *
   * opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async getNodeInfo(opts: AxiosRequestConfig = {}): Promise<Object> {
    return (await axios.get(`${this.host}/ledger`, { ...this.opts, ...opts }))
      .data;
  }

  /**
   * Query for details of a transaction.
   *
   * id - Hex-encoded transaction ID.
   * opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async getTransaction(
    id: string,
    opts: AxiosRequestConfig = {}
  ): Promise<Object> {
    return (await axios.get(`${this.host}/tx/${id}`, { ...this.opts, ...opts }))
      .data;
  }

  /**
   * Query for details of an account; whether it be a smart contract or a user.
   *
   * id - Hex-encoded account/smart contract address.
   * opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async getAccount(id: string, opts: AxiosRequestConfig = {}): Promise<any> {
    return (
      await axios.get(`${this.host}/accounts/${id}`, { ...this.opts, ...opts })
    ).data;
  }

  /**
   * Query for the raw WebAssembly code of a smart contract.
   *
   * id - Hex-encoded ID of the smart contract.
   * opts -  Options to be passed on for making the specified HTTP request call (optional).
   */
  async getCode(
    id: string,
    opts: AxiosRequestConfig = {}
  ): Promise<Uint8Array> {
    return new Uint8Array(
      (
        await axios.get(`${this.host}/contract/${id}`, {
          ...this.opts,
          ...opts,
          responseType: "arraybuffer",
          // @ts-ignore
          responseEncoding: "binary"
        })
      ).data
    );
  }

  /**
   * Query for the amalgamated WebAssembly VM memory of a given smart contract.
   *
   * id - Hex-encoded ID of the smart contract.
   * num_mem_pages - Number of memory pages the smart contract has.
   * opts - Options to be passed on for making the specified HTTP request call (optional).
   * Returns the memory of the given smart contract, which may be used to
   *  initialize a WebAssembly VM with (either on browser/desktop).
   */
  async getMemoryPages(
    id: string,
    num_mem_pages: number,
    opts: AxiosRequestConfig = {}
  ): Promise<Uint8Array> {
    if (num_mem_pages === 0) throw new Error("num pages cannot be zero");

    const memory = new Uint8Array(new ArrayBuffer(65536 * num_mem_pages));
    const reqs = [];

    for (let idx = 0; idx < num_mem_pages; idx++) {
      reqs.push(
        (async () => {
          try {
            const res = await axios.get(
              `${this.host}/contract/${id}/page/${idx}`,
              {
                ...this.opts,
                ...opts,
                responseType: "arraybuffer",
                // @ts-ignore
                responseEncoding: "binary"
              }
            );

            if (res.status === 200) {
              const page = new Uint8Array(res.data);
              memory.set(page, 65536 * idx);
            }
          } catch (error) {}
        })()
      );
    }

    await Promise.all(reqs);

    return memory;
  }

  /**
   * Get nonce and block value for an account.
   * This is required for sending transaction
   *
   * wallet - Wavelet wallet
   * opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async nonce(wallet: nacl.SignKeyPair, opts: AxiosRequestConfig = {}) {
    const account = Buffer.from(wallet.publicKey).toString("hex");
    const result = await axios.get(`${this.host}/nonce/${account}`, {
      ...this.opts,
      ...opts
    });
    return result.data;
  }
  /**
   * Transfer some amount of PERLs to a recipient, or invoke a function on
   * a smart contract should the recipient specified be a smart contract.
   *
   *  recipient - Hex-encoded recipient/smart contract address.
   *  amount - Amount of PERLs to send.
   *  gas_limit - Gas limit to expend for invoking a smart contract function (optional).
   *  gas_deposit - Amount of gas to deposit into a smart contract (optional).
   *  func_name - Name of the function to invoke on a smart contract (optional).
   *  func_payload - Binary-serialized parameters to be used to invoke a smart contract function (optional).
   *  opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async transfer(
    wallet: nacl.SignKeyPair,
    recipient: string,
    amount: BigInt,
    gas_limit: BigInt = BigInt(0),
    gas_deposit: BigInt = BigInt(0),
    func_name: string = "",
    func_payload: Uint8Array = new Uint8Array(new ArrayBuffer(0)),
    opts: AxiosRequestConfig = {}
  ): Promise<Object> {
    const builder = new PayloadBuilder();

    builder.writeBytes(Buffer.from(recipient, "hex"));
    builder.writeUint64(amount);

    if (
      JSBI.GT(gas_limit, BigInt(0)) ||
      func_name.length > 0 ||
      func_payload.length > 0
    ) {
      if (func_name.length === 0) {
        // Default to 'on_money_received' if no func name is specified.
        func_name = "on_money_received";
      }

      const func_name_buf = Buffer.from(func_name, "utf8");
      const func_payload_buf = new Uint8Array(func_payload);

      builder.writeUint64(gas_limit);
      builder.writeUint64(gas_deposit);

      builder.writeUint32(func_name_buf.byteLength);
      builder.writeBytes(func_name_buf);

      builder.writeUint32(func_payload_buf.byteLength);
      builder.writeBytes(func_payload_buf);
    }

    return await this.sendTransaction(
      wallet,
      TAG_TRANSFER,
      builder.getBytes(),
      opts
    );
  }

  /**
   * Stake some amount of PERLs which is deducted from your wallets balance.
   *
   * wallet - Wavelet wallet.
   * amount - Amount of PERLs to stake.
   * opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async placeStake(
    wallet: nacl.SignKeyPair,
    amount: BigInt,
    opts: AxiosRequestConfig = {}
  ) {
    const builder = new PayloadBuilder();

    builder.writeByte(1);
    builder.writeUint64(amount);

    return await this.sendTransaction(
      wallet,
      TAG_STAKE,
      builder.getBytes(),
      opts
    );
  }

  /**
   * Withdraw stake, which is immediately converted into PERLS into your balance.
   *
   *  wallet - Wavelet wallet.
   *  amount - Amount of PERLs to withdraw from your stake.
   *  opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async withdrawStake(
    wallet: nacl.SignKeyPair,
    amount: BigInt,
    opts: AxiosRequestConfig = {}
  ) {
    const builder = new PayloadBuilder();

    builder.writeByte(0);
    builder.writeUint64(amount);

    return await this.sendTransaction(
      wallet,
      TAG_STAKE,
      builder.getBytes(),
      opts
    );
  }

  /**
   * Request a withdrawal of reward; which after some number of consensus
   * rounds will then convert into PERLs into your balance.
   *
   *  wallet - Wavelet wallet.
   *  amount - Amount of PERLs to request to withdraw from your rewards.
   *  opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async withdrawReward(
    wallet: nacl.SignKeyPair,
    amount: BigInt,
    opts: AxiosRequestConfig = {}
  ): Promise<Object> {
    const builder = new PayloadBuilder();

    builder.writeByte(2);
    builder.writeUint64(amount);

    return await this.sendTransaction(
      wallet,
      TAG_STAKE,
      builder.getBytes(),
      opts
    );
  }

  /**
   * Deploy a smart contract with a specified gas limit and set of parameters.
   *
   *  wallet - Wavelet wallet.
   *  code - Binary of your smart contracts WebAssembly code.
   *  gas_limit - Gas limit to expend for creating your smart contract, and invoking its init() function.
   *  gas_deposit - Amount of gas fees to deposit into a smart contract.
   *  params - Parameters to be used for invoking your smart contracts init() function.
   *  opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async deployContract(
    wallet: nacl.SignKeyPair,
    code: Uint8Array,
    gas_limit: BigInt,
    gas_deposit: BigInt = BigInt(0),
    params: Uint8Array = new Uint8Array(),
    opts: AxiosRequestConfig = {}
  ): Promise<Object> {
    code = new Uint8Array(code);
    params = new Uint8Array(params);

    const builder = new PayloadBuilder();

    builder.writeUint64(gas_limit);
    builder.writeUint64(gas_deposit);
    builder.writeUint32(params.byteLength);
    builder.writeBytes(params);
    builder.writeBytes(code);

    return await this.sendTransaction(
      wallet,
      TAG_CONTRACT,
      builder.getBytes(),
      opts
    );
  }

  /**
   * Send a transaction on behalf of a specified wallet with a designated
   * tag and payload.
   *
   * wallet - Wavelet wallet.
   * tag - Tag of the transaction.
   * payload - Binary payload of the transaction.
   * opts - Options to be passed on for making the specified HTTP request call (optional).
   */
  async sendTransaction(
    wallet: nacl.SignKeyPair,
    tag: number,
    payload: Uint8Array,
    opts: AxiosRequestConfig = {}
  ): Promise<Object> {
    const payload_hex = Buffer.from(payload).toString("hex");
    const sender = Buffer.from(wallet.publicKey).toString("hex");
    const now = Date.now();
    const nonceCacheExpire = 3 * 60 * 1000; // expire nonce cache after 3 mins

    if (
      this.nonceCache[sender] &&
      now - this.nonceCache[sender].updated < nonceCacheExpire
    ) {
      this.nonceCache[sender].nonce++;
    } else {
      const { nonce, block } = await this.nonce(wallet);
      this.lastBlock = Math.max(this.lastBlock, block);

      this.nonceCache[sender] = {
        nonce,
        updated: Date.now()
      };
    }

    const builder = new PayloadBuilder();

    builder.writeUint64(BigInt(0));
    builder.writeByte(tag);
    builder.writeBytes(payload);

    const nonce = this.nonceCache[sender].nonce;
    const block = this.lastBlock;

    const message = Buffer.from([nonce, block, tag, ...builder.getBytes()]);
    const signature = Buffer.from(
      nacl.sign.detached(message, wallet.secretKey)
    ).toString("hex");

    const req = {
      sender,
      nonce,
      block,
      tag,
      payload: payload_hex,
      signature
    };

    const data = (
      await axios.post(`${this.host}/tx/send`, JSON.stringify(req), {
        ...this.opts,
        ...opts
      })
    ).data;
    return {
      ...data,
      get tx_id() {
        console.warn("tx_id will be dreprecated. Please use id.");
        return data.id;
      }
    };
  }

  /**
   * Poll for updates to accounts.
   *
   * returns Websocket client.
   */
  async pollAccounts(
    callbacks: IPollAccountsCallbacks,
    opts: { id: string | undefined } = { id: undefined }
  ): Promise<WebSocket.w3cwebsocket> {
    let params: any = {};
    if (opts && opts.id && typeof opts.id === "string" && opts.id.length === 64)
      params.id = opts.id;

    return await this.pollWebsocket("/poll/accounts", params, data => {
      if (callbacks && callbacks.onAccountUpdated) {
        if (!Array.isArray(data)) {
          data = [data];
        }
        data.forEach((item: any) => callbacks.onAccountUpdated(item));
      }
    });
  }

  /**
   * Poll for updates to either all transactions in the ledger, or transactions made by a certain sender, or
   * transactions made by a certain creator, or transactions with a specific tag, or just a single transaction.
   *
   * returns Websocket client.
   */
  async pollTransactions(
    callbacks: IPollTransactionsCallbacks,
    opts: IPollAccountsOptions = {}
  ) {
    let params: any = {};
    if (opts && opts.id && typeof opts.id === "string" && opts.id.length === 64)
      params.id = opts.id;
    if (opts && opts.tag && typeof opts.tag === "number") params.tag = opts.tag;
    if (
      opts &&
      opts.sender &&
      typeof opts.sender === "string" &&
      opts.sender.length === 64
    )
      params.sender = opts.sender;
    if (
      opts &&
      opts.creator &&
      typeof opts.creator === "string" &&
      opts.creator.length === 64
    )
      params.creator = opts.creator;
    return await this.pollWebsocket("/poll/tx", params, data => {
      if (!Array.isArray(data)) {
        data = [data];
      }
      data.forEach((item: any) => {
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
    });
  }

  /**
   * Poll for finality of consensus rounds, or the pruning of consensus rounds.
   *
   *  callback - Callback function for each new event from the websocket.
   *  returns Websocket client.
   */
  async pollConsensus(callbacks: IPollConsensusCallbacks) {
    return await this.pollWebsocket("/poll/consensus", {}, data => {
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
   *  endpoint - Websocket endpoint.
   *  params - Query parameters to connect to the endpoint with.
   *  callback - Callback function for each new event from the websocket.
   *  returns WebSocket client.
   */
  pollWebsocket(
    endpoint: string,
    params: IPollAccountsOptions = {},
    callback: PollWebsocketCallback
  ): Promise<WebSocket.w3cwebsocket> {
    let info: any = url.parse(this.host);
    info.protocol = info.protocol === "https:" ? "wss:" : "ws:";
    info.pathname = endpoint;
    info.query = params;

    return new Promise((resolve, reject) => {
      const client = new WebSocketClient(url.format(info));

      client.onopen = () => {
        resolve(client);
      };

      client.onerror = () => {
        reject(new Error(`Failed to connect to ${url.format(info)}.`));
      };

      client.onmessage = msg => {
        if (typeof msg.data !== "string") return;
        if (callback) {
          callback(JSON.parse(msg.data));
        }
      };
    });
  }

  /**
   * Randomly generate a new Wavelet wallet.
   */
  static generateNewWallet(): nacl.SignKeyPair {
    const c1 = 1;
    let generatedKeys;
    let checksum;

    const prefixLen = (buf: Uint8Array) => {
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
   * private_key_hex -  Hex-encoded private key.
   * returns Wavelet wallet.
   */
  static loadWalletFromPrivateKey(private_key_hex: string): nacl.SignKeyPair {
    return nacl.sign.keyPair.fromSecretKey(Buffer.from(private_key_hex, "hex"));
  }

  /**
   * Parse a transactions payload content into JSON.
   *
   * tag - Tag of a transaction.
   * payload - Binary-serialized payload of a transaction.
   */
  static parseTransaction(
    tag: number,
    payload: string | Buffer
  ): Object | void {
    const buf = typeof payload === "string" ? str2ab(atob(payload)) : payload;

    switch (tag) {
      case TAG_TRANSFER: {
        if (buf.byteLength < 32 + 8) {
          throw new Error(
            "transfer: payload does not contain recipient id or amount"
          );
        }

        const view = new DataView(buf);

        const recipient = Buffer.from(new Uint8Array(buf, 0, 32)).toString(
          "hex"
        );
        const amount = view.getBigUint64(32, true);

        let tx: any = { recipient, amount };

        if (buf.byteLength > 32 + 8) {
          tx.gasLimit = view.getBigUint64(32 + 8, true);
          tx.gasDeposit = view.getBigUint64(32 + 8 + 8, true);

          const funcNameLen = view.getUint32(32 + 8 + 8 + 8, true);
          tx.funcName = Buffer.from(
            new Uint8Array(buf, 32 + 8 + 8 + 8 + 4, funcNameLen)
          ).toString("utf8");

          const funcPayloadLen = view.getUint32(
            32 + 8 + 8 + 8 + 4 + funcNameLen,
            true
          );
          tx.payload = Buffer.from(
            new Uint8Array(
              buf,
              32 + 8 + 8 + 8 + 4 + funcNameLen + 4,
              funcPayloadLen
            )
          );
        }

        return tx;
      }
      case TAG_CONTRACT: {
        if (buf.byteLength < 12) {
          throw new Error("contract: payload is malformed");
        }

        const view = new DataView(buf);

        let tx: any = {};

        tx.gasLimit = view.getBigUint64(0, true);
        tx.gasDeposit = view.getBigUint64(8, true);

        const payloadLen = view.getUint32(8 + 8, true);

        tx.payload = Buffer.from(new Uint8Array(buf, 8 + 8 + 4, payloadLen));
        tx.code = Buffer.from(new Uint8Array(buf, 8 + 8 + 4 + payloadLen));

        return tx;
      }
      case TAG_STAKE: {
        if (buf.byteLength !== 9) {
          throw new Error("stake: payload must be exactly 9 bytes");
        }

        const view = new DataView(buf);
        const opcode = view.getUint8(0);

        if (opcode < 0 || opcode > 2) {
          throw new Error("stake: opcode must be between 0 to 2");
        }

        const amount = view.getBigUint64(1, true);

        let tx: any = { amount };

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

export default {
  Wavelet,
  Contract,
  TAG_TRANSFER,
  TAG_CONTRACT,
  TAG_STAKE,
  TAG_BATCH,
  Buffer,
  JSBI
};

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('core-js/modules/es6.regexp.to-string'), require('core-js/modules/es6.object.to-string'), require('core-js/modules/es6.regexp.match'), require('regenerator-runtime/runtime'), require('core-js/modules/es6.typed.uint8-array')) :
  typeof define === 'function' && define.amd ? define(['core-js/modules/es6.regexp.to-string', 'core-js/modules/es6.object.to-string', 'core-js/modules/es6.regexp.match', 'regenerator-runtime/runtime', 'core-js/modules/es6.typed.uint8-array'], factory) :
  (global = global || self, global['wavelet-client'] = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var axios = require("axios");

  var atob = require("atob");

  var nacl = require("tweetnacl");

  var url = require("url");

  var WebsocketClient = require("websocket").client;

  var TAG_NOP = 0;
  var TAG_TRANSFER = 1;
  var TAG_CONTRACT = 2;
  var TAG_STAKE = 3;
  var TAG_BATCH = 4;
  /**
   * Converts a string to a Buffer.
   *
   * @param {string} str
   * @returns {ArrayBuffer}
   */

  var str2ab = function str2ab(str) {
    var buf = new ArrayBuffer(str.length);
    var view = new Uint8Array(buf);

    for (var i = 0, len = str.length; JSBI.lessThan(i, len); _x = i, i = JSBI.add(i, JSBI.BigInt(1)), _x) {
      var _x;

      view[i] = str.charCodeAt(i);
    }

    return buf;
  };

  if (!global.TextDecoder) {
    global.TextDecoder = require("util").TextDecoder;
  }

  if (!ArrayBuffer.transfer) {
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
    ArrayBuffer.transfer = function (oldBuffer, newByteLength) {
      if (!(oldBuffer instanceof ArrayBuffer)) throw new TypeError('Source must be an instance of ArrayBuffer');
      if (JSBI.lessThanOrEqual(newByteLength, oldBuffer.byteLength)) return oldBuffer.slice(0, newByteLength);
      var destView = new Uint8Array(new ArrayBuffer(newByteLength));
      destView.set(new Uint8Array(oldBuffer));
      return destView.buffer;
    };
  }

  var PayloadBuilder =
  /*#__PURE__*/
  function () {
    /**
     * A payload builder made for easier handling of binary serialization of
     * data for Wavelet to ingest.
     */
    function PayloadBuilder() {
      _classCallCheck(this, PayloadBuilder);

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


    _createClass(PayloadBuilder, [{
      key: "resizeIfNeeded",
      value: function resizeIfNeeded(size) {
        if (JSBI.greaterThan(JSBI.add(this.offset, size), this.buf.byteLength)) {
          this.buf = ArrayBuffer.transfer(this.buf, JSBI.add(this.offset, size));
          this.view = new DataView(this.buf);
        }
      }
      /**
       * Write a single byte to the payload buffer.
       *
       * @param {number} n A single byte.
       */

    }, {
      key: "writeByte",
      value: function writeByte(n) {
        this.resizeIfNeeded(1);
        this.view.setUint8(this.offset, n);
        this.offset += 1;
      }
      /**
       * Write an signed little-endian 16-bit integer to the payload buffer.
       *
       * @param {number} n
       */

    }, {
      key: "writeInt16",
      value: function writeInt16(n) {
        this.resizeIfNeeded(2);
        this.view.setInt16(this.offset, n, true);
        this.offset += 2;
      }
      /**
       * Write an signed little-endian 32-bit integer to the payload buffer.
       *
       * @param {number} n
       */

    }, {
      key: "writeInt32",
      value: function writeInt32(n) {
        this.resizeIfNeeded(4);
        this.view.setInt32(this.offset, n, true);
        this.offset += 4;
      }
      /**
       * Write a signed little-endian 64-bit integer to the payload buffer.
       *
       * @param {bigint} n
       */

    }, {
      key: "writeInt64",
      value: function writeInt64(n) {
        this.resizeIfNeeded(8);
        this.view.setBigInt64(this.offset, n, true);
        this.offset += 8;
      }
      /**
       * Write an unsigned little-endian 16-bit integer to the payload buffer.
       *
       * @param {number} n
       */

    }, {
      key: "writeUint16",
      value: function writeUint16(n) {
        this.resizeIfNeeded(2);
        this.view.setUint16(this.offset, n, true);
        this.offset += 2;
      }
      /**
       * Write an unsigned little-endian 32-bit integer to the payload buffer.
       *
       * @param {number} n
       */

    }, {
      key: "writeUint32",
      value: function writeUint32(n) {
        this.resizeIfNeeded(4);
        this.view.setUint32(this.offset, n, true);
        this.offset += 4;
      }
      /**
       * Write an unsigned little-endian 64-bit integer to the payload buffer.
       *
       * @param {bigint} n
       */

    }, {
      key: "writeUint64",
      value: function writeUint64(n) {
        this.resizeIfNeeded(8);
        this.view.setBigUint64(this.offset, n, true);
        this.offset += 8;
      }
      /**
       * Write a series of bytes to the payload buffer.
       *
       * @param {ArrayBufferLike} buf
       */

    }, {
      key: "writeBytes",
      value: function writeBytes(buf) {
        var _x2, _y;

        this.resizeIfNeeded(buf.byteLength);
        new Uint8Array(this.buf, this.offset, buf.byteLength).set(buf);
        _x2 = this, _y = "offset", _x2[_y] = JSBI.add(_x2[_y], buf.byteLength);
      }
      /**
       * Returns the raw bytes of the payload buffer.
       *
       * @returns {Uint8Array}
       */

    }, {
      key: "getBytes",
      value: function getBytes() {
        return new Uint8Array(this.buf.slice(0, this.offset));
      }
    }]);

    return PayloadBuilder;
  }();

  var Contract =
  /*#__PURE__*/
  function () {
    /**
     * A Wavelet smart contract execution simulator.
     *
     * @param {Wavelet} client Client instance which is connected to a single Wavelet node.
     * @param {string} contract_id Hex-encoded ID of a smart contract.
     */
    function Contract(client, contract_id) {
      _classCallCheck(this, Contract);

      this.client = client;
      this.contract_id = contract_id;
      this.contract_payload = {
        round_idx: JSBI.BigInt(0),
        round_id: "0000000000000000000000000000000000000000000000000000000000000000",
        transaction_id: "0000000000000000000000000000000000000000000000000000000000000000",
        sender_id: "0000000000000000000000000000000000000000000000000000000000000000",
        amount: JSBI.BigInt(0),
        params: new Uint8Array(new ArrayBuffer(0))
      };
      this.decoder = new TextDecoder();
      this.result = null;
      this.logs = [];
      this.rebuildContractPayload();
    }
    /**
     * Sets the consensus round index for all future simulated smart contract calls.
     *
     * @param {bigint} round_idx Consensus round index.
     */


    _createClass(Contract, [{
      key: "setRoundIndex",
      value: function setRoundIndex(round_idx) {
        this.contract_payload.round_idx = round_idx;
      }
      /**
       * Sets the consensus round ID for all future simulated smart contract calls.
       *
       * @param {string} round_id A 64-letter hex-encoded consensus round ID.
       */

    }, {
      key: "setRoundID",
      value: function setRoundID(round_id) {
        if (round_id.length !== 64) throw new Error("round id must be 64 letters and hex-encoded");
        this.contract_payload.round_id = round_id;
      }
      /**
       * Sets the ID of the transaction used to make all future simulated smart contract calls.
       *
       * @param {string} transaction_id A 64-letter ex-encoded transaction ID.
       */

    }, {
      key: "setTransactionID",
      value: function setTransactionID(transaction_id) {
        if (transaction_id.length !== 64) throw new Error("transaction id must be 64 letters and hex-encoded");
        this.contract_payload.transaction_id = transaction_id;
      }
      /**
       * Sets the sender ID for all future simulated smart contract calls.
       *
       * @param {string} sender_id A 64-letter hex-encoded sender wallet address ID.
       */

    }, {
      key: "setSenderID",
      value: function setSenderID(sender_id) {
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

    }, {
      key: "test",
      value: function test(func_name, amount_to_send) {
        if (JSBI.equal(this.vm, undefined)) throw new Error("init() needs to be called before calling test()");
        func_name = JSBI.add("_contract_", func_name);

        if (!(func_name in this.vm.instance.exports)) {
          throw new Error("could not find function in smart contract");
        }

        for (var _len = arguments.length, func_params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _x3 = _key, _key = JSBI.add(_key, JSBI.BigInt(1)), _x3) {
          var _x3;

          func_params[_key - 2] = arguments[_key];
        }

        this.contract_payload.params = this.parseFunctionParams.apply(this, func_params);
        this.contract_payload.amount = amount_to_send;
        this.rebuildContractPayload(); // Clone the current browser VM's memory.

        var copy = ArrayBuffer.transfer(this.vm.instance.exports.memory.buffer, this.vm.instance.exports.memory.buffer.byteLength); // Call the function.

        this.vm.instance.exports[func_name](); // Collect simulated execution results.

        var res = {
          result: this.result,
          logs: this.logs
        }; // Reset the browser VM.

        new Uint8Array(this.vm.instance.exports.memory.buffer, 0, copy.byteLength).set(copy); // Reset all func_params and results and logs.

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
       * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} func_params Variadic list of arguments.
       * @returns {Promise<Object>} Response from the Wavelet node.
       */

    }, {
      key: "call",
      value: function () {
        var _call = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(wallet, func_name, amount_to_send, gas_limit) {
          var _len2,
              func_params,
              _key2,
              _x8,
              _args = arguments;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  for (_len2 = _args.length, func_params = new Array(_len2 > 4 ? _len2 - 4 : 0), _key2 = 4; _key2 < _len2; _x8 = _key2, _key2 = JSBI.add(_key2, JSBI.BigInt(1)), _x8) {
                    func_params[_key2 - 4] = _args[_key2];
                  }

                  _context.next = 3;
                  return this.client.transfer(wallet, this.contract_id, amount_to_send, gas_limit, func_name, this.parseFunctionParams.apply(this, func_params));

                case 3:
                  return _context.abrupt("return", _context.sent);

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function call(_x4, _x5, _x6, _x7) {
          return _call.apply(this, arguments);
        }

        return call;
      }()
      /**
       * Parses smart contract function parameters as a variadic list of arguments, and translates
       * them into an array of bytes suitable for passing on to a single smart contract invocation call.
       *
       * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} params Variadic list of arguments.
       * @returns {Uint8Array} Parameters serialized into bytes.
       */

    }, {
      key: "parseFunctionParams",
      value: function parseFunctionParams() {
        var builder = new PayloadBuilder();

        for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; JSBI.lessThan(_key3, _len3); _x9 = _key3, _key3 = JSBI.add(_key3, JSBI.BigInt(1)), _x9) {
          var _x9;

          params[_key3] = arguments[_key3];
        }

        params.forEach(function (param) {
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
              if (JSBI.equal(_typeof(param.value), "string")) {
                // Assume that it is hex-encoded.
                param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(function (h) {
                  return parseInt(h, 16);
                }));
              }

              builder.writeBytes(param.value);
              break;

            case "bytes":
              if (JSBI.equal(_typeof(param.value), "string")) {
                // Assume that it is hex-encoded.
                param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(function (h) {
                  return parseInt(h, 16);
                }));
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

    }, {
      key: "rebuildContractPayload",
      value: function rebuildContractPayload() {
        var builder = new PayloadBuilder();
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

    }, {
      key: "fetchAndPopulateMemoryPages",
      value: function () {
        var _fetchAndPopulateMemoryPages = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2() {
          var account, loaded_memory, num_mem_pages, num_loaded_mem_pages;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!JSBI.equal(this.vm, undefined)) {
                    _context2.next = 2;
                    break;
                  }

                  throw new Error("init() needs to be called before calling fetchAndPopulateMemoryPages()");

                case 2:
                  _context2.next = 4;
                  return this.client.getAccount(this.contract_id);

                case 4:
                  account = _context2.sent;
                  _context2.next = 7;
                  return this.client.getMemoryPages(account.public_key, account.num_mem_pages);

                case 7:
                  loaded_memory = _context2.sent;
                  num_mem_pages = this.vm.instance.exports.memory.buffer.byteLength / 65536;
                  num_loaded_mem_pages = loaded_memory.byteLength / 65536;

                  if (JSBI.lessThan(num_mem_pages, num_loaded_mem_pages)) {
                    this.vm.instance.exports.memory.grow(JSBI.subtract(num_loaded_mem_pages, num_mem_pages));
                  }

                  new Uint8Array(this.vm.instance.exports.memory.buffer, 0, loaded_memory.byteLength).set(loaded_memory);

                case 12:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function fetchAndPopulateMemoryPages() {
          return _fetchAndPopulateMemoryPages.apply(this, arguments);
        }

        return fetchAndPopulateMemoryPages;
      }()
      /**
       * Downloads smart contract code from the Wavelet node if available, and initializes
       * a WebAssembly VM to simulate function calls against the contract.
       *
       * @returns {Promise<void>}
       */

    }, {
      key: "init",
      value: function () {
        var _init = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3() {
          var _this = this;

          var imports;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return this.client.getCode(this.contract_id);

                case 2:
                  this.code = _context3.sent;
                  imports = {
                    env: {
                      abort: function abort() {},
                      _send_transaction: function _send_transaction(tag, payload_ptr, payload_len) {
                        var payload_view = new Uint8Array(_this.vm.instance.exports.memory.buffer, payload_ptr, payload_len);

                        var payload = _this.decoder.decode(payload_view);

                        console.log("Sent transaction with tag ".concat(tag, " and payload ").concat(params, "."));
                      },
                      _payload_len: function _payload_len() {
                        return _this.contract_payload_buf.byteLength;
                      },
                      _payload: function _payload(payload_ptr) {
                        var view = new Uint8Array(_this.vm.instance.exports.memory.buffer, payload_ptr, _this.contract_payload_buf.byteLength);
                        view.set(_this.contract_payload_buf);
                      },
                      _result: function _result(ptr, len) {
                        _this.result = _this.decoder.decode(new Uint8Array(_this.vm.instance.exports.memory.buffer, ptr, len));
                      },
                      _log: function _log(ptr, len) {
                        var view = new Uint8Array(_this.vm.instance.exports.memory.buffer, ptr, len);

                        _this.logs.push(_this.decoder.decode(view));
                      },
                      _verify_ed25519: function _verify_ed25519() {},
                      _hash_blake2b_256: function _hash_blake2b_256() {},
                      _hash_sha256: function _hash_sha256() {},
                      _hash_sha512: function _hash_sha512() {}
                    }
                  };
                  _context3.next = 6;
                  return WebAssembly.instantiate(this.code, imports);

                case 6:
                  this.vm = _context3.sent;
                  _context3.next = 9;
                  return this.fetchAndPopulateMemoryPages();

                case 9:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function init() {
          return _init.apply(this, arguments);
        }

        return init;
      }()
    }]);

    return Contract;
  }();

  var Wavelet =
  /*#__PURE__*/
  function () {
    /**
     * A client for interacting with the HTTP API of a Wavelet node.
     *
     * @param {string} host Address to the HTTP API of a Wavelet node.
     * @param {Object=} opts Default options to be passed for making any HTTP request calls using this client instance (optional).
     */
    function Wavelet(host) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Wavelet);

      this.host = host;
      this.opts = opts;
    }
    /**
     * Query for information about the node you are connected to.
     *
     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
     * @returns {Promise<Object>}
     */


    _createClass(Wavelet, [{
      key: "getNodeInfo",
      value: function () {
        var _getNodeInfo = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4(opts) {
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return axios.get("".concat(this.host, "/ledger"), _objectSpread({}, this.opts, opts));

                case 2:
                  return _context4.abrupt("return", _context4.sent.data);

                case 3:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function getNodeInfo(_x10) {
          return _getNodeInfo.apply(this, arguments);
        }

        return getNodeInfo;
      }()
      /**
       * Query for details of a transaction.
       *
       * @param {string} id Hex-encoded transaction ID.
       * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<Object>}
       */

    }, {
      key: "getTransaction",
      value: function () {
        var _getTransaction = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee5(id) {
          var opts,
              _args5 = arguments;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  opts = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
                  _context5.next = 3;
                  return axios.get("".concat(this.host, "/tx/").concat(id), _objectSpread({}, this.opts, opts));

                case 3:
                  return _context5.abrupt("return", _context5.sent.data);

                case 4:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function getTransaction(_x11) {
          return _getTransaction.apply(this, arguments);
        }

        return getTransaction;
      }()
      /**
       * Query for details of an account; whether it be a smart contract or a user.
       *
       * @param {string} id Hex-encoded account/smart contract address.
       * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<{public_key: string, nonce: bigint, balance: bigint, stake: bigint, reward: bigint, is_contract: boolean, num_mem_pages: bigint}>}
       */

    }, {
      key: "getAccount",
      value: function () {
        var _getAccount = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee6(id) {
          var opts,
              _args6 = arguments;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  opts = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
                  _context6.next = 3;
                  return axios.get("".concat(this.host, "/accounts/").concat(id), _objectSpread({}, this.opts, opts));

                case 3:
                  return _context6.abrupt("return", _context6.sent.data);

                case 4:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        function getAccount(_x12) {
          return _getAccount.apply(this, arguments);
        }

        return getAccount;
      }()
      /**
       * Query for the raw WebAssembly code of a smart contract.
       *
       * @param string} id Hex-encoded ID of the smart contract.
       * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<Uint8Array>}
       */

    }, {
      key: "getCode",
      value: function () {
        var _getCode = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee7(id) {
          var opts,
              _args7 = arguments;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  opts = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : {};
                  _context7.t0 = Uint8Array;
                  _context7.next = 4;
                  return axios.get("".concat(this.host, "/contract/").concat(id), _objectSpread({}, this.opts, opts, {
                    responseType: 'arraybuffer',
                    responseEncoding: 'binary'
                  }));

                case 4:
                  _context7.t1 = _context7.sent.data;
                  return _context7.abrupt("return", new _context7.t0(_context7.t1));

                case 6:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));

        function getCode(_x13) {
          return _getCode.apply(this, arguments);
        }

        return getCode;
      }()
      /**
       * Query for the amalgamated WebAssembly VM memory of a given smart contract.
       *
       * @param {string} id Hex-encoded ID of the smart contract.
       * @param {number} num_mem_pages Number of memory pages the smart contract has.
       * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<Uint8Array>} The memory of the given smart contract, which may be used to
       *  initialize a WebAssembly VM with (either on browser/desktop).
       */

    }, {
      key: "getMemoryPages",
      value: function () {
        var _getMemoryPages = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee8(id, num_mem_pages) {
          var opts,
              memory,
              idx,
              _x16,
              res,
              _args8 = arguments;

          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  opts = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : {};

                  if (!(num_mem_pages === 0)) {
                    _context8.next = 3;
                    break;
                  }

                  throw new Error("num pages cannot be zero");

                case 3:
                  memory = new Uint8Array(new ArrayBuffer(65536 * num_mem_pages));
                  idx = 0;

                case 5:
                  if (!(idx < num_mem_pages)) {
                    _context8.next = 18;
                    break;
                  }

                  _context8.prev = 6;
                  _context8.next = 9;
                  return axios.get("".concat(this.host, "/contract/").concat(id, "/page/").concat(idx), _objectSpread({}, this.opts, opts, {
                    responseType: 'arraybuffer',
                    responseEncoding: 'binary'
                  }));

                case 9:
                  res = _context8.sent;

                  if (res.status === 200) {
                    memory.set(res.data, 65536 * idx);
                  }

                  _context8.next = 15;
                  break;

                case 13:
                  _context8.prev = 13;
                  _context8.t0 = _context8["catch"](6);

                case 15:
                  _x16 = idx, idx = JSBI.add(idx, JSBI.BigInt(1)), _x16;
                  _context8.next = 5;
                  break;

                case 18:
                  return _context8.abrupt("return", memory);

                case 19:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8, this, [[6, 13]]);
        }));

        function getMemoryPages(_x14, _x15) {
          return _getMemoryPages.apply(this, arguments);
        }

        return getMemoryPages;
      }()
      /**
       * Transfer some amount of PERLs to a recipient, or invoke a function on
       * a smart contract should the recipient specified be a smart contract.
       *
       * @param {nacl.SignKeyPair} wallet
       * @param {string} recipient Hex-encoded recipient/smart contract address.
       * @param {bigint} amount Amount of PERLs to send.
       * @param {bigint=} gas_limit Gas limit to expend for invoking a smart contract function (optional).
       * @param {string=} func_name Name of the function to invoke on a smart contract (optional).
       * @param {Uint8Array=} func_payload Binary-serialized parameters to be used to invoke a smart contract function (optional).
       * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<Object>}
       */

    }, {
      key: "transfer",
      value: function () {
        var _transfer = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee9(wallet, recipient, amount) {
          var gas_limit,
              func_name,
              func_payload,
              opts,
              builder,
              func_name_buf,
              func_payload_buf,
              _args9 = arguments;
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  gas_limit = _args9.length > 3 && _args9[3] !== undefined ? _args9[3] : 0;
                  func_name = _args9.length > 4 && _args9[4] !== undefined ? _args9[4] : "";
                  func_payload = _args9.length > 5 && _args9[5] !== undefined ? _args9[5] : new Uint8Array(new ArrayBuffer(0));
                  opts = _args9.length > 6 && _args9[6] !== undefined ? _args9[6] : {};
                  builder = new PayloadBuilder();
                  builder.writeBytes(Buffer.from(recipient, "hex"));
                  builder.writeUint64(amount);

                  if (gas_limit > 0 || func_name.length > 0 || func_payload.length > 0) {
                    if (func_name.length === 0) {
                      // Default to 'on_money_received' if no func name is specified.
                      func_name = "on_money_received";
                    }

                    func_name_buf = Buffer.from(func_name, 'utf8');
                    func_payload_buf = new Uint8Array(func_payload);
                    builder.writeUint64(gas_limit);
                    builder.writeUint32(func_name_buf.byteLength);
                    builder.writeBytes(func_name_buf);
                    builder.writeUint32(func_payload_buf.byteLength);
                    builder.writeBytes(func_payload_buf);
                    console.log(func_name_buf, func_payload_buf);
                  }

                  _context9.next = 10;
                  return this.sendTransaction(wallet, TAG_TRANSFER, builder.getBytes(), opts);

                case 10:
                  return _context9.abrupt("return", _context9.sent);

                case 11:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee9, this);
        }));

        function transfer(_x17, _x18, _x19) {
          return _transfer.apply(this, arguments);
        }

        return transfer;
      }()
      /**
       * Stake some amount of PERLs which is deducted from your wallets balance.
       *
       * @param {nacl.SignKeyPair} wallet Wavelet wallet.
       * @param {bigint} amount Amount of PERLs to stake.
       * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<*>}
       */

    }, {
      key: "placeStake",
      value: function () {
        var _placeStake = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee10(wallet, amount) {
          var opts,
              builder,
              _args10 = arguments;
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  opts = _args10.length > 2 && _args10[2] !== undefined ? _args10[2] : {};
                  builder = new PayloadBuilder();
                  builder.writeByte(1);
                  builder.writeUint64(amount);
                  _context10.next = 6;
                  return this.sendTransaction(wallet, TAG_STAKE, builder.getBytes(), opts);

                case 6:
                  return _context10.abrupt("return", _context10.sent);

                case 7:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee10, this);
        }));

        function placeStake(_x20, _x21) {
          return _placeStake.apply(this, arguments);
        }

        return placeStake;
      }()
      /**
       * Withdraw stake, which is immediately converted into PERLS into your balance.
       *
       * @param {nacl.SignKeyPair} wallet Wavelet wallet.
       * @param {bigint} amount Amount of PERLs to withdraw from your stake.
       * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<*>}
       */

    }, {
      key: "withdrawStake",
      value: function () {
        var _withdrawStake = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee11(wallet, amount) {
          var opts,
              builder,
              _args11 = arguments;
          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  opts = _args11.length > 2 && _args11[2] !== undefined ? _args11[2] : {};
                  builder = new PayloadBuilder();
                  builder.writeByte(0);
                  builder.writeUint64(amount);
                  _context11.next = 6;
                  return this.sendTransaction(wallet, TAG_STAKE, builder.getBytes(), opts);

                case 6:
                  return _context11.abrupt("return", _context11.sent);

                case 7:
                case "end":
                  return _context11.stop();
              }
            }
          }, _callee11, this);
        }));

        function withdrawStake(_x22, _x23) {
          return _withdrawStake.apply(this, arguments);
        }

        return withdrawStake;
      }()
      /**
       * Request a withdrawal of reward; which after some number of consensus
       * rounds will then convert into PERLs into your balance.
       *
       * @param {nacl.SignKeyPair} wallet Wavelet wallet.
       * @param {bigint} amount Amount of PERLs to request to withdraw from your rewards.
       * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<*>}
       */

    }, {
      key: "withdrawReward",
      value: function () {
        var _withdrawReward = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee12(wallet, amount) {
          var opts,
              builder,
              _args12 = arguments;
          return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  opts = _args12.length > 2 && _args12[2] !== undefined ? _args12[2] : {};
                  builder = new PayloadBuilder();
                  builder.writeByte(2);
                  builder.writeUint64(amount);
                  _context12.next = 6;
                  return this.sendTransaction(wallet, TAG_STAKE, builder.getBytes(), opts);

                case 6:
                  return _context12.abrupt("return", _context12.sent);

                case 7:
                case "end":
                  return _context12.stop();
              }
            }
          }, _callee12, this);
        }));

        function withdrawReward(_x24, _x25) {
          return _withdrawReward.apply(this, arguments);
        }

        return withdrawReward;
      }()
      /**
       * Deploy a smart contract with a specified gas limit and set of parameters.
       *
       * @param {nacl.BoxKeyPair} wallet Wavelet wallet.
       * @param {Uint8Array} code Binary of your smart contracts WebAssembly code.
       * @param {bigint} gas_limit Gas limit to expend for creating your smart contract, and invoking its init() function.
       * @param {Object=} params Parameters to be used for invoking your smart contracts init() function.
       * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
       * @returns {Promise<*>}
       */

    }, {
      key: "deployContract",
      value: function () {
        var _deployContract = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee13(wallet, code, gas_limit) {
          var params,
              opts,
              builder,
              _args13 = arguments;
          return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  params = _args13.length > 3 && _args13[3] !== undefined ? _args13[3] : [];
                  opts = _args13.length > 4 && _args13[4] !== undefined ? _args13[4] : {};
                  code = new Uint8Array(code);
                  params = new Uint8Array(params);
                  builder = new PayloadBuilder();
                  builder.writeUint64(gas_limit);
                  builder.writeUint32(params.byteLength);
                  builder.writeBytes(params);
                  builder.writeBytes(code);
                  _context13.next = 11;
                  return this.sendTransaction(wallet, TAG_CONTRACT, builder.getBytes(), opts);

                case 11:
                  return _context13.abrupt("return", _context13.sent);

                case 12:
                case "end":
                  return _context13.stop();
              }
            }
          }, _callee13, this);
        }));

        function deployContract(_x26, _x27, _x28) {
          return _deployContract.apply(this, arguments);
        }

        return deployContract;
      }()
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

    }, {
      key: "sendTransaction",
      value: function () {
        var _sendTransaction = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee14(wallet, tag, payload) {
          var opts,
              payload_hex,
              builder,
              signature,
              sender,
              req,
              _args14 = arguments;
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  opts = _args14.length > 3 && _args14[3] !== undefined ? _args14[3] : {};
                  payload_hex = Buffer.from(payload).toString("hex");
                  builder = new PayloadBuilder();
                  builder.writeUint64(JSBI.BigInt(0));
                  builder.writeByte(tag);
                  builder.writeBytes(payload);
                  signature = Buffer.from(nacl.sign.detached(builder.getBytes(), wallet.secretKey)).toString("hex");
                  sender = Buffer.from(wallet.publicKey).toString("hex");
                  req = {
                    sender: sender,
                    tag: tag,
                    payload: payload_hex,
                    signature: signature
                  };
                  _context14.next = 11;
                  return axios.post("".concat(this.host, "/tx/send"), req, _objectSpread({}, this.opts, opts));

                case 11:
                  return _context14.abrupt("return", _context14.sent.data);

                case 12:
                case "end":
                  return _context14.stop();
              }
            }
          }, _callee14, this);
        }));

        function sendTransaction(_x29, _x30, _x31) {
          return _sendTransaction.apply(this, arguments);
        }

        return sendTransaction;
      }()
      /**
       * Poll for updates to accounts.
       *
       * @param callbacks
       * @param {{id: string|undefined}} opts
       */

    }, {
      key: "pollAccounts",
      value: function pollAccounts() {
        var callbacks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var params = {};
        if (opts && opts.id && JSBI.equal(_typeof(opts.id), "string") && opts.id.length === 64) params.id = opts.id;
        this.pollWebsocket('/poll/accounts', params, function (data) {
          if (callbacks && callbacks.onAccountUpdated) {
            callbacks.onAccountUpdated(data);
          }
        });
      }
      /**
       * Poll for updates to either all transactions in the ledger, or transactions made by a certain sender, or
       * transactions made by a certain creator, or transactions with a specific tag, or just a single transaction.
       *
       * @param callbacks
       * @param {{id: string|undefined, tag: number|undefined, sender: string|undefined, creator: string|undefined}} opts
       */

    }, {
      key: "pollTransactions",
      value: function pollTransactions() {
        var callbacks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var params = {};
        if (opts && opts.id && JSBI.equal(_typeof(opts.id), "string") && opts.id.length === 64) params.id = opts.id;
        if (opts && opts.tag && JSBI.equal(_typeof(opts.tag), "number")) params.tag = opts.tag;
        if (opts && opts.sender && JSBI.equal(_typeof(opts.sender), "string") && opts.sender.length === 64) params.sender = opts.sender;
        if (opts && opts.creator && JSBI.equal(_typeof(opts.creator), "string") && opts.creator.length === 64) params.creator = opts.creator;
        this.pollWebsocket('/poll/tx', params, function (data) {
          switch (data.event) {
            case "rejected":
              if (callbacks && callbacks.onTransactionRejected) {
                callbacks.onTransactionRejected(data);
              }

              break;

            case "applied":
              if (callbacks && callbacks.onTransactionApplied) {
                callbacks.onTransactionApplied(data);
              }

              break;
          }
        });
      }
      /**
       * Poll for finality of consensus rounds, or the pruning of consensus rounds.
       *
       * @param callbacks
       */

    }, {
      key: "pollConsensus",
      value: function pollConsensus() {
        var callbacks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.pollWebsocket('/poll/consensus', {}, function (data) {
          switch (data.event) {
            case "round_end":
              if (callbacks && callbacks.onRoundEnded) {
                callbacks.onRoundEnded(data);
              }

              break;

            case "prune":
              if (callbacks && callbacks.onRoundPruned) {
                callbacks.onRoundPruned(data);
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
       */

    }, {
      key: "pollWebsocket",
      value: function pollWebsocket(endpoint) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var info = url.parse(this.host);
        info.protocol = JSBI.equal(info.protocol, "https:") ? "wss:" : "ws:";
        info.pathname = endpoint;
        info.query = params;
        var client = new WebsocketClient();
        client.on('connect', function (conn) {
          conn.on('message', function (msg) {
            if (msg.type !== "utf8") return;
            if (callback) callback(JSON.parse(msg.utf8Data));
          });
        });
        client.connect(url.format(info));
      }
      /**
       * Randomly generate a new Wavelet wallet.
       *
       * @returns {nacl.SignKeyPair}
       */

    }], [{
      key: "generateNewWallet",
      value: function generateNewWallet() {
        return nacl.sign.keyPair();
      }
      /**
       * Load a Wavelet wallet given a hex-encoded private key.
       *
       * @param {string} private_key_hex Hex-encoded private key.
       * @returns {nacl.SignKeyPair} Wavelet wallet.
       */

    }, {
      key: "loadWalletFromPrivateKey",
      value: function loadWalletFromPrivateKey(private_key_hex) {
        return nacl.sign.keyPair.fromSecretKey(Buffer.from(private_key_hex, "hex"));
      }
      /**
       * Parse a transactions payload content into JSON.
       *
       * @param {(TAG_NOP|TAG_TRANSFER|TAG_CONTRACT|TAG_STAKE|TAG_BATCH)} tag Tag of a transaction.
       * @param {string} payload Binary-serialized payload of a transaction.
       * @returns {{amount: bigint, recipient: string}|{}|Array|{amount: bigint}} Decoded payload of a transaction.
       */

    }, {
      key: "parseTransaction",
      value: function parseTransaction(tag, payload) {
        switch (tag) {
          case TAG_NOP:
            {
              return {};
            }

          case TAG_TRANSFER:
            {
              var buf = str2ab(atob(params));

              if (buf.byteLength < 32 + 8) {
                throw new Error("transfer: payload does not contain recipient id or amount");
              }

              var view = new DataView(buf);
              var recipient = Buffer.from(new Uint8Array(buf, 0, 32)).toString('hex');
              var amount = view.getBigUint64(32, true);
              var tx = {
                recipient: recipient,
                amount: amount
              };

              if (buf.byteLength > 32 + 8) {
                tx.gasLimit = view.getBigUint64(32 + 8, true);
                var funcNameLen = view.getUint32(32 + 8 + 8, true);
                tx.funcName = Buffer.from(new Uint8Array(buf, 32 + 8 + 8 + 4, funcNameLen)).toString("utf8");
                var funcPayloadLen = view.getUint32(32 + 8 + 8 + 4 + funcNameLen, true);
                tx.payload = Buffer.from(new Uint8Array(buf, 32 + 8 + 8 + 4 + funcNameLen + 4, funcPayloadLen));
              }

              return tx;
            }

          case TAG_CONTRACT:
            {
              var _buf = str2ab(atob(params));

              if (_buf.byteLength < 12) {
                throw new Error("contract: payload is malformed");
              }

              var _view = new DataView(_buf);

              var _tx = {};
              _tx.gasLimit = _view.getBigUint64(0, true);

              var payloadLen = _view.getUint32(8, true);

              _tx.payload = Buffer.from(new Uint8Array(_buf, 8 + 4, payloadLen));
              _tx.code = Buffer.from(new Uint8Array(_buf, 8 + 4 + payloadLen));
              return _tx;
            }

          case TAG_STAKE:
            {
              var _buf2 = str2ab(atob(params));

              if (_buf2.byteLength !== 9) {
                throw new Error("stake: payload must be exactly 9 bytes");
              }

              var _view2 = new DataView(_buf2);

              var opcode = _view2.getUint8(0);

              if (opcode < 0 || opcode > 2) {
                throw new Error("stake: opcode must be between 0 to 2");
              }

              var _amount = _view2.getBigUint64(1, true);

              var _tx2 = {
                amount: _amount
              };

              switch (opcode) {
                case 0:
                  _tx2.op = "withdraw_stake";
                  break;

                case 1:
                  _tx2.op = "place_stake";
                  break;

                case 2:
                  _tx2.op = "withdraw_reward";
                  break;
              }

              return _tx2;
            }

          case TAG_BATCH:
            {
              var _buf3 = str2ab(atob(params));

              var _view3 = new DataView(_buf3);

              var len = _view3.getUint8(0);

              var transactions = [];

              for (var i = 0, offset = 1; JSBI.lessThan(i, len); _x32 = i, i = JSBI.add(i, JSBI.BigInt(1)), _x32) {
                var _x32;

                var _tag = _view3.getUint8(offset);

                offset += 1;

                var _payloadLen = _view3.getUint32(offset, true);

                offset += 4;

                var _payload2 = Buffer.from(new Uint8Array(_buf3, offset, _payloadLen));

                offset = JSBI.add(offset, _payloadLen);
                transactions.push(this.parseTransaction(_tag, params));
              }

              return transactions;
            }

          default:
            throw new Error("unknown tag type: ".concat(tag));
        }
      }
    }]);

    return Wavelet;
  }();

  var main = {
    Wavelet: Wavelet,
    Contract: Contract,
    TAG_NOP: TAG_NOP,
    TAG_TRANSFER: TAG_TRANSFER,
    TAG_CONTRACT: TAG_CONTRACT,
    TAG_STAKE: TAG_STAKE,
    TAG_BATCH: TAG_BATCH
  };

  return main;

}));

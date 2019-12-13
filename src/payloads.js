import PayloadBuilder from "./payload-builder";
import { toBufferBE } from "bigint-buffer";
import JSBI from "jsbi";

if (typeof window === 'undefined') {
    var window = window || {};
    var global = global || window;
}
const BigInt =
    window && window.useNativeBigIntsIfAvailable ? BigInt : JSBI.BigInt;

export const normalizeNumber = value => {
    if (typeof value !== "bigint" || value.constructor !== JSBI) {
        return BigInt(value);
    }
    value;
};

export const getTransfer = (
    recipient,
    amount,
    gas_limit = 0,
    gas_deposit = 0,
    func_name = "",
    func_payload = new Uint8Array(new ArrayBuffer(0))
) => {
    const builder = new PayloadBuilder();

    builder.writeBytes(Buffer.from(recipient, "hex"));

    amount = normalizeNumber(amount);
    gas_limit = normalizeNumber(gas_limit);
    gas_deposit = normalizeNumber(gas_deposit);

    builder.writeUint64(amount);

    if (
        JSBI.GT(gas_limit, BigInt(0)) ||
        func_name.length > 0 ||
        func_payload.length > 0
    ) {
        if (func_name.length === 0 && JSBI.GT(amount, BigInt(0))) {
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

    const payload = builder.getBytes();
    return payload;
};

export const getContract = (code, gas_limit = 0, gas_deposit = 0, params = []) => {
    gas_limit = normalizeNumber(gas_limit);
    gas_deposit = normalizeNumber(gas_deposit);

    code = new Uint8Array(code);
    params = new Uint8Array(params);

    const builder = new PayloadBuilder();

    builder.writeUint64(gas_limit);
    builder.writeUint64(gas_deposit);
    builder.writeUint32(params.byteLength);
    builder.writeBytes(params);
    builder.writeBytes(code);

    const payload = builder.getBytes();
    return payload;
};

export const getStake = (stakeByte, amount = 0) => {
    amount = normalizeNumber(amount);

    const builder = new PayloadBuilder();

    builder.writeByte(stakeByte);
    builder.writeUint64(amount);

    const payload = builder.getBytes();
    return payload;
};

/**
 * Parses smart contract function parameters as a variadic list of arguments, and translates
 * them into an array of bytes suitable for passing on to a single smart contract invocation call.
 *
 * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} params Variadic list of arguments.
 * @returns {Uint8Array} Parameters serialized into bytes.
 */
export const parseFunctionParams = (...params) => {
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
                if (typeof param.value === "string") {
                    // Assume that it is hex-encoded.
                    param.value = new Uint8Array(
                        param.value
                            .match(/[\da-f]{2}/gi)
                            .map(h => parseInt(h, 16))
                    );
                }

                builder.writeBytes(param.value);
                break;
            case "bytes":
                if (typeof param.value === "string") {
                    // Assume that it is hex-encoded.
                    param.value = new Uint8Array(
                        param.value
                            .match(/[\da-f]{2}/gi)
                            .map(h => parseInt(h, 16))
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

    const payload = builder.getBytes();
    return payload;
};

export const getTransaction = (tag, nonce, block, innerPayload) => {
    const binNonce = toBufferBE(nonce, 8);
    const binBlock = toBufferBE(block, 8);
    const builder = new PayloadBuilder();

    builder.writeBytes(binNonce);
    builder.writeBytes(binBlock);
    builder.writeByte(tag);
    builder.writeBytes(innerPayload);

    const payload = builder.getBytes();
    return payload;
};

/**
 * Based on updates to simulation settings for this smart contract, re-build the
 * smart contracts payload.
 */
export const rebuildContractPayload = contract_payload => {
    const builder = new PayloadBuilder();
    builder.writeUint64(contract_payload.round_idx);
    builder.writeBytes(Buffer.from(contract_payload.round_id, "hex"));
    builder.writeBytes(Buffer.from(contract_payload.transaction_id, "hex"));
    builder.writeBytes(Buffer.from(contract_payload.sender_id, "hex"));
    builder.writeUint64(contract_payload.amount);
    builder.writeBytes(contract_payload.params);

    const payload = builder.getBytes();
    return payload;
};

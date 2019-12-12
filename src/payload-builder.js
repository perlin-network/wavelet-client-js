export default class PayloadBuilder {
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
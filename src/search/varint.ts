/**
 * Variable-Length Integer (LEB128) — ported from ultracode.zig/src/search/varint.zig
 *
 * Encodes/decodes unsigned 32-bit integers using LEB128 format:
 * - 7 data bits per byte, MSB = continuation flag
 * - 1 byte for 0-127, 2 bytes for 128-16383, etc. (max 5 bytes for u32)
 *
 * Used for delta-compressed posting lists in the trigram index.
 * Delta encoding: store differences between sorted file IDs instead of absolute values.
 * Example: [3, 7, 15, 100] → deltas [3, 4, 8, 85] → much smaller LEB128 encoding.
 */

/**
 * Encode a u32 value into buf using LEB128.
 * @returns Number of bytes written (1-5)
 */
export function encode(value: number, buf: Uint8Array, offset = 0): number {
  let v = value >>> 0; // ensure u32
  let i = offset;
  while (true) {
    const byte = v & 0x7f;
    v >>>= 7;
    if (v === 0) {
      buf[i] = byte;
      return i - offset + 1;
    }
    buf[i] = byte | 0x80;
    i++;
  }
}

/**
 * Decode a LEB128-encoded u32 from buf.
 * @returns { value, bytesConsumed }
 */
export function decode(buf: Uint8Array, offset = 0): { value: number; len: number } {
  let result = 0;
  let shift = 0;
  for (let i = offset; i < buf.length; i++) {
    const byte = buf[i]!;
    if (shift >= 28) {
      // 5th byte: only lower 4 bits valid for u32
      result |= (byte & 0x0f) << 28;
      return { value: result >>> 0, len: i - offset + 1 };
    }
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) {
      return { value: result >>> 0, len: i - offset + 1 };
    }
    shift += 7;
  }
  return { value: result >>> 0, len: buf.length - offset };
}

/**
 * Delta+LEB128 encode a sorted array of u32 file IDs.
 * @returns Number of bytes written
 */
export function encodeDelta(ids: number[], buf: Uint8Array, offset = 0): number {
  let pos = offset;
  let prev = 0;
  for (const id of ids) {
    const delta = (id - prev) >>> 0;
    pos += encode(delta, buf, pos);
    prev = id;
  }
  return pos - offset;
}

/**
 * Delta+LEB128 decode `count` u32 file IDs from buf.
 */
export function decodeDelta(buf: Uint8Array, offset: number, count: number): number[] {
  // push keeps PACKED_SMI elements; new Array(count) would stay HOLEY
  const ids: number[] = [];
  let pos = offset;
  let prev = 0;
  for (let i = 0; i < count; i++) {
    const r = decode(buf, pos);
    prev = (prev + r.value) >>> 0;
    ids.push(prev);
    pos += r.len;
  }
  return ids;
}

/** Max bytes needed for delta-encoding `count` u32 values */
export function maxEncodedSize(count: number): number {
  return count * 5; // worst case: 5 bytes per u32
}

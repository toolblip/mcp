// UUID v4 and v7 generator
// v7 UUIDs are time-sortable — based on timestamp + random data
export function generateV7() {
    const randomBytes = new Uint8Array(10);
    crypto.getRandomValues(randomBytes);
    const now = Date.now();
    const timeLow = Math.floor(now / 4294967296) & 0xffffffff;
    const timeMid = ((now & 0x00ffff) * 65536) & 0xffff;
    const timeHi = ((now / 4294967296 / 65536) | 0x1000) & 0x4fff; // version 7
    const bytes = new Uint8Array(16);
    // time_low (4 bytes, big-endian)
    bytes[0] = (timeLow >> 24) & 0xff;
    bytes[1] = (timeLow >> 16) & 0xff;
    bytes[2] = (timeLow >> 8) & 0xff;
    bytes[3] = timeLow & 0xff;
    // time_mid (2 bytes, big-endian)
    bytes[4] = (timeMid >> 8) & 0xff;
    bytes[5] = timeMid & 0xff;
    // time_hi_and_version (2 bytes, big-endian)
    bytes[6] = (timeHi >> 8) & 0xff;
    bytes[7] = timeHi & 0xff;
    // clock_seq_hi_and_reserved + clock_seq_low (2 bytes)
    bytes[8] = (randomBytes[0] & 0x3f) | 0x80;
    bytes[9] = randomBytes[1];
    // node (6 bytes)
    bytes[10] = randomBytes[2];
    bytes[11] = randomBytes[3];
    bytes[12] = randomBytes[4];
    bytes[13] = randomBytes[5];
    bytes[14] = randomBytes[6];
    bytes[15] = randomBytes[7];
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join('-');
}
//# sourceMappingURL=uuid.js.map
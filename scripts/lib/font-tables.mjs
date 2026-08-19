/**
 * Minimal TrueType/OpenType table reader.
 *
 * Exists so `pnpm check:glyphs` can answer one question offline, with no
 * dependency: which Unicode code points does this font actually map? The
 * tooling that could answer it is either a Python toolchain (fontTools) or a
 * large JS dependency, for a job that is a few hundred bytes of table walking.
 *
 * Only the tables that question needs are parsed: `cmap` for coverage, plus
 * `name` / `head` / `post` / `OS/2` for the metadata that decides how the face
 * must be declared to next/font.
 */

/** Reads `cmap` and returns the set of mapped Unicode code points. */
export function readCmap(buffer, offset) {
  const codepoints = new Set();
  const numTables = buffer.readUInt16BE(offset + 2);

  // Prefer a Unicode subtable: platform 3 encoding 10 or 1, then platform 0.
  let best = null;
  for (let i = 0; i < numTables; i += 1) {
    const rec = offset + 4 + i * 8;
    const platformId = buffer.readUInt16BE(rec);
    const encodingId = buffer.readUInt16BE(rec + 2);
    const subtableOffset = offset + buffer.readUInt32BE(rec + 4);
    const score =
      platformId === 3 && encodingId === 10
        ? 4
        : platformId === 3 && encodingId === 1
          ? 3
          : platformId === 0
            ? 2
            : 1;
    if (!best || score > best.score) best = { score, subtableOffset };
  }
  if (!best) return codepoints;

  const sub = best.subtableOffset;
  const format = buffer.readUInt16BE(sub);

  if (format === 4) {
    const segCountX2 = buffer.readUInt16BE(sub + 6);
    const segCount = segCountX2 / 2;
    const endBase = sub + 14;
    const startBase = endBase + segCountX2 + 2;
    const deltaBase = startBase + segCountX2;
    const rangeBase = deltaBase + segCountX2;

    for (let s = 0; s < segCount; s += 1) {
      const end = buffer.readUInt16BE(endBase + s * 2);
      const start = buffer.readUInt16BE(startBase + s * 2);
      const delta = buffer.readInt16BE(deltaBase + s * 2);
      const rangeOffset = buffer.readUInt16BE(rangeBase + s * 2);
      if (start === 0xffff) continue;

      for (let c = start; c <= end && c < 0x10000; c += 1) {
        let glyph;
        if (rangeOffset === 0) {
          glyph = (c + delta) & 0xffff;
        } else {
          const address = rangeBase + s * 2 + rangeOffset + (c - start) * 2;
          if (address + 1 >= buffer.length) continue;
          glyph = buffer.readUInt16BE(address);
          if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
        }
        if (glyph !== 0) codepoints.add(c);
      }
    }
  } else if (format === 12) {
    const groups = buffer.readUInt32BE(sub + 12);
    for (let g = 0; g < groups; g += 1) {
      const rec = sub + 16 + g * 12;
      const start = buffer.readUInt32BE(rec);
      const end = buffer.readUInt32BE(rec + 4);
      for (let c = start; c <= end; c += 1) codepoints.add(c);
    }
  } else if (format === 6) {
    const first = buffer.readUInt16BE(sub + 6);
    const count = buffer.readUInt16BE(sub + 8);
    for (let i = 0; i < count; i += 1) {
      if (buffer.readUInt16BE(sub + 10 + i * 2) !== 0) codepoints.add(first + i);
    }
  }

  return codepoints;
}

function decodeUtf16be(buf) {
  let out = "";
  for (let i = 0; i + 1 < buf.length; i += 2) {
    out += String.fromCharCode(buf.readUInt16BE(i));
  }
  return out;
}

/** Reads the `name` table into { nameId: string }. */
function readNames(buffer, offset) {
  const names = {};
  const count = buffer.readUInt16BE(offset + 2);
  const stringOffset = offset + buffer.readUInt16BE(offset + 4);
  for (let i = 0; i < count; i += 1) {
    const rec = offset + 6 + i * 12;
    const platformId = buffer.readUInt16BE(rec);
    const nameId = buffer.readUInt16BE(rec + 6);
    const length = buffer.readUInt16BE(rec + 8);
    const off = buffer.readUInt16BE(rec + 10);
    const raw = buffer.subarray(stringOffset + off, stringOffset + off + length);
    // Platform 3 strings are UTF-16BE; platform 1 is MacRoman, close enough to
    // latin1 for the metadata read here.
    const decoded = platformId === 3 ? decodeUtf16be(raw) : raw.toString("latin1");
    if (decoded && !names[nameId]) names[nameId] = decoded;
  }
  return names;
}

/** Parses the tables this project cares about. */
export function inspectFont(buffer) {
  const numTables = buffer.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + i * 16;
    const tag = buffer.toString("latin1", rec, rec + 4).trim();
    tables[tag] = {
      offset: buffer.readUInt32BE(rec + 8),
      length: buffer.readUInt32BE(rec + 12),
    };
  }

  const result = { tables: Object.keys(tables).sort() };

  if (tables.cmap) result.codepoints = readCmap(buffer, tables.cmap.offset);
  if (tables.maxp) result.numGlyphs = buffer.readUInt16BE(tables.maxp.offset + 4);

  if (tables.name) {
    const names = readNames(buffer, tables.name.offset);
    result.family = names[1];
    result.subfamily = names[2];
    result.fullName = names[4];
    result.version = names[5];
    result.designer = names[9];
    result.license = names[13];
    result.licenseUrl = names[14];
  }

  if (tables.head) {
    result.unitsPerEm = buffer.readUInt16BE(tables.head.offset + 18);
    result.macStyle = buffer.readUInt16BE(tables.head.offset + 44);
  }
  if (tables.post) {
    // Fixed 16.16
    result.italicAngle = buffer.readInt32BE(tables.post.offset + 4) / 65536;
  }
  if (tables["OS/2"]) {
    result.usWeightClass = buffer.readUInt16BE(tables["OS/2"].offset + 4);
    result.fsType = buffer.readUInt16BE(tables["OS/2"].offset + 8);
    result.fsSelection = buffer.readUInt16BE(tables["OS/2"].offset + 62);
  }
  return result;
}

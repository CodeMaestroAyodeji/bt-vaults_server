const parseMagnetURI = require('magnet-uri');


/**
 * Parses a magnet link and extracts key details.
 * @param {string} magnetLink - The magnet URI to parse.
 * @returns {object} - Parsed details including infoHash, name, and trackers.
 * @throws {Error} - If the magnet link is invalid.
 */
const parseMagnetLink = (magnetLink) => {
    try {
        const parsed = parseMagnetURI(magnetLink);
        return {
            infoHash: parsed.infoHash,
            name: parsed.dn || "Unknown",
            trackers: parsed.tr || [],
        };
    } catch (error) {
        throw new Error("Invalid magnet link");
    }
};

module.exports = parseMagnetLink;

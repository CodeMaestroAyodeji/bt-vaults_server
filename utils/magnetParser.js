const parseMagnetURI = require('magnet-uri');

const parseMagnetLink = (magnetLink) => {
    try {
        const parsed = parseMagnetURI(magnetLink);
        return {
            infoHash: parsed.infoHash,
            name: parsed.dn || 'Unknown',
            trackers: parsed.tr || [],
        };
    } catch (error) {
        throw new Error('Invalid magnet link');
    }
};

module.exports = parseMagnetLink;

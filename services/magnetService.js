// services/magnetService.js

const parseMagnetURI = require('magnet-uri');

const validateMagnetLink = (magnetLink) => {
    try {
        const parsed = parseMagnetURI(magnetLink);
        if (!parsed.infoHash || !parsed.name) {
            throw new Error('Invalid magnet link: Missing required fields');
        }
        return {
            name: parsed.name,
            infoHash: parsed.infoHash,
            trackers: parsed.announce || [],
        };
    } catch (error) {
        throw new Error('Invalid magnet link format');
    }
};

module.exports = {
    validateMagnetLink,
};

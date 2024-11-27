const magnetUri = require('magnet-uri');

const validateMagnetLink = (magnetLink) => {
    try {
        const parsed = magnetUri.parse(magnetLink);
        return { isValid: true, parsed };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
};

module.exports = validateMagnetLink;

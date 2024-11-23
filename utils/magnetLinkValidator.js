const magnetUri = require('magnet-uri'); // Ensure this is correct

// Validate Magnet Links
const validateMagnetLink = (magnetLink) => {
    try {
        const parsed = magnetUri.parse(magnetLink);
        return { isValid: true, parsed };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
};

module.exports = validateMagnetLink; // Export using CommonJS syntax

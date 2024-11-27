const parseMagnetLink = require('../../utils/magnetParser');
const validateMagnetLink = require('../../utils/magnetLinkValidator');

const parseMagnet = (req, res) => {
    const { magnet } = req.body;

    if (!magnet) {
        return res.status(400).json({ message: 'Magnet link is required' });
    }

    try {
        const parsedDetails = parseMagnetLink(magnet);
        res.status(200).json({ message: 'Magnet link parsed successfully', data: parsedDetails });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { parseMagnet };

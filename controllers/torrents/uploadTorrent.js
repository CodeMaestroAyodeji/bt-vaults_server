// controllers/torrents/uploadTorrent.js

const Torrent = require('../../models/Torrent'); 
const crypto = require('crypto');

const uploadTorrent = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).send({ message: 'File upload failed' });
        }

        // Retrieve file information
        const filePath = req.file.path; 
        const fileSize = req.file.size; 
        const fileName = req.file.filename;

        // Generate a unique infoHash
        const infoHash = crypto.createHash('sha256').update(fileName).digest('hex');

        // Create a new Torrent document
        const newTorrent = new Torrent({
            name: fileName,
            filePath: filePath,
            size: fileSize,
            infoHash: infoHash,
        });

        // Save the document to the database
        await newTorrent.save();

        // Send a success response back to the client
        res.status(201).json({
            message: 'Torrent file uploaded successfully',
            torrent: {
                id: newTorrent._id,
                name: newTorrent.name,
                size: newTorrent.size,
                filePath: newTorrent.filePath,
                infoHash: newTorrent.infoHash,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
};

module.exports = { uploadTorrent };

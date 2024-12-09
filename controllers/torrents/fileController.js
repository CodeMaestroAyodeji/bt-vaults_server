// controllers/fileController.js

const fs = require('fs');
const path = require('path');
const Torrent = require('../../models/Torrent'); // Ensure this path to your model is correct
const archiver = require('archiver');

// Fetch all files with pagination
const fetchFiles = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Set default values for pagination

    try {
        const results = await Torrent.find()
            .skip((page - 1) * limit) // Skip the previous pages
            .limit(Number(limit)); // Limit the number of results

        const total = await Torrent.countDocuments(); // Get total documents count
        const totalPages = Math.ceil(total / limit); // Calculate total pages

        res.json({
            results,
            total,
            totalPages,
            currentPage: Number(page),
        });
    } catch (err) {
        console.error('Database fetch error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch files' });
    }
};

// Delete a file by ID
const deleteFile = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Torrent.findByIdAndDelete(id); // Use Mongoose to find and delete the torrent
        if (!result) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Database delete error:', err.message);
        return res.status(500).json({ error: 'Failed to delete file' });
    }
};

// Download a file
const downloadFile = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Torrent.findById(id); // Use Mongoose to find the torrent
        if (!result) {
            return res.status(404).json({ error: 'File not found' });
        }
        const filePath = path.join(__dirname, '../uploads', result.name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File does not exist on the server' });
        }
        res.download(filePath);
    } catch (err) {
        console.error('Error during file download:', err.message);
        return res.status(500).json({ error: 'Failed to download file' });
    }
};

// Zip and download multiple files
const zipFiles = async (req, res) => {
    const { ids } = req.body; // Expecting an array of IDs in the request body
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid input. Please provide an array of file IDs.' });
    }

    const output = fs.createWriteStream(path.join(__dirname, '../uploads/files.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        res.download(path.join(__dirname, '../uploads/files.zip'), (err) => {
            if (err) {
                console.error('Error during zip download:', err.message);
            }
            // Optionally, delete the zip file after download
            fs.unlinkSync(path.join(__dirname, '../uploads/files.zip'));
        });
    });

    archive.on('error', (err) => {
        console.error('Archiving error:', err.message);
        return res.status(500).json({ error: 'Failed to create zip file' });
    });

    archive.pipe(output);

    for (const id of ids) {
        const result = await Torrent.findById(id);
        if (result) {
            const filePath = path.join(__dirname, '../uploads', result.name);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: result.name });
            }
        }
    }

    archive.finalize();
};

module.exports = {
    fetchFiles,
    deleteFile,
    downloadFile,
    zipFiles,
};
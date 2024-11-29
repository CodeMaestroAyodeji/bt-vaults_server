// services/uploadService.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload directory
const uploadDir = path.join(__dirname, '../uploads/torrents');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Filter to accept only `.torrent` files
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.torrent') {
        cb(null, true);
    } else {
        cb(new Error('Only .torrent files are allowed'), false);
    }
};

const uploadService = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit to 50MB
});

// Export the upload middleware
module.exports = { uploadService };

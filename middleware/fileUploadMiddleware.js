const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure Uploads Directory Exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// File Filter for .torrent files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/x-bittorrent') {
        cb(null, true);
    } else {
        cb(new Error('Only .torrent files are allowed'), false);
    }
};

// Configure Multer
const upload = multer({ storage, fileFilter });

module.exports = upload;

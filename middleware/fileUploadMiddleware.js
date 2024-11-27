const multer = require('multer');
const path = require('path');

// Define storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        cb(null, uploadDir); // Set upload directory
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Use a unique name for the file
    },
});

// Validate only `.torrent` files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/x-bittorrent') {
        cb(null, true);
    } else {
        cb(new Error('Only .torrent files are allowed'), false);
    }
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('file'); // Ensure 'file' matches the form-data key

router.post('/upload', (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Error in Multer:', err.message); // Log Multer errors
            return res.status(400).json({ message: err.message });
        }
        console.log('File uploaded:', req.file); // Log the file object
        next();
    });
}, uploadTorrent);

module.exports = upload;

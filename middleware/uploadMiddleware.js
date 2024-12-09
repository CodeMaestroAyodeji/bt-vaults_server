// middlewares/uploadMiddleware.js  

const multer = require('multer');  
const fs = require('fs');  
const path = require('path');  

// Define the directory path  
const uploadDir = path.join(__dirname, '../uploads');  

// Ensure the 'uploads' directory exists  
if (!fs.existsSync(uploadDir)) {  
  fs.mkdirSync(uploadDir, { recursive: true });  
  console.log('Uploads directory created!');  
}  

// Set up the storage configuration for multer  
const storage = multer.diskStorage({  
  destination: function (req, file, cb) {  
    cb(null, uploadDir);  
  },  
  filename: function (req, file, cb) {  
    cb(null, file.originalname);   
  },  
});  

// Set file limits if needed (10 MB here)  
const upload = multer({  
  storage: storage,  
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit  
  fileFilter: (req, file, cb) => {  
    console.log('File Uploaded:', file.originalname, 'MIME Type:', file.mimetype);  
    const validTypes = ['application/x-bittorrent', 'application/octet-stream'];  
    if (!validTypes.includes(file.mimetype) && !file.originalname.endsWith('.torrent')) {  
        return cb(new Error('Invalid file type. Please upload a .torrent file.'));  
    }  
    cb(null, true);  
  },  
});  

module.exports = upload;
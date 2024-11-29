const fs = require('fs');  
const path = require('path');  
const archiver = require('archiver');  
const Torrent = require('../../models/Torrent'); // Adjust the path as necessary  

const zipTorrentFiles = async (req, res) => {  
    const { infoHashes } = req.body; // Assume the request body contains an array of infoHashes  

    if (!Array.isArray(infoHashes) || infoHashes.length === 0) {  
        return res.status(400).json({ message: 'Please provide an array of torrent infoHashes.' });  
    }  

    try {  
        // Ensure the temp directory exists  
        const tempDir = path.join(__dirname, '../../temp'); // Ensure correct path  
        if (!fs.existsSync(tempDir)) {  
            fs.mkdirSync(tempDir);  
        }  

        // Create a zip stream  
        const zipFilePath = path.join(tempDir, 'torrent-files.zip');  
        const output = fs.createWriteStream(zipFilePath);  
        const archive = archiver('zip', { zlib: { level: 9 } });  

        archive.on('error', (err) => {  
            throw err;  
        });  

        // Pipe the archive stream to the output file  
        archive.pipe(output);  

        // Add each torrent file to the zip  
        for (const infoHash of infoHashes) {  
            const torrent = await Torrent.findOne({ infoHash });  

            if (!torrent) {  
                console.log(`Torrent with infoHash ${infoHash} not found.`);  
                continue; // Skip to the next loop iteration  
            }  

            const filePath = torrent.filePath;  

            // Check if the filePath is defined and non-empty  
            if (!filePath) {  
                console.log(`File path is empty for torrent: ${infoHash}`);  
                continue; // Skip this torrent due to empty filePath  
            }  

            // Log the expected file path for debugging  
            console.log(`Looking for file at: ${filePath}`);  
            
            if (fs.existsSync(filePath)) {  
                archive.file(filePath, { name: `${infoHash}.torrent` });  
            } else {  
                console.log(`File not found for torrent: ${infoHash}`);  
            }  
        }  

        // Finalize the zip file  
        await archive.finalize();  

        // Send the zip file for download  
        output.on('close', () => {  
            res.download(zipFilePath, 'torrent-files.zip', (err) => {  
                if (err) {  
                    console.error('Error downloading the zip file:', err.message);  
                }  

                // Clean up the generated zip file after download  
                fs.unlink(zipFilePath, (err) => {  
                    if (err) console.error('Error cleaning up zip file:', err);  
                });  
            });  
        });  

    } catch (error) {  
        console.error('Error zipping torrent files:', error.message);  
        res.status(500).json({ message: 'Server error while zipping torrent files.' });  
    }  
};  

module.exports = { zipTorrentFiles };
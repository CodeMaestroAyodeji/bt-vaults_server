const mongoose = require('mongoose');

const torrentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    filePath: { type: String, required: true },
    size: { type: String, required: true },
    seeders: { type: Number, required: true },
    leechers: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now },
    infoHash: { type: String, unique: true },
});

module.exports = mongoose.model('Torrent', torrentSchema);

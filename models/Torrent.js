const mongoose = require('mongoose');

const torrentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    filePath: { type: String }, // Made optional
    size: { type: Number, required: true }, // In bytes
    infoHash: { type: String, required: true },
    seeders: { type: Number, default: 0 },
    leechers: { type: Number, default: 0 },
    status: { type: String, enum: ['queued', 'downloading', 'paused', 'stopped', 'completed'], default: 'queued' },
    progress: { type: Number, default: 0 }, // Progress percentage
    downloadSpeed: { type: Number, default: 0 }, // Bytes per second
    uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Torrent', torrentSchema);

// models/Torrent.js

const mongoose = require('mongoose');

const torrentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    magnet_link: { type: String, required: true },
    infoHash: { type: String, required: true },
    size: { type: Number, required: true }, // This line is essential
    seeds: { type: Number, required: true },
    leechers: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    download_status: { type: String, maxlength: 50 },
    progress: { type: Number, default: 0.00, min: 0.00, max: 100.00 },
    download_speed: { type: Number, default: 0.0 },
    time_remaining: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now }
});


// Create the model
const TorrentModel = mongoose.model('Torrent', torrentSchema);

module.exports = TorrentModel;


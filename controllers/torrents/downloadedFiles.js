const Torrent = require('../../models/Torrent');

const downloadedFiles = async (req, res) => {
    console.log('downloadedFiles function called');
    try {
        console.log('Querying for all torrents');
        const allTorrents = await Torrent.find({});
        console.log('All Torrents:', allTorrents); // Log all torrents

        console.log('Querying for torrents with status "downloading"');
        const downloadingTorrents = await Torrent.find({ status: 'downloading' });
        
        console.log('Downloading Torrents:', downloadingTorrents);

        if (!downloadingTorrents || downloadingTorrents.length === 0) {
            console.log('No torrents found with status "downloading"');
            return res.status(404).json({ message: "Torrent not found" });
        }

        res.status(200).json({
            total: downloadingTorrents.length,
            torrents: downloadingTorrents,
        });
    } catch (error) {
        console.error('Error querying torrents:', error);
        res.status(500).json({ error: "An error occurred while querying the database." });
    }
};



module.exports = { downloadedFiles };
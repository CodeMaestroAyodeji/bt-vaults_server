// controllers/torrents/searchTorrents.js  
const { searchTorrentsService } = require('../../services/searchTorrentsService');  

const searchTorrents = async (req, res) => {  
    const { term, page = 1, limit = 10 } = req.query;  

    try {  
        const searchResults = await searchTorrentsService(term, page, limit);  
        res.status(200).json(searchResults);  
    } catch (error) {  
        console.error('Search error:', error.message);  
        res.status(500).json({ message: 'Error searching torrents.' });  
    }  
};  

module.exports = { searchTorrents };
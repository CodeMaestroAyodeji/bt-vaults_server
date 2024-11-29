// services/searchTorrentsService.js  
const axios = require('axios');  

const searchTorrentsService = async (searchTerm, page, limit) => {  
    const externalApiUrl = process.env.EXTERNAL_TORRENT_API_URL; // Your external API URL  
    try {  
        const response = await axios.get(externalApiUrl, {  
            params: {  
                term: searchTerm,  
                page: page,  
                limit: limit  
            }  
        });  
        return response.data; // Return the data received from the external API  
    } catch (error) {  
        console.error('Error fetching torrents:', error.message);  
        throw new Error('Failed to fetch torrents from external API.');  
    }  
};  

module.exports = { searchTorrentsService };
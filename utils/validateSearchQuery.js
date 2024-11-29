// utils/validateSearchQuery.js  
const { query, validationResult } = require('express-validator');  

const validateSearchQuery = [  
    query('term').isString().notEmpty().withMessage('Search term is required.'),  
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),  
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer.')  
];  

const checkValidationResult = (req, res, next) => {  
    const errors = validationResult(req);  
    if (!errors.isEmpty()) {  
        return res.status(400).json({ errors: errors.array() });  
    }  
    next();  
};  

module.exports = { validateSearchQuery, checkValidationResult };
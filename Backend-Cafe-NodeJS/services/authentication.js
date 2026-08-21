require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];

    console.log('Authorization Header:', authHeader);

    const token = authHeader && authHeader.split(' ')[1];

    console.log('Extracted Token:', token);

    if (token == null) {
        return res.status(401).json({
            message: 'Token Missing'
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, response) => {

        console.log('JWT Error:', err);

        if (err) {
            return res.status(403).json({
                message: 'Invalid Token'
            });
        }

        res.locals = response;

        next();
    });
}

module.exports = { authenticateToken };
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({message: 'Not authorized'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({error: 'Cookie not valid'});
    }   
}

module.exports = verifyToken;
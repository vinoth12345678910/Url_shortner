require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({ message: 'Authorization header is required' });
    }

    const token = authHeader.split(' ')[1]; // Assuming Bearer token format
    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
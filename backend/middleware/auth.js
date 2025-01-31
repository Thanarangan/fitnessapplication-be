const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key"; // Use the same secret key from server.js

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;

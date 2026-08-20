const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Protect routes - Verify JWT Token
const protect = async (req, res, next) => {
  console.log('PROTECT:', typeof next);
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from database excluding password
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' })
      }

      next()
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }
}

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    
  console.log('AUTHORIZE:', roles, typeof next);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      })
    }
    next()
  }
}

module.exports = { protect, authorize }
const jwt = require('jsonwebtoken');
const Signup = require('../models/Signup');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Signup.findById(decoded.id).populate('role').populate('department');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error in authentication', error: error.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'User role not found' });
    }

    // Check if the user's role name is in the allowed roles
    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role.name} is not authorized to access this route`,
        userRole: req.user.role.name,
        allowedRoles: roles
      });
    }
    next();
  };
};

module.exports = { protect, authorize }; 
const { Request, Response, NextFunction } = require('express');
const { CatchAsyncError } = require('./catchAsyncErrors');
const ErrorHandler = require('../config/ErrorHandler');
const jwt = require('jsonwebtoken');
const User=require('../models/User')


// authenticated user
// module.exports.isAuthenticated = CatchAsyncError(async (req, res, next) => {
//   // Extract token from Authorization header
//   const access_token = req.headers.authorization;
//   const token = access_token ? access_token.split(" ")[1] : null;

//   if (!token) {
//     return next(new ErrorHandler("Please login to access this resource", 401));
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWTSECRET);

//     // Check if the token is expired
//     if (decoded.exp && decoded.exp <= Date.now() / 1000) {
//       return next(new ErrorHandler("Access token expired. Please log in again.", 401));
//     }

//     // Retrieve user from MongoDB
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return next(new ErrorHandler("User not found. Please log in again.", 401));
//     }

//     // Attach user to request object
//     req.user = user;
//     next();
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 401));
//   }
// });

module.exports.isAuthenticated = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied" });
  
    try {
      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

// Correct version of the authorizeRoles middleware
module.exports.authorizeRoles = (role) => {
    return (req, res, next) => {
console.log(req.user);

        if (!req.user || req.user.isAdmin !== role) {
        return res.status(403).json({ message: `Role: ${req.user?.isAdmin} is not allowed to access this resource` });
      }
      next();
    };
  };
  
'use-strict'
const jwt = require('express-jwt');
const { PromiseHandler } = require('./error.handler');
const { userVerificationMiddleware, otherServers } = require('../middleware/auth.middleware');


function authorizeNew(allowedRoles = [], permissionName, readWriteValue = []) {
    // skip permissionName, readWriteValue = [] checks if userType != employee or client
    return [
        // PromiseHandler(otherServers),
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }),
        // authorize based on user role
        async (req, res, next) => {
            if (req.apiCallData && req.apiCallData.otherServer) return next()
            req.apiCallData = {
                permissionName, readWriteValue, allowedRoles
            }
            next()
        },
        PromiseHandler(userVerificationMiddleware)
    ];
}
module.exports = authorizeNew;
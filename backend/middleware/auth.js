const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token and attach user to req
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Access denied. Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Access denied. Invalid token.' });
    }
};

// Check if user is a team leader
const requireLeader = (req, res, next) => {
    if (req.user.role !== 'team_leader') {
        return res.status(403).json({ message: 'Access denied. Team leader required.' });
    }
    next();
};

// Check if user can access/modify schedules for a specific team
const canAccessTeam = (req, res, next) => {
    const { team } = req.params;
    
    // Team leaders can only access their own team
    if (req.user.role === 'team_leader' && req.user.team !== team) {
        return res.status(403).json({ 
            message: 'Access denied. You can only access schedules for your team.' 
        });
    }
    
    // Team members can only access their own team
    if (req.user.role === 'team_member' && req.user.team !== team) {
        return res.status(403).json({ 
            message: 'Access denied. You can only access schedules for your team.' 
        });
    }
    
    next();
};

// Check if user can modify a specific schedule
const canModifySchedule = (req, res, next) => {
    const { team } = req.body;
    
    // Team leaders can only modify schedules for their own team
    if (req.user.role === 'team_leader' && req.user.team !== team) {
        return res.status(403).json({ 
            message: 'Access denied. You can only modify schedules for your team.' 
        });
    }
    
    // Team members cannot modify any schedules
    if (req.user.role === 'team_member') {
        return res.status(403).json({ 
            message: 'Access denied. Team members cannot modify schedules.' 
        });
    }
    
    next();
};

module.exports = {
    auth,
    requireLeader,
    canAccessTeam,
    canModifySchedule
}; 
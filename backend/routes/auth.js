const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// @route   POST /api/auth/login
// @desc    User login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Force false for local development
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'none', // Changed from 'lax' to 'none' for cross-origin
            path: '/',
            domain: 'localhost' // Explicitly set domain
        });

        // Return user data (without password)
        res.json({
            success: true,
            message: 'Login successful',
            user: user.toPublicJSON(),
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    User logout
// @access  Private
router.post('/logout', auth, (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            domain: undefined
        });
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user.toPublicJSON()
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting user data'
        });
    }
});

// @route   GET /api/auth/team-members/:team
// @desc    Get team members for dropdown (leaders only)
// @access  Private (Team Leaders)
router.get('/team-members/:team', auth, async (req, res) => {
    try {
        const { team } = req.params;

        // Validate team
        if (!['Video Team', 'Photo Team', 'VJ Team', 'Lighting Team'].includes(team)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid team'
            });
        }

        // Get team members
        const teamMembers = await User.find({
            team: team,
            role: 'team_member',
            isActive: true
        }).select('name username email');

        res.json({
            success: true,
            teamMembers: teamMembers
        });

    } catch (error) {
        console.error('Get team members error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting team members'
        });
    }
});

// @route   POST /api/auth/register
// @desc    User registration
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, team, name } = req.body;

        // Validate required fields
        if (!username || !email || !password || !role || !team || !name) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: username, email, password, role, team, name'
            });
        }

        // Validate role
        if (!['team_leader', 'team_member'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be either "team_leader" or "team_member"'
            });
        }

        // Validate team
        if (!['Video Team', 'Photo Team', 'VJ Team', 'Lighting Team'].includes(team)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid team. Must be one of: Video Team, Photo Team, VJ Team, Lighting Team'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Validate username length
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Username must be at least 3 characters long'
            });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create new user
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            role,
            team,
            name: name.trim()
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token for immediate login
        const token = jwt.sign(
            { userId: newUser._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Force false for local development
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-origin
            path: '/',
            domain: undefined // Force undefined for local development
        });

        // Return success response with user data (without password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser.toPublicJSON(),
            token: token
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updates = {};

        // Only allow updating name and email
        if (name) updates.name = name.trim();
        if (email) {
            // Check if new email already exists
            const existingEmail = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: req.user._id } // Exclude current user
            });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
            updates.email = email.toLowerCase();
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password for comparison
        const user = await User.findById(req.user._id);
        
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
});

module.exports = router;
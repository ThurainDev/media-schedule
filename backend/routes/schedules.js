const express = require('express');
const Schedule = require('../models/Schedule');
const { auth, requireLeader, canModifySchedule } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/schedules
// @desc    Get all schedules (with role-based filtering)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let schedules;
        
        // Team leaders can see all schedules
        if (req.user.role === 'team_leader') {
            schedules = await Schedule.find()
                .sort({ date: 1, time: 1 });
        } else {
            // Team members can see all schedules (read-only)
            schedules = await Schedule.find()
                .sort({ date: 1, time: 1 });
        }

        res.json({
            success: true,
            count: schedules.length,
            schedules: schedules.map(schedule => {
                const scheduleObj = schedule.toObject();
                // Convert Map to regular object for assignments
                let assignments = {};
                if (scheduleObj.assignments && scheduleObj.assignments instanceof Map) {
                    assignments = Object.fromEntries(scheduleObj.assignments);
                } else if (scheduleObj.assignments && typeof scheduleObj.assignments === 'object') {
                    assignments = scheduleObj.assignments;
                }
                
                return {
                    ...scheduleObj,
                    assignments: assignments,
                    formattedDate: schedule.formattedDate,
                    dayLabel: schedule.dayLabel,
                    assignmentsArray: schedule.getAssignmentsArray()
                };
            })
        });

    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching schedules',
            error: error.message
        });
    }
});

// @route   GET /api/schedules/team/:team
// @desc    Get schedules for a specific team
// @access  Private (with team access control)
router.get('/team/:team', auth, async (req, res) => {
    try {
        const { team } = req.params;
        
        // Check team access
        if (req.user.role === 'team_member' && req.user.team !== team) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view schedules for your team.'
            });
        }

        const schedules = await Schedule.find({ team })
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            count: schedules.length,
            schedules: schedules.map(schedule => {
                const scheduleObj = schedule.toObject();
                let assignments = {};
                if (scheduleObj.assignments && scheduleObj.assignments instanceof Map) {
                    assignments = Object.fromEntries(scheduleObj.assignments);
                } else if (scheduleObj.assignments && typeof scheduleObj.assignments === 'object') {
                    assignments = scheduleObj.assignments;
                }
                
                return {
                    ...scheduleObj,
                    assignments: assignments,
                    formattedDate: schedule.formattedDate,
                    dayLabel: schedule.dayLabel,
                    assignmentsArray: schedule.getAssignmentsArray()
                };
            })
        });

    } catch (error) {
        console.error('Get team schedules error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching team schedules',
            error: error.message
        });
    }
});

// @route   POST /api/schedules
// @desc    Create a new schedule (Team Leaders only)
// @access  Private (Team Leaders)
router.post('/', [auth, requireLeader, canModifySchedule], async (req, res) => {
    try {
        const { date, day, service, time, team, assignments, notes } = req.body;

        // Validate required fields
        if (!date || !day || !service || !time || !team) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: date, day, service, time, team'
            });
        }

        // Validate day
        if (!['saturday', 'sunday'].includes(day)) {
            return res.status(400).json({
                success: false,
                message: 'Day must be either "saturday" or "sunday"'
            });
        }

        // Validate team
        if (!['Video Team', 'Photo Team', 'VJ Team', 'Lighting Team'].includes(team)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid team. Must be one of: Video Team, Photo Team, VJ Team, Lighting Team'
            });
        }

        // Create new schedule
        const schedule = new Schedule({
            date: new Date(date),
            day,
            service,
            time,
            team,
            assignments: assignments || {},
            notes: notes || ''
        });

        await schedule.save();

        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            schedule: {
                ...schedule.toObject(),
                assignments: Object.fromEntries(schedule.assignments),
                formattedDate: schedule.formattedDate,
                dayLabel: schedule.dayLabel,
                assignmentsArray: schedule.getAssignmentsArray()
            }
        });

    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while creating schedule',
            error: error.message
        });
    }
});

// @route   PUT /api/schedules/:id
// @desc    Update a schedule (Team Leaders only, their team only)
// @access  Private (Team Leaders)
router.put('/:id', [auth, requireLeader], async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Check if user can modify this schedule
        if (req.user.team !== schedule.team) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify schedules for your team.'
            });
        }

        const { date, day, service, time, team, assignments, notes } = req.body;
        const updateFields = {};

        if (date) updateFields.date = new Date(date);
        if (day) updateFields.day = day;
        if (service) updateFields.service = service;
        if (time) updateFields.time = time;
        if (team) updateFields.team = team;
        if (assignments) updateFields.assignments = assignments;
        if (notes !== undefined) updateFields.notes = notes;

        const updatedSchedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Schedule updated successfully',
            schedule: {
                ...updatedSchedule.toObject(),
                assignments: Object.fromEntries(updatedSchedule.assignments),
                formattedDate: updatedSchedule.formattedDate,
                dayLabel: updatedSchedule.dayLabel,
                assignmentsArray: updatedSchedule.getAssignmentsArray()
            }
        });

    } catch (error) {
        console.error('Update schedule error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while updating schedule',
            error: error.message
        });
    }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete a schedule (Team Leaders only, their team only)
// @access  Private (Team Leaders)
router.delete('/:id', [auth, requireLeader], async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Check if user can delete this schedule
        if (req.user.team !== schedule.team) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete schedules for your team.'
            });
        }

        await Schedule.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Schedule deleted successfully'
        });

    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while deleting schedule',
            error: error.message
        });
    }
});

// @route   GET /api/schedules/test
// @desc    Test endpoint to verify API is working
// @access  Public
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Schedules API is working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 
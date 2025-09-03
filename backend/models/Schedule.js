const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    day: {
        type: String,
        enum: ['saturday', 'sunday'],
        required: [true, 'Day is required']
    },
    service: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true
    },
    time: {
        type: String,
        required: [true, 'Service time is required'],
        trim: true
    },
    team: {
        type: String,
        enum: ['Video Team', 'Photo Team', 'VJ Team', 'Lighting Team'],
        required: [true, 'Team is required']
    },
    assignments: {
        type: Map,
        of: String,
        default: {}
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ date: 1, day: 1, team: 1 });

// Virtual for formatted date
scheduleSchema.virtual('formattedDate').get(function() {
    return this.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for day label
scheduleSchema.virtual('dayLabel').get(function() {
    return this.day === 'saturday' ? 'Saturday' : 'Sunday';
});

// Method to get assignments as array
scheduleSchema.methods.getAssignmentsArray = function() {
    return Array.from(this.assignments.entries()).map(([role, name]) => ({
        role,
        name
    }));
};

module.exports = mongoose.model('Schedule', scheduleSchema); 
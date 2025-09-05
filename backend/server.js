const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip || req.connection.remoteAddress);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
});

// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []), 
     ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : [])] 
  : ['http://localhost:5173', 'http://localhost:4000'];

console.log('Allowed Origins:', allowedOrigins); // For debugging

app.use(cors({
    origin: function (origin, callback) {
        console.log('Request origin:', origin); // For debugging
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin); // For debugging
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
    const mongoURL = process.env.MONGODB_URI || "mongodb+srv://thuraindev:712127@thuraindev.ulnnx.mongodb.net/?retryWrites=true&w=majority&appName=ThurainDev";
    
    try {
        await mongoose.connect(mongoURL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false
        });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        console.log('🔄 Retrying in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schedules', require('./routes/schedules'));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Ministry Schedule API is running!',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation'
        });
    }
    
    // Handle rate limiting errors
    if (err.status === 429) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests'
        });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // Handle MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
    
    // Default error
    res.status(500).json({ 
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

// Start server
const startServer = async () => {
    try {
        await connectWithRetry();
        
        const PORT = process.env.PORT || 4000;
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Process ID: ${process.pid}`);
        });
        
        // Handle server errors
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            
            switch (error.code) {
                case 'EACCES':
                    console.error(`Port ${PORT} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(`Port ${PORT} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
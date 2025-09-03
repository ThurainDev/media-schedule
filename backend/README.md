# Ministry Schedule Backend

A Node.js/Express backend for the Ministry Schedule Management System with JWT authentication and role-based access control.

## Features

- **User Authentication**: JWT-based login/registration with bcrypt password hashing
- **Role-Based Access Control**: Team Member, Team Leader, and Admin roles
- **Team Management**: 4 ministry teams (Video, Photo, VJ, Lighting)
- **Schedule Management**: CRUD operations for ministry schedules
- **Data Validation**: Input validation using express-validator
- **MongoDB Integration**: Mongoose ODM with proper indexing

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend root with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ministry-schedule?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Cookie Settings
COOKIE_SECRET=your-cookie-secret-key-here
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

### Schedules (`/api/schedules`)
- `GET /` - Get all schedules (with filtering)
- `GET /:id` - Get schedule by ID
- `POST /` - Create new schedule (Team Leader/Admin only)
- `PUT /:id` - Update schedule (Team Leader/Admin only)
- `DELETE /:id` - Delete schedule (Team Leader/Admin only)
- `GET /team/:team` - Get schedules for specific team

### Users (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Deactivate user (Admin only)
- `GET /team/:team` - Get users by team
- `GET /stats/overview` - User statistics (Admin only)

## Data Models

### User Schema
- `username`, `email`, `password` (required)
- `firstName`, `lastName`, `team` (required)
- `role`: `team_member` | `team_leader` | `admin`
- `team`: `Video Team` | `Photo Team` | `VJ Team` | `Lighting Team`
- `phone`, `isActive`, `lastLogin`

### Schedule Schema
- `date`, `day` (saturday/sunday), `service`, `time` (required)
- `team`, `assignments` (Map of role -> name), `createdBy` (required)
- `updatedBy`, `isActive`, `notes`

## Authentication & Authorization

### JWT Tokens
- 7-day expiration
- Stored in HTTP-only cookies
- Bearer token support for mobile apps

### Role Permissions
- **Team Member**: View own team schedules, update profile
- **Team Leader**: Full access to team schedules, view team members
- **Admin**: Full system access, user management

### Team Access Control
- Users can only access data from their assigned team
- Team leaders can manage their team's schedules
- Admins have access to all teams

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token validation
- CORS configuration
- Input validation and sanitization
- Role-based route protection
- Soft delete for data integrity

## Database Indexes

- Schedules: `{ date: 1, day: 1, team: 1 }`
- Schedules: `{ createdBy: 1 }`
- Users: `{ email: 1 }`, `{ username: 1 }`

## Error Handling

- Centralized error middleware
- Validation error responses
- Proper HTTP status codes
- Detailed error logging

## Development

### File Structure
```
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── middleware/      # Authentication & validation
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Adding New Routes
1. Create route file in `routes/` directory
2. Add validation middleware if needed
3. Import and use in `server.js`
4. Add authentication middleware as required

### Testing
- Use Postman or similar tool to test endpoints
- Start with authentication endpoints
- Test role-based access control
- Verify team isolation

## Production Considerations

- Use strong JWT secrets
- Enable HTTPS
- Set secure cookie flags
- Use environment-specific MongoDB connections
- Implement rate limiting
- Add request logging
- Set up monitoring and error tracking 
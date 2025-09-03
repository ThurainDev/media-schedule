# Test Data for Postman

## **API Endpoints:**

### **Base URL:** `http://localhost:4000`

1. **Test API Health:** `GET /`
2. **Test Schedules API:** `GET /api/schedules/test`
3. **Get All Schedules:** `GET /api/schedules`
4. **Create New Schedule:** `POST /api/schedules`

---

## **Sample POST Data for Creating Schedules:**

### **Video Team - Fasting Service:**
```json
{
  "date": "2024-01-20",
  "day": "saturday",
  "service": "Fasting Service",
  "time": "9 AM",
  "team": "Video Team",
  "assignments": {
    "Operation Director": "John Doe",
    "Operation Assistant": "Jane Smith",
    "Switcher 1": "Mike Johnson",
    "Switcher 2": "Sarah Wilson",
    "C1": "Tom Brown",
    "C2": "Lisa Davis",
    "C3": "David Miller",
    "C4": "Emma Garcia",
    "C5": "James Rodriguez",
    "C6": "Maria Martinez",
    "Live Comment": "Alex Thompson",
    "Media Maintenance": "Chris Lee"
  },
  "notes": "Special equipment needed for live streaming"
}
```

### **Photo Team - The Arrow Service:**
```json
{
  "date": "2024-01-20",
  "day": "saturday",
  "service": "The Arrow Service",
  "time": "2 PM",
  "team": "Photo Team",
  "assignments": {
    "Lead": "Sarah Wilson",
    "Assist": "Mike Johnson"
  },
  "notes": "Capture key moments during worship"
}
```

### **VJ Team - Main Service:**
```json
{
  "date": "2024-01-21",
  "day": "sunday",
  "service": "Main Service",
  "time": "9 AM",
  "team": "VJ Team",
  "assignments": {
    "Lead": "David Miller",
    "Assist": "Emma Garcia",
    "Trainee": "James Rodriguez"
  },
  "notes": "Prepare worship lyrics and announcements"
}
```

### **Lighting Team - Children Service:**
```json
{
  "date": "2024-01-21",
  "day": "sunday",
  "service": "Children Service",
  "time": "9 AM",
  "team": "Lighting Team",
  "assignments": {
    "Lead": "Alex Thompson",
    "Assist": "Chris Lee",
    "Trainee": "Maria Martinez"
  },
  "notes": "Bright, colorful lighting for children"
}
```

---

## **Testing Steps:**

1. **Start the server** - Should show "Connected to MongoDB" and "Server running on port 5000"

2. **Test basic endpoints:**
   - `GET http://localhost:5000/` → Should return API health message
   - `GET http://localhost:5000/api/schedules/test` → Should return schedules API test message

3. **Create schedules:**
   - Use `POST http://localhost:5000/api/schedules`
   - Copy the sample JSON data above
   - Set Content-Type header to `application/json`

4. **Fetch schedules:**
   - Use `GET http://localhost:5000/api/schedules`
   - Should return all created schedules

---

## **Expected Response Format:**

### **Success Response:**
```json
{
  "success": true,
  "message": "Schedule created successfully",
  "schedule": {
    "_id": "...",
    "date": "2024-01-20T00:00:00.000Z",
    "day": "saturday",
    "service": "Fasting Service",
    "time": "9 AM",
    "team": "Video Team",
    "assignments": {...},
    "notes": "...",
    "formattedDate": "Saturday, January 20, 2024",
    "dayLabel": "Saturday",
    "assignmentsArray": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Missing required fields: date, day, service, time, team"
}
```

---

## **Postman Setup:**

1. **Create a new collection** called "Ministry Schedule API"
2. **Set base URL** to `http://localhost:5000`
3. **Add the endpoints** listed above
4. **For POST requests:** Set Body → raw → JSON
5. **Test with the sample data** provided above 
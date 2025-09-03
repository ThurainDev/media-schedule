# Complete Test Data for Ministry Schedule API

## **API Endpoints:**

### **Base URL:** `http://localhost:4000`

1. **Test API Health:** `GET /`
2. **Authentication:** `POST /api/auth/login`
3. **Get Current User:** `GET /api/auth/me`
4. **Logout:** `POST /api/auth/logout`
5. **Get Team Members:** `GET /api/auth/team-members/:team`
6. **Get All Schedules:** `GET /api/schedules`
7. **Get Team Schedules:** `GET /api/schedules/team/:team`
8. **Create Schedule:** `POST /api/schedules`
9. **Update Schedule:** `PUT /api/schedules/:id`
10. **Delete Schedule:** `DELETE /api/schedules/:id`

---

## **Step 1: Create Users (Team Leaders + Team Members)**

### **Team Leaders (4 users):**

#### **1. Video Team Leader:**
```json
{
  "username": "video_leader",
  "email": "video.leader@church.com",
  "password": "password123",
  "role": "team_leader",
  "team": "Video Team",
  "name": "John Smith"
}
```

#### **2. Photo Team Leader:**
```json
{
  "username": "photo_leader",
  "email": "photo.leader@church.com",
  "password": "password123",
  "role": "team_leader",
  "team": "Photo Team",
  "name": "Sarah Wilson"
}
```

#### **3. VJ Team Leader:**
```json
{
  "username": "vj_leader",
  "email": "vj.leader@church.com",
  "password": "password123",
  "role": "team_leader",
  "team": "VJ Team",
  "name": "David Miller"
}
```

#### **4. Lighting Team Leader:**
```json
{
  "username": "lighting_leader",
  "email": "lighting.leader@church.com",
  "password": "password123",
  "role": "team_leader",
  "team": "Lighting Team",
  "name": "Alex Thompson"
}
```

### **Photo Team Members (10 users):**

#### **5. Photo Team Member 1:**
```json
{
  "username": "photo_member1",
  "email": "photo1@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Mike Johnson"
}
```

#### **6. Photo Team Member 2:**
```json
{
  "username": "photo_member2",
  "email": "photo2@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Lisa Davis"
}
```

#### **7. Photo Team Member 3:**
```json
{
  "username": "photo_member3",
  "email": "photo3@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Tom Brown"
}
```

#### **8. Photo Team Member 4:**
```json
{
  "username": "photo_member4",
  "email": "photo4@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Emma Garcia"
}
```

#### **9. Photo Team Member 5:**
```json
{
  "username": "photo_member5",
  "email": "photo5@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "James Rodriguez"
}
```

#### **10. Photo Team Member 6:**
```json
{
  "username": "photo_member6",
  "email": "photo6@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Maria Martinez"
}
```

#### **11. Photo Team Member 7:**
```json
{
  "username": "photo_member7",
  "email": "photo7@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Chris Lee"
}
```

#### **12. Photo Team Member 8:**
```json
{
  "username": "photo_member8",
  "email": "photo8@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Anna White"
}
```

#### **13. Photo Team Member 9:**
```json
{
  "username": "photo_member9",
  "email": "photo9@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Robert Taylor"
}
```

#### **14. Photo Team Member 10:**
```json
{
  "username": "photo_member10",
  "email": "photo10@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Photo Team",
  "name": "Jennifer Clark"
}
```

### **Video Team Members (10 users):**

#### **15-24. Video Team Members:**
```json
{
  "username": "video_member1",
  "email": "video1@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Video Team",
  "name": "Daniel Wilson"
}
```

*(Continue with video_member2 through video_member10 with different names)*

### **VJ Team Members (10 users):**

#### **25-34. VJ Team Members:**
```json
{
  "username": "vj_member1",
  "email": "vj1@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "VJ Team",
  "name": "Kevin Anderson"
}
```

*(Continue with vj_member2 through vj_member10 with different names)*

### **Lighting Team Members (10 users):**

#### **35-44. Lighting Team Members:**
```json
{
  "username": "lighting_member1",
  "email": "lighting1@church.com",
  "password": "password123",
  "role": "team_member",
  "team": "Lighting Team",
  "name": "Rachel Green"
}
```

*(Continue with lighting_member2 through lighting_member10 with different names)*

---

## **Step 2: Test Authentication**

### **Login as Photo Team Leader:**
```json
POST /api/auth/login
{
  "email": "photo.leader@church.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "username": "photo_leader",
    "email": "photo.leader@church.com",
    "role": "team_leader",
    "team": "Photo Team",
    "name": "Sarah Wilson"
  },
  "token": "..."
}
```

### **Get Photo Team Members (for dropdown):**
```json
GET /api/auth/team-members/Photo Team
Authorization: Bearer {token}
```

---

## **Step 3: Test Schedule Creation (as Photo Team Leader)**

### **Create Photo Team Schedule:**
```json
POST /api/schedules
Authorization: Bearer {token}
{
  "date": "2024-01-20",
  "day": "saturday",
  "service": "Fasting Service",
  "time": "9 AM",
  "team": "Photo Team",
  "assignments": {
    "Lead": "Sarah Wilson",
    "Assist": "Mike Johnson"
  },
  "notes": "Capture worship moments"
}
```

---

## **Testing Steps:**

1. **Create all users** using the JSON data above
2. **Login as Photo Team Leader** to get JWT token
3. **Test team member dropdown** - should see 10 Photo Team members
4. **Create Photo Team schedule** - should work
5. **Try to create Video Team schedule** - should fail (access denied)
6. **Login as Photo Team Member** - should see all schedules but can't edit
7. **Test team-specific access** - members can only see their team's detailed data

---

## **Expected Behavior:**

- **Team Leaders**: Can see ALL schedules, but only edit their team's
- **Team Members**: Can see ALL schedules (read-only), names highlighted when assigned
- **Access Control**: Proper role-based restrictions enforced
- **Member Dropdowns**: Team leaders see only their team's members

---

## **Postman Collection Setup:**

1. **Create collection**: "Ministry Schedule API"
2. **Set base URL**: `http://localhost:4000`
3. **Add environment variables**: `token` for JWT
4. **Test with different user roles** to verify access control 
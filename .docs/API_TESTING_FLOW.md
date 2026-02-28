# 🧪 PetCare API Manual Testing Flow

**Base URL:** `http://localhost:3000/api`

---

## 📋 Prerequisites

1. Start backend server: `npm start`
2. Use **Postman**, **Insomnia**, or **cURL** for testing
3. Store auth tokens from login response
4. Replace `{userId}`, `{petId}`, etc. with actual IDs from responses

---

## 🔐 **1. AUTHENTICATION MODULE** (`/auth`)

### 1.1 Register New User
```
POST /auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```
**Expected Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com"
  }
}
```

### 1.2 Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```
**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user_id": "uuid",
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": { "id": "uuid", "email": "user@example.com", ... }
  }
}
```
**⚠️ ACTION:** Save `access_token` for subsequent requests

### 1.3 Get Current User
```
GET /auth/me
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": { "id": "uuid", "email": "...", "first_name": "...", ... }
}
```

### 1.4 Refresh Token
```
POST /auth/refresh
Headers: Authorization: Bearer {refresh_token}
```
**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "access_token": "new_token",
    "refresh_token": "new_token"
  }
}
```

### 1.5 Forgot Password
```
POST /auth/forgot-password
```
**Body:**
```json
{
  "email": "user@example.com"
}
```
**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Password reset link sent to email"
}
```

### 1.6 Verify Email
```
POST /auth/verify-email
```
**Body:**
```json
{
  "token": "{verification_token_from_email}"
}
```
**Expected Response:** `200 OK`

### 1.7 Logout
```
POST /auth/logout
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

---

## 👥 **2. USERS MODULE** (`/users`)

### 2.1 Get All Users
```
GET /users
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    { "id": "uuid", "email": "...", "first_name": "...", ... },
    ...
  ]
}
```

### 2.2 Get User by ID
```
GET /users/{userId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 2.3 Create User
```
POST /users
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "SecurePass123"
}
```
**Expected Response:** `201 Created`

### 2.4 Update User
```
PUT /users/{userId}
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+1234567890"
}
```
**Expected Response:** `200 OK`

### 2.5 Activate User
```
PATCH /users/{userId}/activate
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 2.6 Delete User
```
DELETE /users/{userId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK` or `204 No Content`

### 2.7 Get User's Pets
```
GET /users/{userId}/pets
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 2.8 Get User's Roles
```
GET /users/{userId}/roles
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 2.9 Assign Role to User
```
POST /users/{userId}/roles
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "role_id": "uuid",
  "is_primary": true
}
```
**Expected Response:** `201 Created`

### 2.10 Remove Role from User
```
DELETE /users/{userId}/roles/{roleId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 2.11 Get User's Permissions
```
GET /users/{userId}/permissions
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

---

## 🐾 **3. PETS MODULE** (`/pets`)

### 3.1 Get All Pets
```
GET /pets
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 3.2 Get My Pets
```
GET /pets/my-pets
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 3.3 Get Pet by ID
```
GET /pets/{petId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 3.4 Create Pet
```
POST /pets
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "Fluffy",
  "pet_type_id": "uuid",
  "breed_id": "uuid",
  "date_of_birth": "2020-01-15",
  "gender": "male",
  "weight": 5.5,
  "color": "brown",
  "microchip_id": "ABC123"
}
```
**Expected Response:** `201 Created`

### 3.5 Update Pet
```
PUT /pets/{petId}
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "Fluffy Updated",
  "weight": 6.0
}
```
**Expected Response:** `200 OK`

### 3.6 Delete Pet
```
DELETE /pets/{petId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

---

## 📋 **4. APPOINTMENTS MODULE** (`/appointments`)

### 4.1 Get All Appointments
```
GET /appointments
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 4.2 Get Appointment by ID
```
GET /appointments/{appointmentId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 4.3 Create Appointment
```
POST /appointments
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "pet_id": "uuid",
  "clinic_id": "uuid",
  "veterinarian_id": "uuid",
  "appointment_date": "2026-03-01",
  "appointment_time": "10:00",
  "reason": "Regular checkup",
  "notes": "Pet seems healthy"
}
```
**Expected Response:** `201 Created`

### 4.4 Update Appointment
```
PUT /appointments/{appointmentId}
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "appointment_date": "2026-03-02",
  "appointment_time": "14:00",
  "status": "confirmed"
}
```
**Expected Response:** `200 OK`

### 4.5 Cancel Appointment
```
PATCH /appointments/{appointmentId}/cancel
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 4.6 Delete Appointment
```
DELETE /appointments/{appointmentId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

---

## 🏥 **5. CLINICS MODULE** (`/clinics`)

### 5.1 Get All Clinics
```
GET /clinics
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 5.2 Get Clinic by ID
```
GET /clinics/{clinicId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 5.3 Create Clinic
```
POST /clinics
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "Happy Paws Clinic",
  "email": "contact@happypaws.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA"
}
```
**Expected Response:** `201 Created`

### 5.4 Update Clinic
```
PUT /clinics/{clinicId}
Headers: Authorization: Bearer {access_token}
```
**Body:** Same as Create (partial update)

### 5.5 Delete Clinic
```
DELETE /clinics/{clinicId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

---

## 👨‍⚕️ **6. VETERINARIANS MODULE** (`/veterinarians`)

### 6.1 Get All Veterinarians
```
GET /veterinarians
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 6.2 Get Veterinarian by ID
```
GET /veterinarians/{vetId}
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 6.3 Create Veterinarian
```
POST /veterinarians
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "user_id": "uuid",
  "specialization": "General Practice",
  "license_number": "VET12345",
  "years_of_experience": 5,
  "bio": "Experienced vet specializing in cats and dogs"
}
```
**Expected Response:** `201 Created`

### 6.4 Update Veterinarian
```
PUT /veterinarians/{vetId}
Headers: Authorization: Bearer {access_token}
```

### 6.5 Delete Veterinarian
```
DELETE /veterinarians/{vetId}
Headers: Authorization: Bearer {access_token}
```

---

## 🏷️ **7. PET TYPES MODULE** (`/pet-types`)

### 7.1 Get All Pet Types
```
GET /pet-types
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`

### 7.2 Get Pet Type by ID
```
GET /pet-types/{typeId}
Headers: Authorization: Bearer {access_token}
```

### 7.3 Create Pet Type
```
POST /pet-types
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "Dog",
  "description": "Canine pet"
}
```
**Expected Response:** `201 Created`

### 7.4 Update Pet Type
```
PUT /pet-types/{typeId}
Headers: Authorization: Bearer {access_token}
```

### 7.5 Delete Pet Type
```
DELETE /pet-types/{typeId}
Headers: Authorization: Bearer {access_token}
```

---

## 🐕 **8. BREEDS MODULE** (`/breeds`)

### 8.1 Get All Breeds
```
GET /breeds
Headers: Authorization: Bearer {access_token}
```

### 8.2 Get Breed by ID
```
GET /breeds/{breedId}
Headers: Authorization: Bearer {access_token}
```

### 8.3 Create Breed
```
POST /breeds
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "Golden Retriever",
  "pet_type_id": "uuid",
  "description": "Friendly and energetic"
}
```

### 8.4 Update Breed
```
PUT /breeds/{breedId}
Headers: Authorization: Bearer {access_token}
```

### 8.5 Delete Breed
```
DELETE /breeds/{breedId}
Headers: Authorization: Bearer {access_token}
```

---

## 📝 **9. MEDICAL RECORDS MODULE** (`/medical-records`)

### 9.1 Get All Medical Records
```
GET /medical-records
Headers: Authorization: Bearer {access_token}
```

### 9.2 Get Medical Record by ID
```
GET /medical-records/{recordId}
Headers: Authorization: Bearer {access_token}
```

### 9.3 Create Medical Record
```
POST /medical-records
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "pet_id": "uuid",
  "appointment_id": "uuid",
  "diagnosis": "Ear infection",
  "treatment": "Antibiotics prescribed",
  "notes": "Follow-up in 2 weeks",
  "record_date": "2026-02-21"
}
```

### 9.4 Update Medical Record
```
PUT /medical-records/{recordId}
Headers: Authorization: Bearer {access_token}
```

### 9.5 Delete Medical Record
```
DELETE /medical-records/{recordId}
Headers: Authorization: Bearer {access_token}
```

---

## ⭐ **10. REVIEWS MODULE** (`/reviews`)

### 10.1 Get All Reviews
```
GET /reviews
Headers: Authorization: Bearer {access_token}
```

### 10.2 Get Review by ID
```
GET /reviews/{reviewId}
Headers: Authorization: Bearer {access_token}
```

### 10.3 Create Review
```
POST /reviews
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "veterinarian_id": "uuid",
  "rating": 5,
  "comment": "Great service and very friendly staff!",
  "appointment_id": "uuid"
}
```

### 10.4 Update Review
```
PUT /reviews/{reviewId}
Headers: Authorization: Bearer {access_token}
```

### 10.5 Delete Review
```
DELETE /reviews/{reviewId}
Headers: Authorization: Bearer {access_token}
```

---

## 👨‍⚖️ **11. ROLES MODULE** (`/roles`)

### 11.1 Get All Roles
```
GET /roles
Headers: Authorization: Bearer {access_token}
```

### 11.2 Get Role by ID
```
GET /roles/{roleId}
Headers: Authorization: Bearer {access_token}
```

### 11.3 Create Role
```
POST /roles
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "Clinic Admin",
  "description": "Administrator for clinic operations"
}
```

### 11.4 Update Role
```
PUT /roles/{roleId}
Headers: Authorization: Bearer {access_token}
```

### 11.5 Delete Role
```
DELETE /roles/{roleId}
Headers: Authorization: Bearer {access_token}
```

---

## 🔐 **12. PERMISSIONS MODULE** (`/permissions`)

### 12.1 Get All Permissions
```
GET /permissions
Headers: Authorization: Bearer {access_token}
```

### 12.2 Get Permission by ID
```
GET /permissions/{permissionId}
Headers: Authorization: Bearer {access_token}
```

### 12.3 Create Permission
```
POST /permissions
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "delete_pet",
  "description": "Permission to delete pets"
}
```

### 12.4 Update Permission
```
PUT /permissions/{permissionId}
Headers: Authorization: Bearer {access_token}
```

### 12.5 Delete Permission
```
DELETE /permissions/{permissionId}
Headers: Authorization: Bearer {access_token}
```

---

## 📊 **13. DASHBOARD MODULE** (`/dashboard`)

### 13.1 Get Dashboard Stats
```
GET /dashboard
Headers: Authorization: Bearer {access_token}
```
**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "total_users": 50,
    "total_pets": 150,
    "total_appointments": 200,
    "total_clinics": 10,
    ...
  }
}
```

---

## ⚙️ **14. SETTINGS MODULE** (`/settings` or `/setting`)

### 14.1 Get All Settings
```
GET /settings
Headers: Authorization: Bearer {access_token}
```

### 14.2 Get Setting by Key
```
GET /settings/{settingKey}
Headers: Authorization: Bearer {access_token}
```

### 14.3 Update Settings
```
PUT /settings/{settingKey}
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "value": "new_value"
}
```

---

## 🔔 **15. NOTIFICATIONS MODULE** (`/notifications`)

### 15.1 Get All Notifications
```
GET /notifications
Headers: Authorization: Bearer {access_token}
```

### 15.2 Get Notification by ID
```
GET /notifications/{notificationId}
Headers: Authorization: Bearer {access_token}
```

### 15.3 Create Notification
```
POST /notifications
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "user_id": "uuid",
  "title": "Appointment Reminder",
  "message": "Your pet's appointment is tomorrow",
  "type": "reminder"
}
```

### 15.4 Mark as Read
```
PATCH /notifications/{notificationId}/read
Headers: Authorization: Bearer {access_token}
```

### 15.5 Delete Notification
```
DELETE /notifications/{notificationId}
Headers: Authorization: Bearer {access_token}
```

---

## 🌐 **16. NOTIFICATION CHANNELS MODULE** (`/notification-channels`)

### 16.1 Get All Notification Channels
```
GET /notification-channels
Headers: Authorization: Bearer {access_token}
```

### 16.2 Create Notification Channel
```
POST /notification-channels
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "user_id": "uuid",
  "channel_type": "email",
  "channel_value": "user@example.com"
}
```

---

## 📅 **17. VET SCHEDULES MODULE** (`/vet-schedules`)

### 17.1 Get All Schedules
```
GET /vet-schedules
Headers: Authorization: Bearer {access_token}
```

### 17.2 Get Schedule by ID
```
GET /vet-schedules/{scheduleId}
Headers: Authorization: Bearer {access_token}
```

### 17.3 Create Schedule
```
POST /vet-schedules
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "veterinarian_id": "uuid",
  "clinic_id": "uuid",
  "day_of_week": "Monday",
  "start_time": "09:00",
  "end_time": "17:00",
  "break_time": "12:00",
  "is_available": true
}
```

---

## 🧪 **Testing Checklist**

- [ ] **Authentication** - Register → Login → Get Me → Refresh → Logout
- [ ] **Users** - CRUD operations + Role assignments
- [ ] **Pets** - Create pet types → Create breeds → Create pets
- [ ] **Clinics** - Create clinic + Get all
- [ ] **Veterinarians** - Assign to clinics + Get schedules
- [ ] **Appointments** - Create → Update → Cancel → Delete
- [ ] **Medical Records** - Create after appointment
- [ ] **Reviews** - Post review after appointment
- [ ] **Roles & Permissions** - Check RBAC enforcement
- [ ] **Dashboard** - Verify stats aggregation
- [ ] **Notifications** - Create and mark as read

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Missing or invalid Bearer token in Authorization header |
| `400 Bad Request` | Invalid JSON or missing required fields |
| `404 Not Found` | ID doesn't exist or wrong route |
| `500 Server Error` | Check backend console for details |

---

## 📝 Example cURL Commands

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123"}'
```

### Get My Pets:
```bash
curl -X GET http://localhost:3000/api/pets/my-pets \
  -H "Authorization: Bearer {access_token}"
```

### Create Pet:
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Fluffy","pet_type_id":"uuid","breed_id":"uuid","date_of_birth":"2020-01-15","gender":"male"}'
```

---

**Good luck with your testing! 🎉**

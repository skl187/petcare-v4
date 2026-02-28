# 🗓️ Veterinarian Schedules - Manual Testing Guide

**Base URL:** `http://localhost:3000/api`

---

## 📋 Prerequisites

1. **Backend running:** `npm start` in `/backend` folder
2. **Auth token:** Get from `/auth/login` endpoint
3. **Required IDs:**
   - `veterinarian_id` (UUID)
   - `clinic_id` (UUID)
4. **All requests require:** `Authorization: Bearer {access_token}` header

---

## 🗓️ VETERINARIAN SCHEDULES - TEST FLOW

### Step 0: Get Required IDs

First, you need a veterinarian_id and clinic_id. You can:

#### Option A: Create a Veterinarian (if needed)
```
POST /veterinarians
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "user_id": "existing-user-uuid",
  "specialization": "General Practice",
  "license_number": "VET001",
  "years_of_experience": 5,
  "bio": "Experienced veterinarian"
}
```

#### Option B: Create a Clinic (if needed)
```
POST /clinics
Headers: Authorization: Bearer {access_token}
```
**Body:**
```json
{
  "name": "Happy Paws Animal Clinic",
  "email": "contact@happypaws.com",
  "phone": "+1-555-0123",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA"
}
```

---

## ✅ **Test Case 1: Create Single Weekly Schedule**

### 1.1 Create Monday Schedule
```
POST /vet-schedules
Headers: Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "17:00",
  "slot_duration": 30,
  "max_appointments_per_slot": 2,
  "is_available": true
}
```

**Expected Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "new-schedule-uuid",
    "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "17:00",
    "slot_duration": 30,
    "max_appointments_per_slot": 2,
    "is_available": true,
    "created_at": "2026-02-21T10:00:00Z"
  },
  "message": "Schedule created"
}
```

---

### 1.2 Create Tuesday Schedule
```
POST /vet-schedules
Headers: Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 2,
  "start_time": "10:00",
  "end_time": "18:00",
  "slot_duration": 30,
  "max_appointments_per_slot": 2,
  "is_available": true
}
```

---

### 1.3 Create Wednesday Schedule
```
POST /vet-schedules
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 3,
  "start_time": "09:00",
  "end_time": "17:00",
  "slot_duration": 30,
  "max_appointments_per_slot": 1,
  "is_available": true
}
```

---

### 1.4 Create Thursday Schedule (With Break)
```
POST /vet-schedules
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 4,
  "start_time": "09:00",
  "end_time": "17:00",
  "slot_duration": 45,
  "max_appointments_per_slot": 2,
  "is_available": true
}
```

---

### 1.5 Create Friday Schedule (Half Day)
```
POST /vet-schedules
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 5,
  "start_time": "09:00",
  "end_time": "13:00",
  "slot_duration": 30,
  "max_appointments_per_slot": 1,
  "is_available": true
}
```

---

### 1.6 Create Saturday Schedule (Optional, Limited Hours)
```
POST /vet-schedules
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 6,
  "start_time": "10:00",
  "end_time": "14:00",
  "slot_duration": 30,
  "max_appointments_per_slot": 1,
  "is_available": true
}
```

---

### 1.7 Sunday Closed
```
POST /vet-schedules
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 0,
  "start_time": null,
  "end_time": null,
  "is_available": false
}
```

---

## ✅ **Test Case 2: List Schedules**

### 2.1 Get All Schedules for Veterinarian
```
GET /vet-schedules?veterinarian_id=f47ac10b-58cc-4372-a567-0e02b2c3d479
Headers: Authorization: Bearer {access_token}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid1",
      "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "17:00",
      "slot_duration": 30,
      "max_appointments_per_slot": 2,
      "is_available": true,
      "clinic_name": "Happy Paws Animal Clinic",
      "vet_first_name": "John",
      "vet_last_name": "Doe"
    },
    ...more schedules
  ]
}
```

---

### 2.2 Get Schedules for Specific Veterinarian + Clinic
```
GET /vet-schedules?veterinarian_id=f47ac10b-58cc-4372-a567-0e02b2c3d479&clinic_id=550e8400-e29b-41d4-a716-446655440000
Headers: Authorization: Bearer {access_token}
```

**Expected Response:** `200 OK` - Returns schedules only for that veterinarian at that specific clinic

---

## ✅ **Test Case 3: Update Schedule (Upsert)**

### 3.1 Update Existing Monday Schedule
```
POST /vet-schedules
Headers: Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 1,
  "start_time": "08:00",
  "end_time": "18:00",
  "slot_duration": 20,
  "max_appointments_per_slot": 3,
  "is_available": true
}
```

**Expected Response:** `200 OK` (not 201 - because it already exists)
```json
{
  "status": "success",
  "data": {
    "id": "same-uuid-as-before",
    "day_of_week": 1,
    "start_time": "08:00",
    "end_time": "18:00",
    "slot_duration": 20,
    "max_appointments_per_slot": 3,
    "updated_at": "2026-02-21T10:30:00Z"
  },
  "message": "Schedule updated"
}
```

---

### 3.2 Mark Schedule as Unavailable
```
POST /vet-schedules
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "day_of_week": 6,
  "start_time": "10:00",
  "end_time": "14:00",
  "is_available": false
}
```

---

## ✅ **Test Case 4: Bulk Update Weekly Schedule**

### 4.1 Replace Entire Weekly Schedule
```
PUT /vet-schedules/bulk
Headers: Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "schedules": [
    {
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "17:00",
      "slot_duration": 30,
      "max_appointments_per_slot": 2,
      "is_available": true
    },
    {
      "day_of_week": 2,
      "start_time": "09:00",
      "end_time": "17:00",
      "slot_duration": 30,
      "max_appointments_per_slot": 2,
      "is_available": true
    },
    {
      "day_of_week": 3,
      "start_time": "10:00",
      "end_time": "16:00",
      "slot_duration": 45,
      "max_appointments_per_slot": 1,
      "is_available": true
    },
    {
      "day_of_week": 4,
      "start_time": "09:00",
      "end_time": "17:00",
      "slot_duration": 30,
      "max_appointments_per_slot": 2,
      "is_available": true
    },
    {
      "day_of_week": 5,
      "start_time": "09:00",
      "end_time": "13:00",
      "slot_duration": 30,
      "max_appointments_per_slot": 1,
      "is_available": true
    }
  ]
}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    { "id": "uuid1", "day_of_week": 1, ... },
    { "id": "uuid2", "day_of_week": 2, ... },
    ...
  ],
  "message": "Schedules updated"
}
```

⚠️ **Note:** This DELETES all existing schedules for this vet+clinic and creates new ones!

---

## ✅ **Test Case 5: Delete Schedule**

### 5.1 Delete Single Schedule
```
DELETE /vet-schedules/{scheduleId}
Headers: Authorization: Bearer {access_token}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": null,
  "message": "Schedule deleted"
}
```

---

### 5.2 Try to Delete Non-Existent Schedule
```
DELETE /vet-schedules/invalid-uuid
Headers: Authorization: Bearer {access_token}
```

**Expected Response:** `404 Not Found`
```json
{
  "status": "error",
  "message": "Schedule not found"
}
```

---

## ✅ **Test Case 6: Schedule Exceptions**

### 6.1 Create Full Day Off (Leave/Vacation)
```
POST /vet-schedules/exceptions
Headers: Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "exception_date": "2026-03-15",
  "exception_type": "holiday",
  "reason": "Annual leave",
  "is_recurring": false
}
```

**Expected Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "exception-uuid",
    "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
    "exception_date": "2026-03-15",
    "exception_type": "holiday",
    "start_time": null,
    "end_time": null,
    "reason": "Annual leave",
    "is_recurring": false,
    "created_at": "2026-02-21T10:00:00Z"
  },
  "message": "Exception created"
}
```

---

### 6.2 Create Partial Day Off (Morning Only)
```
POST /vet-schedules/exceptions
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "exception_date": "2026-03-20",
  "exception_type": "partial_leave",
  "start_time": "09:00",
  "end_time": "12:00",
  "reason": "Doctor's appointment",
  "is_recurring": false
}
```

---

### 6.3 Create Emergency Leave
```
POST /vet-schedules/exceptions
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
  "exception_date": "2026-02-22",
  "exception_type": "emergency_leave",
  "reason": "Sudden illness",
  "is_recurring": false
}
```

---

### 6.4 Create Recurring Holiday
```
POST /vet-schedules/exceptions
```

**Body:**
```json
{
  "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "exception_date": "2026-12-25",
  "exception_type": "holiday",
  "reason": "Christmas",
  "is_recurring": true
}
```

---

### 6.5 List Schedule Exceptions
```
GET /vet-schedules/exceptions?veterinarian_id=f47ac10b-58cc-4372-a567-0e02b2c3d479
Headers: Authorization: Bearer {access_token}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": "exception-uuid1",
      "veterinarian_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "clinic_id": "550e8400-e29b-41d4-a716-446655440000",
      "exception_date": "2026-03-15",
      "exception_type": "holiday",
      "reason": "Annual leave",
      "is_recurring": false,
      "clinic_name": "Happy Paws Animal Clinic"
    },
    ...more exceptions
  ]
}
```

---

### 6.6 List Exceptions with Date Range Filter
```
GET /vet-schedules/exceptions?veterinarian_id=f47ac10b-58cc-4372-a567-0e02b2c3d479&from_date=2026-03-01&to_date=2026-03-31
Headers: Authorization: Bearer {access_token}
```

**Expected Response:** `200 OK` - Only exceptions between March 1-31

---

### 6.7 Delete Schedule Exception
```
DELETE /vet-schedules/exceptions/{exceptionId}
Headers: Authorization: Bearer {access_token}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": null,
  "message": "Exception deleted"
}
```

---

## 📊 Field Reference

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `day_of_week` | Number (0-6) | 0=Sunday, 1=Monday, ..., 6=Saturday | 1 |
| `start_time` | String (HH:MM) | 24-hour format | "09:00" |
| `end_time` | String (HH:MM) | 24-hour format | "17:00" |
| `slot_duration` | Number | Minutes per appointment slot | 30 |
| `max_appointments_per_slot` | Number | How many can book same slot | 1 or 2 |
| `is_available` | Boolean | Schedule is active | true/false |
| `exception_type` | String | "holiday", "leave", "partial_leave", "emergency_leave", "maintenance" | "holiday" |
| `exception_date` | String (YYYY-MM-DD) | | "2026-03-15" |
| `is_recurring` | Boolean | Repeats yearly | true/false |

---

## 🚨 Validation Rules

| Endpoint | Required Fields | Constraints |
|----------|-----------------|-------------|
| POST (single) | veterinarian_id, clinic_id, day_of_week, start_time, end_time | day_of_week: 0-6 |
| POST (exception) | veterinarian_id, exception_date, exception_type | - |
| PUT (bulk) | veterinarian_id, clinic_id, schedules[] | schedules must be array |
| GET (list) | veterinarian_id | - |
| GET (exceptions) | veterinarian_id | - |

---

## ✅ Complete Manual Test Script

Run these in order:

```
1. POST /auth/login → Get access_token
2. POST /vet-schedules (Mon-Fri) → Create weekly schedule
3. GET /vet-schedules?veterinarian_id=... → Verify schedules created
4. POST /vet-schedules (update Mon) → Update Monday
5. GET /vet-schedules?veterinarian_id=... → Verify update
6. POST /vet-schedules/exceptions (full day off) → Add exception
7. GET /vet-schedules/exceptions?veterinarian_id=... → List exceptions
8. DELETE /vet-schedules/{scheduleId} → Delete one schedule
9. GET /vet-schedules?veterinarian_id=... → Verify deletion
10. PUT /vet-schedules/bulk → Replace all schedules
11. GET /vet-schedules?veterinarian_id=... → Verify bulk update
12. DELETE /vet-schedules/exceptions/{exceptionId} → Delete exception
13. GET /vet-schedules/exceptions?veterinarian_id=... → Verify deletion
```

---

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `400 - veterinarian_id is required` | Missing param | Add `?veterinarian_id=...` to GET or in body |
| `400 - Validation failed` | Missing required field | Ensure all required fields in body |
| `404 - Not found` | Invalid schedule/exception ID | Verify ID from list endpoints |
| `401 - Unauthorized` | Invalid or missing token | Get new token from `/auth/login` |
| `500 - Failed to save schedule` | Database error | Check time format (HH:MM), valid UUIDs |

---

**Good luck testing! 🎉**

# API Endpoints Quick Reference Guide

## Overview
This document provides a quick reference for all API endpoints organized by feature/module.

---

## 1. AUTHENTICATION (7 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh-token` | Refresh access token | No |
| POST | `/auth/verify-email` | Verify email address | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

---

## 2. PET MANAGEMENT (6 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/pets` | Add new pet | Yes |
| GET | `/pets` | Get all user's pets | Yes |
| GET | `/pets/{pet_id}` | Get single pet details | Yes |
| PUT | `/pets/{pet_id}` | Update pet information | Yes |
| DELETE | `/pets/{pet_id}` | Delete pet | Yes |
| GET | `/pets/{pet_id}/vaccinations` | Get pet vaccination history | Yes |

---

## 3. PET TYPES & BREEDS (2 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/pet-types` | Get all pet types | Yes |
| GET | `/pet-types/{pet_type_id}/breeds` | Get breeds by pet type | Yes |

---

## 4. VETERINARIAN & CLINIC INFORMATION (3 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/veterinarians` | List all vets/clinics with filters | Yes |
| GET | `/veterinarians/{vet_id}` | Get single vet details | Yes |
| GET | `/veterinarians/{vet_id}/schedule` | Get vet's schedule & available slots | Yes |

---

## 5. APPOINTMENT BOOKING (6 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/appointments` | Book new appointment | Yes |
| GET | `/appointments` | Get all user's appointments | Yes |
| GET | `/appointments/{appointment_id}` | Get appointment details | Yes |
| PUT | `/appointments/{appointment_id}/reschedule` | Reschedule appointment | Yes |
| POST | `/appointments/{appointment_id}/cancel` | Cancel appointment | Yes |
| GET | `/appointments/{appointment_id}/cost` | Get appointment cost breakdown | Yes |

---

## 6. VETERINARIAN APPOINTMENT MANAGEMENT (7 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/vet/appointments/upcoming` | Get vet's upcoming appointments | Yes |
| GET | `/vet/appointments/today` | Get vet's today's appointments | Yes |
| GET | `/vet/appointments` | Get all vet's appointments with filters | Yes |
| POST | `/vet/appointments/{appointment_id}/confirm` | Confirm appointment | Yes |
| POST | `/vet/appointments/{appointment_id}/start` | Mark as in-progress | Yes |
| POST | `/vet/appointments/{appointment_id}/complete` | Complete appointment | Yes |
| GET | `/vet/appointments/{appointment_id}/details` | Get appointment details (vet view) | Yes |

---

## 7. MEDICAL RECORDS (4 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/vet/appointments/{appointment_id}/medical-records` | Create medical record | Yes |
| GET | `/pets/{pet_id}/medical-records` | Get all pet's medical records | Yes |
| GET | `/medical-records/{record_id}` | Get single medical record | Yes |
| PUT | `/medical-records/{record_id}` | Update medical record | Yes |

---

## 8. PRESCRIPTIONS (4 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/vet/appointments/{appointment_id}/prescriptions` | Create prescription with medications | Yes |
| GET | `/pets/{pet_id}/prescriptions` | Get all pet's prescriptions | Yes |
| GET | `/prescriptions/{prescription_id}` | Get single prescription | Yes |
| PUT | `/prescriptions/{prescription_id}` | Update prescription status | Yes |

---

## 9. LAB TESTS & REPORTS (4 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/vet/appointments/{appointment_id}/lab-tests` | Create lab test order | Yes |
| GET | `/pets/{pet_id}/lab-tests` | Get all pet's lab tests | Yes |
| GET | `/lab-tests/{test_id}` | Get single lab test details | Yes |
| PUT | `/lab-tests/{test_id}` | Update lab test results/status | Yes |

---

## 10. VACCINATIONS (4 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/vet/appointments/{appointment_id}/vaccinations` | Record vaccination | Yes |
| GET | `/pets/{pet_id}/vaccinations` | Get all pet's vaccinations | Yes |
| GET | `/vaccinations/{vaccination_id}` | Get single vaccination record | Yes |
| PUT | `/vaccinations/{vaccination_id}` | Update vaccination record | Yes |

---

## 11. REVIEWS & RATINGS (2 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/vet/appointments/{appointment_id}/reviews` | Submit review for vet | Yes |
| GET | `/veterinarians/{vet_id}/reviews` | Get all reviews for vet | Yes |

---

## 12. PAYMENTS (3 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/appointments/{appointment_id}/cost` | Get appointment cost | Yes |
| POST | `/payments/initiate` | Initiate payment | Yes |
| GET | `/payments/{payment_id}` | Get payment status | Yes |

---

## 13. USER DASHBOARD (2 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/dashboard` | Get user dashboard summary | Yes |
| GET | `/dashboard/medical-history` | Get user's medical history summary | Yes |

---

## 14. VETERINARIAN DASHBOARD (2 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/vet/dashboard` | Get vet dashboard summary | Yes |
| GET | `/vet/dashboard/stats` | Get vet performance statistics | Yes |

---

## 15. ADMIN DASHBOARD & ANALYTICS (5 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/admin/dashboard` | Get admin dashboard overview | Yes |
| GET | `/admin/analytics/veterinarians` | Get vet analytics & performance | Yes |
| GET | `/admin/analytics/users` | Get users analytics | Yes |
| GET | `/admin/analytics/revenue` | Get revenue analytics | Yes |
| GET | `/admin/analytics/appointments` | Get appointment analytics | Yes |

---

## 16. USER PROFILE & SETTINGS (4 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update user profile | Yes |
| POST | `/users/change-password` | Change password | Yes |
| POST | `/users/avatar` | Upload avatar image | Yes |

---

## 17. APPOINTMENT REMINDERS (2 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/appointments/{appointment_id}/reminders` | Get appointment reminders | Yes |
| POST | `/appointments/{appointment_id}/reminders` | Set appointment reminder | Yes |

---

## 18. SERVICES & CLINICS (2 endpoints)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| GET | `/services` | Get all available services | Yes |
| GET | `/clinics/{clinic_id}` | Get clinic details | Yes |

---

## SUMMARY BY FEATURE

### User Registration & Auth Flow
```
1. POST /auth/register - Register new account
2. POST /auth/verify-email - Verify email
3. POST /auth/login - Login to account
4. POST /auth/refresh-token - Refresh token (if needed)
5. POST /auth/logout - Logout
```

### User Adding Pet & Viewing Pets
```
1. GET /pet-types - Browse pet types
2. GET /pet-types/{pet_type_id}/breeds - Browse breeds
3. POST /pets - Add new pet
4. GET /pets - View all pets
5. GET /pets/{pet_id} - View pet details
6. PUT /pets/{pet_id} - Update pet info
```

### User Booking Appointment
```
1. GET /veterinarians - Browse veterinarians/clinics
2. GET /veterinarians/{vet_id} - View vet details
3. GET /veterinarians/{vet_id}/schedule - Check available slots
4. POST /appointments - Book appointment
5. GET /appointments - View all appointments
6. GET /appointments/{appointment_id} - View appointment details
```

### User Viewing Medical Records After Update
```
1. GET /pets/{pet_id}/medical-records - View all medical records
2. GET /medical-records/{record_id} - View specific record
3. GET /pets/{pet_id}/prescriptions - View prescriptions
4. GET /pets/{pet_id}/vaccinations - View vaccinations
5. GET /pets/{pet_id}/lab-tests - View lab reports
```

### Veterinarian Confirming Appointments
```
1. GET /vet/appointments/upcoming - View upcoming appointments
2. GET /vet/appointments/today - View today's appointments
3. POST /vet/appointments/{appointment_id}/confirm - Confirm appointment
4. POST /vet/appointments/{appointment_id}/start - Start appointment
```

### Veterinarian Updating Medical Information
```
1. POST /vet/appointments/{appointment_id}/medical-records - Add medical record
2. POST /vet/appointments/{appointment_id}/prescriptions - Add prescription
3. POST /vet/appointments/{appointment_id}/lab-tests - Order lab tests
4. POST /vet/appointments/{appointment_id}/vaccinations - Record vaccination
5. PUT /medical-records/{record_id} - Update medical record
6. PUT /prescriptions/{prescription_id} - Update prescription
7. PUT /lab-tests/{test_id} - Update lab test results
8. POST /vet/appointments/{appointment_id}/complete - Complete appointment
```

### Veterinarian Viewing Dashboard
```
1. GET /vet/dashboard - View dashboard overview
2. GET /vet/dashboard/stats - View performance statistics
3. GET /vet/appointments - View all appointments with filters
```

### Admin Viewing Statistics
```
1. GET /admin/dashboard - View admin dashboard
2. GET /admin/analytics/veterinarians - Vet performance stats
3. GET /admin/analytics/users - User analytics
4. GET /admin/analytics/revenue - Revenue analytics
5. GET /admin/analytics/appointments - Appointment analytics
```

---

## TOTAL ENDPOINTS: 56

### Breakdown by Category:
- Authentication: 7
- Pet Management: 6
- Pet Types & Breeds: 2
- Veterinarian & Clinic Info: 3
- Appointment Booking: 6
- Vet Appointment Management: 7
- Medical Records: 4
- Prescriptions: 4
- Lab Tests: 4
- Vaccinations: 4
- Reviews: 2
- Payments: 3
- User Dashboard: 2
- Vet Dashboard: 2
- Admin Dashboard: 5
- User Profile: 4
- Reminders: 2
- Services & Clinics: 2

---

## AUTHENTICATION

All protected endpoints require:
```
Authorization: Bearer {jwt_access_token}
```

Token obtained from: `POST /auth/login`

---

## RESPONSE FORMATS

### Success Response (2xx)
```json
{
  "data": {...},
  "message": "Success message",
  "status": 200
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "error_code",
  "message": "Error description",
  "details": {}
}
```

---

## COMMON QUERY PARAMETERS

**Pagination:**
- `page=1` - Page number
- `limit=10` - Items per page

**Filtering:**
- `status=active` - Filter by status
- `from_date=2026-01-01` - Start date filter
- `to_date=2026-12-31` - End date filter
- `search=keyword` - Search query

**Sorting:**
- `sort_by=created_at` - Field to sort
- `sort_order=desc` - asc or desc

---

## RATE LIMITS

- **General**: 100 requests/minute
- **Auth**: 5 requests/minute
- **Payments**: 10 requests/minute

Check response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643645400
```

---

## BASE URL

```
https://api.petcare.com/v1
```

## API DOCUMENTATION

- Swagger UI: https://api.petcare.com/docs
- OpenAPI: https://api.petcare.com/openapi.json
- Postman: https://api.petcare.com/postman.json

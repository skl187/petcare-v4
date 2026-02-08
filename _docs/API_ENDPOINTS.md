# Pet Care Application - Comprehensive API Endpoints

## Base URL
```
https://api.bracepetcare.com/v1
```

---

# Authentication Endpoints

### User Registration
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "message": "Registration successful. Please verify your email."
}
```

### User Login
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "role": "user"
  },
  "expires_in": 3600
}
```

### User Logout
```
POST /auth/logout
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

Request Body:
{
  "refresh_token": "refresh_jwt_token"
}

Response: 200 OK
{
  "access_token": "new_jwt_token",
  "expires_in": 3600
}
```

### Verify Email
```
POST /auth/verify-email
Content-Type: application/json

Request Body:
{
  "token": "verification_token"
}

Response: 200 OK
{
  "message": "Email verified successfully"
}
```

### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Password reset link sent to your email"
}
```

### Reset Password
```
POST /auth/reset-password
Content-Type: application/json

Request Body:
{
  "token": "reset_token",
  "new_password": "newPassword123"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

---

## Pet Management Endpoints

### Add Pet
```
POST /pets
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "name": "Buddy",
  "pet_type_id": "uuid",
  "breed_id": "uuid",
  "size": "medium",
  "gender": "male",
  "date_of_birth": "2020-05-15",
  "weight": 25.5,
  "height": 50,
  "weight_unit": "kg",
  "height_unit": "cm",
  "additional_info": {
    "color": "brown",
    "distinguishing_marks": "white paws"
  }
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Buddy",
  "pet_type": "Dog",
  "breed": "Golden Retriever",
  "user_id": "uuid",
  "created_at": "2026-02-01T10:00:00Z"
}
```

### Get All User Pets
```
GET /pets
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=10
  - status=active

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Buddy",
      "pet_type": "Dog",
      "breed": "Golden Retriever",
      "gender": "male",
      "weight": 25.5,
      "age": "5 years",
      "created_at": "2020-05-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

### Get Single Pet Details
```
GET /pets/{pet_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "name": "Buddy",
  "pet_type_id": "uuid",
  "breed_id": "uuid",
  "pet_type": "Dog",
  "breed": "Golden Retriever",
  "size": "medium",
  "gender": "male",
  "date_of_birth": "2020-05-15",
  "weight": 25.5,
  "height": 50,
  "weight_unit": "kg",
  "height_unit": "cm",
  "additional_info": {
    "color": "brown",
    "distinguishing_marks": "white paws"
  },
  "created_at": "2020-05-15T00:00:00Z"
}
```

### Update Pet Details
```
PUT /pets/{pet_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "name": "Buddy Updated",
  "weight": 26,
  "height": 51,
  "additional_info": {
    "color": "brown",
    "distinguishing_marks": "white paws"
  }
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Buddy Updated",
  "weight": 26,
  "updated_at": "2026-02-01T12:00:00Z"
}
```

### Delete Pet
```
DELETE /pets/{pet_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Pet deleted successfully"
}
```

### Get Pet Types (For Pet Registration)
```
GET /pet-types
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Dog",
      "slug": "dog"
    },
    {
      "id": "uuid",
      "name": "Cat",
      "slug": "cat"
    }
  ]
}
```

### Get Breeds by Pet Type
```
GET /pet-types/{pet_type_id}/breeds
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=50

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Golden Retriever",
      "slug": "golden-retriever",
      "pet_type_id": "uuid"
    }
  ]
}
```

---

# Veterinarian Management Endpoints

### Get All Veterinarians/Clinics
```
GET /veterinarians
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - search=clinic_name
  - location=city
  - rating=4.5
  - services=surgery,vaccination

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "first_name": "Dr.",
      "last_name": "Smith",
      "specialization": "General Practice",
      "clinic": {
        "id": "uuid",
        "name": "Happy Paws Clinic",
        "address": "123 Main St",
        "city": "New York",
        "phone": "+1234567890",
        "email": "contact@happypaws.com"
      },
      "rating": 4.8,
      "total_reviews": 150,
      "availability": "Available"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### Get Single Veterinarian Details
```
GET /veterinarians/{vet_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "first_name": "Dr.",
  "last_name": "Smith",
  "specialization": "General Practice",
  "license_number": "LIC123456",
  "experience_years": 15,
  "clinic": {
    "id": "uuid",
    "name": "Happy Paws Clinic",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "phone": "+1234567890",
    "email": "contact@happypaws.com",
    "website": "https://happypaws.com"
  },
  "services": [
    {
      "id": "uuid",
      "name": "Vaccination",
      "price": 50.00
    },
    {
      "id": "uuid",
      "name": "Surgery",
      "price": 500.00
    }
  ],
  "rating": 4.8,
  "total_reviews": 150,
  "response_time": "2 hours"
}
```

### Get Veterinarian Schedule
```
GET /veterinarians/{vet_id}/schedule
Authorization: Bearer {access_token}

Query Parameters:
  - date=2026-02-05
  - week=true (optional)

Response: 200 OK
{
  "veterinarian_id": "uuid",
  "schedule": [
    {
      "id": "uuid",
      "day_of_week": "Monday",
      "start_time": "09:00",
      "end_time": "17:00",
      "slot_duration": 30,
      "is_active": true,
      "available_slots": [
        "09:00", "09:30", "10:00", "10:30"
      ]
    }
  ]
}
```

---

## Appointment Booking Endpoints

### Book Appointment
```
POST /appointments
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "pet_id": "uuid",
  "veterinarian_id": "uuid",
  "clinic_id": "uuid",
  "service_id": "uuid",
  "appointment_date": "2026-02-10",
  "appointment_time": "14:30",
  "reason_for_visit": "Regular checkup",
  "notes": "Pet has been limping slightly",
  "preferred_communication": "sms"
}

Response: 201 Created
{
  "id": "uuid",
  "appointment_number": "APT-2026-0001",
  "pet_id": "uuid",
  "veterinarian_id": "uuid",
  "appointment_date": "2026-02-10",
  "appointment_time": "14:30",
  "status": "scheduled",
  "reason_for_visit": "Regular checkup",
  "created_at": "2026-02-01T10:00:00Z"
}
```

### Get User's All Appointments
```
GET /appointments
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=10
  - status=scheduled,completed,cancelled
  - pet_id=uuid (optional)
  - from_date=2026-01-01
  - to_date=2026-12-31

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "appointment_number": "APT-2026-0001",
      "pet": {
        "id": "uuid",
        "name": "Buddy"
      },
      "veterinarian": {
        "id": "uuid",
        "first_name": "Dr.",
        "last_name": "Smith"
      },
      "clinic": {
        "id": "uuid",
        "name": "Happy Paws Clinic"
      },
      "appointment_date": "2026-02-10",
      "appointment_time": "14:30",
      "status": "scheduled",
      "service": {
        "id": "uuid",
        "name": "Vaccination",
        "price": 50.00
      },
      "reason_for_visit": "Regular checkup",
      "created_at": "2026-02-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8
  }
}
```

### Get Single Appointment Details
```
GET /appointments/{appointment_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "appointment_number": "APT-2026-0001",
  "pet": {
    "id": "uuid",
    "name": "Buddy",
    "breed": "Golden Retriever"
  },
  "veterinarian": {
    "id": "uuid",
    "first_name": "Dr.",
    "last_name": "Smith",
    "specialization": "General Practice"
  },
  "clinic": {
    "id": "uuid",
    "name": "Happy Paws Clinic",
    "address": "123 Main St",
    "phone": "+1234567890"
  },
  "appointment_date": "2026-02-10",
  "appointment_time": "14:30",
  "status": "scheduled",
  "service": {
    "id": "uuid",
    "name": "Vaccination",
    "price": 50.00
  },
  "reason_for_visit": "Regular checkup",
  "notes": "Pet has been limping slightly",
  "payment_status": "pending",
  "created_at": "2026-02-01T10:00:00Z"
}
```

### Reschedule Appointment
```
PUT /appointments/{appointment_id}/reschedule
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "appointment_date": "2026-02-15",
  "appointment_time": "15:00"
}

Response: 200 OK
{
  "id": "uuid",
  "appointment_number": "APT-2026-0001",
  "appointment_date": "2026-02-15",
  "appointment_time": "15:00",
  "status": "scheduled",
  "message": "Appointment rescheduled successfully"
}
```

### Cancel Appointment
```
POST /appointments/{appointment_id}/cancel
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "reason": "Cannot make it",
  "feedback": "Will reschedule later"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "cancelled",
  "cancelled_at": "2026-02-01T10:30:00Z",
  "message": "Appointment cancelled successfully"
}
```

---

## Veterinarian Appointment Management Endpoints

### Get Vet's Upcoming Appointments
```
GET /vet/appointments/upcoming
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - date=2026-02-10 (optional)

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "appointment_number": "APT-2026-0001",
      "pet": {
        "id": "uuid",
        "name": "Buddy",
        "breed": "Golden Retriever",
        "owner": {
          "first_name": "John",
          "last_name": "Doe",
          "phone": "+1234567890"
        }
      },
      "appointment_date": "2026-02-10",
      "appointment_time": "14:30",
      "status": "scheduled",
      "reason_for_visit": "Regular checkup",
      "notes": "Pet has been limping slightly"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### Get Vet's Today's Appointments
```
GET /vet/appointments/today
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - status=scheduled,in-progress,completed

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "appointment_number": "APT-2026-0001",
      "pet": {
        "id": "uuid",
        "name": "Buddy",
        "breed": "Golden Retriever",
        "weight": 25.5,
        "owner": {
          "first_name": "John",
          "last_name": "Doe",
          "phone": "+1234567890"
        }
      },
      "appointment_time": "14:30",
      "status": "scheduled",
      "reason_for_visit": "Regular checkup"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

### Get All Vet's Appointments (With Filters)
```
GET /vet/appointments
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - status=scheduled,completed,cancelled
  - from_date=2026-01-01
  - to_date=2026-12-31
  - pet_name=Buddy
  - owner_name=John

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "appointment_number": "APT-2026-0001",
      "pet": {
        "id": "uuid",
        "name": "Buddy"
      },
      "owner": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "appointment_date": "2026-02-10",
      "appointment_time": "14:30",
      "status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 85
  }
}
```

### Confirm Appointment (Vet/Clinic Staff)
```
POST /vet/appointments/{appointment_id}/confirm
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "notes": "Confirmed by clinic staff"
}

Response: 200 OK
{
  "id": "uuid",
  "appointment_number": "APT-2026-0001",
  "status": "confirmed",
  "confirmed_at": "2026-02-01T11:00:00Z",
  "message": "Appointment confirmed successfully"
}
```

### Mark Appointment as In-Progress
```
POST /vet/appointments/{appointment_id}/start
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "status": "in-progress",
  "started_at": "2026-02-10T14:30:00Z"
}
```

### Complete Appointment
```
POST /vet/appointments/{appointment_id}/complete
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "notes": "Appointment completed successfully"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "completed",
  "completed_at": "2026-02-10T15:00:00Z",
  "message": "Appointment marked as completed"
}
```

---

## Medical Records & Health Information Endpoints

### Create Medical Record
```
POST /vet/appointments/{appointment_id}/medical-records
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "record_type": "consultation",
  "diagnosis": "Ear infection",
  "symptoms": ["ear scratching", "head shaking"],
  "vital_signs": {
    "temperature": 38.5,
    "heart_rate": 90,
    "respiratory_rate": 25
  },
  "physical_examination": "Redness in ear canal, discharge present",
  "treatment_plan": "Antibiotic drops prescribed",
  "recommendations": "Keep ears clean, return after 2 weeks",
  "followup_required": true,
  "followup_date": "2026-02-24",
  "notes": "Severe infection, requires follow-up"
}

Response: 201 Created
{
  "id": "uuid",
  "appointment_id": "uuid",
  "pet_id": "uuid",
  "record_type": "consultation",
  "diagnosis": "Ear infection",
  "record_date": "2026-02-10T14:30:00Z",
  "created_at": "2026-02-10T14:30:00Z"
}
```

### Get Medical Records for Pet
```
GET /pets/{pet_id}/medical-records
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - from_date=2026-01-01
  - to_date=2026-12-31
  - record_type=consultation,surgery,vaccination

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "appointment_id": "uuid",
      "record_type": "consultation",
      "diagnosis": "Ear infection",
      "record_date": "2026-02-10T14:30:00Z",
      "veterinarian": {
        "first_name": "Dr.",
        "last_name": "Smith"
      },
      "clinic": {
        "name": "Happy Paws Clinic"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

### Get Single Medical Record
```
GET /medical-records/{record_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "appointment_id": "uuid",
  "pet_id": "uuid",
  "veterinarian": {
    "first_name": "Dr.",
    "last_name": "Smith"
  },
  "record_type": "consultation",
  "record_date": "2026-02-10T14:30:00Z",
  "diagnosis": "Ear infection",
  "symptoms": ["ear scratching", "head shaking"],
  "vital_signs": {
    "temperature": 38.5,
    "heart_rate": 90
  },
  "physical_examination": "Redness in ear canal",
  "treatment_plan": "Antibiotic drops prescribed",
  "recommendations": "Keep ears clean",
  "followup_required": true,
  "followup_date": "2026-02-24",
  "notes": "Severe infection"
}
```

### Update Medical Record
```
PUT /medical-records/{record_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "diagnosis": "Ear infection - Updated",
  "treatment_plan": "Antibiotic drops and ear cleaning prescribed",
  "notes": "Patient responding well to treatment"
}

Response: 200 OK
{
  "id": "uuid",
  "diagnosis": "Ear infection - Updated",
  "updated_at": "2026-02-12T10:00:00Z"
}
```

---

## Prescriptions Endpoints

### Create Prescription
```
POST /vet/appointments/{appointment_id}/prescriptions
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "medical_record_id": "uuid",
  "medications": [
    {
      "medication_name": "Amoxicillin",
      "dosage": "250mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "route": "Oral",
      "instructions": "Give with food",
      "quantity": "14 tablets",
      "refills_allowed": 1
    },
    {
      "medication_name": "Ear drops",
      "dosage": "5ml",
      "frequency": "Twice daily",
      "duration": "10 days",
      "route": "Topical",
      "instructions": "Apply to affected ear",
      "quantity": "1 bottle",
      "refills_allowed": 0
    }
  ],
  "valid_until": "2026-05-10",
  "notes": "Follow instructions carefully"
}

Response: 201 Created
{
  "id": "uuid",
  "prescription_number": "RX-2026-00123",
  "appointment_id": "uuid",
  "pet_id": "uuid",
  "prescription_date": "2026-02-10",
  "status": "active",
  "medications_count": 2,
  "created_at": "2026-02-10T14:30:00Z"
}
```

### Get Prescriptions for Pet
```
GET /pets/{pet_id}/prescriptions
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - status=active,completed,expired,cancelled

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "prescription_number": "RX-2026-00123",
      "appointment_id": "uuid",
      "prescription_date": "2026-02-10",
      "valid_until": "2026-05-10",
      "status": "active",
      "veterinarian": {
        "first_name": "Dr.",
        "last_name": "Smith"
      },
      "medications": [
        {
          "medication_name": "Amoxicillin",
          "dosage": "250mg",
          "frequency": "Twice daily"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

### Get Single Prescription
```
GET /prescriptions/{prescription_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "prescription_number": "RX-2026-00123",
  "appointment_id": "uuid",
  "pet_id": "uuid",
  "veterinarian": {
    "first_name": "Dr.",
    "last_name": "Smith"
  },
  "prescription_date": "2026-02-10",
  "valid_until": "2026-05-10",
  "status": "active",
  "notes": "Follow instructions carefully",
  "medications": [
    {
      "id": "uuid",
      "medication_name": "Amoxicillin",
      "dosage": "250mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "route": "Oral",
      "instructions": "Give with food",
      "quantity": "14 tablets",
      "refills_allowed": 1
    }
  ]
}
```

### Update Prescription Status
```
PUT /prescriptions/{prescription_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "status": "completed",
  "notes": "Course completed successfully"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "completed",
  "updated_at": "2026-02-18T10:00:00Z"
}
```

---

## Lab Reports & Tests Endpoints

### Create Lab Test
```
POST /vet/appointments/{appointment_id}/lab-tests
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "medical_record_id": "uuid",
  "test_name": "Complete Blood Count",
  "test_type": "Hematology",
  "ordered_date": "2026-02-10",
  "lab_name": "ABC Veterinary Lab",
  "urgency": "routine",
  "cost": 150.00
}

Response: 201 Created
{
  "id": "uuid",
  "test_name": "Complete Blood Count",
  "test_type": "Hematology",
  "status": "ordered",
  "ordered_date": "2026-02-10",
  "created_at": "2026-02-10T14:30:00Z"
}
```

### Get Lab Tests for Pet
```
GET /pets/{pet_id}/lab-tests
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - status=ordered,processing,completed,cancelled

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "test_name": "Complete Blood Count",
      "test_type": "Hematology",
      "ordered_date": "2026-02-10",
      "status": "completed",
      "result_date": "2026-02-12T10:00:00Z",
      "lab_name": "ABC Veterinary Lab",
      "interpretation": "Results within normal range"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}
```

### Get Single Lab Test
```
GET /lab-tests/{test_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "test_name": "Complete Blood Count",
  "test_type": "Hematology",
  "ordered_date": "2026-02-10",
  "sample_collected_date": "2026-02-10T15:00:00Z",
  "result_date": "2026-02-12T10:00:00Z",
  "status": "completed",
  "results": {
    "white_blood_cells": 7.5,
    "red_blood_cells": 6.2,
    "hemoglobin": 14.5
  },
  "normal_range": "WBC: 6.0-17.0 K/uL",
  "interpretation": "Results within normal range",
  "lab_name": "ABC Veterinary Lab",
  "cost": 150.00
}
```

### Update Lab Test Status
```
PUT /lab-tests/{test_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "status": "completed",
  "sample_collected_date": "2026-02-10T15:00:00Z",
  "result_date": "2026-02-12T10:00:00Z",
  "results": {
    "white_blood_cells": 7.5,
    "red_blood_cells": 6.2
  },
  "interpretation": "Results within normal range"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "completed",
  "updated_at": "2026-02-12T10:00:00Z"
}
```

---

## Vaccinations Endpoints

### Record Vaccination
```
POST /vet/appointments/{appointment_id}/vaccinations
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "vaccine_name": "Rabies",
  "vaccine_type": "Inactivated",
  "manufacturer": "Merial",
  "batch_number": "RB123456",
  "vaccination_date": "2026-02-10",
  "next_due_date": "2027-02-10",
  "site_of_injection": "Left hindquarter",
  "adverse_reactions": "None",
  "cost": 40.00,
  "notes": "Annual booster",
  "certificate_issued": true,
  "certificate_number": "CERT-2026-001"
}

Response: 201 Created
{
  "id": "uuid",
  "vaccine_name": "Rabies",
  "vaccination_date": "2026-02-10",
  "next_due_date": "2027-02-10",
  "certificate_number": "CERT-2026-001",
  "created_at": "2026-02-10T14:30:00Z"
}
```

### Get Vaccinations for Pet
```
GET /pets/{pet_id}/vaccinations
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - include_past=true

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "vaccine_name": "Rabies",
      "vaccine_type": "Inactivated",
      "vaccination_date": "2026-02-10",
      "next_due_date": "2027-02-10",
      "status": "due",
      "certificate_number": "CERT-2026-001",
      "veterinarian": {
        "first_name": "Dr.",
        "last_name": "Smith"
      }
    },
    {
      "id": "uuid",
      "vaccine_name": "DHPP",
      "vaccine_type": "Live Attenuated",
      "vaccination_date": "2026-01-15",
      "next_due_date": "2027-01-15",
      "status": "current",
      "certificate_number": "CERT-2026-002"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

### Get Single Vaccination Record
```
GET /vaccinations/{vaccination_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "pet_id": "uuid",
  "appointment_id": "uuid",
  "vaccine_name": "Rabies",
  "vaccine_type": "Inactivated",
  "manufacturer": "Merial",
  "batch_number": "RB123456",
  "vaccination_date": "2026-02-10",
  "next_due_date": "2027-02-10",
  "site_of_injection": "Left hindquarter",
  "adverse_reactions": "None",
  "cost": 40.00,
  "notes": "Annual booster",
  "certificate_issued": true,
  "certificate_number": "CERT-2026-001",
  "veterinarian": {
    "first_name": "Dr.",
    "last_name": "Smith"
  }
}
```

### Update Vaccination
```
PUT /vaccinations/{vaccination_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "adverse_reactions": "Mild swelling at injection site",
  "notes": "Monitor for 24 hours"
}

Response: 200 OK
{
  "id": "uuid",
  "updated_at": "2026-02-10T16:00:00Z"
}
```

---

## Reviews & Ratings Endpoints

### Submit Review for Veterinarian
```
POST /vet/appointments/{appointment_id}/reviews
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "rating": 4.5,
  "review_text": "Dr. Smith was very professional and caring. The clinic was clean and well-organized.",
  "professionalism_rating": 5,
  "knowledge_rating": 5,
  "communication_rating": 4,
  "facility_rating": 4,
  "is_anonymous": false
}

Response: 201 Created
{
  "id": "uuid",
  "appointment_id": "uuid",
  "veterinarian_id": "uuid",
  "rating": 4.5,
  "status": "pending",
  "created_at": "2026-02-10T16:00:00Z"
}
```

### Get Reviews for Veterinarian
```
GET /veterinarians/{vet_id}/reviews
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=10
  - sort_by=recent,helpful,rating

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "display_name": "John D."
      },
      "rating": 4.5,
      "review_text": "Dr. Smith was very professional and caring.",
      "professionalism_rating": 5,
      "knowledge_rating": 5,
      "communication_rating": 4,
      "facility_rating": 4,
      "created_at": "2026-02-10T16:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150
  },
  "summary": {
    "average_rating": 4.8,
    "total_reviews": 150
  }
}
```

---

## Payment Endpoints

### Get Appointment Cost
```
GET /appointments/{appointment_id}/cost
Authorization: Bearer {access_token}

Response: 200 OK
{
  "appointment_id": "uuid",
  "service_cost": 50.00,
  "lab_tests_cost": 150.00,
  "vaccination_cost": 40.00,
  "other_charges": 0.00,
  "subtotal": 240.00,
  "tax": 24.00,
  "total": 264.00,
  "currency": "USD"
}
```

### Initiate Payment
```
POST /payments/initiate
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "appointment_id": "uuid",
  "payment_method": "credit_card",
  "amount": 264.00
}

Response: 201 Created
{
  "id": "uuid",
  "appointment_id": "uuid",
  "amount": 264.00,
  "status": "pending",
  "payment_link": "https://payment.petcare.com/pay/tx_123",
  "expires_at": "2026-02-01T11:00:00Z"
}
```

### Get Payment Status
```
GET /payments/{payment_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "appointment_id": "uuid",
  "amount": 264.00,
  "status": "completed",
  "payment_method": "credit_card",
  "transaction_id": "TXN-2026-001",
  "paid_at": "2026-02-01T10:30:00Z"
}
```

---

## User Dashboard Endpoints

### Get User Dashboard Summary
```
GET /dashboard
Authorization: Bearer {access_token}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "avatar_url": "https://..."
  },
  "pets_count": 2,
  "upcoming_appointments_count": 1,
  "completed_appointments_count": 5,
  "pets": [
    {
      "id": "uuid",
      "name": "Buddy",
      "breed": "Golden Retriever",
      "last_checkup": "2026-01-15"
    }
  ],
  "upcoming_appointments": [
    {
      "id": "uuid",
      "appointment_date": "2026-02-10",
      "pet_name": "Buddy",
      "veterinarian_name": "Dr. Smith"
    }
  ]
}
```

### Get User Medical History Summary
```
GET /dashboard/medical-history
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_appointments": 8,
  "total_medical_records": 12,
  "total_vaccinations": 5,
  "total_prescriptions": 7,
  "recent_records": [
    {
      "id": "uuid",
      "pet_name": "Buddy",
      "type": "vaccination",
      "date": "2026-02-10",
      "description": "Rabies vaccination"
    }
  ]
}
```

---

## Veterinarian Dashboard Endpoints

### Get Vet Dashboard Summary
```
GET /vet/dashboard
Authorization: Bearer {access_token}

Response: 200 OK
{
  "veterinarian": {
    "id": "uuid",
    "first_name": "Dr.",
    "last_name": "Smith",
    "specialization": "General Practice"
  },
  "clinic": {
    "id": "uuid",
    "name": "Happy Paws Clinic"
  },
  "today_appointments_count": 5,
  "upcoming_appointments_count": 12,
  "pending_confirmations": 3,
  "patients_total": 245,
  "rating": 4.8,
  "today_appointments": [
    {
      "id": "uuid",
      "time": "14:30",
      "pet_name": "Buddy",
      "owner_name": "John Doe",
      "status": "scheduled"
    }
  ]
}
```

### Get Vet Performance Stats
```
GET /vet/dashboard/stats
Authorization: Bearer {access_token}

Query Parameters:
  - period=monthly (weekly, monthly, yearly)
  - year=2026
  - month=2

Response: 200 OK
{
  "total_appointments": 85,
  "completed_appointments": 82,
  "cancelled_appointments": 3,
  "average_rating": 4.8,
  "total_reviews": 150,
  "consultation_count": 50,
  "surgery_count": 10,
  "vaccination_count": 25,
  "revenue": 15000.00,
  "busiest_day": "Saturday"
}
```

---

## Admin Dashboard Endpoints

### Get Admin Dashboard Stats
```
GET /admin/dashboard
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_users": 1250,
  "total_veterinarians": 45,
  "total_clinics": 20,
  "total_appointments": 8500,
  "total_revenue": 250000.00,
  "active_users": 980,
  "new_users_this_month": 150,
  "appointments_this_month": 850,
  "appointment_completion_rate": 95.2,
  "average_user_rating": 4.6,
  "average_vet_rating": 4.7
}
```

### Get Veterinarians Analytics
```
GET /admin/analytics/veterinarians
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - sort_by=appointments,rating,revenue

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Dr. Smith",
      "clinic": "Happy Paws Clinic",
      "total_appointments": 450,
      "completed_appointments": 445,
      "rating": 4.8,
      "total_reviews": 150,
      "revenue": 22500.00,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### Get Users Analytics
```
GET /admin/analytics/users
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - status=active,inactive,suspended
  - from_date=2026-01-01
  - to_date=2026-12-31

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "total_pets": 2,
      "total_appointments": 8,
      "total_spent": 2500.00,
      "status": "active",
      "joined_date": "2025-06-15",
      "last_login": "2026-02-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250
  }
}
```

### Get Revenue Analytics
```
GET /admin/analytics/revenue
Authorization: Bearer {access_token}

Query Parameters:
  - period=monthly (weekly, monthly, yearly)
  - year=2026
  - month=2

Response: 200 OK
{
  "period": "February 2026",
  "total_revenue": 25000.00,
  "service_revenue": 15000.00,
  "lab_test_revenue": 5000.00,
  "vaccination_revenue": 5000.00,
  "transaction_count": 450,
  "average_transaction": 55.56,
  "daily_breakdown": [
    {
      "date": "2026-02-01",
      "revenue": 800.00
    }
  ]
}
```

### Get Appointments Analytics
```
GET /admin/analytics/appointments
Authorization: Bearer {access_token}

Query Parameters:
  - period=monthly
  - year=2026

Response: 200 OK
{
  "total_appointments": 850,
  "completed": 808,
  "cancelled": 42,
  "completion_rate": 95.1,
  "average_wait_time": 15,
  "peak_hours": ["10:00-11:00", "14:00-15:00"],
  "most_booked_services": [
    {
      "service": "General Checkup",
      "count": 320
    }
  ]
}
```

---

## User Profile & Settings Endpoints

### Get User Profile
```
GET /users/profile
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "display_name": "John D.",
  "avatar_url": "https://...",
  "bio": "Pet lover and owner",
  "is_email_verified": true,
  "status": "active",
  "created_at": "2025-06-15T00:00:00Z"
}
```

### Update User Profile
```
PUT /users/profile
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "display_name": "John D.",
  "bio": "Pet lover and owner"
}

Response: 200 OK
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "updated_at": "2026-02-01T10:00:00Z"
}
```

### Change Password
```
POST /users/change-password
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

### Update Avatar
```
POST /users/avatar
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Request Body:
{
  "file": <image_file>
}

Response: 200 OK
{
  "avatar_url": "https://...",
  "message": "Avatar updated successfully"
}
```

---

## Appointment Reminders Endpoints

### Get Appointment Reminders
```
GET /appointments/{appointment_id}/reminders
Authorization: Bearer {access_token}

Response: 200 OK
{
  "reminders": [
    {
      "id": "uuid",
      "reminder_type": "email",
      "scheduled_time": "2026-02-09T14:30:00Z",
      "status": "pending",
      "message": "Appointment reminder for Buddy with Dr. Smith"
    },
    {
      "id": "uuid",
      "reminder_type": "sms",
      "scheduled_time": "2026-02-10T09:00:00Z",
      "status": "pending"
    }
  ]
}
```

### Set Appointment Reminder
```
POST /appointments/{appointment_id}/reminders
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "reminder_type": "email",
  "reminder_days_before": 1,
  "reminder_time": "14:30"
}

Response: 201 Created
{
  "id": "uuid",
  "reminder_type": "email",
  "scheduled_time": "2026-02-09T14:30:00Z",
  "status": "pending"
}
```

---

## Services & Clinics Endpoints

### Get All Services
```
GET /services
Authorization: Bearer {access_token}

Query Parameters:
  - page=1
  - limit=20
  - search=vaccination

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "General Checkup",
      "description": "Routine health checkup",
      "base_price": 50.00
    },
    {
      "id": "uuid",
      "name": "Vaccination",
      "description": "Immunization services",
      "base_price": 40.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### Get Clinic Details
```
GET /clinics/{clinic_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "name": "Happy Paws Clinic",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "phone": "+1234567890",
  "email": "contact@happypaws.com",
  "website": "https://happypaws.com",
  "opening_hours": {
    "monday": "09:00-17:00",
    "tuesday": "09:00-17:00"
  },
  "veterinarians": [
    {
      "id": "uuid",
      "name": "Dr. Smith",
      "specialization": "General Practice"
    }
  ],
  "services": [
    {
      "id": "uuid",
      "name": "Vaccination"
    }
  ],
  "rating": 4.8
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

### Common Error Responses

**400 Bad Request**
```json
{
  "error": "bad_request",
  "message": "Invalid request parameters",
  "details": {
    "field_name": "error description"
  }
}
```

**401 Unauthorized**
```json
{
  "error": "unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**403 Forbidden**
```json
{
  "error": "forbidden",
  "message": "You don't have permission to perform this action"
}
```

**404 Not Found**
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

**409 Conflict**
```json
{
  "error": "conflict",
  "message": "Resource already exists"
}
```

**500 Internal Server Error**
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

All endpoints are rate limited:

- **Default**: 100 requests per minute per user
- **Auth endpoints**: 5 requests per minute (to prevent brute force)
- **Payment endpoints**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643645400
```

---

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "total_pages": 15
  }
}
```

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {access_token}
```

The access token is obtained during login and expires after 1 hour. Use the refresh token to get a new access token.

---

## Common Query Parameters

**Sorting**
- `sort_by`: Field to sort by
- `sort_order`: asc or desc (default: desc)

**Filtering**
- `status`: Filter by status
- `from_date`: Filter from date (YYYY-MM-DD)
- `to_date`: Filter to date (YYYY-MM-DD)
- `search`: Full-text search

**Pagination**
- `page`: Page number
- `limit`: Items per page

---

## API Documentation Tools

For interactive API documentation and testing, use:

- **Swagger UI**: https://api.petcare.com/docs
- **Postman Collection**: https://api.petcare.com/postman.json
- **OpenAPI Specification**: https://api.petcare.com/openapi.json

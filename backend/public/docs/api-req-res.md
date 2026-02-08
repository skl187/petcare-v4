# CREATE POST /medical-records/prescriptions
prescriptions should attach to medical records

# PATCH /medical-records/prescriptions/{prescription_id}
```json
// Request headers
Authorization: Bearer <access_token>
Content-Type: application/json
// Request body
```

# CREATE POST /medical-records/lab-tests
```json
// Request
{
  "medical_record_id": "550e8400-e29b-41d4-a716-446655440000",
  "appointment_id": "660e8400-e29b-41d4-a716-446655440001",
  "pet_id": "770e8400-e29b-41d4-a716-446655440002",
  "lab_tests": [
    {
      "test_name": "Complete Blood Count",
      "test_type": "hematology",
      "lab_name": "LabCorp Veterinary",
      "urgency": "routine",
      "cost": 150.00,
      "normal_range": "RBC: 5.5-8.5 M/uL, WBC: 4.5-11 K/uL"
    },
    {
      "test_name": "Biochemistry Panel",
      "test_type": "chemistry",
      "lab_name": "LabCorp Veterinary",
      "urgency": "routine",
      "cost": 200.00
    },
    {
      "test_name": "Urinalysis",
      "test_type": "urinalysis",
      "lab_name": "LabCorp Veterinary",
      "urgency": "urgent",
      "cost": 100.00
    }
  ]
},
// Response
{
  "status": "success",
  "data": {
    "count": 3,
    "tests": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "test_name": "Complete Blood Count",
        "status": "ordered",
        "ordered_date": "2026-02-03"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440004",
        "test_name": "Biochemistry Panel",
        "status": "ordered",
        "ordered_date": "2026-02-03"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440005",
        "test_name": "Urinalysis",
        "status": "ordered",
        "ordered_date": "2026-02-03"
      }
    ]
  },
  "message": "3 lab test(s) created"
}
```

# PATCH /medical-records/lab-tests/{lab_test_id}

```json
// Request headers
Authorization: Bearer <access_token>
Content-Type: application/json
// Request body
{
  "test_type": "chemistry",
  "normal_range": "Glucose: 70-100 mg/dL",
  "lab_name": "Updated Lab Corp",
  "urgency": "urgent",
  "cost": 125.00
}
// response
{
  "status": "success",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "test_name": "Complete Blood Count",
    "test_type": "chemistry",
    "normal_range": "Glucose: 70-100 mg/dL",
    "lab_name": "Updated Lab Corp",
    "urgency": "urgent",
    "cost": 125.00
  },
  "message": "Lab test details updated"
}
```


# DELETE POST /medical_records/lab-tests/:id

```json
// Request headers
Authorization: Bearer <access_token>
Content-Type: application/json
// Request body
{
  "medical_record_id": "550e8400-e29b-41d4-a716-446655440000", // required - UUID of the medical record this prescription is for.
  "appointment_id": "660e8400-e29b-41d4-a716-446655440"
}
// Response
{
  "status": "success",
  "data": null,
  "message": "Prescription and associated medications deleted"
}
```

```json
//GET /records/:medical_record_id/lab-tests
// Request headers
Authorization: Bearer <access_token>

```

# GET /medical_records/:medical_record_id/vaccinations


# POST /medical_records/vaccinations

```json
// Request headers
Authorization: Bearer <access_token>
Content-Type: application/json
// Request body
{
  "pet_id": "770e8400-e29b-41d4-a716-446655440002",
  "appointment_id": "660e8400-e29b-41d4-a716-446655440001",
  "veterinarian_id": "880e8400-e29b-41d4-a716-446655440000",
  "vaccinations": [
    {
      "vaccine_name": "Rabies",
      "vaccine_type": "rabies",
      "manufacturer": "Merial",
      "batch_number": "RB2026001",
      "site_of_injection": "Right hind leg",
      "next_due_date": "2027-02-03",
      "cost": 50.00
    },
    {
      "vaccine_name": "DHPP",
      "vaccine_type": "combination",
      "manufacturer": "Zoetis",
      "batch_number": "DHPP2026002",
      "site_of_injection": "Left hind leg",
      "next_due_date": "2027-02-03",
      "cost": 75.00
    },
    {
      "vaccine_name": "Bordetella",
      "vaccine_type": "respiratory",
      "manufacturer": "Merck",
      "batch_number": "BORD2026003",
      "site_of_injection": "Intranasal",
      "cost": 30.00,
      "notes": "Annual booster"
    }
  ]
}
// Respone
{
  "status": "success",
  "data": {
    "count": 3,
    "vaccinations": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440010",
        "vaccine_name": "Rabies",
        "vaccination_date": "2026-02-03"
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440011",
        "vaccine_name": "DHPP",
        "vaccination_date": "2026-02-03"
      },
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440012",
        "vaccine_name": "Bordetella",
        "vaccination_date": "2026-02-03"
      }
    ]
  },
  "message": "3 vaccination(s) created"
}
```

# GET /api/dashboard/profile
```json
{
  "status": "success",
  "data": {
    "user": { "id":"uuid","email":"user@example.com","first_name":"Jane","last_name":"Doe", "display_name":"Jane Doe" },
    "roles": [{ "id":"uuid","name":"Owner","slug":"owner","is_primary":true }],
    "permissions": [{ "id":"uuid","name":"create:clinic","action":"create","resource":"clinic" }],
    "addresses":[{}],
    "veterinarian": null,
    "pets": { "total": 2 }
  }
}
```

# PATCH /api/dashboard/profile
```bash
curl -X PATCH -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json"
-d '{"bio":"new bio","email":"ignored@example.com","first_name":"John","last_name":"Doe","phone":"+123"}'
http://localhost:3000/api/dashboard/profile
```

# GET /api/users/:id/addresses — list
``` bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/users/<userId>/addresses
```

# POST /api/users/:id/addresses — create
``` bash
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"home",
    "label":"Home",
    "address_line1":"123 Main St",
    "address_line2":"Apt 4",
    "city":"Springfield",
    "state":"IL",
    "postal_code":"62704",
    "country":"USA",
    "is_primary": true
  }' \
  http://localhost:3000/api/users/<userId>/addresses
```
# PATCH /api/users/:id/addresses/:addressId — update
``` bash
curl -X PUT -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"label":"New label","is_primary":false}' \
  http://localhost:3000/api/users/<userId>/addresses/<addressId>
```

# DELETE /api/users/:id/addresses/:addressId 
``` bash
curl -X DELETE -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/users/<userId>/addresses/<addressId>
```

# GET /api/users/?include=pet_count
# GET /api/users/:id/pets  admin-only (permission: read:pet) paginated list of a user's pets.

# GET /api/reviews/veterinarian/:veterinarianId
``` json
{
  "success": true,
  "data": {
    "veterinarian": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "license_number": "VET-2024-001",
      "specialization": "Small Animal Surgery",
      "experience_years": 8,
      "rating": 4.8,
      "total_appointments": 245,
      "first_name": "Dr. Sarah",
      "last_name": "Johnson",
      "avatar_url": "https://cdn.example.com/avatars/vet-001.jpg"
    },
    "reviews": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "rating": 5.0,
        "review_text": "Excellent care for my dog! Dr. Johnson was very knowledgeable and took time to explain everything.",
        "professionalism_rating": 5,
        "knowledge_rating": 5,
        "communication_rating": 5,
        "facility_rating": 4,
        "is_verified": true,
        "is_anonymous": false,
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "display_name": "John Doe",
          "avatar_url": "https://cdn.example.com/avatars/user-002.jpg"
        },
        "appointment": {
          "id": "770e8400-e29b-41d4-a716-446655440000",
          "appointment_date": "2026-01-15",
          "appointment_type": "checkup"
        },
        "created_at": "2026-01-20T10:30:00Z",
        "updated_at": "2026-01-20T10:30:00Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "rating": 4.5,
        "review_text": "Great veterinarian. The facility could be cleaner though.",
        "professionalism_rating": 5,
        "knowledge_rating": 4,
        "communication_rating": 5,
        "facility_rating": 3,
        "is_verified": true,
        "is_anonymous": false,
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "display_name": "Jane Smith",
          "avatar_url": "https://cdn.example.com/avatars/user-003.jpg"
        },
        "appointment": {
          "id": "770e8400-e29b-41d4-a716-446655440001",
          "appointment_date": "2026-01-10",
          "appointment_type": "vaccination"
        },
        "created_at": "2026-01-18T14:20:00Z",
        "updated_at": "2026-01-18T14:20:00Z"
      }
    ],
    "pagination": {
      "total": 24,
      "page": 1,
      "limit": 10,
      "pages": 3
    },
    "summary": {
      "average_rating": 4.8,
      "total_reviews": 24,
      "review_breakdown": {
        "five_star": 18,
        "four_star": 5,
        "three_star": 1,
        "two_star": 0,
        "one_star": 0
      }
    }
  },
  "message": "Reviews retrieved successfully"
}
```

# GET /pet-types
```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Dog",
      "slug": "dog",
      "icon_url": "https://cdn.petcare.com/icons/dog.svg",
      "status": 1,
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Cat",
      "slug": "cat",
      "icon_url": "https://cdn.petcare.com/icons/cat.svg",
      "status": 1,
      "created_at": "2026-01-15T10:32:00Z"
    }
  ]
}
```

# POST /pet-types
```json
Request:
{
  "name": "Bird",
  "slug": "bird",
  "icon_url": "https://cdn.petcare.com/icons/bird.svg",
  "status": 1
}

Response:
{
  "status": "success",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Bird",
    "icon_url": "https://cdn.petcare.com/icons/bird.svg",
    "created_at": "2026-02-08T12:00:00Z"
  }
}
```

# GET /api/reviews/my-reviews

```json
// for_pet_owners
{
  
  "status": "success",
  "data": {
    "user_type": "pet_owner",
    "reviews": [
      {
        "id": "review-id",
        "rating": 5,
        "review_text": "Great veterinarian",
        "appointment_id": "appt-id",
        "appointment_number": "APT-2026-00145",
        "appointment_date": "2026-02-05",
        "appointment_type": "checkup",
        "pet_name": "Buddy",
        "vet_first_name": "Sarah",
        "vet_last_name": "Johnson",
        "clinic_name": "Happy Paws Clinic"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "pages": 1 }
  }
}
// for_veterinarians
{
  "status": "success",
  "data": {
    "user_type": "veterinarian",
    "reviews": [
      {
        "id": "review-id",
        "rating": 5,
        "review_text": "Excellent care",
        "professionalism_rating": 5,
        "knowledge_rating": 5,
        "communication_rating": 5,
        "facility_rating": 4,
        "appointment_date": "2026-02-05",
        "owner_first_name": "John",
        "pet_name": "Max"
      }
    ],
    "stats": {
      "average_rating": 4.8,
      "total_reviews": 24,
      "avg_professionalism": 4.9,
      "positive_reviews": 20,
      "negative_reviews": 1
    },
    "pagination": { "page": 1, "limit": 10, "total": 24, "pages": 3 }
  }
}
```


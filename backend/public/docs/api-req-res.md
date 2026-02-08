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

# GET /medical_records/:medical_record_id/vaccinations




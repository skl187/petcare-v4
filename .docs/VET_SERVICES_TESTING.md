# 🏥 Veterinarian Services API - Testing Guide

**Base URL:** `http://localhost:3000/api`

---

## 📋 Overview

The vet services API has been restructured to support services belonging to specific veterinarians at specific clinics via `vet_clinic_mappings`:

- **Global Services** (Admin/Superadmin only) - Catalog of available services
- **Veterinarian Services** (Vet + Admin/Superadmin) - Services assigned to a vet at a specific clinic

---

## 🔑 Key IDs You'll Need

1. **veterinarian_id** - UUID of the veterinarian
2. **clinic_id** - UUID of the clinic
3. **vet_clinic_mapping_id** - UUID linking vet to clinic (from `vet_clinic_mappings` table)
4. **service_id** - UUID of a service from global services

---

## 🚀 Step-by-Step Testing

### Step 1: Get or Create Global Services (Admin Only)

#### 1.1 List All Global Services
```
GET /vet-services
Headers: Authorization: Bearer {admin_token}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "id": "service-uuid-1",
        "code": "CONS001",
        "name": "Consultation",
        "description": "General consultation",
        "default_duration_minutes": 30,
        "default_fee": 50.00,
        "service_type": "consultation",
        "status": 1,
        "created_at": "2026-02-21T10:00:00Z"
      },
      {
        "id": "service-uuid-2",
        "code": "VAC001",
        "name": "Vaccination",
        "description": "Pet vaccination",
        "default_duration_minutes": 15,
        "default_fee": 75.00,
        "service_type": "vaccination",
        "status": 1,
        "created_at": "2026-02-21T10:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20
  }
}
```

#### 1.2 Create Global Service (Admin Only)
```
POST /vet-services
Headers: Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "code": "SURG001",
  "name": "Surgery",
  "description": "General surgery procedures",
  "default_duration_minutes": 60,
  "default_fee": 250.00,
  "service_type": "surgery",
  "status": 1
}
```

**Expected Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "new-service-uuid",
    "code": "SURG001",
    "name": "Surgery",
    "created_at": "2026-02-21T10:05:00Z"
  },
  "message": "Created"
}
```

#### 1.3 Get Service by ID (Admin Only)
```
GET /vet-services/service-uuid-1
Headers: Authorization: Bearer {admin_token}
```

**Expected Response:** `200 OK`

#### 1.4 Update Global Service (Admin Only)
```
PUT /vet-services/service-uuid-1
Headers: Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "General Consultation",
  "default_fee": 60.00,
  "default_duration_minutes": 45
}
```

**Expected Response:** `200 OK`

#### 1.5 Delete Global Service (Admin Only)
```
DELETE /vet-services/service-uuid-1
Headers: Authorization: Bearer {admin_token}
```

**Expected Response:** `200 OK`

---

### Step 2: Get Vet Clinic Mapping ID

You need the `vet_clinic_mapping_id` which links a veterinarian to a clinic.

```
GET /vet-clinic-mappings?veterinarian_id=vet-uuid
Headers: Authorization: Bearer {token}
```

**Save the `id` from the response as `{vet_clinic_mapping_id}`**

---

### Step 3: Manage Veterinarian Services

**Helper:** vets can retrieve their own services without knowing mapping IDs.
```
GET /vet-services/vet
Headers: Authorization: Bearer {vet_token}
```

Response returns flat list of services with clinic details.

**New vet helper endpoints:**

- List clinics mapped to authenticated vet:
  ```
  GET /vet-services/vet/clinics
  Headers: Authorization: Bearer {vet_token}
  ```
  **Response**: array of `{mapping_id, clinic_id, clinic_name, is_primary, created_at}`

- Add service by specifying clinic id (no mapping id required):
  ```
  POST /vet-services/vet/services
  Headers: Authorization: Bearer {vet_token}
  Content-Type: application/json
  ```
  Body:
  ```json
  {
    "clinic_id": "clinic-A-uuid",
    "service_id": "service-uuid-1",
    "duration_minutes": 30,
    "fee_override": 55.00,
    "is_available": true
  }
  ```



#### 3.1 Add Single Service to Vet at Clinic
```
POST /vet-services/{vet_clinic_mapping_id}/services
Headers: Authorization: Bearer {vet_token}
Content-Type: application/json
```

**Body:**
```json
{
  "service_id": "service-uuid-1",
  "duration_minutes": 30,
  "fee_override": 55.00,
  "is_available": true
}
```

**Expected Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "vet-service-uuid",
    "vet_clinic_mapping_id": "mapping-uuid",
    "service_id": "service-uuid-1",
    "duration_minutes": 30,
    "fee_override": 55.00,
    "is_available": true,
    "created_at": "2026-02-21T10:10:00Z"
  },
  "message": "Service added to veterinarian"
}
```

**Fields:**
- `service_id` (required) - UUID of the global service
- `duration_minutes` (optional) - Overrides default (default: 30)
- `fee_override` (optional) - Overrides default service fee
- `is_available` (optional) - Set to false to disable service (default: true)

#### 3.2 Add Multiple Services (Bulk)
```
POST /vet-services/{vet_clinic_mapping_id}/bulk-services
Headers: Authorization: Bearer {vet_token}
Content-Type: application/json
```

**Body:**
```json
{
  "services": [
    {
      "service_id": "service-uuid-1",
      "duration_minutes": 30,
      "fee_override": 55.00,
      "is_available": true
    },
    {
      "service_id": "service-uuid-2",
      "duration_minutes": 20,
      "fee_override": 80.00,
      "is_available": true
    },
    {
      "service_id": "service-uuid-3",
      "duration_minutes": 60,
      "fee_override": 275.00,
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
    { "id": "vet-service-1", "service_id": "service-uuid-1", ... },
    { "id": "vet-service-2", "service_id": "service-uuid-2", ... },
    { "id": "vet-service-3", "service_id": "service-uuid-3", ... }
  ],
  "message": "Services assigned"
}
```

---

### Step 4: View Services for Veterinarian at Clinic

### Step 5: Vet Payment Lookup

Veterinarian can fetch their own appointment payments filtered by date range.

```
GET /payments/vet?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
Headers: Authorization: Bearer {vet_token}
```

Optional query parameters narrow the window. Response rows include payment records joined to the appointment (clinic_id, appointment_date, appointment_status).



#### 4.1 Get All Services for Vet at Clinic
```
GET /vet-services/clinic/{vet_clinic_mapping_id}/services
Headers: Authorization: Bearer {vet_token}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": "vet-service-uuid-1",
      "service_id": "service-uuid-1",
      "code": "CONS001",
      "name": "Consultation",
      "description": "General consultation",
      "duration_minutes": 30,
      "fee": 55.00,
      "is_available": true,
      "service_type": "consultation",
      "created_at": "2026-02-21T10:10:00Z"
    },
    {
      "id": "vet-service-uuid-2",
      "service_id": "service-uuid-2",
      "code": "VAC001",
      "name": "Vaccination",
      "description": "Pet vaccination",
      "duration_minutes": 20,
      "fee": 80.00,
      "is_available": true,
      "service_type": "vaccination",
      "created_at": "2026-02-21T10:10:00Z"
    }
  ]
}
```

---

### Step 5: Update Veterinarian Service

#### 5.1 Update Service Details (Duration, Fee, Availability)
```
PUT /vet-services/{vet_clinic_mapping_id}/services/{service_id}
Headers: Authorization: Bearer {vet_token}
Content-Type: application/json
```

**Body:**
```json
{
  "duration_minutes": 45,
  "fee_override": 65.00,
  "is_available": false
}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "id": "vet-service-uuid",
    "duration_minutes": 45,
    "fee_override": 65.00,
    "is_available": false,
    "updated_at": "2026-02-21T10:15:00Z"
  },
  "message": "Service updated"
}
```

#### 5.2 Temporarily Disable Service
```
PUT /vet-services/{vet_clinic_mapping_id}/services/{service_id}
Headers: Authorization: Bearer {vet_token}
Content-Type: application/json
```

**Body:**
```json
{
  "is_available": false
}
```

#### 5.3 Re-enable Service
```
PUT /vet-services/{vet_clinic_mapping_id}/services/{service_id}
Headers: Authorization: Bearer {vet_token}
Content-Type: application/json
```

**Body:**
```json
{
  "is_available": true
}
```

---

### Step 6: Remove Service from Veterinarian

#### 6.1 Remove Single Service
```
DELETE /vet-services/{vet_clinic_mapping_id}/services/{service_id}
Headers: Authorization: Bearer {vet_token}
```

**Expected Response:** `200 OK`
```json
{
  "status": "success",
  "data": null,
  "message": "Service removed"
}
```

---

## 📊 Complete Test Flow (End-to-End)

```
1. POST /auth/login → Get auth token
   └─ Save: {vet_token} or {admin_token}

2. POST /vet-services (if no services exist) → Create global services
   └─ Save: {service_id_1}, {service_id_2}, {service_id_3}

3. GET /vet-clinic-mappings?veterinarian_id=... → Get existing mapping
   └─ Save: {vet_clinic_mapping_id}

4. POST /vet-services/{vet_clinic_mapping_id}/bulk-services
   └─ Assign multiple services to vet at clinic

5. GET /vet-services/clinic/{vet_clinic_mapping_id}/services
   └─ Verify services are assigned with correct fees/durations

6. PUT /vet-services/{vet_clinic_mapping_id}/services/{service_id_1}
   └─ Update fee/duration for one service

7. GET /vet-services/clinic/{vet_clinic_mapping_id}/services
   └─ Verify update was applied

8. DELETE /vet-services/{vet_clinic_mapping_id}/services/{service_id_2}
   └─ Remove a service

9. GET /vet-services/clinic/{vet_clinic_mapping_id}/services
   └─ Verify service was removed

10. GET /vet-services (admin token)
    └─ Verify global services still intact
```

---

## 🔐 Endpoint Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/vet-services` | GET | List all global services | Yes (Admin) |
| `/vet-services` | POST | Create global service | Yes (Admin) |
| `/vet-services/:id` | GET | Get service details | Yes (Admin) |
| `/vet-services/:id` | PUT | Update service | Yes (Admin) |
| `/vet-services/:id` | DELETE | Delete service | Yes (Admin) |
| `/vet-services/clinic/:vetClinicMappingId/services` | GET | Get vet's services at clinic | Yes |
| `/vet-services/:vetClinicMappingId/services` | POST | Add service to vet | Yes |
| `/vet-services/:vetClinicMappingId/services/:serviceId` | PUT | Update vet's service | Yes |
| `/vet-services/:vetClinicMappingId/services/:serviceId` | DELETE | Remove vet's service | Yes |
| `/vet-services/:vetClinicMappingId/bulk-services` | POST | Bulk assign services | Yes |

---

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `404 - Veterinarian clinic mapping not found` | Invalid `vet_clinic_mapping_id` | Get correct mapping ID or create new one |
| `404 - Service not found for this veterinarian` | Service not assigned to vet | Add service first via POST |
| `409 - Service already added` | Trying to add same service twice | Use PUT to update instead |
| `400 - service_id is required` | Missing required field | Include `service_id` in request body |
| `401 - Unauthorized` | Missing or invalid token | Get new token from /auth/login |

---

## 💡 Key Concepts

### Global Services vs Veterinarian Services

**Global Services** (vet_services table):
- Defined by admin/superadmin
- Catalog of all available services
- Standard duration and fees
- Can be assigned to multiple vets

**Veterinarian Services** (veterinarian_services table):
- Specific to vet+clinic combination
- Can override duration and fee
- Can be marked available/unavailable
- Linked via `vet_clinic_mapping_id`

### Fee Override Logic

```
Service Fee = fee_override ?? default_fee
Duration = duration_minutes ?? default_duration_minutes
```

If `fee_override` is null, the default service fee is used.

---

## 📝 cURL Examples

### List All Global Services
```bash
curl -X GET http://localhost:3000/api/vet-services \
  -H "Authorization: Bearer {admin_token}"
```

### Add Service to Vet at Clinic
```bash
curl -X POST http://localhost:3000/api/vet-services/{vet_clinic_mapping_id}/services \
  -H "Authorization: Bearer {vet_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "service-uuid",
    "duration_minutes": 30,
    "fee_override": 55.00,
    "is_available": true
  }'
```

### Get Services for Vet at Clinic
```bash
curl -X GET http://localhost:3000/api/vet-services/clinic/{vet_clinic_mapping_id}/services \
  -H "Authorization: Bearer {vet_token}"
```

### Update Vet Service
```bash
curl -X PUT http://localhost:3000/api/vet-services/{vet_clinic_mapping_id}/services/{service_id} \
  -H "Authorization: Bearer {vet_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "fee_override": 65.00,
    "is_available": true
  }'
```

### Bulk Assign Services
```bash
curl -X POST http://localhost:3000/api/vet-services/{vet_clinic_mapping_id}/bulk-services \
  -H "Authorization: Bearer {vet_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "services": [
      {"service_id": "uuid1", "duration_minutes": 30, "fee_override": 55},
      {"service_id": "uuid2", "duration_minutes": 45, "fee_override": 80}
    ]
  }'
```

---

**Happy testing! 🎉**

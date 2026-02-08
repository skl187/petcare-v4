# Get today's appointments
GET /api/appointments/vet/list?filter=today

# Get upcoming appointments only
GET /api/appointments/vet/list?filter=upcoming&page=1&limit=10

# Get past appointments filtered by status
GET /api/appointments/vet/list?filter=past&status=completed&page=1

# Get all appointments
GET /api/appointments/vet/list?filter=all


register 
login
forgot
resetp
logout

addpet
getpets
updatepet
deletepet

addclinic
updateclinic
getclinics
deleteclinic

addveterinarian
getvets
updatevet
deletevet

createappoinments
appointment/:id/status
appointment/:id/reschedule
appointments/vet/list
appointments/vet/:id/medical-record
appointments/vet/:id/prescription
appointments/vet/:id/lab-tests
appointments/vet/:id/vaccinations


pending
==========
appointments/owner
appointments/owner/list
appointments/owner/:id/medical-record
appointments/owner/:id/prescription
appointments/owner/:id/lab-tests
appointments/owner/:id/vaccinations

Dashboards
==========
vet-dashboard
owner-dashboard
admin-dashboard




Start the server and verify it's healthy

Test Auth flow: Register → Login → Get Me → Refresh → Forgot/Reset Password

Test Roles & Permissions: List, Get, Create, Grant/Revoke permissions

Test Pet Types: CRUD

Test Breeds: CRUD (depends on pet types)

Test Clinics: CRUD

Test Veterinarians: CRUD (depends on users + clinics)

Test Vet Services: CRUD

Test Users: CRUD

Test Pets: CRUD (depends on users, pet types, breeds)

Test Appointments: Full lifecycle (create → confirm → in_progress → complete)

Test Medical Records, Prescriptions, Lab Tests, Vaccinations
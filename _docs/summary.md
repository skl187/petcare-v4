Register API Summary
# Endpoint: POST /api/auth/register

Request Body
Field	Validation	Required
email	Must be valid email, normalized	Yes
password	Minimum 8 characters	Yes
first_name	Non-empty, trimmed	Yes
last_name	Non-empty, trimmed	Yes
user_type	Optional, defaults to 'owner'	No


API Endpoints
Permissions (/api/permissions)
Method	Endpoint	Description
GET	/	List all permissions (with search, resource filter)
GET	/resources	List unique resource names
GET	/:id	Get single permission
POST	/	Create permission
PUT	/:id	Update permission
DELETE	/:id	Delete permission (soft)
Role-Permissions (/api/roles/:id/permissions)
Method	Endpoint	Description
GET	/:id/permissions	Get all permissions for a role
POST	/:id/permissions	Grant permission to role
PUT	/:id/permissions	Set all permissions (replace)
DELETE	/:id/permissions/:permissionId	Revoke permission from role
User-Roles (/api/users/:id/roles)
Method	Endpoint	Description
GET	/:id/roles	Get all roles for a user
POST	/:id/roles	Assign role to user
PUT	/:id/roles	Set all roles (replace)
DELETE	/:id/roles/:roleId	Remove role from user
PATCH	/:id/roles/:roleId/primary	Set primary role
User-Permissions (/api/users/:id/permissions)
Method	Endpoint	Description
GET	/:id/permissions	Get all permissions (role + direct)
POST	/:id/permissions	Grant/deny direct permission
DELETE	/:id/permissions/:permissionId	Remove direct permission


Backend Endpoints (created earlier):

GET /api/roles - List roles with permission/user counts
GET /api/roles/:id - Get role with permissions grouped by resource
PUT /api/roles/:id - Update role
PUT /api/roles/:id/permissions - Set role permissions
GET /api/permissions/grouped - Get permissions grouped by resource

GET /api/permissions - List permissions
POST /api/permissions - Create permission
PUT /api/permissions/:id - Update permission
DELETE /api/permissions/:id - Delete permission


API Endpoints
GET /api/dashboard/admin/summary
Admin Dashboard - Returns:

Users: total, active, pending, suspended, new users (7/30 days)
Pets: total pets, new pets
Appointments: overview by status, today's appointments, recent 5, trends (7 days)
Revenue: total, today, last 7/30 days, pending
Clinics: stats + top 5 by appointments
Veterinarians: stats + top 5 by appointments
Payments: pending, completed, partial, refunded counts
GET /api/dashboard/owner/summary
Owner Dashboard - Returns:

Pets: stats + full list with appointment/record counts
Appointments: stats, upcoming 5 appointments
Medical: recent 5 records, vaccination alerts (due/overdue)
Insurance: active policies, coverage available
Payments: transaction history summary
GET /api/dashboard/veterinarian/summary
Veterinarian Dashboard - Returns:

Profile: license, specialization, rating, consultation fee
Appointments: stats, today's list, upcoming 7 days, trends
Patients: total unique patients/owners, recent patients
Earnings: today, this week, this month, pending
Reviews: ratings breakdown
Pending Records: completed appointments without medical records
Clinics: list of associated clinics
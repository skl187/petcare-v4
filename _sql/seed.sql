-- sql/seed.sql

-- ==================== SEED ROLES ====================
INSERT INTO roles (name, slug, description) VALUES
    ('Super Admin', 'superadmin', 'Super administrator with complete system access'),
    ('Admin', 'admin', 'Administrator with user and clinic management'),
    ('Finance Manager', 'finance', 'Manages billing and financial reports'),
    ('Clinic Staff', 'clinic_staff', 'Front desk and clinic operations'),
    ('Doctor', 'doctor', 'Veterinary doctor - can manage appointments and prescribe'),
    ('Pet Owner', 'owner', 'Pet owner - can book and manage own appointments')
ON CONFLICT (slug) DO NOTHING;

-- ==================== SEED PERMISSIONS ====================

-- USER MANAGEMENT
INSERT INTO permissions (name, action, resource, description) VALUES
    ('Create User', 'create', 'user', 'Create new users'),
    ('Read User', 'read', 'user', 'View user details'),
    ('Update User', 'update', 'user', 'Edit user information'),
    ('Delete User', 'delete', 'user', 'Delete user account'),
    ('Manage Roles', 'manage', 'role', 'Assign/revoke roles'),
    ('Manage Permissions', 'manage', 'permission', 'Assign/revoke permissions')
ON CONFLICT (name) DO NOTHING;

-- APPOINTMENT MANAGEMENT
INSERT INTO permissions (name, action, resource, description) VALUES
    ('Create Appointment', 'create', 'appointment', 'Book new appointments'),
    ('Read Appointment', 'read', 'appointment', 'View appointment details'),
    ('Update Appointment', 'update', 'appointment', 'Edit appointment details'),
    ('Delete Appointment', 'delete', 'appointment', 'Cancel appointments'),
    ('View All Appointments', 'read', 'appointment_all', 'View all appointments (not just own)')
ON CONFLICT (name) DO NOTHING;

-- PET MANAGEMENT
INSERT INTO permissions (name, action, resource, description) VALUES
    ('Create Pet', 'create', 'pet', 'Register new pets'),
    ('Read Pet', 'read', 'pet', 'View pet details'),
    ('Update Pet', 'update', 'pet', 'Edit pet information'),
    ('Delete Pet', 'delete', 'pet', 'Delete pet record')
ON CONFLICT (name) DO NOTHING;

-- PET TYPE MANAGEMENT
INSERT INTO permissions (name, action, resource, description) VALUES
    ('Create Pet Type', 'create', 'pet_type', 'Create pet type'),
    ('Read Pet Type', 'read', 'pet_type', 'View pet types'),
    ('Update Pet Type', 'update', 'pet_type', 'Edit pet types'),
    ('Delete Pet Type', 'delete', 'pet_type', 'Delete pet types')
ON CONFLICT (name) DO NOTHING;

-- BREED MANAGEMENT
INSERT INTO permissions (name, action, resource, description) VALUES
    ('Create Breed', 'create', 'breed', 'Create breed'),
    ('Read Breed', 'read', 'breed', 'View breeds'),
    ('Update Breed', 'update', 'breed', 'Edit breeds'),
    ('Delete Breed', 'delete', 'breed', 'Delete breeds')
ON CONFLICT (name) DO NOTHING;

-- APPOINTMENT SLOT MANAGEMENT
INSERT INTO permissions (name, action, resource, description) VALUES
    ('Create Appointment Slot', 'create', 'slot', 'Create appointment slots'),
    ('Read Appointment Slot', 'read', 'slot', 'View appointment slots'),
    ('Update Appointment Slot', 'update', 'slot', 'Edit appointment slots'),
    ('Delete Appointment Slot', 'delete', 'slot', 'Delete appointment slots')

-- BILLING & FINANCE
ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, action, resource, description) VALUES
    ('Create Invoice', 'create', 'invoice', 'Create invoices'),
    ('Read Invoice', 'read', 'invoice', 'View invoices'),
    ('Update Invoice', 'update', 'invoice', 'Edit invoices'),
    ('View Financial Reports', 'read', 'report_financial', 'View financial reports')
ON CONFLICT (name) DO NOTHING;

-- AUDIT & SYSTEM
INSERT INTO permissions (name, action, resource, description) VALUES
    ('View Audit Logs', 'read', 'audit_log', 'View system audit logs'),
    ('View System Reports', 'read', 'report_system', 'View system reports')
ON CONFLICT (name) DO NOTHING;

-- ==================== ASSIGN PERMISSIONS TO ROLES ====================

-- SUPER ADMIN: Full Access (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'superadmin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ADMIN: User, Appointment, and Pet Management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'admin'
  AND p.name IN (
    'Create User', 'Read User', 'Update User', 'Delete User',
    'Manage Roles', 'Manage Permissions',
    'Create Appointment', 'Read Appointment', 'Update Appointment', 'Delete Appointment',
    'View All Appointments',
    'Create Pet', 'Read Pet', 'Update Pet', 'Delete Pet',
    'Create Pet Type', 'Read Pet Type', 'Update Pet Type', 'Delete Pet Type',
    'Create Breed', 'Read Breed', 'Update Breed', 'Delete Breed',
    'View Audit Logs', 'View System Reports'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- FINANCE: Billing and Financial Reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'finance'
  AND p.name IN (
    'Create Invoice', 'Read Invoice', 'Update Invoice',
    'View Financial Reports',
    'View All Appointments',
    'Read Appointment'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- CLINIC STAFF: Appointment and Pet Management (View & Update)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'clinic_staff'
  AND p.name IN (
    'Read Appointment', 'Update Appointment', 'View All Appointments',
    'Read Pet', 'Update Pet',
    'Read Appointment Slot'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- DOCTOR: Appointment Management + Slot Management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'doctor'
  AND p.name IN (
    'Create Appointment', 'Read Appointment', 'Update Appointment',
    'View All Appointments',
    'Read Pet',
    'Create Appointment Slot', 'Read Appointment Slot', 'Update Appointment Slot'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PET OWNER: Own Pets and Appointments Only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'owner'
  AND p.name IN (
    'Create Appointment', 'Read Appointment', 'Update Appointment',
    'Create Pet', 'Read Pet', 'Update Pet'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ==================== SEED USERS ====================

-- Super Admin User
INSERT INTO users (email, password_hash, first_name, last_name, display_name, is_email_verified, status) 
VALUES ('superadmin@petcare.com', crypt('SuperAdmin@123', gen_salt('bf')), 'Super', 'Admin', 'Super Admin', true, 'active')
ON CONFLICT (email) DO NOTHING;

-- Regular Admin User
INSERT INTO users (email, password_hash, first_name, last_name, display_name, is_email_verified, status) 
VALUES ('admin@petcare.com', crypt('Admin@123', gen_salt('bf')), 'Admin', 'User', 'Admin', true, 'active')
ON CONFLICT (email) DO NOTHING;

-- Finance Manager
INSERT INTO users (email, password_hash, first_name, last_name, display_name, is_email_verified, status) 
VALUES ('finance@petcare.com', crypt('Finance@123', gen_salt('bf')), 'Finance', 'Manager', 'Finance Manager', true, 'active')
ON CONFLICT (email) DO NOTHING;

-- Doctor
INSERT INTO users (email, password_hash, first_name, last_name, display_name, is_email_verified, status) 
VALUES ('doctor@petcare.com', crypt('Doctor@123', gen_salt('bf')), 'Dr.', 'Vet', 'Doctor', true, 'active')
ON CONFLICT (email) DO NOTHING;

-- Clinic Staff
INSERT INTO users (email, password_hash, first_name, last_name, display_name, is_email_verified, status) 
VALUES ('staff@petcare.com', crypt('Staff@123', gen_salt('bf')), 'Clinic', 'Staff', 'Staff', true, 'active')
ON CONFLICT (email) DO NOTHING;

-- ==================== ASSIGN ROLES TO USERS ====================

-- Assign Super Admin
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT u.id, r.id, true FROM users u, roles r
WHERE u.email = 'superadmin@petcare.com' AND r.slug = 'superadmin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign Admin
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT u.id, r.id, true FROM users u, roles r
WHERE u.email = 'admin@petcare.com' AND r.slug = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign Finance Manager
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT u.id, r.id, true FROM users u, roles r
WHERE u.email = 'finance@petcare.com' AND r.slug = 'finance'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign Doctor
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT u.id, r.id, true FROM users u, roles r
WHERE u.email = 'doctor@petcare.com' AND r.slug = 'doctor'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign Clinic Staff
INSERT INTO user_roles (user_id, role_id, is_primary)
SELECT u.id, r.id, true FROM users u, roles r
WHERE u.email = 'staff@petcare.com' AND r.slug = 'clinic_staff'
ON CONFLICT (user_id, role_id) DO NOTHING;



-- ==================== SEED PET TYPES & BREEDS ====================
-- Pet types (dog, cat)
INSERT INTO pet_types (name, slug, status, created_by)
SELECT 'Dog', 'dog', 1, u.id FROM users u WHERE u.email = 'admin@petcare.com' LIMIT 1
WHERE NOT EXISTS (SELECT 1 FROM pet_types pt WHERE lower(pt.name) = lower('Dog'));

INSERT INTO pet_types (name, slug, status, created_by)
SELECT 'Cat', 'cat', 1, u.id FROM users u WHERE u.email = 'admin@petcare.com' LIMIT 1
WHERE NOT EXISTS (SELECT 1 FROM pet_types pt WHERE lower(pt.name) = lower('Cat'));

-- Sample breeds
-- Dog breeds
INSERT INTO breeds (name, slug, pet_type_id, description, status, created_by)
SELECT 'Labrador', 'labrador', pt.id, 'Friendly and active', 1, u.id
FROM pet_types pt, users u
WHERE pt.name = 'Dog' AND u.email = 'admin@petcare.com'
  AND NOT EXISTS (SELECT 1 FROM breeds b WHERE lower(b.name) = lower('Labrador') AND b.pet_type_id = pt.id);

INSERT INTO breeds (name, slug, pet_type_id, description, status, created_by)
SELECT 'Beagle', 'beagle', pt.id, 'Small hound', 1, u.id
FROM pet_types pt, users u
WHERE pt.name = 'Dog' AND u.email = 'admin@petcare.com'
  AND NOT EXISTS (SELECT 1 FROM breeds b WHERE lower(b.name) = lower('Beagle') AND b.pet_type_id = pt.id);

-- Cat breeds
INSERT INTO breeds (name, slug, pet_type_id, description, status, created_by)
SELECT 'Persian', 'persian', pt.id, 'Long-haired', 1, u.id
FROM pet_types pt, users u
WHERE pt.name = 'Cat' AND u.email = 'admin@petcare.com'
  AND NOT EXISTS (SELECT 1 FROM breeds b WHERE lower(b.name) = lower('Persian') AND b.pet_type_id = pt.id);

INSERT INTO breeds (name, slug, pet_type_id, description, status, created_by)
SELECT 'Siamese', 'siamese', pt.id, 'Sleek and vocal', 1, u.id
FROM pet_types pt, users u
WHERE pt.name = 'Cat' AND u.email = 'admin@petcare.com'
  AND NOT EXISTS (SELECT 1 FROM breeds b WHERE lower(b.name) = lower('Siamese') AND b.pet_type_id = pt.id);

-- ==================== SEED USER ADDRESSES ====================
-- Add sample addresses for owner@petcare.com (or first user if missing)
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM users WHERE email = 'owner@petcare.com' LIMIT 1;
  IF uid IS NULL THEN
    SELECT id INTO uid FROM users LIMIT 1;
  END IF;

  IF uid IS NOT NULL THEN
    INSERT INTO user_addresses (user_id, type, label, address_line1, address_line2, city, state, postal_code, country, is_primary)
    SELECT uid, 'home', 'Home', '123 Main St', 'Apt 4', 'Springfield', 'IL', '62704', 'USA', true
    WHERE NOT EXISTS (
      SELECT 1 FROM user_addresses WHERE user_id = uid AND type = 'home' AND address_line1 = '123 Main St' AND deleted_at IS NULL
    );

    INSERT INTO user_addresses (user_id, type, label, address_line1, address_line2, city, state, postal_code, country, is_primary)
    SELECT uid, 'work', 'Work', '456 Corporate Ave', NULL, 'Springfield', 'IL', '62705', 'USA', false
    WHERE NOT EXISTS (
      SELECT 1 FROM user_addresses WHERE user_id = uid AND type = 'work' AND address_line1 = '456 Corporate Ave' AND deleted_at IS NULL
    );
  END IF;
END;
$$ LANGUAGE plpgsql;


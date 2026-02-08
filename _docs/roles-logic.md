1. ROLES Table
id      | name      | slug
--------|-----------|----------
uuid-1  | Admin     | admin
uuid-2  | Doctor    | doctor
uuid-3  | Owner     | owner

2. PERMISSIONS Table
id      | action    | resource      | name
--------|-----------|---------------|------------------
uuid-10 | create    | appointment   | Create Appointment
uuid-11 | read      | appointment   | Read Appointment
uuid-12 | update    | appointment   | Update Appointment
uuid-13 | delete    | appointment   | Delete Appointment

3. USERS Table
id      | email              | first_name
--------|-------------------|----------
uuid-100| alice@example.com  | Alice (Admin)
uuid-101| bob@example.com    | Bob (Doctor)
uuid-102| carol@example.com  | Carol (Owner)

4. USER_ROLES Table (User → Role)
user_id | role_id
--------|----------
uuid-100| uuid-1  (Alice → Admin)
uuid-101| uuid-2  (Bob → Doctor)
uuid-102| uuid-3  (Carol → Owner)

5. ROLE_PERMISSIONS Table (Role → Permission)
role_id | permission_id
--------|---------------
uuid-1  | uuid-10  (Admin can create)
uuid-1  | uuid-11  (Admin can read)
uuid-1  | uuid-12  (Admin can update)
uuid-1  | uuid-13  (Admin can delete)
uuid-2  | uuid-10  (Doctor can create)
uuid-2  | uuid-11  (Doctor can read)
uuid-2  | uuid-12  (Doctor can update)
uuid-3  | uuid-10  (Owner can create)
uuid-3  | uuid-11  (Owner can read)

6. USER_PERMISSIONS Table (Direct Override)
user_id | permission_id | granted
--------|---------------|--------
uuid-101| uuid-13       | false   (Bob cannot delete)

How Permission Check Works
Alice (Admin) tries to DELETE appointment:
checkPermission(uuid-100, 'delete', 'appointment')
  ↓
1. Check user_permissions:
   SELECT FROM user_permissions 
   WHERE user_id = uuid-100 AND action = 'delete'
   → NOT FOUND
  ↓
2. Check role_permissions:
   alice → admin role → admin has uuid-13 (delete)
   → FOUND ✓
  ↓
RESULT: ALLOWED ✓
Bob (Doctor) tries to DELETE appointment:
checkPermission(uuid-101, 'delete', 'appointment')
  ↓
1. Check user_permissions:
   user_id = uuid-101 AND action = 'delete'
   → found BUT granted = false ✗
  ↓
RESULT: DENIED ✗
Carol (Owner) tries to UPDATE appointment:
checkPermission(uuid-102, 'update', 'appointment')
  ↓
1. Check user_permissions:
   → NOT FOUND
  ↓
2. Check role_permissions:
   carol → owner role → owner does NOT have update
   → NOT FOUND
  ↓
RESULT: DENIED ✗

Summary Table
UserRoleCan CreateCan ReadCan UpdateCan DeleteAliceAdmin✓✓✓✓BobDoctor✓✓✓✗ (override)CarolOwner✓✓✗✗
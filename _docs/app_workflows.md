## Workflows

admin fetch all appointments
admin fetch appointment id

user registered
user login
user adds his pet
user book an appointment for his pet with veterinarian id
veterinarian/clinic_staff confirms his appointments
veterinarian view his upcoming appointments and other details in dashboard
veterinarian list all his appointments and todays appointments
veterinarian update medical records, prescriptions, lab-reports and vaccinations of an appointment
user able to view his appointment details after veterinarian update appointment
admin able to view stats 
user able to view his pets, pet appointments medical records all his stats in dashboard

give full proper list of api endpoints to meet above requirements

# Scenario 1: Regular Appointment with Insurance

User books appointment with insurance policy
System verifies coverage eligibility
At checkout, calculates:

Total charges
Insurance coverage (e.g., 80%)
Copay/deductible
Out-of-pocket amount


User pays copay immediately
System creates insurance claim automatically
Tracks claim status until reimbursement

# Scenario 2: Pre-Authorized Surgery

Veterinarian submits pre-authorization request
Insurance provider approves estimated cost
Surgery proceeds with approved amount
Final claim submitted after surgery
Insurance pays approved amount
Any excess billed to user

# Scenario 3: Emergency Visit

User arrives with pet emergency
Quick insurance verification
Treatment provided
Bills insurance directly
User pays deductible/copay only
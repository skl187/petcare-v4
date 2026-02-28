# Split Payment System Documentation

## Overview

The split payment system enables veterinary clinics to record multiple partial payments for a single appointment. This supports flexible payment methods where clients can pay with a combination of:

- Cash
- Credit/Debit Card
- UPI/Digital Wallets
- Bank Transfers
- Cheques
- Insurance
- Other payment methods

## Architecture

### Database Design

#### Core Tables

**`vet_appointment_payments`**
- Primary table storing all payment records
- Supports multiple payment records per appointment
- Key columns:
  - `is_partial`: Boolean flag indicating if this is part of a split payment
  - `payment_sequence`: Ordinal position in payment sequence (1, 2, 3...)
  - `split_payment_group_id`: UUID linking related split payments

**`vet_payment_transactions`**
- Secondary table for provider transaction tracking
- One record per payment method with provider involvement
- Key columns:
  - `provider_code`: Payment provider identifier (stripe, razorpay, paypal)
  - `provider_response`: Full JSONB response from payment gateway

### Database Helper Functions

#### `get_appointment_total_paid(appointment_id UUID)`
Returns total amount paid across all split payments for an appointment.

```sql
SELECT get_appointment_total_paid('apt-001');
-- Returns: 200.00 (if two $100 payments recorded)
```

#### `get_appointment_payment_status(appointment_id UUID)`
Returns complete payment status including:
- `total_amount`: Appointment total
- `total_paid`: Amount paid so far
- `is_fully_paid`: Boolean whether fully paid
- `payment_count`: Number of payment records
- `is_split_payment`: Boolean whether split payments used

#### View: `v_appointment_split_payments`
Provides aggregated split payment summary per appointment with grouping and totals.

## Frontend Implementation

### Utility Functions (`paymentUtils.ts`)

```typescript
import {
  calculateTotalPaid,
  calculateRemainingBalance,
  formatCurrency,
  isFullyPaid,
  hasSplitPayments,
  getPaymentSummary,
  validateSplitPaymentAmount,
} from '@/utils/paymentUtils';

// Calculate total paid
const totalPaid = calculateTotalPaid(payments); // $200

// Calculate remaining balance
const remaining = calculateRemainingBalance(300, payments); // $100

// Format currency
formatCurrency(100, 'USD'); // "$100.00"

// Get comprehensive summary
const summary = getPaymentSummary(300, payments);
// Returns: { appointmentTotal, totalPaid, remainingBalance, isFullyPaid, isSplitPayment, ... }

// Validate payment amount
const validation = validateSplitPaymentAmount(50, 100);
// Returns: { isValid: true }
```

### API Service (`splitPaymentService.ts`)

```typescript
import {
  recordPayment,
  getAppointmentPayments,
  getPaymentSummary,
  updatePaymentStatus,
  deletePayment,
  recordSplitPayments,
} from '@/services/splitPaymentService';

// Record single payment
const payment = await recordPayment('apt-001', {
  payment_method: 'credit_card',
  paid_amount: 100,
  is_partial: true,
  split_payment_group_id: 'group-abc',
  provider_code: 'stripe',
  transaction_id: 'ch_123456',
  provider_response: { status: 'succeeded', ... }
});

// Get all payments for appointment
const { payments, summary } = await getAppointmentPayments('apt-001');

// Get payment summary
const paymentSummary = await getPaymentSummary('apt-001');
// Returns comprehensive split payment details

// Record multiple split payments (with rollback on error)
const allPayments = await recordSplitPayments('apt-001', [
  { payment_method: 'cash_at_counter', paid_amount: 100 },
  { payment_method: 'credit_card', paid_amount: 100 },
  { payment_method: 'insurance', paid_amount: 100 }
]);
```

## Backend Implementation

### Payment Validation Middleware

```javascript
// All payment endpoints validate input using validatePaymentInput middleware

// Valid payment methods
const validMethods = [
  'cash_at_counter',
  'credit_card',
  'debit_card',
  'upi',
  'bank_transfer',
  'cheque',
  'insurance',
  'wallet'
];

// Validates:
// - Payment method is in enum
// - Amount is positive number
// - is_partial is boolean
// - split_payment_group_id is valid UUID format
```

### Payment Utility Functions (`paymentUtils.js`)

```javascript
const {
  calculateTotalPaid,
  calculateRemainingBalance,
  validateSplitPayment,
  getNextPaymentSequence,
  groupPaymentsBySplit,
  isFullyPaid,
  hasSplitPayments,
  getPaymentSummary
} = require('@/core/utils/paymentUtils');

// Validate before recording
const validation = validateSplitPayment({
  appointmentTotal: 300,
  paymentAmount: 100,
  existingPayments: [],
  paymentMethod: 'credit_card',
  splitPaymentGroupId: 'group-abc'
});
// Returns: { isValid: true, error: null }

// Get next sequence number
const sequence = getNextPaymentSequence(existingPayments, 'group-abc');
// Returns: 2 (if 1 payment already recorded)
```

### Controllers

#### `splitPaymentController.js`

**`recordPayment(req, res)`**
- POST `/api/vet-appointments/:appointmentId/payments`
- Records new payment with validation
- Automatically determines split payment status
- Updates appointment payment status
- Logs provider transactions if applicable

Request body:
```json
{
  "payment_method": "credit_card",
  "paid_amount": 100,
  "is_partial": true,
  "split_payment_group_id": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Partial payment via card",
  "provider_code": "stripe",
  "transaction_id": "ch_1234567890",
  "provider_response": {
    "id": "ch_1234567890",
    "object": "charge",
    "status": "succeeded"
  }
}
```

Response:
```json
{
  "success": true,
  "payment": {
    "id": "pmt-001",
    "appointment_id": "apt-001",
    "payment_method": "credit_card",
    "paid_amount": 100,
    "is_partial": true,
    "payment_sequence": 1,
    "split_payment_group_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_status": "paid"
  },
  "appointmentStatus": {
    "totalPaid": 100,
    "remainingBalance": 200,
    "paymentStatus": "partially_paid"
  }
}
```

**`getAppointmentPayments(req, res)`**
- GET `/api/vet-appointments/:appointmentId/payments`
- Returns all payments with summary

**`updatePaymentStatus(req, res)`**
- PUT `/api/vet-appointments/:appointmentId/payments/:paymentId`
- Updates payment status (pending, paid, failed, cancelled)
- Recalculates appointment status

**`deletePayment(req, res)`**
- DELETE `/api/vet-appointments/:appointmentId/payments/:paymentId`
- Deletes payment record and transactions
- Prevents deletion if it would invalidate appointment status

**`getPaymentSummary(req, res)`**
- GET `/api/vet-appointments/:appointmentId/payment-summary`
- Returns comprehensive split payment summary

## Usage Examples

### Example 1: Full Payment with One Method

```typescript
// Appointment total: $300

const payment = await recordPayment('apt-001', {
  payment_method: 'credit_card',
  paid_amount: 300,
  provider_code: 'stripe',
  transaction_id: 'ch_abc123',
  provider_response: { status: 'succeeded' }
});

// Result: Single payment, appointment status = "paid"
```

### Example 2: Split Payment (Cash + Card)

```typescript
// Appointment total: $300
const groupId = generateSplitPaymentGroupId(); // UUID

// First payment: Cash
await recordPayment('apt-001', {
  payment_method: 'cash_at_counter',
  paid_amount: 150,
  is_partial: true,
  split_payment_group_id: groupId
});

// Second payment: Card
await recordPayment('apt-001', {
  payment_method: 'credit_card',
  paid_amount: 150,
  is_partial: true,
  split_payment_group_id: groupId,
  provider_code: 'stripe',
  transaction_id: 'ch_xyz789',
  provider_response: { status: 'succeeded' }
});

// Result: 
// - 2 payment records with same split_payment_group_id
// - Appointment status = "paid"
// - Payment sequences = 1, 2
```

### Example 3: Partial Payment (Pay Later)

```typescript
// Appointment total: $300
const groupId = generateSplitPaymentGroupId();

// First payment: Upfront insurance
await recordPayment('apt-001', {
  payment_method: 'insurance',
  paid_amount: 150,
  is_partial: true,
  split_payment_group_id: groupId
});

// Check status
const summary = await getPaymentSummary('apt-001');
// { totalPaid: 150, remainingBalance: 150, isFullyPaid: false, isSplitPayment: true }

// Later: Patient pays remaining
await recordPayment('apt-001', {
  payment_method: 'credit_card',
  paid_amount: 150,
  is_partial: true,
  split_payment_group_id: groupId,
  provider_code: 'stripe',
  transaction_id: 'ch_later123'
});

// Result: Appointment now fully paid with 2 split payments
```

### Example 4: Insurance + Multiple Methods

```typescript
// Total: $300
const groupId = generateSplitPaymentGroupId();

// Insurance covers $150
await recordPayment('apt-001', {
  payment_method: 'insurance',
  paid_amount: 150,
  is_partial: true,
  split_payment_group_id: groupId
});

// Patient pays $100 cash
await recordPayment('apt-001', {
  payment_method: 'cash_at_counter',
  paid_amount: 100,
  is_partial: true,
  split_payment_group_id: groupId
});

// Patient pays $50 card
await recordPayment('apt-001', {
  payment_method: 'credit_card',
  paid_amount: 50,
  is_partial: true,
  split_payment_group_id: groupId,
  provider_code: 'stripe',
  transaction_id: 'ch_final123'
});

// Result: 3 payments totaling $300, fully paid
```

## Payment Status Flow

```
Appointment Created
    ↓
payment_status = "unpaid"
    ↓
First Payment Recorded (is_partial depends on amount)
    ↓
    ├─ Pays full amount → "paid"
    └─ Pays partial → "partially_paid"
    ↓
More Payments Can Be Recorded (same or different methods)
    ↓
When total_paid >= appointment.total_amount → "paid"
    ↓
Payment can be updated to "failed" or "cancelled" if needed
```

## Provider Integration

### Stripe
```typescript
const payment = await recordPayment('apt-001', {
  payment_method: 'credit_card',
  paid_amount: 100,
  provider_code: 'stripe',
  transaction_id: 'ch_1234567890',
  provider_response: {
    id: 'ch_1234567890',
    amount: 10000,
    currency: 'usd',
    status: 'succeeded'
  }
});
```

### Razorpay
```typescript
const payment = await recordPayment('apt-001', {
  payment_method: 'credit_card',
  paid_amount: 100,
  provider_code: 'razorpay',
  transaction_id: 'pay_JKrrmVPqP9bKRe',
  provider_response: {
    id: 'pay_JKrrmVPqP9bKRe',
    amount: 10000,
    currency: 'USD',
    status: 'captured'
  }
});
```

## Validation Rules

1. **Amount**: Must be positive number
2. **Remaining Balance**: Payment cannot exceed remaining balance
3. **Payment Method**: Must be in enum
4. **Split Payment Group**: Required when recording multiple payments
5. **Provider Code**: Must match known providers if provider payment
6. **Transaction ID**: Required for provider-based payments

## Backward Compatibility

- Existing single payments continue to work unchanged
- `is_partial` defaults to `FALSE` for existing payments
- `split_payment_group_id` is `NULL` for single payments
- Query indexes optimized for both scenarios

## Reporting

### Get Split Payment Statistics

```typescript
const stats = await getPaymentStats('2024-01-01', '2024-12-31');
// Returns:
// {
//   totalAmount: 50000,
//   totalPaid: 45000,
//   totalPending: 5000,
//   splitPaymentCount: 234,
//   paymentMethodBreakdown: {
//     'cash_at_counter': 10000,
//     'credit_card': 20000,
//     'insurance': 15000
//   }
// }
```

### View Aggregated Split Payments

```sql
SELECT * FROM v_appointment_split_payments 
WHERE is_split_payment = true
ORDER BY appointment_id DESC;
```

## Error Handling

### Common Errors

**404 Not Found**
- Appointment not found
- Payment not found

**400 Bad Request**
- Invalid payment method
- Invalid amount (<=0)
- Amount exceeds remaining balance
- Invalid UUID format
- Missing required fields

**400 Payment Validation Errors**
- Appointment already fully paid
- Remaining balance is 0
- Split payment group ID required for multi-part

**500 Internal Server Error**
- Database errors
- Provider transaction recording failed

## Performance Considerations

- Indexes on `is_partial`, `payment_status`, `split_payment_group_id` for fast queries
- `v_appointment_split_payments` view for aggregations
- `get_appointment_payment_status()` function for status checks
- Batch operations support with transaction rollback

## Security

- All endpoints require authentication
- User must have appropriate permissions for appointment
- Provider responses are stored as-is but not exposed in API responses
- Payment data is encrypted at rest (general database security)

## Testing

Sample test cases:

1. Record single full payment
2. Record split payment with 2 methods
3. Record split payment with 3+ methods
4. Validate remaining balance prevents overpayment
5. Test payment status updates
6. Test deletion of split payments
7. Provider transaction integration tests
8. Rollback on split payment error

## API Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/vet-appointments/:appointmentId/payments` | Record payment |
| GET | `/api/vet-appointments/:appointmentId/payments` | List payments |
| PUT | `/api/vet-appointments/:appointmentId/payments/:paymentId` | Update status |
| DELETE | `/api/vet-appointments/:appointmentId/payments/:paymentId` | Delete payment |
| GET | `/api/vet-appointments/:appointmentId/payment-summary` | Get summary |

## Migration Guide

If upgrading from single-payment-only system:

1. All existing payments remain as-is
2. New `is_partial`, `payment_sequence`, `split_payment_group_id` columns are nullable
3. Existing payments will have:
   - `is_partial = FALSE`
   - `payment_sequence = NULL`
   - `split_payment_group_id = NULL`
4. No data loss or breaking changes
5. Can start using split payments immediately

## Future Enhancements

- [ ] Refund workflow for split payments
- [ ] Recurring split payment plans
- [ ] Payment reconciliation reports
- [ ] Multi-currency support
- [ ] Payment webhooks for all providers
- [ ] Automated payment reminders
- [ ] Payment fraud detection/scoring

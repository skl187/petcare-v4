/**
 * Split Payment Integration Examples
 * Real-world examples of using the split payment API
 */

import {
  recordPayment,
  getAppointmentPayments,
  getPaymentSummary,
  updatePaymentStatus,
  deletePayment,
  recordSplitPayments,
} from '@/services/splitPaymentService';

import {
  calculateRemainingBalance,
  formatCurrency,
  generateSplitPaymentGroupId,
  getPaymentSummary as calcPaymentSummary,
  getPaymentMethodDisplay,
} from '@/utils/paymentUtils';

import { API_ENDPOINTS } from '@/constants/api';

/**
 * EXAMPLE 1: Simple Full Payment with Credit Card
 * Appointment: $300 | Payment Method: Credit Card (via Stripe)
 */
export const example1_fullPaymentCard = async (appointmentId: string) => {
  try {
    const payment = await recordPayment(appointmentId, {
      payment_method: 'credit_card',
      paid_amount: '300',
      notes: 'Full payment via credit card',
      // If coming from Stripe webhook:
      provider_code: 'stripe',
      transaction_id: 'ch_1234567890ABCDEF',
      provider_response: {
        id: 'ch_1234567890ABCDEF',
        object: 'charge',
        amount: 30000,
        amount_captured: 30000,
        amount_refunded: 0,
        captured: true,
        currency: 'usd',
        paid: true,
        status: 'succeeded',
        receipt_email: 'customer@example.com',
      },
    });

    console.log('Payment recorded:', {
      paymentId: payment.id,
      amount: formatCurrency(payment.paid_amount),
      status: payment.payment_status,
    });

    const summary = await getPaymentSummary(appointmentId);
    console.log('Appointment payment status:', {
      total: formatCurrency(summary.appointmentTotal),
      paid: formatCurrency(summary.totalPaid),
      remaining: formatCurrency(summary.remainingBalance),
      fullyPaid: summary.isFullyPaid,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
  }
};

/**
 * EXAMPLE 2: Split Payment - Cash + Card
 * Appointment: $300 | Cash: $150 | Card: $150
 */
export const example2_splitCashAndCard = async (appointmentId: string) => {
  const groupId = generateSplitPaymentGroupId();

  try {
    // First: Record cash payment (at counter)
    const cashPayment = await recordPayment(appointmentId, {
      payment_method: 'cash_at_counter',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
      notes: 'Cash payment at reception desk',
    });

    console.log('Cash payment recorded:', {
      amount: formatCurrency(cashPayment.paid_amount),
      sequence: cashPayment.payment_sequence,
    });

    // Check remaining balance
    let summary = await getPaymentSummary(appointmentId);
    console.log('After cash payment:', {
      remaining: formatCurrency(summary.remainingBalance),
    });

    // Second: Record card payment (via payment gateway)
    const cardPayment = await recordPayment(appointmentId, {
      payment_method: 'credit_card',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
      notes: 'Remaining balance via card',
      provider_code: 'stripe',
      transaction_id: 'ch_remaining123',
      provider_response: {
        id: 'ch_remaining123',
        status: 'succeeded',
        amount: 15000,
      },
    });

    console.log('Card payment recorded:', {
      amount: formatCurrency(cardPayment.paid_amount),
      sequence: cardPayment.payment_sequence,
    });

    // Final summary
    summary = await getPaymentSummary(appointmentId);
    console.log('Final appointment status:', {
      total: formatCurrency(summary.appointmentTotal),
      paid: formatCurrency(summary.totalPaid),
      fullyPaid: summary.isFullyPaid,
      paymentCount: summary.paymentCount,
      methods: summary.paymentBreakdown.map((p) => getPaymentMethodDisplay(p.method)),
    });
  } catch (error) {
    console.error('Error in split payment:', error);
  }
};

/**
 * EXAMPLE 3: Split Payment - Insurance + Cash + Card
 * Appointment: $300 | Insurance: $150 | Cash: $75 | Card: $75
 */
export const example3_splitThreeMethods = async (appointmentId: string) => {
  const groupId = generateSplitPaymentGroupId();
  const payments = [
    {
      payment_method: 'insurance' as const,
      paid_amount: '150',
      notes: 'Insurance claim',
    },
    {
      payment_method: 'cash_at_counter' as const,
      paid_amount: '75',
      notes: 'Patient cash payment',
    },
    {
      payment_method: 'credit_card' as const,
      paid_amount: '75',
      notes: 'Card payment',
      provider_code: 'stripe',
      transaction_id: 'ch_finally123',
      provider_response: { status: 'succeeded' },
    },
  ];

  try {
    // Record all split payments with same group ID
    const allPayments = await recordSplitPayments(
      appointmentId,
      payments.map((p) => ({
        ...p,
        is_partial: true,
        split_payment_group_id: groupId,
      }))
    );

    console.log('All split payments recorded:', {
      count: allPayments.length,
      breakdown: allPayments.map((p) => ({
        method: getPaymentMethodDisplay(p.payment_method),
        amount: formatCurrency(p.paid_amount),
        sequence: p.payment_sequence,
      })),
    });

    const summary = await getPaymentSummary(appointmentId);
    console.log('Appointment fully paid:', summary.isFullyPaid);
  } catch (error) {
    console.error('Error recording split payments:', error);
  }
};

/**
 * EXAMPLE 4: Partial Payment Now, Pay Later
 * Appointment: $300 | Upfront Insurance: $150 | Later Payment: $150
 */
export const example4_paymentNowAndLater = async (appointmentId: string) => {
  const groupId = generateSplitPaymentGroupId();

  try {
    // Upfront: Insurance covers $150
    const insurancePayment = await recordPayment(appointmentId, {
      payment_method: 'insurance',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
      notes: 'Insurance approval for $150',
    });

    console.log('Insurance payment recorded - appointment not yet fully paid');

    let summary = await getPaymentSummary(appointmentId);
    console.log('Appointment status:', {
      remaining: formatCurrency(summary.remainingBalance),
      fullyPaid: summary.isFullyPaid,
    });

    // ... Some time later, patient makes additional payment

    const laterPayment = await recordPayment(appointmentId, {
      payment_method: 'credit_card',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
      notes: 'Patient deferred payment via card',
      provider_code: 'stripe',
      transaction_id: 'ch_deferred123',
      provider_response: { status: 'succeeded' },
    });

    console.log('Deferred payment recorded');

    summary = await getPaymentSummary(appointmentId);
    console.log('Appointment now fully paid:', {
      fullyPaid: summary.isFullyPaid,
      totalPayments: summary.paymentCount,
    });
  } catch (error) {
    console.error('Error in deferred payment:', error);
  }
};

/**
 * EXAMPLE 5: View and Manage Split Payments
 * List all payments, validate amounts, update statuses
 */
export const example5_viewAndManagePayments = async (appointmentId: string) => {
  try {
    // Get all payments
    const { payments, summary } = await getAppointmentPayments(appointmentId);

    console.log('Appointment Payment Details:', {
      total: formatCurrency(summary.total_amount),
      paid: formatCurrency(summary.total_paid),
      remaining: formatCurrency(summary.remaining_balance),
      fullyPaid: summary.is_fully_paid,
      isSplitPayment: summary.is_split_payment,
      paymentCount: summary.payment_count,
    });

    console.log('\nIndividual Payments:');
    payments.forEach((payment) => {
      console.log(`- ${getPaymentMethodDisplay(payment.payment_method)}: ${formatCurrency(payment.paid_amount)} (${payment.payment_status})`);
    });

    // If any payment failed, update it
    const failedPayment = payments.find((p) => p.payment_status === 'failed');
    if (failedPayment) {
      console.log('\nRetrying failed payment...');
      const updated = await updatePaymentStatus(appointmentId, failedPayment.id, 'paid');
      console.log('Payment status updated to:', updated.payment_status);
    }

    // Validate payment consistency
    const totalValidation = payments.reduce((sum, p) => sum + parseFloat(String(p.paid_amount)), 0);
    console.log('\nPayment validation:', {
      calculatedTotal: formatCurrency(totalValidation),
      systemTotal: formatCurrency(summary.total_paid),
      consistent: Math.abs(totalValidation - summary.total_paid) < 0.01,
    });
  } catch (error) {
    console.error('Error viewing payments:', error);
  }
};

/**
 * EXAMPLE 6: Handle Payment Refund
 * Mark split payment as cancelled if needed
 */
export const example6_handleRefund = async (appointmentId: string, paymentId: string) => {
  try {
    console.log('Processing refund for payment:', paymentId);

    // Method 1: Update status to cancelled (marks as refunded)
    const updated = await updatePaymentStatus(appointmentId, paymentId, 'cancelled');
    console.log('Payment marked as cancelled:', updated.payment_status);

    // Get new appointment status
    const summary = await getPaymentSummary(appointmentId);
    console.log('Appointment status after refund:', {
      remaining: formatCurrency(summary.remainingBalance),
      fullyPaid: summary.isFullyPaid,
    });

    // Note: Provider refund (Stripe, etc.) should be handled separately
    // This only updates the local payment record status
  } catch (error) {
    console.error('Error handling refund:', error);
  }
};

/**
 * EXAMPLE 7: Building a Payment Form Component
 * Shows reactive validation as user enters split payments
 */
export const example7_paymentFormValidation = (appointmentTotal: number, existingPayments: any[]) => {
  // Simulate real-time payment form input
  const payments = [
    { method: 'cash_at_counter', amount: 100 },
    { method: 'credit_card', amount: 100 },
  ];

  const remaining = calculateRemainingBalance(appointmentTotal, existingPayments);

  // Validate each payment
  payments.forEach((payment) => {
    if (payment.amount > remaining) {
      console.warn(`⚠️ Payment ${payment.method} exceeds remaining balance`);
    } else if (payment.amount <= 0) {
      console.warn(`⚠️ Payment ${payment.method} must be greater than 0`);
    } else {
      console.log(`✓ ${getPaymentMethodDisplay(payment.method)}: ${formatCurrency(payment.amount)}`);
    }
  });

  const totalEntered = payments.reduce((sum, p) => sum + p.amount, 0);
  console.log('\nForm Summary:', {
    appointmentTotal: formatCurrency(appointmentTotal),
    paymentsEntered: formatCurrency(totalEntered),
    remaining: formatCurrency(remaining - totalEntered),
    valid: totalEntered <= remaining,
  });
};

/**
 * EXAMPLE 8: Appointment Completion Workflow
 * Complete flow from appointment creation to final payment
 */
export const example8_completeWorkflow = async (appointmentId: string) => {
  const appointmentTotal = 300;
  const groupId = generateSplitPaymentGroupId();

  try {
    console.log('=== APPOINTMENT PAYMENT WORKFLOW ===\n');

    // Step 1: User selects first payment method
    console.log('Step 1: Patient selects multiple payment methods');
    console.log('- Will pay: $150 cash + $150 card\n');

    // Step 2: Record first payment
    console.log('Step 2: Record cash payment');
    await recordPayment(appointmentId, {
      payment_method: 'cash_at_counter',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
    });
    console.log('✓ Cash payment accepted\n');

    // Step 3: Process second payment
    console.log('Step 3: Process card payment');
    await recordPayment(appointmentId, {
      payment_method: 'credit_card',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
      provider_code: 'stripe',
      transaction_id: 'ch_workflow123',
      provider_response: { status: 'succeeded' },
    });
    console.log('✓ Card payment processed via Stripe\n');

    // Step 4: Verify appointment is paid
    console.log('Step 4: Verify appointment payment status');
    const summary = await getPaymentSummary(appointmentId);
    console.log('Appointment Status:', {
      '✓ Total Amount': formatCurrency(summary.appointmentTotal),
      '✓ Amount Paid': formatCurrency(summary.totalPaid),
      '✓ Fully Paid': summary.isFullyPaid,
      '✓ Split Payment': summary.isSplitPayment,
      '✓ Payment Methods': summary.paymentBreakdown.length,
    });

    console.log('\n=== APPOINTMENT PAYMENT COMPLETE ===');
  } catch (error) {
    console.error('❌ Error in workflow:', error);
  }
};

/**
 * EXAMPLE 9: Error Handling and Recovery
 * Demonstrates how to handle payment errors
 */
export const example9_errorHandling = async (appointmentId: string) => {
  const groupId = generateSplitPaymentGroupId();

  try {
    // Try to record payment that would exceed balance
    const payments = await recordSplitPayments(appointmentId, [
      {
        payment_method: 'cash_at_counter',
        paid_amount: '200', // First payment
        is_partial: true,
        split_payment_group_id: groupId,
      },
      {
        payment_method: 'credit_card',
        paid_amount: '200', // Second payment - would exceed $300 total
        is_partial: true,
        split_payment_group_id: groupId,
      },
    ]);
  } catch (error) {
    console.error('❌ Batch payment failed:', (error as Error).message);
    // Automatic rollback occurs - both payments would be deleted

    // Recover by recording valid amounts
    await recordPayment(appointmentId, {
      payment_method: 'cash_at_counter',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
    });

    await recordPayment(appointmentId, {
      payment_method: 'credit_card',
      paid_amount: '150',
      is_partial: true,
      split_payment_group_id: groupId,
    });

    console.log('✓ Recovery payment recorded successfully');
  }
};

/**
 * EXAMPLE 10: Integration with Stripe Webhooks
 * Handle Stripe payment events and update appointment
 */
export const example10_stripeWebhookIntegration = async (
  appointmentId: string,
  event: any // Stripe webhook event
) => {
  const groupId = generateSplitPaymentGroupId();

  try {
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object;

      // Record payment from webhook
      const payment = await recordPayment(appointmentId, {
        payment_method: 'credit_card',
        paid_amount: (charge.amount / 100).toString(), // Convert cents to dollars
        is_partial: true,
        split_payment_group_id: groupId,
        notes: `Stripe charge ${charge.id}`,
        provider_code: 'stripe',
        transaction_id: charge.id,
        provider_response: charge, // Full charge object
      });

      console.log(`✓ Payment recorded from Stripe webhook: ${charge.id}`);

      // Check if appointment is now fully paid
      const summary = await getPaymentSummary(appointmentId);
      if (summary.isFullyPaid) {
        console.log('✓ Appointment fully paid!');
        // Could trigger notification, invoice generation, etc.
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      console.log(`Processing refund for charge: ${charge.id}`);
      // Find and cancel corresponding payment record
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
};

export default {
  example1_fullPaymentCard,
  example2_splitCashAndCard,
  example3_splitThreeMethods,
  example4_paymentNowAndLater,
  example5_viewAndManagePayments,
  example6_handleRefund,
  example7_paymentFormValidation,
  example8_completeWorkflow,
  example9_errorHandling,
  example10_stripeWebhookIntegration,
};

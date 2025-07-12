import { loadStripe, Stripe } from '@stripe/stripe-js';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentConfig {
  enableStripe: boolean;
  depositPercentage: number;
  currency: string;
  acceptedMethods: string[];
  requireDeposit: boolean;
}

class PaymentService {
  private stripe: Promise<Stripe | null>;
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  constructor() {
    this.stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'eur',
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(
    clientSecret: string,
    paymentMethod: any,
    billingDetails: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const stripe = await this.stripe;
      if (!stripe) throw new Error('Stripe not loaded');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod,
        receipt_email: billingDetails.email
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: 'Payment failed' };
    }
  }

  async processRefund(paymentIntentId: string, amount?: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  calculateDepositAmount(totalAmount: number, depositPercentage: number): number {
    return Math.round((totalAmount * depositPercentage) / 100);
  }

  getPaymentConfig(): PaymentConfig {
    return {
      enableStripe: true,
      depositPercentage: 30,
      currency: 'eur',
      acceptedMethods: ['card', 'sepa_debit'],
      requireDeposit: false
    };
  }

  async getStripeInstance(): Promise<Stripe | null> {
    return await this.stripe;
  }
}

export const paymentService = new PaymentService();
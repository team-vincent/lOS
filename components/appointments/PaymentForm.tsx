'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { BookingData } from './AppointmentBooking';
import { paymentService } from '@/lib/services/paymentService';

interface PaymentFormProps {
  bookingData: BookingData;
  onPaymentComplete: (paymentData: any) => void;
  isLoading?: boolean;
  className?: string;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  bookingData,
  onPaymentComplete,
  isLoading = false,
  className = ''
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentConfig = paymentService.getPaymentConfig();
  const totalAmount = bookingData.service?.price || 0;
  const depositAmount = paymentService.calculateDepositAmount(totalAmount, paymentConfig.depositPercentage);

  const getPaymentAmount = () => {
    switch (bookingData.paymentOption) {
      case 'deposit':
        return depositAmount;
      case 'full':
        return totalAmount;
      case 'onsite':
        return 0;
      default:
        return totalAmount;
    }
  };

  const paymentAmount = getPaymentAmount();

  const handlePaymentOptionChange = (option: 'full' | 'deposit' | 'onsite') => {
    // Update booking data through parent component
    // This would typically be passed as a prop
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentService.isStripeAvailable()) {
      setPaymentError('Le système de paiement n\'est pas disponible. Veuillez contacter le support.');
      return;
    }

    if (!stripe || !elements) {
      setPaymentError('Le système de paiement n\'est pas encore chargé. Veuillez patienter.');
      return;
    }

    if (paymentAmount === 0) {
      // No payment required, proceed directly
      onPaymentComplete({ paymentIntentId: null });
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(
        paymentAmount,
        paymentConfig.currency,
        {
          serviceId: bookingData.service?.id || '',
          clientEmail: bookingData.client.email || '',
          appointmentDate: bookingData.timeSlot?.date.toISOString() || ''
        }
      );

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const result = await paymentService.confirmPayment(
        paymentIntent.clientSecret,
        {
          card: cardElement,
          billing_details: {
            name: `${bookingData.client.firstName} ${bookingData.client.lastName}`,
            email: bookingData.client.email,
            phone: bookingData.client.phone,
            address: bookingData.client.address ? {
              line1: bookingData.client.address.street,
              city: bookingData.client.address.city,
              postal_code: bookingData.client.address.postalCode,
              country: bookingData.client.address.country
            } : undefined
          }
        },
        {
          email: bookingData.client.email
        }
      );

      if (result.success) {
        onPaymentComplete({ paymentIntentId: paymentIntent.id });
      } else {
        setPaymentError(result.error || 'Erreur de paiement');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Une erreur est survenue lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
        iconColor: '#00F5FF',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Finalisation du paiement</h2>
        <p className="text-gray-400">
          Sécurisez votre réservation avec un paiement en ligne sécurisé
        </p>
      </div>

      {/* Payment Options */}
      {totalAmount > 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-6">Options de paiement</h3>
          
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentOption"
                value="full"
                checked={bookingData.paymentOption === 'full'}
                onChange={() => handlePaymentOptionChange('full')}
                className="mt-1 w-4 h-4 text-[#00F5FF] bg-gray-700 border-gray-600 focus:ring-[#00F5FF] focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium">Paiement intégral</div>
                <div className="text-sm text-gray-400">
                  Payez la totalité maintenant ({totalAmount}€)
                </div>
              </div>
              <div className="text-lg font-bold text-green-400">{totalAmount}€</div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentOption"
                value="deposit"
                checked={bookingData.paymentOption === 'deposit'}
                onChange={() => handlePaymentOptionChange('deposit')}
                className="mt-1 w-4 h-4 text-[#00F5FF] bg-gray-700 border-gray-600 focus:ring-[#00F5FF] focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium">Acompte ({paymentConfig.depositPercentage}%)</div>
                <div className="text-sm text-gray-400">
                  Payez un acompte maintenant, le reste sur place
                </div>
              </div>
              <div className="text-lg font-bold text-blue-400">{depositAmount}€</div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentOption"
                value="onsite"
                checked={bookingData.paymentOption === 'onsite'}
                onChange={() => handlePaymentOptionChange('onsite')}
                className="mt-1 w-4 h-4 text-[#00F5FF] bg-gray-700 border-gray-600 focus:ring-[#00F5FF] focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium">Paiement sur place</div>
                <div className="text-sm text-gray-400">
                  Payez directement lors du rendez-vous
                </div>
              </div>
              <div className="text-lg font-bold text-gray-400">0€</div>
            </label>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {paymentAmount > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#00F5FF]" />
              <span>Informations de paiement</span>
            </h3>

            {/* Security Notice */}
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">Paiement 100% sécurisé</p>
                <p className="text-green-300 text-sm">
                  Vos données sont protégées par le chiffrement SSL et la norme PCI DSS
                </p>
              </div>
            </div>

            {/* Card Element */}
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Informations de carte <span className="text-red-400">*</span>
              </label>
              <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
                <CardElement options={cardElementOptions} />
              </div>
              <p className="text-xs text-gray-400">
                Cartes acceptées: Visa, Mastercard, American Express
              </p>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{paymentError}</p>
              </motion.div>
            )}

            {/* Payment Summary */}
            <div className="bg-gray-700/50 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center mb-2">
                <span>Service:</span>
                <span>{bookingData.service?.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Prix total:</span>
                <span>{totalAmount}€</span>
              </div>
              {bookingData.paymentOption === 'deposit' && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span>Acompte ({paymentConfig.depositPercentage}%):</span>
                    <span>{depositAmount}€</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Reste à payer sur place:</span>
                    <span>{totalAmount - depositAmount}€</span>
                  </div>
                </>
              )}
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>À payer maintenant:</span>
                  <span className="text-[#00F5FF]">{paymentAmount}€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || isProcessing || isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing || isLoading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Payer {paymentAmount}€ maintenant</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* No Payment Required */}
      {paymentAmount === 0 && (
        <div className="text-center">
          <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun paiement requis</h3>
            <p className="text-gray-400 mb-6">
              {totalAmount === 0 
                ? 'Ce service est gratuit' 
                : 'Vous avez choisi de payer sur place'
              }
            </p>
            <button
              onClick={() => onPaymentComplete({ paymentIntentId: null })}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Finalisation...' : 'Confirmer la réservation'}
            </button>
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="text-center text-sm text-gray-400 space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>SSL 256-bit</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lock className="w-4 h-4" />
            <span>PCI DSS</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>3D Secure</span>
          </div>
        </div>
        <p>Vos données de paiement sont sécurisées et ne sont jamais stockées sur nos serveurs</p>
      </div>
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={paymentService.getStripeInstance()}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight, Calendar, CreditCard, User } from 'lucide-react';
import { Service, TimeSlot, Client, Appointment, BookingStep } from '@/lib/types/appointment';
import ServiceSelection from './ServiceSelection';
import TimeSlotSelection from './TimeSlotSelection';
import ClientInformation from './ClientInformation';
import BookingSummary from './BookingSummary';
import PaymentForm from './PaymentForm';
import BookingConfirmation from './BookingConfirmation';
import { appointmentService } from '@/lib/services/appointmentService';
import { paymentService } from '@/lib/services/paymentService';
import { notificationService } from '@/lib/services/notificationService';

export interface BookingData {
  service?: Service;
  timeSlot?: TimeSlot;
  client: Partial<Client>;
  appointment?: Partial<Appointment>;
  paymentOption: 'full' | 'deposit' | 'onsite';
  paymentAmount?: number;
}

interface AppointmentBookingProps {
  className?: string;
  onComplete?: (appointment: Appointment) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  className = '',
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);

  const [bookingData, setBookingData] = useState<BookingData>({
    client: {},
    paymentOption: 'full'
  });

  const steps = [
    { number: 1, title: 'Service', icon: <Calendar className="w-5 h-5" />, description: 'Choisissez votre prestation' },
    { number: 2, title: 'Créneau', icon: <Calendar className="w-5 h-5" />, description: 'Sélectionnez date et heure' },
    { number: 3, title: 'Informations', icon: <User className="w-5 h-5" />, description: 'Vos coordonnées' },
    { number: 4, title: 'Paiement', icon: <CreditCard className="w-5 h-5" />, description: 'Finalisation' }
  ];

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleServiceSelect = (service: Service) => {
    updateBookingData({ service });
    handleNext();
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    updateBookingData({ timeSlot });
    handleNext();
  };

  const handleClientSubmit = (client: Partial<Client>) => {
    updateBookingData({ client });
    handleNext();
  };

  const handlePaymentComplete = async (paymentData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create client if new
      let clientId = bookingData.client.id;
      if (!clientId) {
        const existingClient = await appointmentService.getClientByEmail(bookingData.client.email!);
        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const newClient = await appointmentService.createClient(bookingData.client as Omit<Client, 'id'>);
          clientId = newClient.id;
        }
      }

      // Create appointment
      const appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
        serviceId: bookingData.service!.id,
        clientId: clientId!,
        date: bookingData.timeSlot!.date,
        startTime: bookingData.timeSlot!.startTime,
        endTime: bookingData.timeSlot!.endTime,
        status: 'confirmed',
        paymentStatus: paymentData.paymentIntentId ? 'paid' : 'pending',
        paymentAmount: bookingData.paymentAmount || bookingData.service!.price,
        paymentMethod: paymentData.paymentIntentId ? 'card' : 'cash',
        remindersSent: [false, false]
      };

      const appointment = await appointmentService.createAppointment(appointmentData);

      // Generate calendar event
      const calendarEvent = await appointmentService.generateCalendarEvent(appointment);

      // Send confirmation email
      await notificationService.sendConfirmationEmail(
        appointment,
        bookingData.client as Client,
        bookingData.service!,
        calendarEvent
      );

      // Schedule reminders
      await notificationService.scheduleReminders(appointment);

      setCompletedAppointment(appointment);
      onComplete?.(appointment);

    } catch (err) {
      console.error('Error completing booking:', err);
      setError('Une erreur est survenue lors de la finalisation. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!bookingData.service;
      case 2:
        return !!bookingData.timeSlot;
      case 3:
        return !!(bookingData.client.firstName && bookingData.client.lastName && bookingData.client.email);
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (completedAppointment) {
    return (
      <BookingConfirmation
        appointment={completedAppointment}
        service={bookingData.service!}
        client={bookingData.client as Client}
        className={className}
      />
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] border-transparent text-white'
                      : 'border-gray-600 text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-white' : 'text-gray-400'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.number ? 'bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD]' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <ServiceSelection
              onServiceSelect={handleServiceSelect}
              selectedService={bookingData.service}
            />
          )}

          {currentStep === 2 && bookingData.service && (
            <TimeSlotSelection
              service={bookingData.service}
              onTimeSlotSelect={handleTimeSlotSelect}
              selectedTimeSlot={bookingData.timeSlot}
            />
          )}

          {currentStep === 3 && (
            <ClientInformation
              initialData={bookingData.client}
              onSubmit={handleClientSubmit}
              service={bookingData.service}
            />
          )}

          {currentStep === 4 && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PaymentForm
                  bookingData={bookingData}
                  onPaymentComplete={handlePaymentComplete}
                  isLoading={isLoading}
                />
              </div>
              <div className="lg:col-span-1">
                <BookingSummary bookingData={bookingData} />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Précédent</span>
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-400">
              Étape {currentStep} sur {steps.length}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Suivant</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;
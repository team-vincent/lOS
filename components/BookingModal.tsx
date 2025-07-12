'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentBooking from './appointments/AppointmentBooking';
import { Appointment } from '@/lib/types/appointment';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 1 | 2 | 3 | 4;
  preSelectedService?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialStep = 1,
  preSelectedService
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !completedAppointment) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, completedAppointment]);

  const handleClose = () => {
    if (completedAppointment) {
      // Si un rendez-vous a été complété, fermer directement
      onClose();
      setCompletedAppointment(null);
    } else {
      // Animation de fermeture
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300);
    }
  };

  const handleAppointmentComplete = (appointment: Appointment) => {
    setCompletedAppointment(appointment);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={!completedAppointment ? handleClose : undefined}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: isClosing ? 0 : 1, 
            scale: isClosing ? 0.95 : 1, 
            y: isClosing ? 20 : 0 
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full h-[95vh] max-w-7xl mx-4 my-4 bg-[#0A0A0B] rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#0A0A0B]/95 backdrop-blur-sm border-b border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {completedAppointment ? 'Réservation confirmée' : 'Prendre rendez-vous'}
                </h2>
                <p className="text-sm text-gray-400">
                  {completedAppointment 
                    ? 'Votre rendez-vous a été enregistré avec succès'
                    : 'Réservez votre créneau en quelques étapes'
                  }
                </p>
              </div>
            </div>

            {/* Progress Indicators (only if not completed) */}
            {!completedAppointment && (
              <div className="hidden md:flex items-center space-x-2">
                {[
                  { icon: <Calendar className="w-4 h-4" />, label: 'Service' },
                  { icon: <Clock className="w-4 h-4" />, label: 'Créneau' },
                  { icon: <User className="w-4 h-4" />, label: 'Infos' },
                  { icon: <CreditCard className="w-4 h-4" />, label: 'Paiement' }
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-xs text-gray-400">{step.label}</span>
                    {index < 3 && (
                      <div className="w-8 h-0.5 bg-gray-700 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Success Icon (if completed) */}
            {completedAppointment && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 font-medium">Succès</span>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors group"
              title="Fermer"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="h-[calc(95vh-80px)] overflow-y-auto">
            <div className="p-6">
              <AppointmentBooking
                onComplete={handleAppointmentComplete}
                className="max-w-none"
              />
            </div>
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0B] to-transparent p-6 pointer-events-none">
            <div className="text-center text-xs text-gray-500">
              <p>🔒 Vos données sont sécurisées et chiffrées</p>
              <p>📧 Confirmation par email • 📱 Rappels automatiques</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
'use client';

import React from 'react';
import { Calendar, Clock, User, CreditCard, MapPin, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookingData } from './AppointmentBooking';

interface BookingSummaryProps {
  bookingData: BookingData;
  className?: string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  bookingData,
  className = ''
}) => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`;
  };

  const getPaymentLabel = () => {
    switch (bookingData.paymentOption) {
      case 'full':
        return 'Paiement intégral';
      case 'deposit':
        return 'Acompte (30%)';
      case 'onsite':
        return 'Paiement sur place';
      default:
        return 'Non défini';
    }
  };

  const getPaymentAmount = () => {
    if (!bookingData.service) return 0;
    
    switch (bookingData.paymentOption) {
      case 'full':
        return bookingData.service.price;
      case 'deposit':
        return Math.round(bookingData.service.price * 0.3);
      case 'onsite':
        return 0;
      default:
        return bookingData.service.price;
    }
  };

  return (
    <div className={`bg-gray-800/50 rounded-2xl p-6 border border-gray-700 sticky top-8 ${className}`}>
      <h3 className="text-xl font-semibold mb-6">Récapitulatif de votre réservation</h3>
      
      <div className="space-y-6">
        {/* Service */}
        {bookingData.service && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-300">Service sélectionné</h4>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: bookingData.service.color }}
                />
                <span className="font-semibold">{bookingData.service.name}</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                {bookingData.service.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formatDuration(bookingData.service.duration)}</span>
                </div>
                <div className="font-semibold text-green-400">
                  {bookingData.service.price === 0 ? 'Gratuit' : `${bookingData.service.price}€`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date & Time */}
        {bookingData.timeSlot && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-300">Date et heure</h4>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-5 h-5 text-[#00F5FF]" />
                <span className="font-semibold">
                  {format(bookingData.timeSlot.date, 'EEEE d MMMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#9D4EDD]" />
                <span>{bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Client Information */}
        {(bookingData.client.firstName || bookingData.client.email) && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-300">Vos informations</h4>
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              {bookingData.client.firstName && bookingData.client.lastName && (
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{bookingData.client.firstName} {bookingData.client.lastName}</span>
                </div>
              )}
              {bookingData.client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{bookingData.client.email}</span>
                </div>
              )}
              {bookingData.client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{bookingData.client.phone}</span>
                </div>
              )}
              {bookingData.client.company && (
                <div className="text-sm text-gray-400">
                  {bookingData.client.company}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-300">Lieu du rendez-vous</h4>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#40E0D0] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Leonce Ouattara Studio</div>
                <div className="text-sm text-gray-400">
                  Abidjan, Côte d'Ivoire
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  L'adresse exacte vous sera communiquée par email
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        {bookingData.service && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-300">Paiement</h4>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <CreditCard className="w-5 h-5 text-green-400" />
                <span className="font-medium">{getPaymentLabel()}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Prix du service:</span>
                  <span>{bookingData.service.price}€</span>
                </div>
                
                {bookingData.paymentOption === 'deposit' && (
                  <>
                    <div className="flex justify-between text-[#00F5FF]">
                      <span>Acompte (30%):</span>
                      <span>{getPaymentAmount()}€</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Reste à payer:</span>
                      <span>{bookingData.service.price - getPaymentAmount()}€</span>
                    </div>
                  </>
                )}
                
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>À payer maintenant:</span>
                    <span className="text-green-400">{getPaymentAmount()}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-2">À retenir</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• Confirmation par email dans quelques minutes</li>
            <li>• Rappels automatiques J-2 et H-2</li>
            <li>• Arrivez 5 minutes en avance</li>
            <li>• Annulation gratuite jusqu'à 24h avant</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center text-sm text-gray-400">
          <p>Une question ?</p>
          <div className="mt-1">
            <a href="mailto:leonce.ouattara@outlook.fr" className="text-[#00F5FF] hover:underline">
              leonce.ouattara@outlook.fr
            </a>
          </div>
          <div>
            <a href="tel:+22505451307390" className="text-[#00F5FF] hover:underline">
              +225 05 45 13 07 39
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
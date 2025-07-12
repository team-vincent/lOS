'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Download,
  Share2,
  Edit,
  X,
  Copy,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment, Service, Client } from '@/lib/types/appointment';
import { appointmentService } from '@/lib/services/appointmentService';

interface BookingConfirmationProps {
  appointment: Appointment;
  service: Service;
  client: Client;
  className?: string;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  service,
  client,
  className = ''
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const appointmentDate = format(appointment.date, 'EEEE d MMMM yyyy', { locale: fr });
  const appointmentTime = `${appointment.startTime} - ${appointment.endTime}`;

  const handleDownloadCalendar = async () => {
    try {
      const icsContent = await appointmentService.generateCalendarEvent(appointment);
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rendez-vous-${format(appointment.date, 'yyyy-MM-dd')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading calendar:', error);
    }
  };

  const shareUrl = `${window.location.origin}/appointments/${appointment.id}`;
  const shareText = `J'ai réservé un rendez-vous avec Leonce Ouattara Studio pour ${service.name} le ${appointmentDate} à ${appointment.startTime}`;

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`;
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center mb-12"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Réservation confirmée !</h1>
        <p className="text-gray-400 text-lg">
          Votre rendez-vous a été enregistré avec succès. Vous allez recevoir un email de confirmation.
        </p>
      </motion.div>

      {/* Appointment Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid lg:grid-cols-3 gap-8 mb-12"
      >
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">{service.name}</h2>
            <p className="text-gray-400 mb-4">{service.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#00F5FF]" />
                <span>Durée: {formatDuration(service.duration)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 font-semibold">
                  {service.price === 0 ? 'Gratuit' : `${service.price}€`}
                </span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Date et heure</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-[#9D4EDD]" />
                <span className="text-lg font-medium">{appointmentDate}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-[#00F5FF]" />
                <span className="text-lg font-medium">{appointmentTime}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Lieu du rendez-vous</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-[#40E0D0] flex-shrink-0 mt-1" />
              <div>
                <div className="font-medium text-lg">Leonce Ouattara Studio</div>
                <div className="text-gray-400">Abidjan, Côte d'Ivoire</div>
                <div className="text-sm text-gray-500 mt-2">
                  L'adresse exacte vous sera communiquée par email 24h avant le rendez-vous.
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Statut du paiement</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  appointment.paymentStatus === 'paid' 
                    ? 'bg-green-500/20 text-green-400' 
                    : appointment.paymentStatus === 'partial'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {appointment.paymentStatus === 'paid' && 'Payé'}
                  {appointment.paymentStatus === 'partial' && 'Acompte versé'}
                  {appointment.paymentStatus === 'pending' && 'À payer sur place'}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Montant: {appointment.paymentAmount}€
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadCalendar}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-[#00F5FF] hover:bg-[#0099CC] rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Ajouter au calendrier</span>
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-[#9D4EDD] hover:bg-[#8A2BE2] rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Partager</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Edit className="w-5 h-5" />
                <span>Modifier</span>
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <a
                href="mailto:leonce.ouattara@outlook.fr"
                className="flex items-center space-x-3 text-gray-300 hover:text-[#00F5FF] transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>leonce.ouattara@outlook.fr</span>
              </a>
              <a
                href="tel:+22505451307390"
                className="flex items-center space-x-3 text-gray-300 hover:text-[#00F5FF] transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>+225 05 45 13 07 39</span>
              </a>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">À retenir</h3>
            <ul className="text-sm text-blue-300 space-y-2">
              <li>• Email de confirmation envoyé</li>
              <li>• Rappels automatiques J-2 et H-2</li>
              <li>• Arrivez 5 minutes en avance</li>
              <li>• Apportez vos documents si nécessaire</li>
              <li>• Annulation gratuite jusqu'à 24h avant</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-[#00F5FF]/10 to-[#9D4EDD]/10 rounded-2xl p-8 border border-[#00F5FF]/30 text-center"
      >
        <h3 className="text-2xl font-bold mb-4">Et maintenant ?</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="w-12 h-12 bg-[#00F5FF] rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">1. Vérifiez votre email</h4>
            <p className="text-gray-400">
              Vous recevrez la confirmation avec tous les détails dans quelques minutes.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-[#9D4EDD] rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">2. Ajoutez à votre agenda</h4>
            <p className="text-gray-400">
              Téléchargez le fichier .ics pour ne pas oublier votre rendez-vous.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-[#40E0D0] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">3. Préparez-vous</h4>
            <p className="text-gray-400">
              Préparez vos questions et documents pour optimiser notre échange.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Partager votre rendez-vous</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span>Partager sur Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-400 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5" />
                <span>Partager sur Twitter</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                <span>Partager sur LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  copySuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Copy className="w-5 h-5" />
                <span>{copySuccess ? 'Lien copié !' : 'Copier le lien'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
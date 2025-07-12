'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, MapPin, Globe, Shield, CheckCircle } from 'lucide-react';
import { Service, Client } from '@/lib/types/appointment';
import { appointmentService } from '@/lib/services/appointmentService';

interface ClientInformationProps {
  initialData: Partial<Client>;
  onSubmit: (client: Partial<Client>) => void;
  service?: Service;
  className?: string;
}

const ClientInformation: React.FC<ClientInformationProps> = ({
  initialData,
  onSubmit,
  service,
  className = ''
}) => {
  const [formData, setFormData] = useState<Partial<Client>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      checkExistingClient(formData.email);
    }
  }, [formData.email]);

  const checkExistingClient = async (email: string) => {
    setIsCheckingEmail(true);
    try {
      const existingClient = await appointmentService.getClientByEmail(email);
      if (existingClient) {
        setIsExistingClient(true);
        setFormData(prev => ({
          ...prev,
          ...existingClient,
          email // Keep the typed email
        }));
      } else {
        setIsExistingClient(false);
      }
    } catch (error) {
      console.error('Error checking client:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'L\'email est requis';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Phone validation (French format)
    if (formData.phone) {
      const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Format de téléphone invalide (ex: +33 6 12 34 56 78)';
      }
    }

    // RGPD acceptance
    if (!rgpdAccepted) {
      newErrors.rgpd = 'Vous devez accepter la politique de confidentialité';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const countries = [
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'FR', name: 'France' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'CA', name: 'Canada' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'ML', name: 'Mali' },
    { code: 'BF', name: 'Burkina Faso' }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Vos informations</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Complétez vos coordonnées pour finaliser la réservation de votre {service?.name.toLowerCase()}.
        </p>
      </div>

      {/* Existing Client Notice */}
      {isExistingClient && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3"
        >
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-medium">Client reconnu !</p>
            <p className="text-green-300 text-sm">Vos informations ont été pré-remplies automatiquement.</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <User className="w-5 h-5 text-[#00F5FF]" />
            <span>Informations personnelles</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prénom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors ${
                  errors.firstName ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Votre prénom"
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors ${
                  errors.lastName ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Votre nom"
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="votre@email.com"
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-[#00F5FF] border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Téléphone <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="+225 05 45 13 07 39"
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Format: +225 XX XX XX XX XX ou 0X XX XX XX XX
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Entreprise</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors"
                placeholder="Nom de votre entreprise (optionnel)"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#9D4EDD]" />
            <span>Adresse (optionnel)</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <input
                type="text"
                value={formData.address?.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors"
                placeholder="123 Rue de la République"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Ville</label>
                <input
                  type="text"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors"
                  placeholder="Abidjan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Code postal</label>
                <input
                  type="text"
                  value={formData.address?.postalCode || ''}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors"
                  placeholder="00225"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pays</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.address?.country || 'CI'}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00F5FF] transition-colors appearance-none"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#40E0D0]" />
            <span>Préférences</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.preferences?.notifications ?? true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    notifications: e.target.checked,
                    language: prev.preferences?.language || 'fr',
                    timezone: prev.preferences?.timezone || 'Africa/Abidjan'
                  }
                }))}
                className="mt-1 w-4 h-4 text-[#00F5FF] bg-gray-700 border-gray-600 rounded focus:ring-[#00F5FF] focus:ring-2"
              />
              <div>
                <label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                  Recevoir les notifications par email
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Confirmations, rappels et informations importantes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RGPD Compliance */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/30">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="rgpd"
              checked={rgpdAccepted}
              onChange={(e) => setRgpdAccepted(e.target.checked)}
              className={`mt-1 w-4 h-4 text-blue-400 bg-gray-700 border-gray-600 rounded focus:ring-blue-400 focus:ring-2 ${
                errors.rgpd ? 'border-red-500' : ''
              }`}
            />
            <div className="flex-1">
              <label htmlFor="rgpd" className="text-sm font-medium cursor-pointer">
                J'accepte la politique de confidentialité <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                En cochant cette case, vous acceptez que vos données personnelles soient traitées 
                conformément à notre{' '}
                <a href="/privacy" className="text-blue-400 hover:underline">
                  politique de confidentialité
                </a>{' '}
                et aux règles du{' '}
                <a href="/rgpd" className="text-blue-400 hover:underline">
                  RGPD
                </a>.
                Vous pouvez retirer votre consentement à tout moment.
              </p>
              {errors.rgpd && (
                <p className="text-red-400 text-xs mt-1">{errors.rgpd}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!rgpdAccepted}
          >
            Continuer vers le paiement
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Vos données sont sécurisées et chiffrées
          </p>
        </div>
      </form>
    </div>
  );
};

export default ClientInformation;
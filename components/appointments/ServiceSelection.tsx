'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Euro, Filter, Search, Star, CheckCircle } from 'lucide-react';
import { Service } from '@/lib/types/appointment';
import { appointmentService } from '@/lib/services/appointmentService';

interface ServiceSelectionProps {
  onServiceSelect: (service: Service) => void;
  selectedService?: Service;
  className?: string;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  onServiceSelect,
  selectedService,
  className = ''
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory, priceFilter, durationFilter]);

  const loadServices = async () => {
    try {
      const data = await appointmentService.getServices();
      setServices(data.filter(service => service.isActive));
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Price filter
    if (priceFilter) {
      switch (priceFilter) {
        case 'free':
          filtered = filtered.filter(service => service.price === 0);
          break;
        case 'under-100':
          filtered = filtered.filter(service => service.price > 0 && service.price < 100);
          break;
        case 'over-100':
          filtered = filtered.filter(service => service.price >= 100);
          break;
      }
    }

    // Duration filter
    if (durationFilter) {
      switch (durationFilter) {
        case 'short':
          filtered = filtered.filter(service => service.duration <= 60);
          break;
        case 'medium':
          filtered = filtered.filter(service => service.duration > 60 && service.duration <= 120);
          break;
        case 'long':
          filtered = filtered.filter(service => service.duration > 120);
          break;
      }
    }

    setFilteredServices(filtered);
  };

  const categories = [...new Set(services.map(service => service.category))];

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#00F5FF] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choisissez votre prestation</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Sélectionnez le service qui correspond à vos besoins. Chaque prestation est adaptée 
          pour vous offrir la meilleure expertise possible.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-[#00F5FF] focus:outline-none text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-[#00F5FF] focus:outline-none text-white"
          >
            <option value="">Toutes catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-[#00F5FF] focus:outline-none text-white"
          >
            <option value="">Tous les prix</option>
            <option value="free">Gratuit</option>
            <option value="under-100">Moins de 100€</option>
            <option value="over-100">100€ et plus</option>
          </select>

          {/* Duration Filter */}
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-[#00F5FF] focus:outline-none text-white"
          >
            <option value="">Toutes durées</option>
            <option value="short">Court (≤ 1h)</option>
            <option value="medium">Moyen (1-2h)</option>
            <option value="long">Long (> 2h)</option>
          </select>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory || priceFilter || durationFilter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="px-3 py-1 bg-[#00F5FF]/20 text-[#00F5FF] rounded-full text-sm">
                Recherche: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="px-3 py-1 bg-[#9D4EDD]/20 text-[#9D4EDD] rounded-full text-sm">
                {selectedCategory}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceFilter('');
                setDurationFilter('');
              }}
              className="px-3 py-1 bg-gray-600 text-gray-300 rounded-full text-sm hover:bg-gray-500 transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun service trouvé</h3>
          <p className="text-gray-400">Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedService?.id === service.id
                  ? 'ring-2 ring-[#00F5FF] ring-opacity-50'
                  : ''
              }`}
              onClick={() => onServiceSelect(service)}
            >
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 h-full">
                {/* Service Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="text-sm text-gray-400 uppercase tracking-wide">
                        {service.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#00F5FF] transition-colors">
                      {service.name}
                    </h3>
                  </div>
                  {selectedService?.id === service.id && (
                    <CheckCircle className="w-6 h-6 text-[#00F5FF] flex-shrink-0" />
                  )}
                </div>

                {/* Service Description */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Service Details */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatDuration(service.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Euro className="w-4 h-4 text-green-400" />
                      <span className="text-lg font-bold text-green-400">
                        {service.price === 0 ? 'Gratuit' : `${service.price}€`}
                      </span>
                    </div>
                  </div>
                  {service.price === 0 && (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">Populaire</span>
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {service.requirements && service.requirements.length > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Prérequis :</h4>
                    <ul className="space-y-1">
                      {service.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-center space-x-2">
                          <div className="w-1 h-1 bg-gray-500 rounded-full" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Selection Indicator */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#00F5FF]/30 transition-all duration-300 pointer-events-none" />
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00F5FF]/5 to-[#9D4EDD]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#00F5FF]/10 to-[#9D4EDD]/10 rounded-2xl p-6 border border-[#00F5FF]/30">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Besoin d'aide pour choisir ?</h3>
          <p className="text-gray-400 mb-4">
            Pas sûr du service qui vous convient ? Commencez par une consultation gratuite.
          </p>
          <button
            onClick={() => {
              const consultationService = services.find(s => s.price === 0);
              if (consultationService) {
                onServiceSelect(consultationService);
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Consultation gratuite
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
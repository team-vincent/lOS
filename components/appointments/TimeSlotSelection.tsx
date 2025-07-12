'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, MapPin, Zap } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Service, TimeSlot } from '@/lib/types/appointment';
import { appointmentService } from '@/lib/services/appointmentService';

interface TimeSlotSelectionProps {
  service: Service;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  selectedTimeSlot?: TimeSlot;
  className?: string;
}

const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({
  service,
  onTimeSlotSelect,
  selectedTimeSlot,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    loadAvailableSlots();
  }, [currentDate, service.id]);

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      const endDate = addDays(endOfWeek(currentDate, { weekStartsOn: 1 }), 14); // 3 weeks
      const slots = await appointmentService.getAvailableSlots(service.id, startDate, endDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextAvailableSlot = async () => {
    const nextSlot = await appointmentService.getNextAvailableSlot(service.id);
    if (nextSlot) {
      setSelectedDate(nextSlot.date);
      onTimeSlotSelect(nextSlot);
    }
  };

  const getDaysInView = () => {
    const days = [];
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    for (let i = 0; i < 21; i++) { // 3 weeks
      days.push(addDays(startDate, i));
    }
    
    return days;
  };

  const getSlotsForDate = (date: Date) => {
    return availableSlots.filter(slot => 
      isSameDay(slot.date, date) && slot.isAvailable
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTimeSlotsByPeriod = (date: Date) => {
    const slots = getSlotsForDate(date);
    
    return {
      morning: slots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0]);
        return hour >= 9 && hour < 12;
      }),
      afternoon: slots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0]);
        return hour >= 14 && hour < 18;
      }),
      evening: slots.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0]);
        return hour >= 18 && hour < 20;
      })
    };
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    return `${slot.startTime} - ${slot.endTime}`;
  };

  const isDateAvailable = (date: Date) => {
    return getSlotsForDate(date).length > 0;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentDate, direction === 'next' ? 7 : -7);
    setCurrentDate(newDate);
  };

  const quickTimeFilters = [
    { label: 'Matin', value: 'morning', icon: '🌅' },
    { label: 'Après-midi', value: 'afternoon', icon: '☀️' },
    { label: 'Soirée', value: 'evening', icon: '🌆' }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choisissez votre créneau</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Sélectionnez la date et l'heure qui vous conviennent pour votre {service.name.toLowerCase()}.
        </p>
      </div>

      {/* Service Info */}
      <div className="bg-gradient-to-r from-[#00F5FF]/10 to-[#9D4EDD]/10 rounded-2xl p-6 border border-[#00F5FF]/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{service.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Leonce Ouattara Studio, Abidjan</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {service.price === 0 ? 'Gratuit' : `${service.price}€`}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={getNextAvailableSlot}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          <Zap className="w-5 h-5" />
          <span>Premier créneau disponible</span>
        </button>
        
        <div className="flex items-center space-x-2">
          {quickTimeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                // Scroll to first available slot of this period
                const today = new Date();
                const slots = getTimeSlotsByPeriod(today);
                const periodSlots = slots[filter.value as keyof typeof slots];
                if (periodSlots.length > 0) {
                  setSelectedDate(today);
                  // Auto-scroll to this time period
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
            >
              <span>{filter.icon}</span>
              <span className="text-sm">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-lg p-1 border border-gray-600">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#00F5FF] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendrier
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#00F5FF] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Liste
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek('prev')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Semaine précédente</span>
        </button>
        
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h3>
        
        <button
          onClick={() => navigateWeek('next')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <span>Semaine suivante</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-[#00F5FF] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des créneaux...</p>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && !isLoading && (
        <div className="space-y-6">
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {getDaysInView().map((date, index) => {
              const isAvailable = isDateAvailable(date);
              const isPast = isBefore(date, startOfDay(new Date()));
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => isAvailable && !isPast && setSelectedDate(date)}
                  disabled={!isAvailable || isPast}
                  className={`
                    aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isPast 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : isAvailable
                        ? isSelected
                          ? 'bg-[#00F5FF] text-white shadow-lg'
                          : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                        : 'text-gray-500 cursor-not-allowed'
                    }
                    ${isCurrentDay && !isSelected ? 'ring-2 ring-[#9D4EDD] ring-opacity-50' : ''}
                  `}
                >
                  <div>{format(date, 'd')}</div>
                  {isAvailable && !isPast && (
                    <div className="text-xs text-green-400 mt-1">
                      {getSlotsForDate(date).length}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Time Slots for Selected Date */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-semibold mb-4">
                Créneaux disponibles - {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h4>
              
              {(() => {
                const periods = getTimeSlotsByPeriod(selectedDate);
                const hasSlots = periods.morning.length + periods.afternoon.length + periods.evening.length > 0;
                
                if (!hasSlots) {
                  return (
                    <p className="text-gray-400 text-center py-4">
                      Aucun créneau disponible pour cette date.
                    </p>
                  );
                }
                
                return (
                  <div className="space-y-6">
                    {Object.entries(periods).map(([period, slots]) => {
                      if (slots.length === 0) return null;
                      
                      const periodLabels = {
                        morning: { label: 'Matin', icon: '🌅' },
                        afternoon: { label: 'Après-midi', icon: '☀️' },
                        evening: { label: 'Soirée', icon: '🌆' }
                      };
                      
                      return (
                        <div key={period}>
                          <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                            <span>{periodLabels[period as keyof typeof periodLabels].icon}</span>
                            <span>{periodLabels[period as keyof typeof periodLabels].label}</span>
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {slots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => onTimeSlotSelect(slot)}
                                className={`
                                  p-3 rounded-lg text-sm font-medium transition-all duration-200
                                  ${selectedTimeSlot?.id === slot.id
                                    ? 'bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                  }
                                `}
                              >
                                {formatTimeSlot(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && !isLoading && (
        <div className="space-y-4">
          {getDaysInView()
            .filter(date => isDateAvailable(date) && !isBefore(date, startOfDay(new Date())))
            .slice(0, 7) // Show next 7 available days
            .map((date, index) => {
              const periods = getTimeSlotsByPeriod(date);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#00F5FF]" />
                    <span>{format(date, 'EEEE d MMMM', { locale: fr })}</span>
                    {isToday(date) && (
                      <span className="px-2 py-1 bg-[#9D4EDD] text-white text-xs rounded-full">
                        Aujourd'hui
                      </span>
                    )}
                  </h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(periods).map(([period, slots]) => {
                      if (slots.length === 0) return null;
                      
                      const periodLabels = {
                        morning: { label: 'Matin', icon: '🌅' },
                        afternoon: { label: 'Après-midi', icon: '☀️' },
                        evening: { label: 'Soirée', icon: '🌆' }
                      };
                      
                      return (
                        <div key={period}>
                          <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                            <span>{periodLabels[period as keyof typeof periodLabels].icon}</span>
                            <span>{periodLabels[period as keyof typeof periodLabels].label}</span>
                          </h5>
                          <div className="space-y-2">
                            {slots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => onTimeSlotSelect(slot)}
                                className={`
                                  w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 text-left
                                  ${selectedTimeSlot?.id === slot.id
                                    ? 'bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }
                                `}
                              >
                                {formatTimeSlot(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Timezone Info */}
      <div className="text-center text-sm text-gray-400">
        <p>Tous les horaires sont affichés en heure locale (GMT+0, Abidjan)</p>
      </div>
    </div>
  );
};

export default TimeSlotSelection;
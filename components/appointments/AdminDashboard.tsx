'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Analytics, Appointment, Service, Client } from '@/lib/types/appointment';
import { appointmentService } from '@/lib/services/appointmentService';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (selectedPeriod) {
        case 'current-month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'last-month':
          const lastMonth = subMonths(now, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case 'last-3-months':
          startDate = startOfMonth(subMonths(now, 2));
          endDate = endOfMonth(now);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }

      const [analyticsData] = await Promise.all([
        appointmentService.getAnalytics(startDate, endDate)
      ]);

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    // Implementation for CSV/Excel export
    console.log('Exporting data...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20';
      case 'completed':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-[#00F5FF] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-gray-400">Gestion des rendez-vous et analytics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-[#00F5FF] focus:outline-none"
            >
              <option value="current-month">Mois actuel</option>
              <option value="last-month">Mois dernier</option>
              <option value="last-3-months">3 derniers mois</option>
            </select>
            
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-[#00F5FF] hover:bg-[#0099CC] rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {analytics && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#00F5FF]/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#00F5FF]" />
                </div>
                <span className="text-2xl font-bold">{analytics.totalAppointments}</span>
              </div>
              <h3 className="font-semibold mb-1">Total RDV</h3>
              <p className="text-sm text-gray-400">Rendez-vous pris</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-bold">{analytics.fillRate}%</span>
              </div>
              <h3 className="font-semibold mb-1">Taux de remplissage</h3>
              <p className="text-sm text-gray-400">Créneaux occupés</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#9D4EDD]/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#9D4EDD]" />
                </div>
                <span className="text-2xl font-bold">{analytics.conversionRate}%</span>
              </div>
              <h3 className="font-semibold mb-1">Taux de conversion</h3>
              <p className="text-sm text-gray-400">Visiteurs → RDV</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-2xl font-bold">{analytics.averageRevenue}€</span>
              </div>
              <h3 className="font-semibold mb-1">Revenu moyen</h3>
              <p className="text-sm text-gray-400">Par rendez-vous</p>
            </motion.div>
          </div>
        )}

        {/* Charts Section */}
        {analytics && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-6">Évolution du chiffre d'affaires</h3>
              <div className="space-y-4">
                {analytics.revenueByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{month.month}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] h-2 rounded-full"
                          style={{ width: `${(month.revenue / 6000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{month.revenue}€</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Services */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-6">Services les plus demandés</h3>
              <div className="space-y-4">
                {analytics.topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{service.service}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#9D4EDD] to-[#DA70D6] h-2 rounded-full"
                          style={{ width: `${(service.count / 60) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{service.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Appointments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Rendez-vous récents</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-[#00F5FF] focus:outline-none text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-[#00F5FF] focus:outline-none text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="pending">En attente</option>
                  <option value="cancelled">Annulé</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Heure</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Montant</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock data - replace with real appointments */}
                {[
                  {
                    id: '1',
                    client: 'Marie Dubois',
                    service: 'Consultation gratuite',
                    date: new Date(),
                    startTime: '10:00',
                    status: 'confirmed',
                    amount: 0
                  },
                  {
                    id: '2',
                    client: 'Jean Martin',
                    service: 'Audit technique',
                    date: new Date(),
                    startTime: '14:30',
                    status: 'pending',
                    amount: 150
                  }
                ].map((appointment, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{appointment.client}</div>
                    </td>
                    <td className="p-4 text-gray-300">{appointment.service}</td>
                    <td className="p-4 text-gray-300">
                      {format(appointment.date, 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="p-4 text-gray-300">{appointment.startTime}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {appointment.amount === 0 ? 'Gratuit' : `${appointment.amount}€`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-600 rounded transition-colors text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
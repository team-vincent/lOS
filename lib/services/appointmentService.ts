import { Service, TimeSlot, Appointment, Client, Analytics } from '@/lib/types/appointment';
import { addDays, format, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

class AppointmentService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Services
  async getServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${this.baseUrl}/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      return this.getMockServices();
    }
  }

  async getServiceById(id: string): Promise<Service | null> {
    const services = await this.getServices();
    return services.find(service => service.id === id) || null;
  }

  // Time Slots
  async getAvailableSlots(
    serviceId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<TimeSlot[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/slots?serviceId=${serviceId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch slots');
      return await response.json();
    } catch (error) {
      console.error('Error fetching slots:', error);
      return this.generateMockSlots(startDate, endDate);
    }
  }

  async getNextAvailableSlot(serviceId: string): Promise<TimeSlot | null> {
    const endDate = addDays(new Date(), 30);
    const slots = await this.getAvailableSlots(serviceId, new Date(), endDate);
    return slots.find(slot => slot.isAvailable) || null;
  }

  // Appointments
  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      const response = await fetch(`${this.baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await fetch(`${this.baseUrl}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return await response.json();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  // Clients
  async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    try {
      const response = await fetch(`${this.baseUrl}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      if (!response.ok) throw new Error('Failed to create client');
      return await response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async getClientByEmail(email: string): Promise<Client | null> {
    try {
      const response = await fetch(`${this.baseUrl}/clients?email=${encodeURIComponent(email)}`);
      if (!response.ok) return null;
      const clients = await response.json();
      return clients[0] || null;
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  }

  // Analytics
  async getAnalytics(startDate: Date, endDate: Date): Promise<Analytics> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return this.getMockAnalytics();
    }
  }

  // Calendar Integration
  async generateCalendarEvent(appointment: Appointment): Promise<string> {
    const service = await this.getServiceById(appointment.serviceId);
    const startDateTime = new Date(`${format(appointment.date, 'yyyy-MM-dd')}T${appointment.startTime}`);
    const endDateTime = new Date(`${format(appointment.date, 'yyyy-MM-dd')}T${appointment.endTime}`);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Leonce Ouattara Studio//Appointment System//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@leonceouattara.com`,
      `DTSTART:${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${service?.name || 'Rendez-vous'}`,
      `DESCRIPTION:${service?.description || ''}`,
      'LOCATION:Leonce Ouattara Studio, Abidjan',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  // Mock Data (for development)
  private getMockServices(): Service[] {
    return [
      {
        id: '1',
        name: 'Consultation gratuite',
        category: 'Consultation',
        description: 'Échange initial pour comprendre vos besoins et définir la stratégie',
        duration: 30,
        price: 0,
        color: '#00F5FF',
        isActive: true
      },
      {
        id: '2',
        name: 'Audit technique',
        category: 'Audit',
        description: 'Analyse complète de votre infrastructure technique existante',
        duration: 120,
        price: 150,
        color: '#9D4EDD',
        requirements: ['Accès aux systèmes', 'Documentation technique'],
        isActive: true
      },
      {
        id: '3',
        name: 'Formation développement',
        category: 'Formation',
        description: 'Session de formation personnalisée sur les technologies web',
        duration: 90,
        price: 100,
        color: '#40E0D0',
        isActive: true
      },
      {
        id: '4',
        name: 'Support technique',
        category: 'Support',
        description: 'Assistance technique pour résoudre vos problèmes urgents',
        duration: 60,
        price: 80,
        color: '#DA70D6',
        isActive: true
      }
    ];
  }

  private generateMockSlots(startDate: Date, endDate: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      // Skip weekends
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        // Morning slots (9:00 - 12:00)
        for (let hour = 9; hour < 12; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const endHour = minute === 45 ? hour + 1 : hour;
            const endMinute = minute === 45 ? 0 : minute + 15;
            const endTimeString = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

            slots.push({
              id: `${format(current, 'yyyy-MM-dd')}-${timeString}`,
              date: new Date(current),
              startTime: timeString,
              endTime: endTimeString,
              isAvailable: Math.random() > 0.3 // 70% availability
            });
          }
        }

        // Afternoon slots (14:00 - 18:00)
        for (let hour = 14; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const endHour = minute === 45 ? hour + 1 : hour;
            const endMinute = minute === 45 ? 0 : minute + 15;
            const endTimeString = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

            slots.push({
              id: `${format(current, 'yyyy-MM-dd')}-${timeString}`,
              date: new Date(current),
              startTime: timeString,
              endTime: endTimeString,
              isAvailable: Math.random() > 0.2 // 80% availability
            });
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  private getMockAnalytics(): Analytics {
    return {
      totalAppointments: 156,
      fillRate: 78.5,
      conversionRate: 65.2,
      cancellationRate: 8.3,
      averageRevenue: 125.50,
      topServices: [
        { service: 'Consultation gratuite', count: 45 },
        { service: 'Audit technique', count: 32 },
        { service: 'Formation développement', count: 28 },
        { service: 'Support technique', count: 51 }
      ],
      revenueByMonth: [
        { month: 'Jan', revenue: 3200 },
        { month: 'Fév', revenue: 4100 },
        { month: 'Mar', revenue: 3800 },
        { month: 'Avr', revenue: 4500 },
        { month: 'Mai', revenue: 5200 },
        { month: 'Jun', revenue: 4800 }
      ]
    };
  }
}

export const appointmentService = new AppointmentService();
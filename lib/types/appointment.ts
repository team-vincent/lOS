export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number; // en minutes
  price: number;
  color: string;
  requirements?: string[];
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBuffer?: boolean;
  serviceId?: string;
}

export interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  preferences?: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
}

export interface Appointment {
  id?: string;
  serviceId: string;
  clientId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentAmount: number;
  paymentMethod?: 'card' | 'cash' | 'transfer';
  remindersSent: boolean[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingStep {
  step: 1 | 2 | 3;
  service?: Service;
  timeSlot?: TimeSlot;
  client?: Partial<Client>;
  paymentOption?: 'full' | 'deposit' | 'onsite';
}

export interface PaymentConfig {
  enableStripe: boolean;
  depositPercentage: number;
  currency: string;
  acceptedMethods: string[];
  requireDeposit: boolean;
}

export interface Analytics {
  totalAppointments: number;
  fillRate: number;
  conversionRate: number;
  cancellationRate: number;
  averageRevenue: number;
  topServices: Array<{ service: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}
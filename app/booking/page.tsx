import AppointmentBooking from '@/components/appointments/AppointmentBooking';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="container mx-auto px-4 py-16">
        <AppointmentBooking />
      </div>
    </div>
  );
}
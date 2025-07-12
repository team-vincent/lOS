'use client';

import { useState, useEffect } from 'react';
import BookingModal from '@/components/BookingModal';
import { useBookingModal } from '@/hooks/useBookingModal';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Sectors from '@/components/Sectors';
import Projects from '@/components/Projects';
import Blog from '@/components/Blog';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import ScrollIndicator from '@/components/ScrollIndicator';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import EcoBadge from '@/components/EcoBadge';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isOpen, modalOptions, openBookingModal, closeBookingModal } = useBookingModal();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen relative">
      <ScrollIndicator />
      <BackgroundAnimation />
      
      <Navigation onBookingClick={openBookingModal} />
      
      <main className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Hero onBookingClick={openBookingModal} />
        <About onBookingClick={openBookingModal} />
        <Services onBookingClick={openBookingModal} />
        <Sectors onBookingClick={openBookingModal} />
        <Projects onBookingClick={openBookingModal} />
        <Blog onBookingClick={openBookingModal} />
        <Contact onBookingClick={openBookingModal} />
      </main>
      
      <Footer />
      <Chatbot />
      <EcoBadge />
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={isOpen}
        onClose={closeBookingModal}
        initialStep={modalOptions.initialStep}
        preSelectedService={modalOptions.preSelectedService}
      />
    </div>
  );
}
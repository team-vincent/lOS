'use client';

import { useState, useCallback } from 'react';

interface UseBookingModalOptions {
  initialStep?: 1 | 2 | 3 | 4;
  preSelectedService?: string;
}

export const useBookingModal = (options: UseBookingModalOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<UseBookingModalOptions>(options);

  const openBookingModal = useCallback((newOptions: UseBookingModalOptions = {}) => {
    setModalOptions({ ...options, ...newOptions });
    setIsOpen(true);
  }, [options]);

  const closeBookingModal = useCallback(() => {
    setIsOpen(false);
    // Reset options after a delay to allow for exit animation
    setTimeout(() => {
      setModalOptions(options);
    }, 300);
  }, [options]);

  const openWithService = useCallback((serviceId: string) => {
    openBookingModal({ preSelectedService: serviceId });
  }, [openBookingModal]);

  const openAtStep = useCallback((step: 1 | 2 | 3 | 4) => {
    openBookingModal({ initialStep: step });
  }, [openBookingModal]);

  return {
    isOpen,
    modalOptions,
    openBookingModal,
    closeBookingModal,
    openWithService,
    openAtStep
  };
};

export default useBookingModal;
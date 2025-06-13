'use client';

import { useEffect } from 'react';

interface GoogleCalendarModalProps {
  onClose: () => void;
  isModalOpen: boolean;
}

const GoogleCalendarModal = ({
  onClose,
  isModalOpen,
}: GoogleCalendarModalProps) => {
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-lenis-prevent', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-lenis-prevent');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-lenis-prevent');
    };
  }, [isModalOpen]);

  return (
    <div
      className={`bg-white w-full rounded-2xl md:rounded-3xl p-6 md:p-10 md:max-w-[60vw] overflow-auto md:w-full relative transition-all duration-300 ease-in-out ${
        isModalOpen
          ? 'opacity-100 scale-100 visible'
          : 'opacity-0 scale-90 invisible'
      }`}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-black text-2xl font-semibold cursor-pointer hover:text-red-500 transition-colors duration-300 ease-in-out">
        ✕
      </button>

      {/* Google Calendar iframe */}
      <div className="w-full h-[600px]">
        <iframe
          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2XLXndSmcUpG3Lk4SInzwOq9AmWCCl10gUeSjANNdCjP5W90cNDHu440XEbXiYK9Q6dlXe8RQo?gv=true"
          width="100%"
          height="100%"
          frameBorder="0"
          className="rounded-xl w-full h-full"
          allowFullScreen></iframe>
      </div>
    </div>
  );
};

export default GoogleCalendarModal;

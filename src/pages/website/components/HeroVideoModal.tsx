'use client';

import { useEffect } from 'react';

import VideoSection from './VideoSection';

interface HeroVideoModalProps {
  onClose: () => void;
  isModalOpen: boolean;
}

const HeroVideoModal = ({ onClose, isModalOpen }: HeroVideoModalProps) => {
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
        className="absolute top-2 right-4 text-black text-2xl font-semibold cursor-pointer hover:text-red-500 transition-colors duration-300 ease-in-out">
        ✕
      </button>

      <VideoSection
        embedUrl="https://fast.wistia.net/embed/iframe/s5r9t8jg3o?autoPlay=true&mute=true&playerColor=000000"
        className="w-full"
      />
    </div>
  );
};

export default HeroVideoModal;

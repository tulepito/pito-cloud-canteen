'use client';

import { useEffect, useRef } from 'react';

import VideoSection from './VideoSection';

interface HeroVideoModalProps {
  onClose: () => void;
  isModalOpen: boolean;
}

const HeroVideoModal = ({ onClose, isModalOpen }: HeroVideoModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable body scrolling when modal is open
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-lenis-prevent', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-lenis-prevent');
    }

    // Function to handle click outside modal
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose(); // Close modal if the click is outside the modal
      }
    };

    // Attach event listener on mount
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, onClose]);

  return (
    <div
      className={`bg-transparent border-none w-full rounded-[8px] md:max-w-[60vw] overflow-auto md:w-full relative transition-all duration-300 ease-in-out ${
        isModalOpen
          ? 'opacity-100 scale-100 visible'
          : 'opacity-0 scale-90 invisible'
      }`}
      ref={modalRef}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-1 right-2 z-10 text-black text-xxl font-semibold cursor-pointer hover:text-gray-500 transition-colors duration-300 ease-in-out">
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

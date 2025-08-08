import { useIntl } from 'react-intl';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Image from 'next/image';

import image1 from '../assets/pitoAssets/1.webp';
import image4 from '../assets/pitoAssets/3.webp';
import image3 from '../assets/pitoAssets/11.webp';
import image5 from '../assets/pitoAssets/12.webp';

import { ModalForm } from './Modal';

import '@splidejs/react-splide/css';

type ModalProps = {
  onClose: () => void;
  isModalOpen: boolean;
};

const images = [image1, image3, image4, image5];

const ModalAlt = ({ onClose, isModalOpen }: ModalProps) => {
  const intl = useIntl();

  if (!isModalOpen) {
    return null; // Don't render the modal if it's not open
  }

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center transition-all duration-300 ease-in-out ${
        isModalOpen
          ? 'opacity-100 visible bg-black/80 z-[1000]'
          : 'opacity-0 invisible z-10'
      }`}>
      <div
        className={`rounded-none md:rounded-3xl p-0 w-full md:max-w-5xl max-h-full md:max-h-[95%] h-full overflow-y-auto md:w-full relative transition-all duration-300 ease-in-out flex items-stretch ${
          isModalOpen
            ? 'opacity-100 scale-100 visible'
            : 'opacity-0 scale-90 invisible'
        }`}>
        {/* lhs */}
        <div className="bg-white w-[60%] h-full hidden md:block">
          <Splide
            options={{
              type: 'loop',
              arrows: false,
              autoplay: true,
              interval: 3000,
              pagination: true,
              height: '95vh',
              width: '100%',
            }}>
            {images.map((image, index) => {
              return (
                <SplideSlide key={index}>
                  <Image
                    src={image}
                    alt="company"
                    className={` ${
                      isModalOpen
                        ? 'size-full object-cover visible'
                        : 'size-0 invisible'
                    }`}
                  />
                </SplideSlide>
              );
            })}
          </Splide>
        </div>
        {/* rhs */}
        <div className="overflow-auto w-full md:w-[45%] flex flex-col p-4 md:p-10 bg-white !rounded-none md:rounded-3xl absolute h-full right-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-black/50 text-lg font-semibold cursor-pointer hover:text-red-500 transition-colors duration-300 ease-in-out">
            ✕
          </button>
          {/* Heading */}
          <div className="flex flex-col items-center text-center gap-4 mb-6">
            <h2 className="text-2xl md:text-4xl font-bold font-alt leading-snug">
              {intl.formatMessage({ id: 'lets-tailor-your-0' })}
              <br />
              {intl.formatMessage({ id: 'lunch-solution-0' })}
            </h2>
            <p className="text-gray-600">
              {intl.formatMessage({
                id: 'say-goodbye-to-lunch-hassles-well-make-every-meal-easy-and-enjoyable-for-your-team-0',
              })}
            </p>
          </div>
          {/* Form */}
          <ModalForm onClose={onClose} />
          {/* <form className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                placeholder="Enter Company Name"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+84 000 00 000"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Business Email
              </label>
              <input
                type="email"
                placeholder="Enter Business Email"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Service Requirements / Notes
              </label>
              <textarea
                placeholder="Let us know any preferences or questions"
                rows={4}
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              className="bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition">
              Send
            </button>
          </form> */}
        </div>
      </div>
    </div>
  );
};

export default ModalAlt;

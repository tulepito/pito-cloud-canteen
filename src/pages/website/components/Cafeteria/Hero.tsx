import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue2 from '../../assets/decorations/blue2.svg';
import imageDecor1Alt from '../../assets/decorations/imageDecor1Alt.svg';
import imageDecor3 from '../../assets/decorations/imageDecor3.svg';
import lemon from '../../assets/decorations/lemon.svg';
import lemon2 from '../../assets/decorations/lemon2.svg';
import yellow2 from '../../assets/decorations/yellow2.svg';

const Hero = () => {
  const intl = useIntl();

  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:min-h-[40rem] relative">
      {/* main hero section */}
      <div className="flex flex-col items-center gap-20 md:py-20 px-5 md:min-h-[40rem] md:justify-center">
        {/* lhs */}
        <div className="flex flex-col items-center text-center md:gap-5 gap-2 md:w-[53%] md:pt-0">
          <div className="md:hidden h-[80px]"></div>
          <span className="text-center font-medium">
            {intl.formatMessage({ id: 'your-teams-meals' })}
          </span>
          <h1 className="font-[unbounded] font-bold text-3xl md:text-[40px] md:w-auto leading-[1.4]">
            {intl.formatMessage({ id: 'lunch-made-easy' })},{' '}
            <br className="hidden md:block" />{' '}
            {intl.formatMessage({ id: 'whether-you-have' })}{' '}
            <span className="text-[#D680A3]">100</span>{' '}
            {intl.locale === 'en' && <br className="hidden md:block" />}{' '}
            {intl.formatMessage({ id: 'or' })}{' '}
            <span className="text-[#D680A3]">500+</span>{' '}
            {intl.formatMessage({ id: 'employees' })}
          </h1>
          <span className="text-text w-full md:w-3/4 md:text-lg font-medium">
            {intl.formatMessage({
              id: 'delivering-the-office-canteen-experience-from-planning-and-setup-to-service-without-the-need-for-an-in-house-kitchen',
            })}
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01] mt-5">
            {intl.formatMessage({ id: 'free-consultation' })}
          </button>
        </div>
      </div>
      {/* decorations */}
      <Image
        src={yellow2}
        alt="yellow circle decor"
        className="md:top-23 md:right-[14rem] top-24 md:size-24 size-12 absolute -z-10 md:flex hidden"
      />
      <Image
        src={imageDecor3}
        alt="blue decor"
        className="md:top-8 md:-right-44 -right-24 -top-16 md:size-[33rem] size-48 absolute -z-20"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-[20rem] md:-right-12 -right-16 -top-1 md:size-64 rotate-45 size-32 absolute -z-30"
      />
      <Image
        src={lemon2}
        alt="lemon triangle decor"
        className="md:top-0 rotate-[60deg] top-80 -left-16 md:-left-28 size-96 absolute -z-20 md:flex hidden"
      />
      <Image
        src={imageDecor1Alt}
        alt="image decor"
        className="md:top-20 -top-10 -left-14 md:-left-64 md:size-[37rem] size-32 absolute -z-20"
      />
      <Image
        src={blue2}
        alt="blue decor"
        className="md:bottom-20 md:left-60 left-12 md:top-auto -top-0 md:size-40 size-9 md:rotate-0 -rotate-[19deg] absolute -z-20"
      />
    </div>
  );
};

export default Hero;

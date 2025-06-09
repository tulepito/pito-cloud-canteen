import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue2 from '../../assets/decorations/blue2.svg';
import imageDecor1Alt from '../../assets/decorations/imageDecor1Alt.svg';
import imageDecor3 from '../../assets/decorations/imageDecor3.svg';
import lemon from '../../assets/decorations/lemon.svg';
import lemon2 from '../../assets/decorations/lemon2.svg';
import yellow2 from '../../assets/decorations/yellow2.svg';

const Hero = () => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:min-h-[40rem] relative">
      {/* main hero section */}
      <div className="flex flex-col items-center gap-20 md:py-20 px-5">
        {/* lhs */}
        <div className="flex flex-col items-center text-center md:gap-5 gap-2 md:w-[53%] md:pt-0">
          <div className="md:hidden h-[80px]"></div>
          <span className="text-text">Your Team’s Meals</span>
          <span className="font-alt font-bold text-3xl md:text-6xl md:w-auto">
            Lunch Made Easy, <br /> Whether You Have{' '}
            <span className="text-[#D680A3]">100</span> <br /> or{' '}
            <span className="text-[#D680A3]">2,000+</span> Employees
          </span>
          <span className="text-text w-3/4">
            Delivering the &quot;office canteen&quot; experience – from planning
            and setup to service – without the need for an in-house kitchen.
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="capitalize btn border border-black bg-black text-white hover:bg-white hover:text-black mt-5 md:w-auto w-full">
            Free Consultation
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

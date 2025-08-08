import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue2.svg';
import imageDecor1Alt2 from '../../assets/decorations/imageDecor1Alt2.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';

const Hero = () => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:min-h-[35rem] md:px-0 px-5 relative max-w-[1024px] mx-auto">
      {/* main hero section */}
      <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center md:py-20 mb-5 md:mb-0">
        {/* lhs */}
        <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-[55%] w-full pt-0 md:pb-0 pb-50">
          <span className="font-medium">Mid-Sized Business Ready</span>
          <span className="font-[unbounded] font-bold text-3xl md:text-[40px] md:leading-tight">
            <span className="text-[#D680A3]">Lunch Operations</span> Without an
            In-House Canteen
          </span>
          <span className="font-medium md:text-lg">
            Bring a professional lunch experience to your office without the
            need for an in-house kitchen or manual management.
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01] mt-4">
            Book a Free Consultation{' '}
          </button>
        </div>
      </div>
      {/* decorations */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="md:top-20 md:-left-20 md:right-auto right-20 md:bottom-auto -bottom-7 md:size-6 size-14 absolute z-10 hidden md:block"
      />
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="md:top-0 md:-right-20 right-20 md:bottom-auto -bottom-7 md:size-40 size-14 absolute -z-20  md:transform-none scale-150"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:size-80 size-20 md:top-12 -top-15 -left-40 md:-left-96 absolute -z-10 md:transform-none translate-x-[200px] translate-y-[160px] scale-125 -z-1 -rotate-90"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="absolute size-34 -rotate-80 -bottom-10 -z-20 md:hidden flex md:transform-none scale-50 -translate-y-[400px] -translate-x-[220px] -rotate-[132deg]"
      />
      <Image
        src={blue}
        alt="blue decor"
        className="size-28 z-10 md:top-40 -top-15 -right-20 md:right-auto -rotate-12 md:-left-36 left-auto absolute md:flex hidden"
      />
      <Image
        src={pink}
        alt="pink decor"
        className="md:size-56 size-30 md:bottom-20 -bottom-15 md:rotate-150 -right-20 md:right-52 absolute -z-20 md:rotate-180 md:transform-none scale-50 -translate-y-[460px] translate-x-[140px] -rotate-[132deg]"
      />
      <Image
        src={imageDecor1Alt2}
        alt="image decor"
        className="md:top-10 md:-right-20 z-1 md:z-0 md:bottom-auto -bottom-8 right-23  md:size-[480px] size-72 absolute -z-20 md:transform-none translate-x-4"
      />
      <div className="h-[240px] md:hidden"></div>
    </div>
  );
};

export default Hero;

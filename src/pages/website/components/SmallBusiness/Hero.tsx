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
          <div className="md:hidden h-[80px]"></div>
          <span className="font-alt font-bold text-3xl md:text-6xl">
            <span className="text-[#D680A3]">Lunch Made Easy</span> <br />
            For Teams With No Time to Waste
          </span>
          <span className="text-text">
            No more manual lunch ordering. PITO helps you schedule lunch for the
            whole week in just a few minutes. No Excel files, no complicated
            Zalo messages.
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn z-20 border border-black hover:bg-white hover:text-black bg-black text-white mt-4 md:w-auto w-full">
            Get Free Consultation{' '}
          </button>
          <div className="md:hidden h-[200px]"></div>
        </div>
      </div>
      {/* decorations */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="md:top-8 md:-left-24 md:right-auto right-0 md:bottom-auto -bottom-20 md:size-11 size-24 absolute z-10"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:size-64 size-40 md:rotate-10 -rotate-16 md:top-0 -translate-y-32 translate-x-8 md:transform-none -left-10 md:-left-96 absolute -z-[999]"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="absolute size-34 -rotate-80 -bottom-10 -z-20 md:hidden flex md:transform-none scale-[0.4] translate-x-[-200px] translate-y-[-480px]"
      />
      <Image
        src={pink}
        alt="lemon triangle decor"
        className="md:size-80 size-30 md:top-60 -top-15 md:-rotate-[150deg] -rotate-120 -right-20 md:right-auto md:-left-96 left-auto absolute -z-10 md:transform-none scale-[0.4] translate-x-[120px] translate-y-[-720px] -rotate-90"
      />
      <Image
        src={blue}
        alt="blue decor"
        className="md:top-20 md:-right-40 -top-10 md:size-[400px] size-56 rotate-[22deg] absolute -z-20 md:flex hidden"
      />
      <Image
        src={imageDecor1Alt2}
        alt="image decor"
        className="md:top-20 md:-right-20 md:bottom-auto -bottom-16 right-8  md:size-[440px] size-72 absolute -z-20"
      />
    </div>
  );
};

export default Hero;

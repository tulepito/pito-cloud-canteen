import { useIntl } from 'react-intl';
import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import imageDecor1 from '../../assets/decorations/imageDecor1.svg';
import imageDecor2 from '../../assets/decorations/imageDecor2.svg';
import lemon from '../../assets/decorations/lemon.svg';
import lemon2 from '../../assets/decorations/lemon2.svg';
import yellow2 from '../../assets/decorations/yellow2.svg';

const Hero = () => {
  const intl = useIntl();

  return (
    <div className="w-full md:min-h-[40rem] relative">
      {/* main hero section */}
      <div className="flex flex-col items-center gap-20 md:py-20 pt-32 md:pt-20 px-5 md:pb-auto pb-12">
        {/* lhs */}
        <div className="flex flex-col gap-2 md:gap-4 w-full text-center justify-center md:w-2/3">
          <span className="text-center">
            {intl.formatMessage({ id: 'your-teams-meals' })}
          </span>
          <div className="flex flex-col items-center text-center md:gap-5 gap-2 md:pt-0">
            <span className="font-alt font-bold text-3xl md:text-6xl xl:whitespace-pre !leading-tight">
              {intl.formatMessage({
                id: 'done-right-without-the-daily-coordination',
              })}
            </span>
            <span className="text-center md:w-[60%] md:whitespace-pre-line">
              {intl.formatMessage({
                id: 'automated-lunch-ordering-system-designed-for-teams-of-20-to-99-employees-helps-you-save-time-on-coordination-so-you-can-focus-on-your-work',
              })}
            </span>
            <button className="capitalize btn border border-solid border-black bg-black text-white hover:bg-white hover:text-black mt-5 md:w-auto w-full">
              {intl.formatMessage({ id: 'get-started' })}
            </button>
          </div>
        </div>
      </div>
      {/* decorations */}
      <Image
        src={yellow2}
        alt="yellow circle decor"
        className="md:top-16 md:right-[4rem] top-60 md:size-24 size-12 absolute -z-10 md:flex hidden"
      />
      <Image
        src={blue}
        alt="blue decor"
        className="md:top-0 md:-right-44 top-60 md:size-[30rem] -rotate-[22deg] size-12 absolute -z-20 md:flex hidden"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-[12rem] md:-right-52 right-0 top-10 md:size-64 -rotate-[54deg] size-24 absolute -z-30 -translate-y-28 md:translate-y-0 translate-x-10 md:-translate-x-0"
      />
      <Image
        src={imageDecor2}
        alt="image decor"
        className="md:top-[20rem] md:right-28 right-0 top-10 md:size-28 -rotate-45 size-24 absolute -translate-y-14 md:translate-y-0 scale-50 md:scale-100"
      />
      <Image
        src={lemon2}
        alt="lemon triangle decor"
        className="md:top-[-80px] top-80 -left-24 md:-left-16 size-40 absolute -z-10 md:flex hidden"
      />
      <Image
        src={imageDecor1}
        alt="lemon triangle decor"
        className="md:top-[-80px] top-20 -left-28 md:-left-64 md:size-[37rem] size-48 absolute -z-20 -translate-y-28 md:translate-y-0 translate-x-10 md:-translate-x-0"
      />
    </div>
  );
};

export default Hero;

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
    <div className="w-full md:min-h-[40rem] relative md:mb-36">
      {/* main hero section */}
      <div className="flex flex-col items-center gap-20 md:py-20 pt-32 md:pt-32 px-5 md:pb-auto pb-20">
        {/* lhs */}
        <div className="flex flex-col items-center text-center md:gap-5 gap-2 md:w-[40%] md:pt-0">
          <span className="text-text">
            {intl.formatMessage({ id: 'your-teams-meals' })}
          </span>
          <span className="font-alt font-bold text-3xl md:text-6xl md:w-auto w-2/3 whitespace-pre">
            {intl.formatMessage({
              id: 'done-right-without-the-daily-coordination',
            })}
          </span>
          <span className="text-text">
            {intl.formatMessage({
              id: 'automated-lunch-ordering-system-designed-for-teams-of-20-to-99-employees-helps-you-save-time-on-coordination-so-you-can-focus-on-your-work',
            })}
          </span>
          <button className="capitalize btn border border-solid border-black bg-black text-white hover:bg-white hover:text-black mt-5 md:w-auto w-full">
            {intl.formatMessage({ id: 'get-started' })}
          </button>
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
        className="md:top-0 md:-right-44 top-60 md:size-[30rem] -rotate-22 size-12 absolute -z-20 md:flex hidden"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-[20rem] md:-right-32 right-0 top-10 md:size-64 -rotate-45 size-24 absolute -z-30 -translate-y-10 md:translate-y-0 translate-x-10 md:-translate-x-0"
      />
      <Image
        src={imageDecor2}
        alt="image decor"
        className="md:top-[20rem] md:right-28 right-0 top-10 md:size-36 -rotate-45 size-24 absolute -translate-y-10 md:translate-y-0 scale-50 md:scale-100"
      />
      <Image
        src={lemon2}
        alt="lemon triangle decor"
        className="md:top-0 top-80 -left-24 md:-left-16 size-40 absolute -z-10 md:flex hidden"
      />
      <Image
        src={imageDecor1}
        alt="lemon triangle decor"
        className="md:top-0 top-20 -left-28 md:-left-64 md:size-[37rem] size-48 absolute -z-20 -translate-y-10 md:translate-y-0 translate-x-10 md:-translate-x-0"
      />
      <Image
        src={blue}
        alt="blue decor"
        className="md:-bottom-14 md:left-60  md:right-auto -right-16 md:top-auto top-32 size-44 md:rotate-0 rotate-90 absolute -z-20 -translate-y-10 md:translate-y-0 translate-x-10 md:-translate-x-0"
      />
    </div>
  );
};

export default Hero;

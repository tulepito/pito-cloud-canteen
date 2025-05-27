import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import videoPlaceholder from '../../assets/videoPlaceholder.png';

const Hero = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:min-h-[40rem] md:px-0 px-5 relative max-w-[1024px] mx-auto">
      {/* main hero section */}
      <div className="flex md:flex-row md:px-4 flex-col-reverse items-center gap-20 md:py-20 pt-20">
        {/* lhs */}
        <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-1/2 md:pt-0 pt-[22rem]">
          <span className="text-text">
            {intl.formatMessage({ id: 'the-lunch-management-platform' })}
          </span>
          <span className="font-alt font-bold text-3xl md:text-[2.5rem] leading-[3rem]">
            {intl.formatMessage({
              id: 'streamline-team-meals-simplify-your-workday',
            })}
          </span>
          <span className="text-text">
            {intl.formatMessage({
              id: 'stop-drowning-in-meal-coordination-pito-cloud-canteen-is-a-tech-powered-platform-that-transforms-workplace-dining-from-a-daily-headache-into-a-strategic-employee-benefit',
            })}
          </span>
          <div className="flex md:flex-row flex-col md:items-center items-stretch w-full gap-2 mt-8">
            <a
              href=""
              onClick={() => setIsModalOpen(true)}
              className="capitalize btn border border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
              {intl.formatMessage({ id: 'book-free-consultation-0' })}
            </a>
            {/* <a
              href=""
              className="capitalize btn border border-solid border-gray-300 bg-white text-black hover:opacity-90 transition-all duration-200 hover:!scale-[1.01] py-3 px-6 font-semibold">
              {intl.formatMessage({ id: 'book-free-consultation-0' })}
            </a> */}
          </div>
        </div>
        <svg
          className="absolute md:size-[45rem] size-[30rem] md:-right-64 md:top-0 -top-10 -right-32 -z-10"
          width="500"
          height="500"
          viewBox="0 0 1100 900">
          <defs>
            <clipPath id="videoClip">
              <path d="M143.181 313C130.241 154.146 248.965 14.5768 408.358 1.2629C523.832 -8.38244 628.971 50.8845 683.064 144.678C704.766 137.234 727.729 132.325 751.63 130.328C906.962 117.353 1043.11 232.33 1055.72 387.137C1066.69 521.801 980.563 642.243 855.719 679.845L391.436 846.229C364.798 857.361 335.991 864.579 305.674 867.112C150.342 880.086 14.1975 765.11 1.58682 610.304C-7.69025 496.419 52.4739 392.705 146.773 340.666C145.15 331.598 143.945 322.37 143.181 313Z" />
            </clipPath>
          </defs>

          {/* rhs */}
          <foreignObject width="100%" height="100%" clipPath="url(#videoClip)">
            <div className="h-full w-full bg-black text-black relative">
              {/* <div className="flex flex-col items-center gap-5 absolute bottom-52 left-48 w-72">
                <button className="size-32 flex items-center justify-center rounded-full bg-black/50 text-white text-4xl cursor-pointer group">
                  <FaPlay className="group-hover:scale-125 transition-all duration-300 ease-in-out" />
                </button>
                <span className="text-center text-white text-2xl">
                  {intl.formatMessage({
                    id: 'watch-a-short-video-to-learn-more-about-us-0',
                  })}
                </span>
              </div> */}
              <Image
                src={videoPlaceholder}
                className="w-full h-full object-cover"
                alt="video placeholder"
              />
            </div>
          </foreignObject>
        </svg>
      </div>
      {/* decorations */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="md:top-16 md:right-[24rem] top-40 md:size-20 size-12 absolute -z-10"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-0 top-60 -left-24 md:-left-64 size-40 absolute"
      />
      <Image
        src={pink}
        alt="pink triangle decor"
        className="md:-bottom-34 md:-left-64 md:top-auto top-0 md:size-72 size-56 md:rotate-0 rotate-90 absolute -z-20"
      />
    </div>
  );
};

export default Hero;

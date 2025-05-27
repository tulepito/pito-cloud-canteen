import { FaPlay } from 'react-icons/fa';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import videoPlaceholder from '../../assets/videoPlaceholder.png';

const Hero2 = () => {
  const intl = useIntl();

  return (
    <div className="w-full md:min-h-[40rem] md:px-32 px-5 relative md:mb-36 mb-20">
      {/* main hero section */}
      <div className="flex md:flex-row flex-col-reverse items-center justify-center md:py-20 pt-20">
        {/* lhs */}
        <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-1/2 w-full md:pt-0 pt-[22rem]">
          <span className="font-alt font-bold text-3xl md:text-6xl max-w-[280px] md:max-w-none">
            {intl.formatMessage({ id: 'smart-delivery-zero-disruption' })}
          </span>
          <span className="text-text md:w-3/4 text-left md:text-center">
            {intl.formatMessage({
              id: 'see-how-pitos-smart-delivery-system-fits-seamlessly-into-your-teams-daily-rhythm-without-slack-reminders-or-stairwell-drop-offs',
            })}
          </span>
          <a
            href=""
            className="btn border border-solid border-gray-400 bg-white text-black hover:bg-black hover:text-white mt-4 md:w-auto w-full">
            {intl.formatMessage({ id: 'watch-a-video' })}
          </a>
        </div>
        <svg
          className="absolute md:size-[40rem] md:rotate-20 rotate-6  size-[25rem] md:-right-40 md:top-20 top-10 -right-16 -z-10"
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
            <div className="h-full w-full flex items-center justify-center bg-black text-black relative">
              <div className="flex flex-col items-center gap-5 absolute left-80 w-60 -rotate-6 md:-rotate-20 scale-[200%] md:scale-100">
                <button className="size-32 flex items-center justify-center rounded-full bg-black/50 text-white text-4xl cursor-pointer group">
                  <FaPlay className="group-hover:scale-125 transition-all duration-300 ease-in-out" />
                </button>
                <span className="text-center text-white">
                  {intl.formatMessage({
                    id: 'watch-a-short-video-to-learn-more-about-us',
                  })}
                </span>
              </div>
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
        className="md:top-48 md:right-[25rem] top-60 md:size-12 size-12 absolute -z-10"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-[28rem] md:size-64 size-20 rotate-15 top-0 left-auto md:right-auto right-5 md:left-18 absolute -z-10"
      />
      <Image
        src={pink}
        alt="pink triangle decor"
        className="md:-bottom-54 md:-left-40 md:-top-60 top-20 md:size-[30rem] size-56 md:-rotate-90 rotate-90 absolute -z-20"
      />
      <Image
        src={blue}
        alt="blue decor"
        className="md:top-[10rem] md:left-16 top-20 md:size-44 size-56 absolute -z-20 md:flex hidden"
      />
    </div>
  );
};

export default Hero2;

import { useIntl } from 'react-intl';
import Image from 'next/image';

import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import VideoSection from '../VideoSection';

const Hero2 = () => {
  const intl = useIntl();

  return (
    <div className="w-full md:h-full md:px-0 px-5 relative md:mb-10 mb-20">
      {/* main hero section */}
      <div className="flex md:flex-row flex-col-reverse gap-5 items-center justify-center md:pb-20 pt-0 max-w-[1024px] mx-auto">
        {/* lhs */}
        <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-1/2 w-full md:pt-0 pt-16">
          <span className="font-alt font-bold text-xl md:text-[42px] leading-tight max-w-[280px] md:max-w-none md:whitespace-pre-line">
            {intl.formatMessage({ id: 'smart-delivery-zero-disruption' })}
          </span>
          <span className="text-text md:w-3/4 text-left md:text-left">
            {intl.formatMessage({
              id: 'see-how-pitos-smart-delivery-system-fits-seamlessly-into-your-teams-daily-rhythm-without-slack-reminders-or-stairwell-drop-offs',
            })}
          </span>
        </div>
        <VideoSection
          embedUrl="https://www.youtube.com/embed/6s3JriAkeFE?autoplay=1&loop=1&controls=0&modestbranding=1&rel=0&fs=0&showinfo=0&mute=1"
          className="md:w-1/2 w-full z-10"
        />
      </div>
      {/* decorations */}
      <Image
        src={yellow}
        alt="yellow circle decor"
        className="md:top-32 md:right-[25rem] top-60 md:size-12 size-12 absolute -z-10"
      />
      <Image
        src={lemon}
        alt="lemon triangle decor"
        className="md:top-[2rem] md:size-52 size-20 rotate-[15deg] top-0 left-auto md:-left-44 md:right-auto right-5 absolute -z-10"
      />
      <Image
        src={pink}
        alt="pink triangle decor"
        className="md:-bottom-54 md:-left-56 md:-top-60 top-20 md:size-[24rem] size-56 md:-rotate-[110deg] rotate-90 absolute -z-20"
      />
    </div>
  );
};

export default Hero2;

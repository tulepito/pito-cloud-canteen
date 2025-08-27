import { useIntl } from 'react-intl';
import Image from 'next/image';

import step3 from '../../assets/com-van-phong-cho-moi-quy.webp';
import blueTriangle from '../../assets/decorations/blueTriangle.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import pinkAlt from '../../assets/decorations/pinkAlt.svg';
import yellow from '../../assets/decorations/yellow.svg';
import yellowTriangle from '../../assets/decorations/yellowTriangle.svg';

export const HowItWorksSteps = ({
  step1Title = '',
  step2Title = '',
  step3Title = '',
  step1Description = '',
  step2Description = '',
  step3Description = '',
}) => {
  return (
    <div className="flex flex-col items-center md:gap-40 gap-20 w-full md:mt-20 mt-10">
      {/* step 1 */}
      <div className="flex md:flex-row flex-col md:gap-32 gap-10 justify-between">
        {/* lhs */}
        <div className="flex pt-12 flex-col md:items-start md:text-start items-center text-center md:gap-5 gap-2 md:w-1/2">
          <div
            className="
      md:size-16 size-12 flex items-center justify-center rounded-full bg-[#6CCFF6]/80 md:text-xl text-base text-white font-semibold">
            01
          </div>
          <h3 className="font-bold md:text-4xl text-xl font-alt">
            {step1Title}
          </h3>
          <span className="text-lg">{step1Description}</span>
        </div>
        {/* rhs */}
        <div className="md:w-1/2 relative flex md:justify-end md:items-end justify-center items-center">
          <Image
            src={yellowTriangle}
            alt="yellow"
            className="absolute -z-10 md:size-40 size-25 md:-top-10 -top-20 md:left-10 left-auto md:right-auto -right-8 md:transform-none scale-50 translate-x-[60px] translate-y-[20px]"
          />
          <Image
            src={pink}
            alt="pink"
            className="absolute -z-10 md:size-64 size-45 -rotate-90 bottom-0 md:-bottom-20 md:-right-20 right-auto md:left-auto -left-20 md:transform-none scale-50 translate-x-[0] translate-y-[160px]"
          />
          <div className="mt-0 relative w-full aspect-video rounded-md overflow-hidden border border-neutral-200">
            <iframe
              src="https://fast.wistia.net/embed/iframe/7za7iibhgy?autoPlay=true&mute=true&playerColor=000000"
              title="Media Frame"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>
      {/* step 2 */}
      <div className="flex  md:flex-row flex-col-reverse md:gap-32 gap-10 justify-between md:translate-x-10">
        {/* lhs */}
        <div className="md:w-1/2 relative flex md:justify-end md:items-end justify-center items-center">
          <Image
            src={blueTriangle}
            alt="blue"
            className="absolute -z-10 size-40 top-20 -left-20"
          />
          <Image
            src={yellow}
            alt="yellow"
            className="absolute -z-10 size-12 -top-6 md:left-8 left-auto md:right-auto right-0"
          />
          <div className="mt-0 relative w-full aspect-video rounded-md overflow-hidden border border-neutral-200">
            <iframe
              src="https://fast.wistia.net/embed/iframe/8u3jxgesk7?autoPlay=true&mute=true&playerColor=000000"
              title="Media Frame"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
        {/* rhs */}
        <div className="flex pt-12 flex-col md:items-start md:text-start items-center text-center md:gap-5 gap-2 md:w-1/2">
          <div
            className="
      md:size-16 size-12 flex items-center justify-center rounded-full bg-[#C5D475] md:text-xl text-base text-white font-semibold">
            02
          </div>
          <h3 className="font-bold md:text-4xl text-xl font-alt">
            {step2Title}
          </h3>
          <span className="text-lg">{step2Description}</span>
        </div>
      </div>
      {/* step 3 */}
      <div className="flex md:flex-row flex-col md:gap-32 gap-10 justify-between">
        {/* lhs */}
        <div className="flex pt-12 flex-col md:items-start md:text-start items-center text-center md:gap-5 gap-2 md:w-1/2">
          <div
            className="
      md:size-16 size-12 flex items-center justify-center rounded-full bg-[#F6AFCE] md:text-xl text-base text-white font-semibold">
            03
          </div>
          <h3 className="font-bold md:text-4xl text-xl font-alt">
            {step3Title}
          </h3>
          <span className="text-lg">{step3Description}</span>
        </div>
        {/* rhs */}
        <div className="md:w-1/2 relative flex md:justify-end md:items-end justify-center items-center">
          <Image
            src={lemon}
            alt="lemon decor"
            className="absolute -z-10 size-40 md:-bottom-15 bottom-auto md:top-auto -top-20 -left-32 rotate-60"
          />
          <Image
            src={pinkAlt}
            alt="pink decor"
            className="absolute -z-10 size-50 -top-20 -right-20 md:flex hidden"
          />
          <div className="rounded-2xl relative aspect-square w-full flex items-center justify-center overflow-hidden">
            <Image
              src={step3}
              alt="PITO services on-site"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col items-center md:gap-12 md:px-0 px-5 md:pt-16 pt-20 pb-16 gap-1 relative max-w-[1024px] mx-auto">
      <div className="flex flex-col gap-2 items-center">
        <span className="font-[unbounded] text-3xl md:text-[40px] font-bold text-center md:leading-tight">
          {intl.formatMessage({ id: 'how-it-works-1' })} <br />{' '}
          <span className="text-[#D680A3]">
            {intl.formatMessage({ id: '3-easy-steps' })}
          </span>{' '}
        </span>
        <span className="text-center md:w-auto w-2/3 md:text-lg font-medium">
          {intl.formatMessage({
            id: 'transform-your-lunch-experience-in-just-3-steps',
          })}
        </span>
      </div>
      <HowItWorksSteps
        step1Title={intl.formatMessage({
          id: 'automatically-plan-weekly-menus',
        })}
        step2Title={intl.formatMessage({
          id: 'employees-pre-select-their-meals',
        })}
        step3Title={intl.formatMessage({
          id: 'pito-sets-up-and-serves-on-site',
        })}
        step1Description={intl.formatMessage({
          id: 'admins-select-menus-from-over-100-carefully-vetted-restaurants-no-time-wasted-making-daily-decisions',
        })}
        step2Description={intl.formatMessage({
          id: 'employees-choose-their-meals-via-the-app-web-dietary-preferences-and-allergies-are-automatically-suggested',
        })}
        step3Description={intl.formatMessage({
          id: 'no-kitchen-required-pito-delivers-and-serves-meals-at-your-office-with-a-professional-pop-up-canteen-setup',
        })}
      />
    </div>
  );
};

export default HowItWorks;

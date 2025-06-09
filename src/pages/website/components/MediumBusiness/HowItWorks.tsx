import Image from 'next/image';

import blueTriangle from '../../assets/decorations/blueTriangle.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import pinkAlt from '../../assets/decorations/pinkAlt.svg';
import yellow from '../../assets/decorations/yellow.svg';
import yellowTriangle from '../../assets/decorations/yellowTriangle.svg';
import step1 from '../../assets/pitoAssets/gifs/step1.gif';
import step2 from '../../assets/pitoAssets/gifs/step2.gif';
import step3 from '../../assets/pitoAssets/gifs/step3.gif';

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
          <span className="font-bold md:text-4xl text-xl font-alt">
            {step1Title}
          </span>
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
          <div className="rounded-2xl mt-20 md:mt-0 relative overflow-hidden aspect-[2.1] w-full flex items-center justify-center scale-110">
            <Image src={step1} alt="step 1 gif" fill className="object-cover" />
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
          <div className="rounded-2xl relative overflow-hidden aspect-[2.2] w-full flex items-center justify-center scale-110">
            <Image src={step2} alt="step 2 gif" className="object-cover" />
          </div>
        </div>
        {/* rhs */}
        <div className="flex pt-12 flex-col md:items-start md:text-start items-center text-center md:gap-5 gap-2 md:w-1/2">
          <div
            className="
      md:size-16 size-12 flex items-center justify-center rounded-full bg-[#C5D475] md:text-xl text-base text-white font-semibold">
            02
          </div>
          <span className="font-bold md:text-4xl text-xl font-alt">
            {step2Title}
          </span>
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
          <span className="font-bold md:text-4xl text-xl font-alt">
            {step3Title}
          </span>
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
          <div className="rounded-2xl relative overflow-hidden aspect-[2.0] w-full flex items-center justify-center scale-110">
            <Image src={step3} alt="step 3 gif" className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  return (
    <div className="flex flex-col items-center md:gap-12 md:px-0 px-5 md:pt-0 pt-20 md:pb-0 pb-20 gap-1 relative max-w-[1024px] mx-auto">
      <div className="flex flex-col gap-2 items-center">
        <span className="font-alt text-2xl md:text-5xl font-bold text-center md:leading-[4rem]">
          How it works <br />{' '}
          <span className="text-[#D680A3]">3 easy steps</span>{' '}
        </span>
        <span className="text-text text-center md:w-auto w-2/3">
          Transform Your Lunch Experience in Just 3 Steps
        </span>
      </div>
      <HowItWorksSteps
        step1Title="Automatically Plan Weekly Menus"
        step2Title="Employees Pre-Select Their Meals"
        step3Title="PITO Sets Up & Serves On-Site"
        step1Description="Admins select menus from over 100 carefully vetted restaurants. No time wasted making daily decisions."
        step2Description="Employees choose their meals via the app/web. Dietary preferences and allergies are automatically suggested."
        step3Description="No kitchen required. PITO delivers and serves meals at your office with a professional pop-up canteen setup."
      />
    </div>
  );
};

export default HowItWorks;

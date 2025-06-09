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
import { HowItWorksSteps } from '../MediumBusiness/HowItWorks';

const HowItWorks = () => {
  return (
    <div className="flex flex-col items-center md:gap-12 md:px-56 px-5 md:pb-36 md:pt-20 gap-0 relative">
      <div className="flex flex-col gap-2 items-center">
        <span className="font-alt text-2xl md:text-5xl font-bold text-center md:leading-[3rem]">
          How It Works
        </span>
        <span className="text-text md:w-3/4 text-center">
          🎯 Ideal for teams of 10–99 employees, especially in offices without a
          built-in kitchen.
        </span>
      </div>
      <HowItWorksSteps
        step1Title="Plan Once, Set and Forget"
        step2Title="Let Your Team Choose"
        step3Title="Meals Delivered Where You Want"
        step1Description="The Booker (your team’s meal coordinator) selects the vendors and weekly menu. No more daily decisions or Zalo messages."
        step2Description="Employees receive app notifications to pre-select their meals. Just one tap, and the whole week’s menu is set."
        step3Description="No calls, no confusion. Our Delivery Agents team sets up meals at the designated drop-off point - all fully contactless."
      />
      <div className="flex-col items-center md:gap-40 gap-20 w-full md:mt-40 mt-10 hidden">
        {/* step 1 */}
        <div className="flex md:flex-row flex-col md:gap-30 gap-20 justify-between">
          {/* lhs */}
          <div className="flex flex-col md:items-start md:text-start items-center text-center md:gap-5 gap-2 md:w-1/3">
            <div
              className="
            md:size-16 size-12 flex items-center justify-center rounded-full bg-[#6CCFF6]/80 md:text-xl text-base text-white font-semibold">
              01
            </div>
            <span className="font-bold md:text-3xl text-xl font-alt">
              Plan Once, Set and Forget
            </span>
            <span>
              The Booker (your team’s meal coordinator) selects the vendors and
              weekly menu. No more daily decisions or Zalo messages.
            </span>
          </div>
          {/* rhs */}
          <div className="md:w-1/2 relative flex md:justify-end md:items-end justify-center items-center">
            <Image
              src={yellowTriangle}
              alt="yellow"
              className="absolute -z-10 md:size-40 size-25 md:-top-10 -top-20 md:left-10 left-auto md:right-auto -right-8"
            />
            <Image
              src={pink}
              alt="pink"
              className="absolute -z-10 md:size-70 size-45 -rotate-120 -bottom-20 md:-right-15 right-auto md:left-auto -left-20"
            />
            <Image
              src={step1}
              alt="step 1 gif"
              className="md:h-57 h-42 rounded-2xl object-cover w-full"
            />
          </div>
        </div>
        {/* step 2 */}
        <div className="flex md:flex-row flex-col-reverse md:gap-30 gap-20 justify-between">
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
            <Image
              src={step2}
              alt="step 2 gif"
              className="md:h-54 h-42 rounded-2xl object-cover w-full"
            />
          </div>
          {/* rhs */}
          <div className="flex flex-col md:items-start md:text-start items-center text-center md:gap-5 gap-2 md:w-1/3">
            <div
              className="
            md:size-16 size-12 flex items-center justify-center rounded-full bg-[#C5D475] md:text-xl text-base text-white font-semibold">
              02
            </div>
            <span className="font-bold md:text-3xl text-xl font-alt">
              Let Your Team Choose
            </span>
            <span>
              Employees receive app notifications to pre-select their meals.
              Just one tap, and the whole week’s menu is set.
            </span>
          </div>
        </div>
        {/* step 3 */}
        <div className="flex md:flex-row flex-col md:gap-30 gap-20 justify-between">
          {/* lhs */}
          <div className="flex flex-col md:items-start md:text-start items-center text-center md:gap-5 gap-2 md:w-1/3">
            <div
              className="
            md:size-16 size-12 flex items-center justify-center rounded-full bg-[#F6AFCE] md:text-xl text-base text-white font-semibold">
              03
            </div>
            <span className="font-bold md:text-3xl text-xl font-alt">
              Meals Delivered Where You Want
            </span>
            <span>
              No calls, no confusion. Our Delivery Agents team sets up meals at
              the designated drop-off point - all fully contactless.
            </span>
          </div>
          {/* rhs */}
          <div className="md:w-1/2 relative flex md:justify-end md:items-end justify-center items-center">
            <Image
              src={lemon}
              alt="lemon decor"
              className="absolute -z-10 size-40 md:-bottom-15 bottom-auto md:top-auto -top-20 -left-20 rotate-60"
            />
            <Image
              src={pinkAlt}
              alt="pink decor"
              className="absolute -z-10 size-50 -top-20 -right-20 md:flex hidden"
            />
            <Image
              src={step3}
              alt="step 3 gif"
              className="md:h-61 h-46 rounded-2xl object-cover w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

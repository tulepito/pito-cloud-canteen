import { PiCalendarCheck, PiForkKnife, PiPackage } from 'react-icons/pi';
import Image from 'next/image';

import image1 from '../../assets/admin/how-it-works-1.webp';
import image2 from '../../assets/admin/how-it-works-2.webp';
import image3 from '../../assets/admin/how-it-works-3.webp';

const HowItWorks = () => {
  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <span className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
        How It Works
      </span>
      <div className="flex flex-col items-center w-full gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-[60px] w-full">
          <div className="order-2 md:order-1 col-span-1 flex flex-row md:flex-col gap-3 md:gap-5 justify-center">
            <div className="size-8 md:size-20 text-lg md:text-4xl flex items-center justify-center shrink-0 rounded-full text-[#96A546] bg-[#C5D475]/50">
              <PiCalendarCheck />
            </div>
            <p className="text-base md:text-[22px]  font-medium">
              Plan meals for your entire team in advance (weekly, shift-based).
            </p>
          </div>
          <div className="order-1 md:order-2 col-span-1 relative w-full aspect-[164/175] md:aspect-[12/7]">
            <Image
              src={image1}
              alt="How It Works Step 1"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-[60px] w-full">
          <div className="col-span-1 relative w-full aspect-[164/175] md:aspect-[12/7]">
            <Image
              src={image2}
              alt="How It Works Step 2"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
          <div className="col-span-1 flex flex-row md:flex-col gap-3 md:gap-5 justify-center">
            <div className="size-8 md:size-20 text-lg md:text-4xl flex items-center justify-center shrink-0 rounded-full text-[#D680A3] bg-[#FBD7E7]/50">
              <PiForkKnife />
            </div>
            <p className="text-base md:text-[22px]  font-medium">
              Employees pick their meals via app/web.
            </p>
          </div>
        </div>

        <div className="grid col-span-1 md:grid-cols-2 gap-2 md:gap-[60px] w-full">
          <div className="order-2 md:order-1 col-span-1 flex flex-row md:flex-col gap-3 md:gap-5 justify-center">
            <div className="size-8 md:size-20 text-lg md:text-4xl flex items-center justify-center shrink-0 rounded-full text-[#3598BF] bg-[#C4ECFB]/50">
              <PiPackage />
            </div>
            <p className="text-base md:text-[22px]  font-medium">
              Meals are delivered to your designated drop-off points – on time,
              every time.
            </p>
          </div>
          <div className="order-1 md:order-2 col-span-1 relative w-full aspect-[164/175] md:aspect-[12/7]">
            <Image
              src={image3}
              alt="How It Works Step 3"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

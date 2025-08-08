import { PiClock, PiFileText, PiForkKnife } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';

const ReClaim = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col md:gap-10 md:mb-36 mb-20 gap-5 relative max-w-[1024px] mx-auto px-5 md:px-0">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <span className="text-text w-full md:w-2/3 text-center font-semibold">
          {intl.formatMessage({
            id: 'reclaim-your-time-boost-team-satisfaction',
          })}
        </span>
        <span className="font-alt text-2xl font-[unbounded] font-semibold md:text-[40px] text-center md:leading-tight md:whitespace-pre-line">
          What <span className="text-[#96A546]">Startups Get</span> from{' '}
          <br className="hidden md:block" />{' '}
          <span className="text-[#96A546]">PITO Cloud Canteen</span>?
        </span>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-5">
        {/* Card 1 */}
        <div className="col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiClock className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
            Save 90% of time coordinating meals
          </span>
        </div>

        {/* Card 2 */}
        <div className="col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiForkKnife className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
            Diverse menu, different dishes every day, never boring
          </span>
        </div>

        {/* Card 3 */}
        <div className="col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiFileText className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
            Detailed weekly and monthly reports on the system
          </span>
        </div>

        {/* Card 4 & Card 5 */}
        <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-5">
          <div className="flex md:flex-col gap-3 md:gap-8 justify-start md:justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5 w-full md:w-1/2">
            <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
              <PiFileText className="text-xl md:text-2xl" />
            </div>
            <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
              Meals delivered to the designated point, ensuring food safety
            </span>
          </div>
          <div className="flex md:flex-col gap-3 md:gap-8 justify-start md:justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5 w-full md:w-1/2">
            <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
              <PiFileText className="text-xl md:text-2xl" />
            </div>
            <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
              Flexible daily adjustments
            </span>
          </div>
        </div>
      </div>

      {/* Decorations */}
      <div className="aspect-[247/285] w-[70%] md:w-[40%] top-[20%] -left-[25%] absolute -z-20 rotate-[210deg] md:-rotate-[148deg]">
        <Image src={pink} alt="pink triangle decor" fill />
      </div>
      <Image
        src={yellow}
        className="absolute size-[60px] md:size-20 top-[20%] -left-[10%] md:left-[10%] -z-10"
        alt="yellow circle decor"
      />
      <Image
        src={yellow}
        className="absolute size-20 top-[35%] -right-[25%] -z-10"
        alt="yellow circle decor"
      />
      <Image
        src={yellow}
        className="absolute size-[60px] top-[50%] -right-[2%] -z-10 block md:hidden"
        alt="yellow circle decor"
      />
      <div className="aspect-[247/285] w-[65%] md:w-[45%] bottom-[2%] md:top-[20%] -right-[25%] absolute -z-20 -rotate-[22deg]">
        <Image src={blue} alt="pink triangle decor" fill />
      </div>
    </div>
  );
};

export default ReClaim;

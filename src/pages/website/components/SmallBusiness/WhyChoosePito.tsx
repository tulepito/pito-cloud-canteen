import {
  PiFileText,
  PiForkKnife,
  PiHandshake,
  PiLaptop,
  PiStar,
  PiUser,
} from 'react-icons/pi';

const WhyChoosePito = () => {
  return (
    <div className="flex flex-col items-center md:gap-12 md:px-56 px-5 md:pb-20 md:pt-20 gap-10 relative pb-10">
      <div className="flex flex-col gap-2 items-center">
        <span className="font-alt text-2xl md:text-4xl font-bold text-center md:leading-[3rem]">
          Why Choose PITO Cloud Canteen?
        </span>
        <span className="text-text md:w-3/4 text-center">
          No more manual lunch ordering. PITO helps you schedule lunch for the
          whole week in just a few minutes. No Excel files, no complicated Zalo
          messages.
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-5 w-full md:px-18">
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#6CCFF6]/60 text-[#3598BF] rounded-full">
            <PiForkKnife />
          </div>
          <span className="font-semibold">
            Perfect for offices without in-house kitchens
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#F6AFCE]/60 text-[#D680A3] rounded-full">
            <PiLaptop />
          </div>
          <span className="font-semibold">
            Manage everything from one simple platform{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#FFC811]/60 text-[#C79000] rounded-full">
            <PiHandshake />
          </div>
          <span className="font-semibold">
            Works with verified, rotating vendors{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#6CCFF6]/60 text-[#3598BF] rounded-full">
            <PiFileText />
          </div>
          <span className="font-semibold">
            Transparent pricing, no hidden fees{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#F6AFCE]/60 text-[#D680A3] rounded-full">
            <PiUser />
          </div>
          <span className="font-semibold">
            Personalized meals for each employee – the right person, the right
            dish{' '}
          </span>
        </div>
        <div className="rounded-2xl p-3 border border-[#D7D7D7] flex items-center gap-3">
          <div className="size-11 text-xl flex items-center justify-center shrink-0 bg-[#C5D475]/60 text-[#96A546] rounded-full">
            <PiStar />
          </div>
          <span className="font-semibold">
            Diverse, high-quality menus with real user ratings{' '}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WhyChoosePito;

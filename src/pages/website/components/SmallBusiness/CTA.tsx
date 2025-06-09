import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import CTABg from '../../assets/CTABg2.png';

const CTA = () => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col gap-40 w-full items-start justify-center md:min-h-[40rem] md:pt-36 relative">
      <Image
        src={CTABg}
        alt="CTA Background"
        className="absolute -z-10 size-full object-cover"
      />

      <div className="flex flex-col md:items-start items-center md:text-start text-center gap-4 px-5 md:px-54 md:w-3/4 py-16 md:pb-36">
        <span className="text-text">Your Team’s Meals</span>
        <span className="font-alt font-bold text-2xl md:text-6xl">
          Don’t let lunch <br /> coordination disrupt your team’s day{' '}
        </span>
        <span className="text-text md:w-1/2">
          You set the plan once. We handle the rest. No calls, no chaos, no
          complaints.
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn z-20 hover:bg-black hover:text-white w-fit bg-white px-12 mt-3 md:mt-8">
          Book a Free Demo
        </button>
      </div>
    </div>
  );
};

export default CTA;

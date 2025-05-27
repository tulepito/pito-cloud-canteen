// import { useState } from 'react';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import blue from '../assets/decorations/blue.svg';
import lemon from '../assets/decorations/lemon.svg';
import pink from '../assets/decorations/pink.svg';
import yellow from '../assets/decorations/yellow.svg';
import pitoAsset1 from '../assets/pitoAssets/1.png';
import pitoAsset2 from '../assets/pitoAssets/2.png';
import pitoAsset3 from '../assets/pitoAssets/3.png';
import pitoAsset4 from '../assets/pitoAssets/4.png';
import pitoAsset5 from '../assets/pitoAssets/5.png';
import pitoAsset6 from '../assets/pitoAssets/6.png';
import { useModal } from '../pages/Layout';

const CTA = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col gap-40 w-full items-center pb-[30rem] md:pt-36">
      <div className="flex flex-col items-center gap-4 text-center md:w-1/2">
        <span className="font-alt font-bold text-2xl md:text-4xl">
          {intl.formatMessage({ id: 'ready-to-revolutionize' })} <br />
          {intl.formatMessage({ id: 'your-teams-lunch-experience' })}
        </span>
        <span className="text-text">
          {intl.formatMessage({
            id: 'get-a-personalized-demo-of-the-platform-and-a-custom-solution-tailored-to-your-teams-size-and-budget-no-pressure-no-obligations-just-helpful-insights',
          })}
        </span>
        <div className="flex md:flex-row flex-col items-stretch md:items-center justify-center w-full px-5 gap-4 mt-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn border border-solid border-gray-300 text-white bg-black hover:opacity-90 hover:scale-[1.01] transition-all duration-300 ease-in-out p-4 px-6 font-semibold">
            {intl.formatMessage({ id: 'book-free-consultation' })}
          </button>
          {/* <button
            onClick={() => setIsModalOpen(true)}
            className="btn border border-solid border-gray-300 hover:bg-black hover:text-white">
          </button> */}
        </div>
      </div>
      {/* decorations and images */}
      <div className="w-full relative max-w-[1500px]">
        <Image
          src={lemon}
          alt="lemon triangle decor"
          className="absolute md:left-14 left-32 md:top-auto top-60 -rotate-60 -z-10 md:size-auto size-36"
        />
        <Image
          src={yellow}
          alt="yellow circle decor"
          className="absolute md:left-12 md:right-auto -right-5 md:-top-14 top-80 md:size-12 size-20"
        />
        <Image
          src={blue}
          alt="blue decor"
          className="absolute md:top-0 -top-20 md:left-[43%] md:right-auto -right-20 md:size-80 size-60 -z-10"
        />
        <Image
          src={yellow}
          alt="yellow circle decor"
          className="absolute md:right-[27rem] left-1/2 top-0 md:size-6 size-10"
        />
        <Image
          src={pink}
          alt="pink decor"
          className="absolute md:-right-20 md:left-auto -left-40 md:-top-32 top-0 -z-10 size-80 md:size-[32rem] rotate-140 md:-rotate-100"
        />
        {/* images */}
        <Image
          src={pitoAsset1}
          alt="assets1"
          className="rounded-3xl w-48 h-60 object-cover absolute rotate-20 md:-rotate-12 md:top-5 md:left-auto -left-6 top-32"
        />
        <Image
          src={pitoAsset2}
          alt="assets2"
          className="rounded-3xl md:w-32 w-32 md:h-24 h-36 object-cover absolute -rotate-20 md:left-60 md:right-auto right-20 md:top-5 top-72"
        />
        <Image
          src={pitoAsset3}
          alt="assets3"
          className="rounded-3xl w-48 h-60 object-cover absolute rotate-12 md:right-auto -right-10 md:left-[25rem] top-5"
        />
        <Image
          src={pitoAsset4}
          alt="assets4"
          className="rounded-3xl md:flex hidden w-28 h-36 object-cover absolute left-[40rem] top-40"
        />
        <Image
          src={pitoAsset5}
          alt="assets5"
          className="rounded-3xl md:flex hidden w-48 h-56 object-cover absolute -rotate-12 left-[49rem] top-0"
        />
        <Image
          src={pitoAsset6}
          alt="assets6"
          className="rounded-3xl md:flex hidden w-48 h-60 object-cover absolute rotate-12 right-32 top-5"
        />
        <Image
          src={pitoAsset1}
          alt="assets1"
          className="rounded-3xl md:flex hidden w-28 h-32 object-cover absolute -right-5 top-32"
        />
      </div>
    </div>
  );
};

export default CTA;

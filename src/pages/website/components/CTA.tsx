// import { useState } from 'react';
import { useIntl } from 'react-intl';

// import Image from 'next/image';
// import blue from '../assets/decorations/blue.svg';
// import lemon from '../assets/decorations/lemon.svg';
// import pink from '../assets/decorations/pink.svg';
// import yellow from '../assets/decorations/yellow.svg';
import { useModal } from '../pages/Layout';

const CTA = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <>
      <div className="flex flex-col gap-40 w-full items-center py-10 md:py-16">
        <div className="flex flex-col items-center gap-4 text-center md:w-1/2 px-5 md:px-0">
          <span className="font-alt font-bold text-2xl md:text-[42px] leading-tight">
            {intl.formatMessage({ id: 'ready-to-revolutionize' })} <br />
            {intl.formatMessage({ id: 'your-teams-lunch-experience' })}
          </span>
          <span className="text-text md:whitespace-pre-line">
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
      </div>
    </>
  );
};

export default CTA;

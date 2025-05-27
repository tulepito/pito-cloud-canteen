import { useIntl } from 'react-intl';
import Image from 'next/image';

import CTABg from '../assets/CTABg.png';
import { useModal } from '../pages/Layout';

const CTAAlt = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col gap-40 w-full items-start justify-center md:min-h-[40rem] md:pt-36 relative">
      <Image
        src={CTABg}
        alt="CTA Background"
        className="absolute -z-10 size-full object-cover"
      />

      <div className="flex flex-col gap-4 px-5 md:px-54 w-2/3 md:w-3/4 py-16 md:pb-36 max-w-[1224px] mx-auto">
        <span className="text-text text-center md:text-left">
          {intl.formatMessage({ id: 'your-teams-meals' })}
        </span>
        <span className="font-alt font-bold text-2xl md:text-6xl max-w-[600px] text-center md:text-left">
          {intl.formatMessage({ id: 'ready-to-simplify-team-lunches' })}
        </span>
        <span className="text-text text-center md:text-left">
          {intl.formatMessage({ id: 'lets-build-your-custom-plan' })}
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn hover:bg-black hover:text-white md:w-fit bg-white px-12 mt-3 md:mt-8 w-full ">
          {intl.formatMessage({ id: 'get-started' })}
        </button>
      </div>
    </div>
  );
};

export default CTAAlt;

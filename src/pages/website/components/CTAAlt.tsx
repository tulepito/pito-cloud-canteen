import { useIntl } from 'react-intl';
import Image from 'next/image';

import CTABg from '../assets/CTABg.webp';
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

      <div className="flex flex-col gap-4 px-5 md:px-54 w-full md:w-3/4 py-16 md:pb-36 max-w-[1224px] mx-auto">
        <span className="text-center md:text-left  font-medium">
          {intl.formatMessage({ id: 'your-teams-meals' })}
        </span>
        <h2 className="font-bold text-2xl md:text-[40px] font-[unbounded] max-w-[700px] text-center leading-tight md:text-left md:whitespace-pre-line">
          {intl.formatMessage({ id: 'ready-to-simplify-team-lunches' })}
        </h2>
        {intl.locale === 'en' && (
          <span className="text-center md:text-left md:text-lg  font-medium">
            {intl.formatMessage({ id: 'lets-build-your-custom-plan' })}
          </span>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn hover:bg-white hover:text-black md:w-fit bg-black py-3 text-white px-6 mt-3 md:mt-8 w-full font-[unbounded] font-semibold">
          {intl.formatMessage({ id: 'get-started' })}
        </button>
      </div>
    </div>
  );
};

export default CTAAlt;

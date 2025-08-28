import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import CTABg from '../../assets/tech/CTABg.webp';
import CTABgMobile from '../../assets/tech/CTABgMobile.webp';

const CTA = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col gap-40 w-full items-start justify-center min-h-[] md:min-h-[50vh] md:pt-0 relative overflow-hidden">
      <Image
        src={CTABg}
        alt="CTA Background"
        className="object-cover hidden md:block scale-110"
      />
      <Image
        src={CTABgMobile}
        alt="CTA Background"
        className="object-cover md:hidden block right-0 w-full aspect-[30/47]"
      />

      <div className="absolute top-[3%] md:top-12 flex flex-col md:items-start items-center md:text-start text-center gap-4 px-5 md:px-0 max-w-[1024px] mx-auto w-full py-16 md:pb-36 right-0 left-0">
        <span className="font-medium">
          {intl.formatMessage({ id: 'optimize-today-with-pito-cloud-canteen' })}
        </span>
        <h2 className="font-semibold text-2xl md:text-[40px] font-[unbounded] md:leading-tight md:whitespace-pre-line md:w-[60%]">
          {intl.formatMessage({
            id: 'smart-lunch-with-pito-accurate-friendly',
          })}
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn hover:bg-black hover:text-white md:w-fit bg-white py-3 px-6 mt-3 md:mt-8 w-full font-[unbounded] font-semibold">
          {intl.formatMessage({ id: 'request-a-demo' })}
        </button>
      </div>
    </div>
  );
};

export default CTA;

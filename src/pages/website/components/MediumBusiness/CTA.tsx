import { useIntl } from 'react-intl';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

const CTA = ({
  src,
  srcMobile,
  textTop = '',
  textMiddleNode = <></>,
  textBottom = '',
}: {
  src: StaticImageData;
  srcMobile: StaticImageData;
  textTop: string;
  textMiddleNode: React.ReactNode;
  textBottom: string;
}) => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col gap-40 w-full items-start justify-center h-[600px] md:pt-0 relative overflow-hidden">
      <Image
        src={src}
        alt="CTA Background"
        className="object-cover hidden md:block scale-110"
      />
      <Image
        src={srcMobile}
        alt="CTA Background"
        className="object-cover md:hidden block right-0 w-full"
      />

      <div className="absolute -top-4 md:top-12 flex flex-col md:items-start items-center md:text-start text-center gap-4 px-5 md:px-0 max-w-[1024px] mx-auto w-full py-16 md:pb-36 right-0 left-0">
        <span className="font-medium">{textTop}</span>
        <h3 className="font-[unbounded] font-bold text-2xl md:text-[40px] leading-tight md:whitespace-pre-line">
          {textMiddleNode}
        </h3>
        <span className="font-medium md:text-lg md:w-3/4 md:whitespace-pre-line">
          {textBottom}
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn hover:bg-black hover:text-white md:w-fit bg-white py-3 px-6 mt-3 md:mt-8 w-full font-[unbounded] font-semibold">
          {intl.formatMessage({ id: 'book-a-free-consultation' })}
        </button>
      </div>
    </div>
  );
};

export default CTA;

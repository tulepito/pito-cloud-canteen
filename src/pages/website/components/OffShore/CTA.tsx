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
  textBottom?: string;
}) => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col gap-40 w-full items-start justify-center min-h-[60vh] md:pt-0 relative overflow-hidden">
      <Image
        src={src}
        alt="CTA Background"
        className="object-cover hidden md:block"
      />
      <Image
        src={srcMobile}
        alt="CTA Background"
        className="object-cover md:hidden block right-0 w-full"
      />

      <div className="absolute top-1/3 md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center gap-4 px-5 md:px-0 max-w-[1024px] mx-auto w-full">
        <span className=" font-medium">{textTop}</span>
        <span className="font-semibold text-2xl md:text-[40px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
          {textMiddleNode}
        </span>
        {textBottom && <span className="text-text md:w-3/4">{textBottom}</span>}

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn hover:bg-black hover:text-white md:w-fit bg-white py-3 px-6 mt-3 md:mt-8 w-full font-[unbounded] font-semibold">
          Request a Demo
        </button>
      </div>
    </div>
  );
};

export default CTA;

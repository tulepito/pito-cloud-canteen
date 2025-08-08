import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import pitoAsset1 from '../../assets/pitoAssets/6.webp';
import pitoAsset2 from '../../assets/pitoAssets/9.webp';
import pitoAsset3 from '../../assets/pitoAssets/10.webp';
import pitoAsset4 from '../../assets/pitoAssets/11.webp';
import pitoAsset5 from '../../assets/pitoAssets/12.webp';

const Decor = () => {
  return (
    <div className="flex flex-col gap-40 w-full items-center md:pb-[30rem] pb-[35rem] md:pt-36 pt-32">
      {/* decorations and images */}
      <div className="w-full relative max-w-[1224px]">
        <Image
          src={lemon}
          alt="lemon triangle decor"
          className="absolute md:left-0 left-24 md:top-auto top-40 md:-rotate-60 -rotate-[28deg] -z-10 md:size-auto size-48"
        />
        <Image
          src={yellow}
          alt="yellow circle decor"
          className="absolute md:left-96 md:right-auto right-2 md:top-60 top-60 size-10"
        />
        <Image
          src={blue}
          alt="blue decor"
          className="absolute md:top-0 -top-20 md:left-[40%] md:right-auto -right-20 md:size-80 size-60 -z-10"
        />
        <Image
          src={pink}
          alt="pink decor"
          className="absolute md:-right-20 md:left-auto -left-60 md:-top-32 top-0 -z-10 size-80 md:size-[32rem] rotate-[180deg] md:-rotate-[120deg]"
        />
        {/* images */}
        <Image
          src={pitoAsset1}
          alt="assets1"
          className="rounded-3xl w-72 aspect-[5/4] object-cover absolute rotate-20 md:-rotate-12 md:-top-1 md:-left-10 -left-6 top-32 md:flex hidden"
        />
        <Image
          src={pitoAsset2}
          alt="assets3"
          className="md:rounded-3xl rounded-2xl md:size-48 size-40 object-cover absolute md:rotate-6 -rotate-12 md:right-auto right-10 md:left-[18rem] md:-top-10 top-56"
        />
        <Image
          src={pitoAsset3}
          alt="assets5"
          className="rounded-3xl md:size-44 size-44 object-cover md:rotate-0 rotate-16 absolute md:left-[32rem] md:top-24 top-40 -left-10"
        />
        <Image
          src={pitoAsset4}
          alt="assets6"
          className="rounded-3xl md:flex hidden w-36 aspect-[3/4] object-cover absolute -rotate-[9deg] right-[360px] -top-15"
        />
        <Image
          src={pitoAsset5}
          alt="assets6"
          className="rounded-2xl w-48 md:w-80 aspect-square md:aspect-[5/3] object-cover absolute md:right-5 -right-10 md:top-10 md:rotate-6 rotate-[12deg]"
        />
      </div>
    </div>
  );
};

export default Decor;

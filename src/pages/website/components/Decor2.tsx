import Image from 'next/image';

import blue from '../assets/decorations/blue.svg';
import lemon from '../assets/decorations/lemon.svg';
import pink from '../assets/decorations/pink.svg';
import yellow from '../assets/decorations/yellow.svg';
import mealbox1 from '../assets/pitoAssets/mealbox1.png';
import mealbox2 from '../assets/pitoAssets/mealbox2.png';
import mealbox3 from '../assets/pitoAssets/mealbox3.png';
import mealbox4 from '../assets/pitoAssets/mealbox4.png';
import mealbox5 from '../assets/pitoAssets/mealbox5.png';

const Decor2 = () => {
  return (
    <div className="flex flex-col gap-40 w-full items-center md:pb-[30rem] pb-[35rem] md:pt-36 pt-32">
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
          className="absolute md:-right-20 md:left-auto -left-40 md:-top-32 top-0 -z-10 size-80 md:size-[32rem] rotate-[240deg] md:-rotate-100"
        />
        {/* images */}
        <div className="rounded-3xl w-60 h-80 absolute rotate-20 md:-rotate-12 md:top-5 md:left-auto -left-6 top-32">
          <Image src={mealbox1} alt="assets1" className="object-contain" fill />
        </div>
        <div className="rounded-3xl md:w-[18rem] w-32 md:h-[18rem] h-36 object-cover absolute -rotate-20 md:left-80 md:right-auto right-20 md:top-5 top-72 translate-y-10 md:-translate-y-0">
          <Image src={mealbox2} alt="assets2" className="object-contain" fill />
        </div>
        <div className="rounded-3xl w-48 h-60 object-cover absolute rotate-12 md:right-auto -right-10 md:left-[44rem] top-28">
          <Image src={mealbox3} alt="assets3" className="object-contain" fill />
        </div>
        <div className="rounded-3xl md:flex hidden w-[20rem] h-[20rem] object-cover absolute left-[58rem] -top-20">
          <Image src={mealbox4} alt="assets4" className="object-contain" fill />
        </div>
        <div className="rounded-3xl md:flex hidden w-36 h-56 object-cover absolute -rotate-12 left-[76rem] top-40">
          <Image src={mealbox5} alt="assets5" className="object-contain" fill />
        </div>
      </div>
    </div>
  );
};

export default Decor2;

import { PiCheck } from 'react-icons/pi';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue3.svg';
import lemon from '../../assets/decorations/lemon.svg';
import CTABgMobile from '../../assets/employee/CTABgMobile.webp';
import image from '../../assets/employee/want.webp';
import imageVideo from '../../assets/videoPlaceholder.png';

const data = [
  'No more guesswork or group chats to pick food',
  'Everyone eats what they like - together',
  "Lunch is no longer a hassle - it's a moment to enjoy",
];

const Want = () => {
  const { setIsModalOpen } = useModal();

  return (
    <>
      <div className="w-full md:min-h-[60vh] relative">
        {/* main hero section */}

        <div className="flex md:flex-row flex-col-reverse items-center md:justify-start justify-center mb-0 max-w-[1024px] mx-auto md:px-0 px-5">
          <div className="flex flex-col md:items-start items-center text-left md:gap-5 gap-2 md:w-2/3 pt-0">
            <span className=" font-medium">
              Share this with your HR/Admin so your whole{' '}
              <br className="hidden md:block" /> team can enjoy PITO Cloud
              Canteen !
            </span>
            <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
              Want meals delivered on time,{' '}
              <span className="text-[#D680A3]">made just for you</span> - right
              at the office?
            </p>
            <div className="flex flex-col w-full">
              <span className="text-text md:text-lg md:whitespace-pre-line font-normal md:font-medium mb-5">
                PITO Cloud Canteen makes lunch easier{' '}
                <br className="hidden md:block" /> and better for everyone:
              </span>
              <div className="flex flex-col w-full gap-2">
                {data.map((item, index) => (
                  <div
                    key={index}
                    className="w-full flex flex-row item-start md:items-center gap-2">
                    <PiCheck className="text-xl md:text-2xl min-w-5" />
                    <p className="text-base md:text-lg font-normal md: font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex md:flex-row flex-col md:items-center items-stretch w-full gap-2 mt-8">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
                Request a Free Consultation
              </a>
            </div>
          </div>
        </div>
        {/* decorations */}
        <div className="aspect-[635/470] h-[40%] z-10 md:-top-[10%] md:-left-[10%] absolute md:flex hidden">
          <Image src={blue} alt="blue decor" fill />
        </div>

        <div className="aspect-square h-[80px] z-20 md:top-[22%] md:left-[3%] absolute md:flex hidden">
          <Image src={imageVideo} alt="image video" fill />
        </div>

        <div className="aspect-[153/139] h-[40%] z-10 md:bottom-[4%] md:-left-[6%] absolute md:flex hidden rotate-[70deg]">
          <Image src={lemon} alt="lemon triangle decor" fill />
        </div>

        <div className="h-full md:top-0 md:-right-[10%] z-0 right-0 absolute md:block hidden">
          <div className="relative aspect-[166/125] h-full">
            <Image
              src={image}
              alt="Image hero"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
              loading="eager"
            />
          </div>
        </div>

        <div className="relative aspect-[9/8] w-full md:hidden block">
          <Image
            src={CTABgMobile}
            alt="Image hero"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            loading="eager"
          />
        </div>
      </div>
    </>
  );
};

export default Want;

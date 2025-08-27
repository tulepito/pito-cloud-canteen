import { useIntl } from 'react-intl';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import hero from '../../assets/startup/com-trua-van-phong-pito-cloud-canteen.webp';
import hero1 from '../../assets/startup/pito-cloud-canteen-com-trua-van-phong.webp';

const Hero = () => {
  const intl = useIntl();
  const { setIsModalOpen } = useModal();

  return (
    <div className="w-full md:h-[90vh] relative mt-20 mb-48 md:mb-0 md:mt-0 md:px-0 px-5 flex flex-col md:flex-row items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-20 md:py-20 h-full max-w-[1024px]">
        <div className="flex flex-col items-center justify-center text-center md:gap-5 gap-2 w-full md:w-[70%] pt-0">
          <span className=" font-medium">
            {intl.formatMessage({ id: 'delicious-on-time-your-choice-0' })}
          </span>
          <h1 className="font-semibold text-2xl md:text-[40px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
            {intl.formatMessage(
              {
                id: 'flexible-lunch-solution-for-your-company',
              },
              {
                highlightVi: (
                  <span className="text-[#D680A3]">bữa trưa linh hoạt</span>
                ),
                highlightEn: (
                  <span className="text-[#D680A3]">
                    Flexible Lunch Solution
                  </span>
                ),
              },
            )}
          </h1>
          <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
            {intl.formatMessage({
              id: 'de-dang-mo-rong-tu-10-den-100-nhan-su-tiet-kiem-thoi-gian',
            })}
          </span>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
            {intl.formatMessage({ id: 'request-a-demo' })}
          </a>
        </div>
      </div>

      {/* decorations */}

      <div className="aspect-[35/26] w-[30%] bottom-0 -left-[10%] absolute -z-10 hidden md:block">
        <Image
          src={hero}
          alt="Cơm trưa văn phòng PITO Cloud Canteen"
          className="object-contain"
          fill
        />
      </div>
      <div className="aspect-[247/285] w-[24%] -top-[20%] -left-[15%] absolute -z-20 -rotate-[126deg] hidden md:block">
        <Image src={pink} alt="pink triangle decor" fill />
      </div>
      <div className="aspect-[59/54] w-[50%] md:w-[25%] -bottom-[85%] md:bottom-[5%] -left-[10%] absolute -z-20">
        <Image src={lemon} alt="lemon triangle decor" fill />
      </div>
      <div className="aspect-[35/26] w-[30%] -top-[7%] -right-[12%] absolute -z-10 -rotate-[16deg] hidden md:block">
        <Image src={blue} alt="hero" className="object-contain" fill />
      </div>

      <div className="h-[90%] md:h-[50%] -bottom-[97%] md:bottom-0 z-0 -right-[36%] md:-right-[10%] absolute">
        <div className="relative aspect-[1520/1120] h-full">
          <Image
            src={yellow}
            alt="yellow circle decor"
            className="size-10 md:size-[100px] absolute top-[2%] -z-20 left-[2%]"
          />
          <Image
            src={hero1}
            alt="Cơm trưa văn phòng PITO Cloud Canteen"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
            loading="eager"
          />
          <Image
            src={lemon}
            alt="lemon triangle decor"
            className="hidden md:block md:size-80 absolute -top-[30%] -z-20 -right-[2%] -rotate-[32deg]"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;

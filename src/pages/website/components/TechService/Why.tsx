import { PiBrain, PiFileText, PiHeart, PiUsersThree } from 'react-icons/pi';
import clsx from 'clsx';
import Image from 'next/image';

import featureImage from '../../assets/employee/employee-hero.webp';

const Why = () => {
  const data = [
    {
      title: 'Minimize operational overhead — focus fully on client delivery.',
      color: '#C5D475',
      textColor: '#96A546',
      icon: <PiBrain />,
    },
    {
      title: 'Optimize cost management across multiple teams.',
      color: '#C4ECFB',
      textColor: '#3598BF',
      icon: <PiUsersThree />,
    },
    {
      title: 'Boost employee morale through seamless, hassle-free meals.',
      color: '#FBD7E7',
      textColor: '#D680A3',
      icon: <PiHeart />,
    },
    {
      title: 'Transparent invoicing — no surprises, no hidden charges.',
      color: '#C5D475',
      textColor: '#96A546',
      icon: <PiFileText />,
    },
  ];

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center text-center md:gap-5 gap-2 w-full pt-0">
        <p className="font-semibold text-2xl md:text-[40px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
          Why <span className="text-[#96A546]">Tech Service Companies</span>{' '}
          <br /> Choose PITO
        </p>
      </div>

      <div className="flex md:flex-row flex-col gap-2 md:gap-6 w-full">
        <div className="md:w-1/2 aspect-[164/175] md:aspect-auto relative flex items-center justify-center rounded-2xl overflow-hidden">
          <Image
            src={featureImage}
            alt="stepBg"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex md:w-1/2 flex-col gap-[10px]">
          {data.map((item, index) => (
            <div
              key={index}
              className="border rounded-2xl md:rounded-[30px] overflow-hidden border-[#D7D7D7]">
              <div
                className={`flex items-start gap-3 md:gap-4 transition-all duration-200 px-3 py-4 md:p-5`}>
                <div
                  className={clsx(
                    'size-8 md:size-11 text-lg md:text-xl flex items-center justify-center shrink-0 rounded-full',
                  )}
                  style={{
                    backgroundColor: item.color,
                    color: item.textColor,
                  }}>
                  {item.icon}
                </div>

                <span className="text-base md:text-lg text-left font-medium">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Why;

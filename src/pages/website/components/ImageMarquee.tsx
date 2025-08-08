import Marquee from 'react-fast-marquee';
import Image from 'next/image';

import image1 from '../assets/pitoAssets/1.webp';
import image4 from '../assets/pitoAssets/7.webp';
import image2 from '../assets/pitoAssets/14.webp';
import image3 from '../assets/pitoAssets/15.webp';
import image5 from '../assets/pitoAssets/16.webp';
import image6 from '../assets/pitoAssets/17.webp';
import image7 from '../assets/pitoAssets/18.webp';
import image8 from '../assets/pitoAssets/19.webp';
import image9 from '../assets/pitoAssets/20.webp';

const images = [
  { src: image1, alt: 'image1', type: 'type1' },
  { src: image2, alt: 'image2', type: 'type2' },
  { src: image3, alt: 'image3', type: 'type1' },
  { src: image4, alt: 'image4', type: 'type2' },
  { src: image5, alt: 'image5', type: 'type1' },
  { src: image6, alt: 'image6', type: 'type2' },
  { src: image7, alt: 'image7', type: 'type1' },
  { src: image8, alt: 'image8', type: 'type2' },
  { src: image9, alt: 'image9', type: 'type1' },
  { src: image4, alt: 'image4-duplicate', type: 'type2' },
];

const ImageMarquee = () => {
  return (
    <div className="mb-[60px] md:mb-[160px]">
      <Marquee className="h-full">
        {images.map(({ src, alt, type }, index) => {
          return (
            <div
              className={`relative rounded-3xl mr-3 overflow-hidden h-[150px] md:h-[450px]`}
              style={{
                width: type === 'type1' ? '33vw' : '20vw',
                minWidth: '140px',
              }}
              key={index}>
              <Image
                key={index}
                src={src}
                alt={alt}
                fill
                className={'object-cover'}
              />
            </div>
          );
        })}
      </Marquee>
      <div className="block md:hidden">
        <Marquee className="h-full mt-3">
          {images.reverse().map(({ src, alt }, index) => {
            return (
              <div
                className={`relative rounded-3xl mr-3 overflow-hidden`}
                style={{
                  width: '80vw',
                  minWidth: '140px',
                  height: '150px',
                }}
                key={index}>
                <Image
                  key={index}
                  src={src}
                  alt={alt}
                  fill
                  className={'object-cover'}
                />
              </div>
            );
          })}
        </Marquee>
      </div>
    </div>
  );
};

export default ImageMarquee;

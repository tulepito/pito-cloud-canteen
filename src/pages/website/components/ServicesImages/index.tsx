import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';

import pitoAsset1 from '../../assets/pitoAssets/1.png';
import pitoAsset2 from '../../assets/pitoAssets/2.png';
import pitoAsset3 from '../../assets/pitoAssets/3.png';
import pitoAsset4 from '../../assets/pitoAssets/4.png';
import pitoAsset5 from '../../assets/pitoAssets/5.png';
import pitoAsset6 from '../../assets/pitoAssets/6.png';

import css from './styles.module.css';

const images = [
  pitoAsset1,
  pitoAsset2,
  pitoAsset3,
  pitoAsset4,
  pitoAsset5,
  pitoAsset6,
];

const ServiceImages = () => {
  return (
    <div className="mx-auto pb-10">
      <div className={clsx(css.carousel__services_feature)}>
        <div className={clsx('py-4', css.services_feature)}>
          {images.concat(images).map((image, index) => (
            <div key={index} className={css.services__item_feature}>
              <div className="flex flex-col items-start relative size-full cursor-pointer gap-1 overflow-hidden rounded-xl border border-solid border-neutral-100">
                <div className="relative size-full">
                  <Image
                    src={image}
                    alt={`Service Image ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={100}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={clsx('py-4', css.services_feature)}>
          {images.concat(images).map((image, index) => (
            <div key={index} className={css.services__item_feature}>
              <div className="flex flex-col items-start relative size-full cursor-pointer gap-1 overflow-hidden rounded-xl border border-solid border-neutral-100">
                <div className="relative size-full">
                  <Image
                    src={image}
                    alt={`Service Image ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={100}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceImages;

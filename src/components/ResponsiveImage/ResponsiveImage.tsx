/**
 * Usage without sizes:
 *   <ResponsiveImage
 *     alt="ListingX"
 *     image={imageDataFromSDK}
 *     variants={['landscape-crop', 'landscape-crop2x']}
 *   />
 *   // produces:
 *   <img
 *     alt="ListingX"
 *     src="url/to/landscape-crop.jpg"
 *     srcSet="url/to/landscape-crop.jpg 400w, url/to/landscape-crop2x.jpg 800w" />
 *
 * Usage with sizes:
 *   <ResponsiveImage
 *     alt="ListingX"
 *     image={imageDataFromSDK}
 *     variants={['landscape-crop', 'landscape-crop2x']}
 *     sizes="(max-width: 600px) 100vw, 50vw"
 *   />
 *   // produces:
 *   <img
 *     alt="ListingX"
 *     src="url/to/landscape-crop.jpg"
 *     srcSet="url/to/landscape-crop.jpg 400w, url/to/landscape-crop2x.jpg 800w"
 *     sizes="(max-width: 600px) 100vw, 50vw" />
 *
 *   // This means that below 600px image will take as many pixels there are available on current
 *   // viewport width (100vw) - and above that image will only take 50% of the page width.
 *   // Browser decides which image it will fetch based on current screen size.
 *
 * NOTE: for all the possible image variant names and their respective
 * sizes, see the API documentation.
 */

import type { TDefaultProps, TImage, TImageVariant } from '@utils/types';
import classNames from 'classnames';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import NoImageIcon from './NoImageIcon';
import css from './ResponsiveImage.module.scss';

type TResponsiveImageProps = TDefaultProps & {
  alt: string;
  noImageMessage?: string;
  image: TImage;
  variants: TImageVariant[];
  sizes?: string;
};

const ResponsiveImage: React.FC<TResponsiveImageProps> = (props) => {
  const {
    className,
    rootClassName,
    alt,
    noImageMessage,
    image,
    variants = [],
    ...rest
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  if (image == null || variants.length === 0) {
    const noImageClasses = classNames(
      rootClassName || css.root,
      css.noImageContainer,
      className,
    );

    const noImageMessageText = noImageMessage || (
      <FormattedMessage id="ResponsiveImage.noImage" />
    );
    return (
      <div className={noImageClasses}>
        <div className={css.noImageWrapper}>
          <NoImageIcon className={css.noImageIcon} />
          <div className={css.noImageText}>{noImageMessageText}</div>
        </div>
      </div>
    );
  }

  const imageVariants = image.attributes.variants;

  const srcSet = variants
    .map((variantName: TImageVariant) => {
      const variant = imageVariants[variantName];

      if (!variant) {
        // Variant not available (most like just not loaded yet)
        return null;
      }
      return `${variant.url} ${variant.width}w`;
    })
    .filter((v) => v != null)
    .join(', ');

  const style = {
    objectFit: 'cover',
  } as CSSProperties;

  const imgProps = {
    className: classes,
    src: srcSet,
    fill: true,
    style,
    ...rest,
  };

  return <Image alt={alt} {...imgProps} />;
};

export default ResponsiveImage;

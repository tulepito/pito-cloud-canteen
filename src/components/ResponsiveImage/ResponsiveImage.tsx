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

import type { CSSProperties, MutableRefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import Image from 'next/image';

import defaultFoodThumbail from '@src/assets/defaultFoodThumbnail.png';
import type { TDefaultProps, TImage, TImageVariant } from '@utils/types';

import NoImageIcon from './NoImageIcon';

import css from './ResponsiveImage.module.scss';

const PARENT_MAX_WIDTH_TO_MAKE_NO_IMAGE_ICON_SMALL = 300;
const SMALL_NO_IMAGE_ICON_WIDTH = 30;
const BIG_NO_IMAGE_ICON_WIDTH = 60;

type TResponsiveImageProps = TDefaultProps & {
  alt: string;
  noImageMessage?: string;
  image: TImage | null;
  variants?: TImageVariant[];
  sizes?: string;
  emptyType?: 'food';
  src?: string;
  style?: CSSProperties;
};

const ResponsiveImage: React.FC<TResponsiveImageProps> = (props) => {
  const {
    className,
    rootClassName,
    alt,
    image,
    variants = [],
    emptyType,
    src,
    ...rest
  } = props;

  const [noImageIconWidth, setNoImageIconWidth] = useState<number>(
    BIG_NO_IMAGE_ICON_WIDTH,
  );

  const noImageContainerRef = useRef() as MutableRefObject<HTMLDivElement>;
  const intl = useIntl();

  useEffect(() => {
    // This useEffect to make no image icon width to fit with its parent width
    if (image) return;
    if (
      noImageContainerRef.current &&
      noImageContainerRef.current.clientWidth <=
        PARENT_MAX_WIDTH_TO_MAKE_NO_IMAGE_ICON_SMALL
    ) {
      setNoImageIconWidth(SMALL_NO_IMAGE_ICON_WIDTH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(image), noImageContainerRef]);

  const classes = classNames(rootClassName || css.root, className);
  if (!image || variants.length === 0) {
    const noImageClasses = classNames(
      rootClassName || css.root,
      css.noImageContainer,
      className,
    );

    if (emptyType === 'food') {
      return (
        <>
          <Image
            src={src || defaultFoodThumbail}
            style={rest.style}
            fill
            alt={intl.formatMessage({ id: 'anh-minh-hoa' })}
          />
          {!src && (
            <>
              <div className={css.overlay} />
              <p className={css.overlayText}>
                {intl.formatMessage({ id: 'anh-minh-hoa' })}
              </p>
            </>
          )}
        </>
      );
    }

    return (
      <div className={noImageClasses} ref={noImageContainerRef}>
        <div className={css.noImageWrapper}>
          <NoImageIcon className={css.noImageIcon} width={noImageIconWidth} />
        </div>
      </div>
    );
  }

  const imageVariants = image?.attributes?.variants;

  const srcSet = variants
    .map((variantName: TImageVariant) => {
      const variant = imageVariants?.[variantName];

      if (!variant) {
        // Variant not available (most like just not loaded yet)
        return null;
      }

      return `${variant.url} ${variant.width}w`;
    })
    .filter((v) => v != null)[0];

  const style = {
    objectFit: 'cover',
    ...rest.style,
  } as CSSProperties;

  const imgProps = {
    className: classes,
    src: srcSet!,
    fill: true,
    style,
    ...rest,
  };

  return srcSet ? <Image alt={alt} {...imgProps} /> : null;
};

export default ResponsiveImage;

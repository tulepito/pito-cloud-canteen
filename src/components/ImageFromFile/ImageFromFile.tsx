import Promised from '@components/Promised/Promised';
import classNames from 'classnames';
import Image from 'next/image';
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import css from './ImageFromFile.module.scss';

type TImageFromFile = {
  className: string;
  rootClassName: string;
  aspectRatioClassName?: string;
  file: File;
  id: string;
  children: ReactNode;
};

// readImage returns a promise which is resolved
// when FileReader has loaded given file as dataURL
const readImage = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: any) => resolve(e.target.result);
    reader.onerror = (e: any) => {
      // eslint-disable-next-line
      console.error(
        'Error (',
        e,
        `) happened while reading ${file.name}: ${e.target.result}`,
      );
      reject(new Error(`Error reading ${file.name}: ${e.target.result}`));
    };
    reader.readAsDataURL(file);
  });

// Create elements out of given thumbnail file
const ImageFromFile: React.FC<TImageFromFile> = (props) => {
  const [promisedImage, setPromisedImage] = useState<any>();

  const { className, rootClassName, aspectRatioClassName, file, id, children } =
    props;

  useEffect(() => {
    setPromisedImage(readImage(file));
  }, []);
  const classes = classNames(rootClassName || css.root, className);
  const aspectRatioClasses = aspectRatioClassName || css.aspectWrapper;
  return (
    <Promised
      key={id}
      promise={promisedImage}
      renderFulfilled={(dataURL: string) => {
        return (
          <div className={classes}>
            <div className={css.threeToTwoWrapper}>
              <div className={aspectRatioClasses}>
                <Image
                  src={dataURL}
                  fill={true}
                  alt={file.name}
                  className={css.rootForImage}
                />
              </div>
            </div>
            {children}
          </div>
        );
      }}
      renderRejected={() => (
        <div className={classes}>
          <FormattedMessage id="ImageFromFile.couldNotReadFile" />
        </div>
      )}
    />
  );
};

export default ImageFromFile;

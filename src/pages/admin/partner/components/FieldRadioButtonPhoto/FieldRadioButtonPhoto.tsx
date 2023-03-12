import type { ReactNode } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import FieldPhotoUpload from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import type { TObject } from '@utils/types';
import { nonEmptyImage } from '@utils/validators';

import css from './FieldRadioButtonPhoto.module.scss';

type TImageUploadFnReturnValue = {
  payload: TObject;
};

type TFieldRadioButtonPhoto = {
  name: string;
  options: any[];
  className?: string;
  label?: string;
  description?: string | ReactNode;
  values?: any;
  image: any;
  accept: string;
  variants: string[];
  onImageUpload: (params: {
    id: string;
    file: File;
  }) => Promise<TImageUploadFnReturnValue>;
  onRemoveImage: (e: any) => void;
  uploadImageError: any;
};

const FieldRadioButtonPhoto: React.FC<TFieldRadioButtonPhoto> = (props) => {
  const {
    name,
    options = [],
    className,
    label,
    description,
    values,
    image,
    variants,
    onImageUpload,
    onRemoveImage,
    uploadImageError,
  } = props;

  const intl = useIntl();

  return (
    <div className={classNames(css.field, className)}>
      {label && <p className={css.label}>{label}</p>}
      {description && <p className={css.description}>{description}</p>}
      {options.map((opt: any) => {
        return (
          <div key={opt.id} className={css.option}>
            <FieldRadioButton
              id={opt.id}
              label={opt.label}
              name={`${name}.status`}
              value={opt.key}
            />
            {values[name]?.status === 'yes' && opt.hasImage && (
              <FieldPhotoUpload
                id={`${name}.image`}
                name={`${name}.image`}
                className={css.inputImage}
                image={image}
                variants={variants}
                onImageUpload={onImageUpload}
                onRemoveImage={onRemoveImage}
                uploadImageError={uploadImageError}
                validate={nonEmptyImage(
                  intl.formatMessage({
                    id: 'FieldRadioButtonPhoto.imageRequired',
                  }),
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FieldRadioButtonPhoto;

import FieldPhotoUpload from '@components/FieldPhotoUpload/FieldPhotoUpload';
import FieldRadioButton from '@components/FieldRadioButton/FieldRadioButton';
import { nonEmptyImage } from '@utils/validators';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './FieldRadioButtonPhoto.module.scss';

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
  onImageUpload: (e: any) => void;
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
              value={opt.value}
            />
            {values[name]?.status === 'yes' && opt.hasImage && (
              <FieldPhotoUpload
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

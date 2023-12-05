import { useEffect, useRef } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import { AvatarLarge } from '@components/Avatar/Avatar';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import Icons from '@components/Icons/Icons';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import ImageFromFile from '@components/ImageFromFile/ImageFromFile';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TImageActionPayload } from '@redux/slices/uploadImage.slice';
import { uploadImageThunks } from '@redux/slices/uploadImage.slice';
import { User } from '@utils/data';
import { isUploadImageOverLimitError } from '@utils/errors';
import type { TCurrentUser, TUser } from '@utils/types';
import {
  composeValidators,
  phoneNumberFormatValid,
  required,
} from '@utils/validators';

import css from './ContactPointProfileForm.module.scss';

const ACCEPT_IMAGES = 'image/*';
export type TContactPointProfileFormValues = {
  avatar?: File;
  displayName: string;
  email: string;
  phoneNumber: string;
};

type TExtraProps = {
  bookerAccount: TUser | TCurrentUser;
  formRef: any;
  setFormDisabled: (value: boolean) => void;
};
type TContactPointProfileFormComponentProps =
  FormRenderProps<TContactPointProfileFormValues> & Partial<TExtraProps>;
type TContactPointProfileFormProps = FormProps<TContactPointProfileFormValues> &
  TExtraProps;

const ContactPointProfileFormComponent: React.FC<
  TContactPointProfileFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    bookerAccount,
    form,
    formRef,
    pristine,
    invalid,
    setFormDisabled,
  } = props;
  formRef.current = handleSubmit;
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const image = useAppSelector(
    (state) => state.uploadImage.image,
    shallowEqual,
  );
  const uploadInProgress = useAppSelector(
    (state) => state.uploadImage.uploadImageInProgress,
  );
  const fileUploadImageError = useAppSelector(
    (state) => state.uploadImage.uploadImageError,
  );

  useEffect(() => {
    const disabled = invalid || pristine;
    setFormDisabled?.(disabled);
  }, [pristine, invalid, setFormDisabled]);

  const imageLabelRef = useRef(null);

  const profileImageId = bookerAccount?.profileImage
    ? bookerAccount?.profileImage.id
    : null;
  const profileImage = image || { imageId: profileImageId };
  const transientUserProfileImage =
    profileImage.uploadedImage || bookerAccount?.profileImage;
  const transientUser = {
    ...bookerAccount,
    profileImage: transientUserProfileImage,
  } as TCurrentUser;

  const fileExists = !!profileImage.file;

  const uploadingOverlay = !image?.imageId ? (
    <div className={css.thumbnailLoading}>
      <IconSpinner />
    </div>
  ) : null;

  const fileUploadInProgress = uploadInProgress && fileExists;
  const imageFromFile =
    fileExists && fileUploadInProgress ? (
      <ImageFromFile
        id={profileImage.id}
        rootClassName={css.uploadingImage}
        aspectRatioClassName={css.squareAspectRatio}
        file={profileImage.file}>
        {uploadingOverlay}
      </ImageFromFile>
    ) : null;
  const avatarComponent =
    !fileUploadInProgress && profileImage.imageId ? (
      <AvatarLarge
        className={css.avatarImg}
        user={transientUser}
        disableProfileLink
      />
    ) : null;
  const chooseAvatarLabel =
    profileImage?.imageId || fileUploadInProgress ? (
      <div className={css.avatarContainer}>
        {imageFromFile}
        {avatarComponent}
        <div className={css.camera}>
          <Icons.Camera />
        </div>
      </div>
    ) : (
      <div className={css.avatarPlaceholder}>
        <div className={css.textLabel}>
          {User(bookerAccount as TUser).getProfile().abbreviatedName}
        </div>
        <div className={css.camera}>
          <Icons.Camera />
        </div>
      </div>
    );

  const onImageUpload = async ({ id, file }: TImageActionPayload) => {
    await dispatch(uploadImageThunks.uploadImage({ id, file }));
  };

  return (
    <Form className={css.container} onSubmit={handleSubmit}>
      <div className={css.avatar}>
        <Field
          accept={ACCEPT_IMAGES}
          id="avatar"
          name="avatar"
          label={chooseAvatarLabel}
          type="file"
          form={null}
          uploadImageError={fileUploadImageError}
          disabled={fileUploadInProgress}>
          {(fieldProps) => {
            const { accept, id, input, label, disabled, uploadImageError } =
              fieldProps;
            const { name, type } = input;
            const onChange = async (e: any) => {
              const file = e.target.files[0];
              form.change(`avatar`, file);
              form.blur(`avatar`);
              if (file != null) {
                const tempId = `${file.name}_${Date.now()}`;
                await onImageUpload({ id: tempId, file });
              }
            };

            let error = null;

            if (isUploadImageOverLimitError(uploadImageError)) {
              error = (
                <div className={css.error}>
                  {intl.formatMessage({
                    id: 'ContactPointProfileForm.limitSize',
                  })}
                </div>
              );
            } else if (uploadImageError) {
              error = (
                <div className={css.error}>
                  {intl.formatMessage({
                    id: 'ContactPointProfileForm.uploadImageError',
                  })}
                </div>
              );
            }

            return (
              <>
                <div className={css.uploadAvatarWrapper}>
                  <label ref={imageLabelRef} className={css.label} htmlFor={id}>
                    {label}
                  </label>
                  <input
                    accept={accept}
                    id={id}
                    name={name}
                    className={css.uploadAvatarInput}
                    disabled={disabled}
                    onChange={onChange}
                    type={type}
                  />
                </div>

                {error}
              </>
            );
          }}
        </Field>
      </div>
      <div className={css.profile}>
        <FieldTextInput
          id="displayName"
          name="displayName"
          className={css.fieldInput}
          label={intl.formatMessage({
            id: 'ContactPointProfileForm.displayName.label',
          })}
          labelClassName={css.label}
          placeholder={intl.formatMessage({
            id: 'ContactPointProfileForm.displayName.placeholder',
          })}
          validate={required(
            intl.formatMessage({
              id: 'ContactPointProfileForm.displayName.required',
            }),
          )}
        />
        <FieldTextInput
          id="email"
          name="email"
          className={css.fieldInput}
          label={intl.formatMessage({
            id: 'ContactPointProfileForm.email.label',
          })}
          labelClassName={css.label}
          disabled
          placeholder={intl.formatMessage({
            id: 'ContactPointProfileForm.email.placeholder',
          })}
          validate={required(
            intl.formatMessage({
              id: 'ContactPointProfileForm.email.required',
            }),
          )}
        />
        <FieldTextInput
          id="phoneNumber"
          name="phoneNumber"
          className={css.fieldInput}
          label={intl.formatMessage({
            id: 'ContactPointProfileForm.phoneNumber.label',
          })}
          labelClassName={css.label}
          placeholder={intl.formatMessage({
            id: 'ContactPointProfileForm.phoneNumber.placeholder',
          })}
          validate={composeValidators(
            phoneNumberFormatValid(
              intl.formatMessage({
                id: 'ContactPointProfileForm.phoneNumber.format',
              }),
            ),
            required(
              intl.formatMessage({
                id: 'ContactPointProfileForm.phoneNumber.required',
              }),
            ),
          )}
        />
      </div>
    </Form>
  );
};

const ContactPointProfileForm: React.FC<TContactPointProfileFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={ContactPointProfileFormComponent} />;
};

export default ContactPointProfileForm;

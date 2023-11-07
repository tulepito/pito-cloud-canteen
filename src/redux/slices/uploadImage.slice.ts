import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities } from '@src/utils/data';
import { storableError } from '@src/utils/errors';
import type { TObject } from '@src/utils/types';
import { EImageVariants } from '@utils/enums';

// ================ Initial states ================ //
type TUploadImageState = {
  image: any;
  images: TObject;
  uploadImageInProgress: boolean;
  uploadImageError: any;
};
export type TImageActionPayload = {
  id: string;
  file: any;
};
const initialState: TUploadImageState = {
  image: null,
  images: {},
  uploadImageInProgress: false,
  uploadImageError: null,
};

// ================ Thunk types ================ //
const UPLOAD_IMAGE = 'app/uploadImage/UPLOAD_IMAGE';
const UPLOAD_IMAGES = 'app/uploadImage/UPLOAD_IMAGES';

// ================ Async thunks ================ //
const uploadImage = createAsyncThunk(
  UPLOAD_IMAGE,
  async (payload: TImageActionPayload, { extra: sdk }) => {
    const { id, file } = payload;
    const bodyParams = {
      image: file,
    };
    const queryParams = {
      expand: true,
      'fields.image': [
        `variants.${EImageVariants.squareSmall}`,
        `variants.${EImageVariants.squareSmall2x}`,
        `variants.${EImageVariants.scaledLarge}`,
        `variants.${EImageVariants.landscapeCrop2x}`,
        `variants.${EImageVariants.scaledMedium}`,
        `variants.${EImageVariants.scaledXLarge}`,
      ],
    };
    const uploadImageResponse = await sdk.images.upload(
      bodyParams,
      queryParams,
    );
    const uploadedImage = uploadImageResponse.data.data;

    return {
      id,
      uploadedImage,
    };
  },
  {
    serializeError: storableError,
  },
);

const uploadImages = createAsyncThunk(
  UPLOAD_IMAGES,
  async (payload: any, { extra: sdk }) => {
    const queryParams = {
      expand: true,
      'fields.image': [
        `variants.${EImageVariants.squareSmall}`,
        `variants.${EImageVariants.squareSmall2x}`,
        `variants.${EImageVariants.scaledLarge}`,
      ],
    };
    const response = await Promise.all(
      payload.map(async (image: any) => {
        try {
          const bodyParams = {
            image: image.file,
          };
          const uploadImageResponse = denormalisedResponseEntities(
            await sdk.images.upload(bodyParams, queryParams),
          )[0];

          return {
            id: image.id,
            imageId: uploadImageResponse.id.uuid,
            uploadedImage: uploadImageResponse,
          };
        } catch (error) {
          console.error(`Upload image ${image.id} error:`, error);

          return {
            id: image.id,
            imageId: null,
            uploadedImage: null,
            uploadError: storableError(error),
          };
        }
      }),
    );

    return response;
  },
);

export const uploadImageThunks = { uploadImage, uploadImages };

// ================ Slice ================ //
const uploadImageSlice = createSlice({
  name: 'uploadImage',
  initialState,
  reducers: {
    resetImage: (state) => ({
      ...state,
      ...initialState,
    }),
    removeImage: (state, { payload }) => ({
      ...state,
      images: Object.keys(state.images).reduce((result, image: any) => {
        if (image !== payload) {
          return {
            ...result,
            [image]: state.images[image],
          };
        }

        return result;
      }, {}),
    }),
    addImages: (state, { payload }) => ({
      ...state,
      images: payload,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state, { meta }) => {
        state.uploadImageInProgress = true;
        state.uploadImageError = null;
        state.image = {
          ...meta.arg,
        };
      })
      .addCase(uploadImage.fulfilled, (state, { payload }) => {
        const { id, uploadedImage } = payload;
        const { file } = state.image || {};
        const image = {
          id,
          imageId: uploadedImage.id,
          file,
          uploadedImage,
        };

        return {
          ...state,
          uploadImageInProgress: false,
          image,
        };
      })
      .addCase(uploadImage.rejected, (state, { error }) => {
        state.image = null;
        state.uploadImageInProgress = false;
        state.uploadImageError = error.message;
      })

      .addCase(uploadImages.pending, (state, { meta }) => {
        const { images } = state;

        return {
          ...state,
          uploadImageInProgress: true,
          uploadImageError: null,
          images: {
            ...images,
            ...meta.arg.reduce((result: any, image: TImageActionPayload) => {
              return {
                ...result,
                [image.id]: {
                  ...image,
                },
              };
            }, {}),
          },
        };
      })
      .addCase(uploadImages.fulfilled, (state, { payload }) => {
        const { images = {} }: { images: TObject } = state;
        const newImages = Object.keys(images).reduce(
          (result: any, image: any) => {
            const uploadedImage = payload.find((_image) => _image.id === image);

            return {
              ...result,
              [image]: {
                ...images[image],
                ...uploadedImage,
              },
            };
          },
          {},
        );

        return {
          ...state,
          uploadImageInProgress: false,
          images: newImages,
        };
      })
      .addCase(uploadImages.rejected, (state, { error }) => {
        state.images = {};
        state.uploadImageInProgress = false;
        state.uploadImageError = error.message;
      });
  },
});

export const { resetImage, removeImage, addImages } = uploadImageSlice.actions;
// ================ Actions ================ //
export default uploadImageSlice.reducer;

// ================ Selectors ================ //

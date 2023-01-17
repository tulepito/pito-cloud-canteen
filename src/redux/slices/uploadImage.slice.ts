import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';

// ================ Initial states ================ //
type TUploadImageState = {
  image: any;
  uploadImageInProgress: boolean;
  uploadImageError: any;
};
export type TImageActionPayload = {
  id: string;
  file: any;
};
const initialState: TUploadImageState = {
  image: null,
  uploadImageInProgress: false,
  uploadImageError: null,
};

// ================ Thunk types ================ //
const UPLOAD_IMAGE = 'app/uploadImage/UPLOAD_IMAGE';

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
);
export const uploadImageThunks = { uploadImage };

// ================ Slice ================ //
const uploadImageSlice = createSlice({
  name: 'uploadImage',
  initialState,
  reducers: {
    resetImage: (state) => ({
      ...state,
      ...initialState,
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
      });
  },
});

// ================ Actions ================ //
export default uploadImageSlice.reducer;

// ================ Selectors ================ //

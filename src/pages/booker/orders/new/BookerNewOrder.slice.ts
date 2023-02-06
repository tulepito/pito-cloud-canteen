import { createAsyncThunk } from '@redux/redux.helper';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import { createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

// ================ Initial states ================ //
type TBookerNewOrderState = {
  submitInprogress: boolean;
  submitError: any | null;
};
const initialState: TBookerNewOrderState = {
  submitInprogress: false,
  submitError: null,
};

// ================ Thunk types ================ //
const CREATE_DRAFT_ORDER = 'app/bookerNewOrder/createDraftOrder';

// ================ Async thunks ================ //
const createDraftOrder = createAsyncThunk(
  CREATE_DRAFT_ORDER,
  (data: any, { dispatch }) => {
    dispatch(updateDraftMealPlan(data));
  },
  {
    serializeError: storableError,
  },
);

export const BookerNewOrderThunks = { createDraftOrder };

// ================ Slice ================ //
const BookerNewOrderSlice = createSlice({
  name: 'BookerNewOrder',
  initialState,
  reducers: {},
  extraReducers: () => {},
});

// ================ Actions ================ //
export const BookerNewOrderAction = BookerNewOrderSlice.actions;
export default BookerNewOrderSlice.reducer;

// ================ Selectors ================ //

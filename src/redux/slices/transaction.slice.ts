import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import type { TTransaction } from '@utils/types';

// ================ Initial states ================ //
type TTransactionSliceState = {
  subTransactions: TTransaction[];
};
const initialState: TTransactionSliceState = {
  subTransactions: [],
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //

const participantReviewOrder = createAsyncThunk(
  'app/transaction/PARTICIPANT_REVIEW_ORDER',
  async () => {},
);

export const transactionSliceThunks = { participantReviewOrder };

// ================ Slice ================ //
const transactionSliceSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
  extraReducers: () => {},
});

// ================ Actions ================ //
export const transactionSliceAction = transactionSliceSlice.actions;
export default transactionSliceSlice.reducer;

// ================ Selectors ================ //

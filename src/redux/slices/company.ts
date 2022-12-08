import { createSlice } from '@reduxjs/toolkit';

interface CompanyState {
  companyName: string;
}

const initialState: CompanyState = {
  companyName: '',
};
export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    addCompanyName: (state, action) => {
      return {
        ...state,
        companyName: action.payload,
      };
    },
  },
  extraReducers: () => {},
});

export const { addCompanyName } = companySlice.actions;

export default companySlice.reducer;

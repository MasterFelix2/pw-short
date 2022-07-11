import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = { infDivs: 0, tankDivs: 0}

export const deployableDivsSlice = createSlice({
  name:"deployableDivs",
  initialState: {value: initialStateValue},
  reducers: {
    setDeployableDivs: ( state, action ) => {
        state.value = action.payload;
    },
  }
});

export const { setDeployableDivs } = deployableDivsSlice.actions;
export default deployableDivsSlice.reducer;
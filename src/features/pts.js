import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = { pts:0}

export const ptsSlice = createSlice({
  name:"pts",
  initialState: {value: initialStateValue},
  reducers: {
    setPts: ( state, action ) => {
        state.value = action.payload;
    },
  }
});

export const { setPts } = ptsSlice.actions;
export default ptsSlice.reducer;

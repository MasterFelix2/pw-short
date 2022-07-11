import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = { timeframe: 1}

export const selectionSlice = createSlice({
  name:"selection",
  initialState: {value: initialStateValue},
  reducers: {
    addSelection: ( state, action ) => {
        state.value = action.payload;
    },
  }
});

export const { addSelection } = selectionSlice.actions;
export default selectionSlice.reducer;

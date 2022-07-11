import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = { freeAttacks:0, freeMoves: 0, distance: 1}

export const freeMovesSlice = createSlice({
  name:"freeMoves",
  initialState: {value: initialStateValue},
  reducers: {
    addFreeMoves: ( state, action ) => {
        state.value = action.payload;
    },
  }
});

export const { addFreeMoves } = freeMovesSlice.actions;
export default freeMovesSlice.reducer;
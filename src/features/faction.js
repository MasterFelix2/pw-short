import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = { faction: "", nonFaction: ""}

export const factionSlice = createSlice({
  name:"faction",
  initialState: {value: initialStateValue},
  reducers: {
    setFaction: ( state, action ) => {
        state.value = action.payload;
    },
  }
});

export const { setFaction } = factionSlice.actions;
export default factionSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = { type:"", description:"", done:false}

export const taskSlice = createSlice({
    name:"task",
    initialState: {value: initialStateValue},
    reducers: {
        addTask: ( state, action ) => {
            state.value = action.payload;
        },
        removeTask: (state) => {
            state.value = initialStateValue;
        }
    }
});

export const { addTask, removeTask } = taskSlice.actions;
export default taskSlice.reducer;
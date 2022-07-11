import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit"
import { Provider } from "react-redux"
import userReducer from "./features/users"
import taskReducer from "./features/tasks"
import deployableDivsReducer from "./features/deployableDivs"
import selectionReducer from './features/selection';
import ptsReducer from "./features/pts"
import freeMovesReducer from "./features/freeMoves"
import factionReducer from "./features/faction"
import { CookiesProvider } from 'react-cookie';
//import { persistStore, persistReducer } from 'redux-persist';

const store = configureStore({
  reducer: {
    faction: factionReducer,
    deployableDivs: deployableDivsReducer,
    freeMoves: freeMovesReducer,
    user: userReducer,
    task: taskReducer,
    selection: selectionReducer,
    pts: ptsReducer,
  }
});

ReactDOM.render(
  <CookiesProvider>
   <Provider store={store}>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </Provider>
  </CookiesProvider>
  ,document.getElementById('root')
);

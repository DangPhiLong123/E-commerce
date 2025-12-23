import { configureStore } from "@reduxjs/toolkit";
import appSlice from './appSlice'
import storage from 'redux-persist/lib/storage'
import { userSlice } from "./userSlice";
import cartSlice from './cartSlice';
import wishlistSlice from './wishlistSlice';
import { persistReducer, persistStore, FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER } from 'redux-persist'

const commonConfig = {
  key: 'shop/user',
  storage
}

const userConfig = {
  ...commonConfig,
  whitelist: ['isLoggedIn', 'token', 'current']
}

// Thêm config cho cart
const cartConfig = {
  key: 'shop/cart',
  storage,
  whitelist: ['items']
}

export const store = configureStore({
  reducer: {
    app: appSlice,
    user: persistReducer(userConfig, userSlice.reducer),
    cart: persistReducer(cartConfig, cartSlice),
    wishlist: wishlistSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  })
});

export const persistor = persistStore(store)

export default store;

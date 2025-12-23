import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
  },
  reducers: {
    addToWishlist: (state, action) => {
      const { product } = action.payload;
      const existing = state.items.find(item => item._id === product._id);
      if (!existing) {
        state.items.push(product);
      }
    },
    removeFromWishlist: (state, action) => {
      const { productId } = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
  }
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;




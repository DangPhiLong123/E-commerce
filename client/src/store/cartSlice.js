import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, variant } = action.payload;
      const existing = state.items.find(
        item => item.product._id === product._id && JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity, variant });
      }
    },
    updateQuantity: (state, action) => {
      const { productId, variant, amount } = action.payload;
      const itemIndex = state.items.findIndex(
        i => i.product._id === productId && JSON.stringify(i.variant) === JSON.stringify(variant)
      );
      if (itemIndex !== -1) {
        const newQuantity = state.items[itemIndex].quantity + amount;
        if (newQuantity <= 0) {
          // Xóa sản phẩm nếu quantity <= 0
          state.items.splice(itemIndex, 1);
        } else {
          // Cập nhật quantity
          state.items[itemIndex].quantity = newQuantity;
        }
      }
    },
    removeFromCart: (state, action) => {
      const { productId, variant } = action.payload;
      state.items = state.items.filter(
        item => !(item.product._id === productId && JSON.stringify(item.variant) === JSON.stringify(variant))
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCart: (state, action) => {
      state.items = action.payload;
    },
    // Có thể thêm các action khác như clearCart
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer; 
import React, {useEffect} from "react";
import { Route, Routes } from "react-router-dom";
import { Login, Home, Public, Products, Blogs, DetailProduct, Services, FAQ, FinalRegister, ResetPassword } from "./pages/public";
import { Dashboard, ManageProducts, CreateProducts, ManageUser, ManageOrder, AdminLayout, CustomizeVarriants, Analytics } from "./pages/admin";
import { MemberLayout, Personal, MyCart, Wishlist, History, CheckOut } from "./pages/member";
import path from "./ultils/path";
import {getCategories} from './store/asyncActions'
import {useDispatch, useSelector} from 'react-redux'
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { Cart } from "components";
import { showCart } from "store/appSlice";
import { setCart, clearCart } from 'store/cartSlice';
import { setWishlist } from 'store/wishlistSlice';

function App() {
  const dispatch = useDispatch()
  const {isShowCart} = useSelector(state => state.app)
  const user = useSelector(state => state.user.current);
  const isLoggedIn = useSelector(state => state.user.isLoggedIn);
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);
  // Sync cart per user
  useEffect(() => {
    if (isLoggedIn && user?._id) {
      // Load cart for this user from localStorage
      const userCart = localStorage.getItem(`cart_${user._id}`);
      if (userCart) {
        dispatch(setCart(JSON.parse(userCart)));
      } else {
        dispatch(setCart([]));
      }
      // Load wishlist for this user
      const userWishlist = localStorage.getItem(`wishlist_${user._id}`);
      if (userWishlist) {
        dispatch(setWishlist(JSON.parse(userWishlist)));
      } else {
        dispatch(setWishlist([]));
      }
    } else {
      dispatch(clearCart());
      dispatch(setWishlist([]));
    }
    // eslint-disable-next-line
  }, [isLoggedIn, user?._id]);

  useEffect(() => {
    if (isLoggedIn && user?._id) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(cartItems));
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(wishlistItems));
    }
  }, [cartItems, wishlistItems, isLoggedIn, user?._id]);

  useEffect (() =>{
    dispatch(getCategories())
  },[dispatch])
  return (
    <div className="min-h-screen font-main">
      {isShowCart && <div onClick={() => dispatch(showCart())} className="fixed inset-0 bg-overlay z-50 flex justify-end">
        <Cart />
      </div>}
      <Routes>
        <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.PRODUCTS} element={<Products />} />
          <Route path={path.BLOGS} element={<Blogs />} />
          <Route path={path.DETAIL_PRODUCT_CATEGORY_PID_TITLE} element={<DetailProduct />} />
          <Route path={path.OUR_SERVICES} element={<Services />} />
          <Route path={path.FAQ} element={<FAQ />} />
          {/* <Route path={path.CHECKOUT} element={<CheckOut />} /> */}
          <Route path={path.ALL} element={<Home />} />
        </Route>
        <Route path={path.ADMIN} element={<AdminLayout />}>
          <Route path={path.DASHBOARD} element={<Dashboard />} />
          <Route path={path.ANALYTICS} element={<Analytics />} />
          <Route path={path.MANAGE_PRODUCTS} element={<ManageProducts />} />
          <Route path={path.CREATE_PRODUCTS} element={<CreateProducts />} />
          <Route path={path.MANAGE_USER} element={<ManageUser />} />
          <Route path={path.MANAGE_ORDER} element={<ManageOrder />} />
          <Route path={path.CUSTOMIZE_VARIANTS} element={<CustomizeVarriants />} />
        </Route>
        <Route path={path.MEMBER} element={<MemberLayout />}>
          <Route path={path.PERSONAL} element={<Personal />} />
          <Route path={path.MY_CART} element={<MyCart />} />
          <Route path={path.WISHLIST} element={<Wishlist />} />
          <Route path={path.HISTORY} element={<History />} />
        </Route>
        <Route path={path.CHECKOUT_MEMBER} element={<CheckOut />} />
        <Route path={path.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={path.FINAL_REGISTER} element={<FinalRegister />} />
        <Route path={path.LOGIN} element={<Login />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />
    </div>
  );
}
export default App;

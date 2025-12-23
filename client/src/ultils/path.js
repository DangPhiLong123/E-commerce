const path = {
  PUBLIC: "/",
  HOME: "",
  ALL: "*",
  LOGIN: "login",
  PRODUCTS: ":category",
  BLOGS: "blogs",
  OUR_SERVICES: "services",
  FAQ: 'faqs',
  DETAIL_PRODUCT_CATEGORY_PID_TITLE: ":category/:pid/:title",
  FINAL_REGISTER: 'finalregister/:status',
  RESET_PASSWORD: 'reset-password/:token',
  CHECKOUT_MEMBER: 'member/checkout',


  //admin
  ADMIN: 'admin',
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
  MANAGE_PRODUCTS: 'manage-products',
  CREATE_PRODUCTS: 'create-products',
  MANAGE_USER: 'manage-user',
  MANAGE_ORDER: 'manage-order',


  //member
  MEMBER: 'member',
  PERSONAL: 'personal',
  MY_CART: 'my-cart',
  WISHLIST: 'wishlist',
  HISTORY: 'history',
  
  
  
  
  CUSTOMIZE_VARIANTS: 'products/:id/variants',
};

export default path;

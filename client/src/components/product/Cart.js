import React, { memo } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { showCart } from 'store/appSlice'
import withBase from 'hocs/withBase'
import { useSelector, useDispatch } from 'react-redux'
import { updateQuantity } from 'store/cartSlice'
import { useNavigate } from 'react-router-dom'
import path from 'ultils/path'

const Cart = ({dispatch: propDispatch}) => {
  // Lấy cart từ redux store
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const handleGoToDetailCart = () => {
    propDispatch(showCart());
    navigate(`/${path.MEMBER}/${path.MY_CART}`);
  };
  const handleGoToCheckout = () => {
    propDispatch(showCart());
    navigate(`/${path.CHECKOUT_MEMBER}`);
  };

  return (
    <div 
        onClick={(e) => e.stopPropagation()}
        className='w-[500px] h-screen bg-black text-white p-6 grid grid-rows-[auto,1fr,auto]'>
      <header className='border-b border-gray-700 font-bold text-2xl flex justify-between items-center h-[60px]'>
        <span>Your Cart</span>
        <span onClick={() => propDispatch(showCart())} className='cursor-pointer p-2 hover:bg-gray-700 rounded-full'>
          <AiFillCloseCircle size={24} />
        </span>
      </header>
      <section className='overflow-y-scroll scrollbar-hide'>
        {!cartItems.length && <div className='flex justify-center items-center h-full'>
            <span className='text-gray-500 text-xs italic'>No products in cart</span>
        </div>}
        {cartItems.map((item) => (
          <div key={item.product._id + JSON.stringify(item.variant)} className='flex justify-between items-center border-b border-gray-700 py-4'>
            <div className='flex items-center gap-2'>
              <img src={item.product.images?.[0] || item.product.thumb} alt={item.product.title} className='w-[100px] h-[100px] object-cover' />
              <div>
                <div className='font-semibold'>{item.product.title}</div>
                {/* Hiển thị variant nếu có */}
                {item.variant && typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && (
                  <div className='text-xs text-gray-300'>
                    {Object.entries(item.variant)
                      .filter(([key]) => !['price', 'thumb', 'images', 'title', '_id'].includes(key))
                      .map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                  </div>
                )}
                {item.variant && typeof item.variant === 'string' && (
                  <div className='text-xs text-gray-300'>{item.variant}</div>
                )}
              </div>
            </div>
            <div className='flex flex-col items-end gap-2'>
              <div className='flex items-center gap-2'>
                <button
                  className='px-2 py-1 border rounded text-lg'
                  onClick={() => dispatch(updateQuantity({ productId: item.product._id, variant: item.variant, amount: -1 }))}
                >-</button>
                <span className='px-2 py-1 border rounded'>{item.quantity}</span>
                <button
                  className='px-2 py-1 border rounded text-lg'
                  onClick={() => dispatch(updateQuantity({ productId: item.product._id, variant: item.variant, amount: 1 }))}
                >+</button>
              </div>
              <div className='font-bold text-yellow-300'>
                {(item.product.price * item.quantity).toLocaleString()} VND
              </div>
            </div>
          </div>
        ))}
      </section>
      <div className="row-span-3 h-full flex flex-col justify-end gap-2">
        <div className="flex justify-between items-center font-bold text-sm mb-2">
          <span>SUBTOTAL</span>
          <span>{subtotal.toLocaleString()} VND</span>
        </div>
        <div className="text-xs italic text-gray-300 mb-2">
          Shipping, taxes, and discounts calculated at checkout.
        </div>
        <button className="w-full py-2 bg-red-600 text-white font-semibold mb-2" onClick={handleGoToDetailCart}>SHOPPING CART &rarr;</button>
        <button className="w-full py-2 bg-red-600 text-white font-semibold" onClick={handleGoToCheckout}>CHECK OUT &rarr;</button>
      </div>
    </div>
  )
}

export default withBase(memo(Cart))

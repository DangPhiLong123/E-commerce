import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeFromWishlist } from 'store/wishlistSlice'
import { addToCart } from 'store/cartSlice'
import { useNavigate } from 'react-router-dom'
import path from 'ultils/path'
import Product from 'components/product/Product'

const Wishlist = () => {
  const wishlistItems = useSelector(state => state.wishlist.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist({ productId }));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product,
      quantity: 1,
      variant: null
    }));
  };

  return (
    <div className='w-main mx-auto my-6'>
      <h1 className='text-2xl font-semibold mb-4'>Danh sách yêu thích</h1>
      
      {wishlistItems.length === 0 ? (
        <div className='py-8 text-center text-gray-500'>
          <div className='text-lg mb-2'>Danh sách yêu thích trống</div>
          <div className='text-sm'>Bạn chưa có sản phẩm nào trong danh sách yêu thích</div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {wishlistItems.map((product) => (
            <div key={product._id} className='relative'>
              <Product 
                data={product} 
                navigate={navigate}
                dispatch={dispatch}
              />
              <div className='absolute top-2 right-2 flex gap-2'>
                <button
                  onClick={() => handleAddToCart(product)}
                  className='px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600'
                >
                  Thêm vào giỏ
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className='px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600'
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist

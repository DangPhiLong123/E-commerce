import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateQuantity, removeFromCart } from 'store/cartSlice'
import { useNavigate } from 'react-router-dom'
import path from 'ultils/path'
import Breadcrumb from 'components/layout/Breadcrumb'
import Pagination from 'components/common/Pagination';
import { useSearchParams } from 'react-router-dom';

const MyCart = () => {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemsPerPage = 4;
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = cartItems.slice(startIdx, endIdx);
  const subtotal = paginatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="w-main mx-auto my-8 px-2">
      {/* <div className="text-xl font-bold mb-2">YOUR CART</div> */}
      {/* <div className="mb-4"><Breadcrumb /></div> */}
      <div className="bg-white rounded shadow p-4">
        {cartItems.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <div className="text-lg mb-2">Giỏ hàng trống</div>
            <div className="text-sm">Bạn chưa có sản phẩm nào trong giỏ hàng</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 border-b font-bold py-2 text-center">
              <div className="col-span-6 text-left">PRODUCTS</div>
              <div className="col-span-3">QUANTITY</div>
              <div className="col-span-3 text-right pr-4">PRICE</div>
            </div>
            {paginatedItems.map(item => (
              <div key={item.product._id + JSON.stringify(item.variant)} className="grid grid-cols-12 items-center border-b py-4">
                <div className="col-span-6 flex items-center gap-4">
                  <img src={item.product.images?.[0] || item.product.thumb} alt={item.product.title} className="w-32 h-32 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{item.product.title}</div>
                    <div className="text-xs text-gray-500">
                      {item.variant && typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && (
                        Object.entries(item.variant)
                          .filter(([key]) => !['price', 'thumb', 'images', 'title', '_id'].includes(key))
                          .map(([key, value]) => `${value}`).join(' / ')
                      )}
                    </div>
                    <button
                      className="text-xs text-red-500 underline mt-1"
                      onClick={() => dispatch(removeFromCart({ productId: item.product._id, variant: item.variant }))}
                    >Remove</button>
                  </div>
                </div>
                <div className="col-span-3 flex justify-center items-center gap-2">
                  <button
                    className="px-2 py-1 border rounded text-lg"
                    onClick={() => dispatch(updateQuantity({ productId: item.product._id, variant: item.variant, amount: -1 }))}
                  >-</button>
                  <span className="px-3 py-1 border rounded bg-gray-50">{item.quantity}</span>
                  <button
                    className="px-2 py-1 border rounded text-lg"
                    onClick={() => dispatch(updateQuantity({ productId: item.product._id, variant: item.variant, amount: 1 }))}
                  >+</button>
                </div>
                <div className="col-span-3 text-right font-semibold text-lg pr-4">
                  {(item.product.price * item.quantity).toLocaleString()} VND
                </div>
              </div>
            ))}
            <Pagination
              totalItems={cartItems.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
            />
            {/* Subtotal và CHECKOUT chỉ hiển thị khi có sản phẩm */}
            <div className="flex justify-end mt-4">
              <div className="flex flex-col items-end w-80">
                <div className="flex items-center justify-end gap-10 mb-2 w-full">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold text-lg">{subtotal.toLocaleString()} VND</span>
                </div>
                <div className="text-xs italic text-gray-500 mb-2 w-full text-right">
                  Shipping, taxes, and discounts calculated at checkout.
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded font-semibold" onClick={() => navigate(`/${path.CHECKOUT_MEMBER}`)}>
                  CHECKOUT &rarr;
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyCart

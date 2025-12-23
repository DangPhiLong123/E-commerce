import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../../axios';
import { clearCart } from '../../store/cartSlice';

const CheckOut = () => {
  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.user.current);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Giữ lại để tương thích, nhưng flow mới sẽ redirect về Home với ?paid=...
    const status = searchParams.get('status');
    if (!status) return;
    if (status === 'success') {
      alert('Thanh toán thành công!');
      dispatch(clearCart());
    } else if (status === 'fail') {
      alert('Thanh toán thất bại!');
    } else if (status === 'invalid') {
      alert('Chữ ký không hợp lệ!');
    } else if (status === 'error') {
      alert('Có lỗi xảy ra khi xử lý!');
    }
  }, [dispatch, searchParams]);

  const [shippingInfo, setShippingInfo] = useState({
    name: user ? `${user.firstname} ${user.lastname}` : '',
    address: '',
    phone: '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleVNPayPayment = async () => {
    // Validation: Kiểm tra các trường bắt buộc
    if (!shippingInfo.address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }
    
    if (!shippingInfo.phone.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    // Validation: Kiểm tra định dạng số điện thoại (có thể mở rộng thêm)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingInfo.phone.trim())) {
      alert('Số điện thoại phải có từ 10-11 chữ số!');
      return;
    }

    // Validation: Kiểm tra email nếu có
    if (shippingInfo.email && !shippingInfo.email.includes('@')) {
      alert('Email không hợp lệ!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/payment/vnpay', {
        amount: subtotal,
        shippingInfo,
        cartItems,
      }, { withCredentials: true });
      if (res && res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      alert('Không lấy được link thanh toán!');
    } catch (err) {
      alert('Có lỗi khi tạo thanh toán!');
    }
    setLoading(false);
  };

  return (
    <div className="w-main mx-auto my-8 px-2">
      <div className="text-2xl font-bold mb-4">Checkout</div>
      <div className="bg-white rounded shadow p-4 max-w-xl mx-auto">
        <h2 className="font-semibold mb-2">Thông tin giao hàng</h2>
        <div className="flex flex-col gap-2 mb-4">
          <input className="border p-2 rounded" name="name" value={shippingInfo.name} onChange={handleChange} placeholder="Họ tên" />
          <div>
            <input 
              className={`border p-2 rounded w-full ${!shippingInfo.address.trim() ? 'border-red-500' : 'border-gray-300'}`} 
              name="address" 
              value={shippingInfo.address} 
              onChange={handleChange} 
              placeholder="Địa chỉ *" 
              required
            />
            {!shippingInfo.address.trim() && (
              <p className="text-red-500 text-xs mt-1">Địa chỉ là bắt buộc</p>
            )}
          </div>
          <div>
            <input 
              className={`border p-2 rounded w-full ${!shippingInfo.phone.trim() ? 'border-red-500' : 'border-gray-300'}`} 
              name="phone" 
              value={shippingInfo.phone} 
              onChange={handleChange} 
              placeholder="Số điện thoại *" 
              required
            />
            {!shippingInfo.phone.trim() && (
              <p className="text-red-500 text-xs mt-1">Số điện thoại là bắt buộc</p>
            )}
          </div>
          <input className="border p-2 rounded" name="email" value={shippingInfo.email} onChange={handleChange} placeholder="Email" />
        </div>
        <h2 className="font-semibold mb-2">Đơn hàng</h2>
        <ul className="mb-4">
          {cartItems.map(item => (
            <li key={item.product._id + JSON.stringify(item.variant)} className="flex justify-between border-b py-1">
              <span>{item.product.title} x {item.quantity}</span>
              <span>{(item.product.price * item.quantity).toLocaleString()} VND</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg mb-4">
          <span>Tổng cộng</span>
          <span>{subtotal.toLocaleString()} VND</span>
        </div>
        <button
          className={`w-full py-2 rounded font-semibold ${
            !shippingInfo.address.trim() || !shippingInfo.phone.trim() || loading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={handleVNPayPayment}
          disabled={!shippingInfo.address.trim() || !shippingInfo.phone.trim() || loading}
        >
          {loading ? 'Đang chuyển hướng...' : 'Thanh toán VNPay'}
        </button>
        {(!shippingInfo.address.trim() || !shippingInfo.phone.trim()) && (
          <p className="text-red-500 text-xs mt-2 text-center">
            Vui lòng nhập đầy đủ thông tin giao hàng để tiếp tục
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckOut;

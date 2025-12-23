const express = require('express');
const router = express.Router();
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const Order = require('../models/order');
const User = require('../models/user');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Thông tin cấu hình VNPay (bạn cần thay bằng thông tin thật của bạn)
const vnp_TmnCode = '753M85PQ';
const vnp_HashSecret = '2XRTOERHLMXUXM3Z76SIM9YEJJUFM2Y4';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:5000/api/payment/vnpay_return'; // Backend endpoint nhận kết quả từ VNPay
// Base URL của frontend để redirect người dùng sau khi thanh toán
const frontendBaseUrl = process.env.CLIENT_URL || 'http://localhost:3000';

// Đảm bảo vnp_OrderInfo không có ký tự đặc biệt
// Đảm bảo vnp_ReturnUrl là frontend, KHÔNG dùng làm IPN
// Đăng ký IPN URL là backend, ví dụ: http://localhost:5000/api/payment/vnpay_ipn

router.post('/vnpay', verifyAccessToken, async (req, res) => {
  try {
    const { amount, cartItems } = req.body;
    const orderId = Date.now().toString();
    // Không dùng ký tự đặc biệt, không dấu
    const orderInfo = `Thanh toan don hang DigitalXpress ${orderId}`;

    // Kiểm tra cấu hình
    console.log('vnp_TmnCode:', vnp_TmnCode);
    console.log('vnp_HashSecret:', vnp_HashSecret);
    console.log('vnp_Url:', vnp_Url);
    console.log('vnp_ReturnUrl:', vnp_ReturnUrl);

    // Tạo bản ghi đơn hàng ở trạng thái Processing (idempotent theo orderId)
    try {
      const products = Array.isArray(cartItems)
        ? cartItems.map((item) => ({
            product: item.product?._id || item.product,
            count: item.quantity || 1,
            color: item.variant?.color || item.color,
            // Lưu snapshot thông tin tại thời điểm mua
            unitPrice: item.product?.price || 0,
            variant: item.variant || null
          }))
        : [];

      await Order.create({
        products,
        status: 'Processing',
        total: amount,
        transactionId: orderId, // lưu TxnRef làm tham chiếu
        paymentMethod: 'vnpay',
        orderBy: req.user._id,
      });
    } catch (e) {
      // Nếu lỗi tạo đơn hàng, dừng
      console.error('Create order error:', e);
      return res.status(500).json({ error: 'Cannot create order' });
    }

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1',
      vnp_CreateDate: moment().format('YYYYMMDDHHmmss')
    };

    // Sắp xếp và encode value
    const vnp_Params_Sorted = sortObject(vnp_Params);
    // Tạo signData KHÔNG encode (theo chuẩn VNPay)
    const signData = Object.keys(vnp_Params_Sorted).map(key => key + '=' + vnp_Params_Sorted[key]).join('&');
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params_Sorted['vnp_SecureHash'] = signed;
    // Khi tạo URL redirect, encode=true
    const paymentUrl = vnp_Url + '?' + Object.keys(vnp_Params_Sorted).map(key => key + '=' + vnp_Params_Sorted[key]).join('&');
    return res.json({ paymentUrl });
  } catch (err) {
    console.error('VNPay error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// VNPay IPN endpoint: Đăng ký URL này trên portal VNPay để nhận thông báo giao dịch
// Ví dụ: http://localhost:5000/api/payment/vnpay_ipn
router.get('/vnpay_ipn', async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa hash khỏi params để xác thực
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sort lại params
    const sortedParams = sortObject(vnp_Params);
    const signData = Object.keys(sortedParams).map(key => key + '=' + sortedParams[key]).join('&');
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00') {
      // Cập nhật trạng thái đơn hàng và xóa giỏ hàng server (idempotent)
      const orderId = vnp_Params['vnp_TxnRef'];
      const order = await Order.findOneAndUpdate(
        { transactionId: orderId },
        { status: 'Succeed', paidAt: new Date() },
        { new: true }
      );
      if (order?.orderBy) {
        await User.findByIdAndUpdate(order.orderBy, { cart: [] });
      }
      return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature or payment failed' });
    }
  } catch (err) {
    return res.status(500).json({ RspCode: '99', Message: 'Server error' });
  }
});
router.get('/vnpay_return', async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = sortObject(vnp_Params);
    const signData = Object.keys(sortedParams).map(key => key + '=' + sortedParams[key]).join('&');
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        // Thanh toán thành công: cập nhật đơn hàng và xóa giỏ hàng server
        const orderId = vnp_Params['vnp_TxnRef'];
        const order = await Order.findOneAndUpdate(
          { transactionId: orderId },
          { status: 'Succeed', paidAt: new Date() },
          { new: true }
        );
        if (order?.orderBy) {
          await User.findByIdAndUpdate(order.orderBy, { cart: [] });
        }
        // Redirect về Home và kèm tham số để frontend hiển thị thông báo + clear cart local
        return res.redirect(`${frontendBaseUrl}/?paid=success`);
      } else {
        // Thanh toán thất bại
        return res.redirect(`${frontendBaseUrl}/?paid=fail`);
      }
    } else {
      // Sai chữ ký
      return res.redirect(`${frontendBaseUrl}/?paid=invalid`);
    }
  } catch (err) {
    return res.redirect(`${frontendBaseUrl}/?paid=error`);
  }
});


// Hàm sắp xếp object theo key và encode value theo chuẩn VNPay
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    // Encode value theo chuẩn VNPay: encodeURIComponent và thay %20 bằng +
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = router;

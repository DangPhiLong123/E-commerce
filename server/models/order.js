const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    products:[{
        product: {type: mongoose.Types.ObjectId, ref: 'Product'},
        count: Number,
        color: String,
        // Lưu snapshot biến thể đã chọn tại thời điểm mua
        variant: {
            type: Object,
        },
        // Lưu đơn giá tại thời điểm mua để hiển thị lịch sử chính xác
        unitPrice: {
            type: Number,
        }
    }],
    status:{
        type:String,
        default: 'Created',
        enum: ['Created', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'Returned', 'Succeed']
    },
    total: Number,
    // Thông tin thanh toán/giao dịch
    transactionId: {
        type: String,
    },
    paymentMethod: {
        type: String,
        default: 'vnpay'
    },
    paidAt: {
        type: Date,
    },
    coupon: {
        type: mongoose.Types.ObjectId,
        ref: 'Coupon'
    },
    orderBy:{
        type:mongoose.Types.ObjectId,
        ref: 'User'
        
    },
},{ timestamps: true });

//Export the model
module.exports = mongoose.model('Order', orderSchema);
const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: Array,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    thumb: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
    },
    variants: [{
      color: { type: String },
      price: { type: Number },
      thumb: { type: String },
      images: [{ type: String }],
      title: { type: String },
      sku: { type: String }
    }],
    priceVariants: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    colorVariants: [String],
    color: {
      type: String,
    },
    ratings: [
      {
        star: { type: Number },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number,
    },
    saleStartDate: {
      type: Date,
    },
    saleEndDate: {
      type: Date,
    },
    saleType: {
      type: String,
      enum: ["flash_sale", "daily_deal", "clearance", "promotion"],
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    infomations: {
      type: Object,
      default: {
        DESCRIPTION: "",
        WARRANTY: "",
        DELIVERY: "",
        PAYMENT: ""
      }
    }
  },
  {
    timestamps: true,
  }
);

// Middleware để validate variants và tự động tính giá sale
productSchema.pre("save", function (next) {
  // Loại bỏ variants rỗng hoặc không hợp lệ
  if (this.variants && this.variants.length > 0) {
    this.variants = this.variants.filter(variant => {
      // Chỉ giữ lại variants có đầy đủ color và price
      return variant.color && variant.price;
    });
  }
  
  // Tự động tính giá sale khi set discountPercent
  if (this.isOnSale && this.discountPercent) {
    this.salePrice = Math.round(this.price * (1 - this.discountPercent / 100));
  }
  next();
});

//Export the model
module.exports = mongoose.model("Product", productSchema);

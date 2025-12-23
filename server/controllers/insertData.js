const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const data = require("../../data/digitalXpress.json");
const slugify = require("slugify");
const categoryData = require("../../data/cate_brand");
const ProductCategory = require("../models/productCategory");

const fn = async (product) => {
  // Tạo slug unique với timestamp
  const baseSlug = slugify(product?.name, { lower: true, strict: true });
  const timestamp = Date.now();
  const uniqueSlug = `${baseSlug}-${timestamp}`;
  
  await Product.create({
    title: product?.name,
    slug: uniqueSlug,
    description: product?.description,
    brand: product?.brand,
    price: Math.round(Number(product?.price?.match(/\d/g).join("")) / 100),
    category: product?.category[1],
    quantity: Math.round(Math.random() * 1000),
    sold: Math.round(Math.random() * 100),
    images: product?.images,
    color: product?.variants?.find((el) => el.label === "Color")?.variants[0],
    thumb: product?.thumb,
    totalRatings: Math.round(Math.random() * 5),
    variants: product?.variants || [],
    infomations: product?.infomations || {}
  });
};

const insertProduct = asyncHandler(async (req, res) => {
  try {
    // Xóa tất cả sản phẩm có sẵn để tránh trùng lặp
    await Product.deleteMany({});
    console.log("Đã xóa tất cả sản phẩm cũ");
    
    const promises = [];
    for (let product of data) promises.push(fn(product));
    await Promise.all(promises);
    
    return res.json({ 
      success: true, 
      message: "Chèn dữ liệu sản phẩm thành công",
      count: data.length
    });
  } catch (error) {
    console.error("Lỗi khi chèn dữ liệu:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi khi chèn dữ liệu sản phẩm",
      error: error.message
    });
  }
});

const fn2 = async (cate) => {
  await ProductCategory.create({
    title: cate?.cate,
    brand: cate?.brand,
    image: cate?.image
  });
};

const insertCategory = asyncHandler(async (req, res) => {
  try {
    const promises = [];
    console.log(categoryData);
    for (let cate of categoryData) promises.push(fn2(cate));
    await Promise.all(promises);
    
    return res.json({ 
      success: true, 
      message: "Chèn dữ liệu danh mục thành công",
      count: categoryData.length
    });
  } catch (error) {
    console.error("Lỗi khi chèn dữ liệu danh mục:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi khi chèn dữ liệu danh mục",
      error: error.message
    });
  }
});

module.exports = {
  insertProduct,
  insertCategory,
};

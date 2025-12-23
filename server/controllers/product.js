const { response } = require("express");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

// Helper function để tạo slug unique
const generateUniqueSlug = async (title, excludeId = null) => {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  // Tạo query condition
  const query = { slug: uniqueSlug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  // Kiểm tra slug đã tồn tại chưa
  while (await Product.findOne(query)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
    query.slug = uniqueSlug;
  }
  
  return uniqueSlug;
};

// Helper function để xử lý variants
const processVariants = (variants) => {
  if (!variants) return undefined;
  
  if (Array.isArray(variants)) {
    const validVariants = variants.filter(variant => 
      variant && variant.color && variant.price
    );
    // Nếu sau khi filter mà variants rỗng thì return undefined
    return validVariants.length > 0 ? validVariants : undefined;
  }
  
  // Nếu variants không phải array thì return undefined
  return undefined;
};

const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error("Missing input");
  
  // Tạo slug unique
  if (req.body && req.body.title) {
    req.body.slug = await generateUniqueSlug(req.body.title);
  }
  
  // Xử lý variants - loại bỏ variants rỗng hoặc không hợp lệ
  const processedVariants = processVariants(req.body.variants);
  if (processedVariants) {
    req.body.variants = processedVariants;
  } else {
    delete req.body.variants;
  }
  
  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: newProduct ? true : false,
    createdProduct: newProduct ? newProduct : "Cannot create new product",
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid);
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get product",
  });
});

const getProducts = asyncHandler(async (req, res) => {
  try {
    const queries = { ...req.query };
    
    // Tách các trường đặc biệt khỏi query
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);

    // Xây dựng query
    let searchQuery = {};

    // Xử lý tìm kiếm theo q (search term)
    if (queries.q) {
      const searchTerm = queries.q.trim();
      searchQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ];
      delete queries.q;
    }

    // Xử lý category với case-insensitive
    if (queries.category) {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push({ category: { $regex: new RegExp('^' + queries.category + '$', 'i') } });
      delete queries.category;
    }

    // Xử lý price range
    if (queries.from || queries.to) {
      if (!searchQuery.$and) searchQuery.$and = [];
      const priceQuery = {};
      if (queries.from) priceQuery.$gte = Number(queries.from);
      if (queries.to) priceQuery.$lte = Number(queries.to);
      searchQuery.$and.push({ price: priceQuery });
      delete queries.from;
      delete queries.to;
    }

    // Xử lý color với case-insensitive
    if (queries.color) {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push({ color: { $regex: new RegExp('^' + queries.color + '$', 'i') } });
      delete queries.color;
    }

    // Kết hợp với các query còn lại
    if (Object.keys(queries).length > 0) {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push(queries);
    }

    // Nếu chỉ có một điều kiện trong $and, bỏ $and
    if (searchQuery.$and && searchQuery.$and.length === 1) {
      const andCondition = searchQuery.$and[0];
      delete searchQuery.$and;
      searchQuery = { ...searchQuery, ...andCondition };
    }

    console.log('Search Query:', JSON.stringify(searchQuery, null, 2));

    // Tạo command
    let queryCommand = Product.find(searchQuery);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    // Fields limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    // Pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS || 10;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);

    // Execute query
    const products = await queryCommand.exec();
    const counts = await Product.countDocuments(searchQuery);

    console.log('Found products:', counts);

    return res.status(200).json({
      success: true,
      counts,
      products: products || []
    });
  } catch (err) {
    console.error('Error in getProducts:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  
  // Tạo slug unique (exclude sản phẩm hiện tại)
  if (req.body && req.body.title) {
    req.body.slug = await generateUniqueSlug(req.body.title, pid);
  }
  
  // Xử lý variants - loại bỏ variants rỗng hoặc không hợp lệ
  const processedVariants = processVariants(req.body.variants);
  if (processedVariants) {
    req.body.variants = processedVariants;
  } else {
    delete req.body.variants;
  }
  
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct
      ? updatedProduct
      : "Cannot not update product",
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deleteProduct: deletedProduct
      ? deletedProduct
      : "Cannot not delete product",
  });
});

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid } = req.body;

  if (!star || !pid) {
    return res.status(400).json({
      success: false,
      message: "Missing rating information or product ID",
    });
  }

  const ratingProduct = await Product.findById(pid);

  if (!ratingProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const alreadyRating = ratingProduct.ratings.some(
    (el) => el.postedBy.toString() === _id.toString()
  );

  if (alreadyRating) {
    ratingProduct.ratings = ratingProduct.ratings.map((rating) => {
      if (rating.postedBy.toString() === _id.toString()) {
        return { ...rating, star, comment, createdAt: new Date() };
      }
      return rating;
    });
  } else {
    ratingProduct.ratings.push({
      star,
      comment,
      postedBy: _id,
      createdAt: new Date()
    });
  }

  const totalRatings = ratingProduct.ratings.length;
  const sumRatings = ratingProduct.ratings.reduce((sum, r) => sum + r.star, 0);
  const averageRating = sumRatings / totalRatings;

  ratingProduct.totalRatings = averageRating;

  await ratingProduct.save();

  return res.status(200).json({
    success: true,
    product: ratingProduct,
  });
});

const uploadImagesProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!req.files) throw new Error("Missing files");
  const response = await Product.findByIdAndUpdate(
    pid,
    { $push: { images: { $each: req.files.map((el) => el.path) } } },
    { new: true }
  );
  return res.status(200).json({
    status: response ? true : false,
    updatedProduct: response ? response : "Cannot upload Images Product",
  });
});

const uploadThumbImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded')
  return res.status(200).json({
    success: true,
    url: req.file.path
  })
})

const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new Error('No files uploaded')
  return res.status(200).json({
    success: true,
    urls: req.files.map(file => file.path)
  })
})

// Thêm biến thể cho sản phẩm
const addVarriant = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { color, price, thumb, images, title, sku } = req.body;
  if (!color || !price) {
    return res.status(400).json({ success: false, message: 'Missing color or price' });
  }
  const update = {
    $push: {
      variants: { color, price, thumb, images, title, sku }
    }
  };
  const updatedProduct = await Product.findByIdAndUpdate(pid, update, { new: true });
  if (!updatedProduct) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  return res.status(200).json({ success: true, product: updatedProduct });
});

// Xóa biến thể của sản phẩm
const removeVarriant = asyncHandler(async (req, res) => {
  const { pid, variantId } = req.params;
  
  const product = await Product.findById(pid);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Tìm và xóa variant theo _id
  const variantIndex = product.variants.findIndex(variant => variant._id.toString() === variantId);
  if (variantIndex === -1) {
    return res.status(404).json({ success: false, message: 'Variant not found' });
  }

  product.variants.splice(variantIndex, 1);
  await product.save();

  return res.status(200).json({ 
    success: true, 
    message: 'Variant deleted successfully',
    product: product 
  });
});



module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImagesProduct,
  uploadThumbImage,
  uploadImages,
  addVarriant,
  removeVarriant,
};

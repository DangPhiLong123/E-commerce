import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiGetProducts } from '../../apis/product';
import { formatPrice } from '../../ultils/helpers';
import { Link } from 'react-router-dom';
import { FaHeart, FaEye } from 'react-icons/fa';
import { LuMenu } from 'react-icons/lu';
import SelectOption from '../common/SelectOption';
import Slider from 'react-slick';
import { useDispatch } from 'react-redux';
import { showModal } from 'store/appSlice';
import DetailProduct from 'pages/public/DetailProduct';
import useI18n from 'hooks/useI18n';

const NewArrivals = () => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cachedProducts, setCachedProducts] = useState({});
  const sliderRef = useRef(null);
  const dispatch = useDispatch();
  const { t } = useI18n();

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    initialSlide: 0,
    centerMode: false,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 0
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 0
        }
      }
    ]
  };

  const getCategories = (t) => [
    { id: 'all', name: t('common.all') },
    { id: 'Smartphone', name: t('common.smartphone') },
    { id: 'Tablet', name: t('common.tablet') },
    { id: 'Laptop', name: t('common.laptop') }
  ];

  const fetchProducts = useCallback(async (category, forceRefresh = false) => {
    if (cachedProducts[category] && !forceRefresh) {
      setProducts(cachedProducts[category]);
      return;
    }

    try {
      setLoading(true);
      let params = {
        sort: '-createdAt', // Tất cả đều sắp xếp theo thời gian tạo mới nhất
        limit: category === 'all' ? 30 : 10,
      };

      if (category !== 'all') {
        params.category = category;
      }

      const response = await apiGetProducts(params);
      console.log('NewArrivals API response:', response);

      if (response?.success) {
        let processedProducts;
        if (category === 'all') {
          // Lấy sản phẩm mới nhất từ tất cả categories
          // Ưu tiên sản phẩm mới nhất nhưng vẫn đảm bảo có đại diện từ mỗi category
          const categorizedProducts = {};
          response.products.forEach(product => {
            const cat = product.category;
            if (!categorizedProducts[cat]) {
              categorizedProducts[cat] = [];
            }
            categorizedProducts[cat].push(product);
          });

          // Lấy sản phẩm mới nhất từ mỗi category (tối đa 3 sản phẩm/category)
          const latestFromEachCategory = ['Smartphone', 'Tablet', 'Laptop'].reduce((acc, cat) => {
            if (categorizedProducts[cat]?.length > 0) {
              return acc.concat(categorizedProducts[cat].slice(0, 3));
            }
            return acc;
          }, []);

          // Lấy thêm sản phẩm mới nhất nói chung để đủ 12 sản phẩm
          const remainingProducts = response.products.slice(0, 12);
          
          // Kết hợp và loại bỏ trùng lặp
          const allProducts = [...latestFromEachCategory, ...remainingProducts];
          const uniqueProducts = allProducts.filter((product, index, self) => 
            index === self.findIndex(p => p._id === product._id)
          );
          
          processedProducts = uniqueProducts.slice(0, 12);
        } else {
          processedProducts = response.products;
        }

        // Validate and filter products with valid data
        processedProducts = processedProducts.filter(product => 
          product && 
          product._id && 
          product.title && 
          product.price && 
          !isNaN(product.price) && 
          product.price > 0
        );

        console.log('Processed products after filtering:', processedProducts);
        console.log('Category:', category, 'Product count:', processedProducts.length, 'Timestamp:', new Date().toLocaleTimeString());

        setCachedProducts(prev => ({
          ...prev,
          [category]: processedProducts
        }));
        setProducts(processedProducts);
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  }, [cachedProducts]);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  // Reset slider position when products change
  useEffect(() => {
    if (products && sliderRef.current) {
      sliderRef.current.slickGoTo(0);
    }
  }, [products]);

  const handleCategoryClick = useCallback((category) => {
    setActiveCategory(category);
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(0);
    }
  }, []);

  // Function to refresh all cached data
  const refreshAllProducts = useCallback(() => {
    setCachedProducts({});
    fetchProducts(activeCategory, true);
  }, [activeCategory, fetchProducts]);

  // Auto-refresh when component mounts to get latest products
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (activeCategory === 'all') {
        refreshAllProducts();
      }
    }, 30000); // Refresh every 30 seconds for 'all' category

    return () => clearInterval(refreshInterval);
  }, [activeCategory, refreshAllProducts]);

  const handleQuickView = (product) => {
    dispatch(showModal({
      isShowModal: true,
      modalChildren: (
        <DetailProduct
          isQuickView
          pid={product._id}
          title={product.title}
          category={product.category}
        />
      )
    }));
  };

  if (loading && !products) return (
    <div className='w-full min-h-[200px] flex items-center justify-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
    </div>
  );

  return (
    <div className='w-full'>
      <h3 className='text-[20px] font-semibold py-[8px] border-b-2 border-main justify-between items-center hidden lg:flex'>
        <span>{t('common.new_arrivals')}</span>
        <div className='flex items-center gap-4'>
          <div className='flex text-sm divide-x divide-gray-300'>
          {getCategories(t).map((category, index) => (
            <span
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`cursor-pointer hover:text-main transition-colors px-4 ${activeCategory === category.id ? 'text-main font-medium' : ''
                } ${index === 0 ? 'pl-0' : ''}`}
            >
              {category.name}
            </span>
          ))}
          </div>
          <button
            onClick={refreshAllProducts}
            className='text-xs text-gray-500 hover:text-main transition-colors cursor-pointer'
            title='Refresh products'
          >
            🔄
          </button>
        </div>
      </h3>
      <div className='mt-6'>
        {products && products.length > 0 ? (
          <Slider ref={sliderRef} {...settings} key={`slider-${activeCategory}`}>
            {products.map((product) => (
            <div key={product._id} className='px-3 pb-6'>
              <div className='relative group border hover:shadow-md p-5 rounded-lg bg-white transition-all duration-300 h-full flex flex-col'>
                {/* Tag NEW */}
                <div className='absolute top-4 right-4 bg-yellow-400 text-white px-3 py-1 rounded-full z-10 font-semibold text-xs shadow-sm'>
                  NEW
                </div>

                {/* Product Image */}
                <div className='w-full h-[350px] relative overflow-hidden flex items-center justify-center p-2'>
                  <img
                    src={product.thumb || 'https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png'}
                    alt={product.title}
                    className='w-full h-full object-contain transition-all duration-500 group-hover:opacity-0'
                  />

                  {/* Description Tooltip */}
                  <div className='absolute inset-0 bg-white p-6 flex flex-col justify-center
                              transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 overflow-y-auto'>
                    {Array.isArray(product?.description) && product.description.length > 0 ? (
                      <div className='space-y-2'>
                        {product.description.map((desc, index) => (
                          <div key={index} className='text-sm text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-3'>
                            {desc}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-sm text-gray-500 text-center'>No description available</div>
                    )}
                  </div>
                </div>

                {/* Product Info with Action Buttons */}
                <div className='text-center mt-6 px-3 flex-1 flex flex-col justify-between relative'>
                  {/* Action Buttons */}
                  <div className='absolute -top-14 left-0 right-0 flex justify-center gap-4 
                              transition-all duration-300 opacity-0 group-hover:opacity-100 z-20'>
                    <SelectOption icon={<FaHeart size={20} />} />
                    <SelectOption icon={<LuMenu size={20} />} pid={product._id} title={product.title} category={product.category} />
                    <span onClick={() => handleQuickView(product)}>
                      <SelectOption icon={<FaEye size={20} />} />
                    </span>
                  </div>

                  <Link
                    to={`/${product?.category?.toLowerCase()}/${product._id}/${product.title}`}
                    className='text-base hover:text-main line-clamp-2 font-medium mb-3'
                  >
                    {product.title || 'Untitled Product'}
                  </Link>
                  <span className='text-red-500 font-semibold text-lg'>
                    {product.price ? `${formatPrice(product.price)} VND` : 'Price not available'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          </Slider>
        ) : (
          <div className='text-center py-8 text-gray-500'>
{t('common.no_products_available')}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
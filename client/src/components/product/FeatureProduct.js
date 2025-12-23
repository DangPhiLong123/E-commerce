import React, { useState, useEffect } from 'react';
import { apiGetProducts } from '../../apis/product';
import { formatPrice, renderStarFromNumber } from '../../ultils/helpers';
import { useNavigate } from 'react-router-dom';
import useI18n from 'hooks/useI18n'

const FeatureProduct = () => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n()

  const handleProductClick = (product) => {
    window.scrollTo(0, 0);
    navigate(`/${product.category?.toLowerCase()}/${product._id}/${product.title}`);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiGetProducts({
        limit: 20, // Increased from 12 to 20 to ensure we have enough unique products
        sort: '-totalRatings',
        fields: 'thumb,title,price,totalRatings,category,slug'
      });

      if (response?.success) {
        // Loại bỏ sản phẩm trùng lặp dựa trên title
        const uniqueProducts = Array.from(
          new Map(response.products.map(item => [item.title, item])).values()
        );

        // Thêm giá giảm 20% cho tất cả sản phẩm
        const productsWithDiscount = uniqueProducts.map(product => ({
          ...product,
          price_old: product.price,
          price: Math.round(product.price * 0.8)
        }));

        // Giới hạn 9 sản phẩm
        setProducts(productsWithDiscount.slice(0, 9));
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return (
    <div className='w-full min-h-[200px] flex items-center justify-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
    </div>
  );

  return (
    <div className='w-full py-4'>
      <h3 className='text-lg sm:text-[20px] font-semibold py-[8px] border-b-2 border-main'>{t('common.featured_products')}</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        {products?.map((product) => (
          <div key={product._id} className='w-full'>
            <div 
              onClick={() => handleProductClick(product)}
              className='block cursor-pointer'
            >
              <div className='w-full border p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-main hover:-translate-y-1 group'>
                <div className='w-full h-[200px] flex items-center justify-center mb-3 overflow-hidden'>
                  <img 
                    src={product.thumb} 
                    alt={product.title} 
                    className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-110'
                  />
                </div>
                <div className='flex flex-col gap-1 w-full'>
                  <span className='flex h-4 justify-center'>
                    {renderStarFromNumber(product.totalRatings)}
                  </span>
                  <h4 className='text-sm font-medium line-clamp-1'>{product.title}</h4>
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs line-through'>{formatPrice(product.price_old)} VND</span>
                    <span className='text-red-500 font-semibold text-sm'>{formatPrice(product.price)} VND</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Section */}
      <div className='mt-8'>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5">
          {/* Banner lớn bên trái */}
          <div className="col-span-2 row-span-2 overflow-hidden rounded-lg group">
              <img 
                  src="https://digital-world-2.myshopify.com/cdn/shop/files/banner1-bottom-home2_b96bc752-67d4-45a5-ac32-49dc691b1958_600x.jpg?v=1613166661"
                  alt='banner'
                  className='w-full h-[150px] sm:h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-110 group-hover:brightness-90 group-hover:shadow-xl'
              />
          </div>

          {/* Banner Samsung */}
          <div className="col-span-1 h-full overflow-hidden rounded-lg group">
              <img 
                  src="https://digital-world-2.myshopify.com/cdn/shop/files/banner2-bottom-home2_400x.jpg?v=1613166661"
                  alt='banner'
                  className='w-full h-[150px] sm:h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-110 group-hover:brightness-90 group-hover:shadow-xl'
              />
          </div>

          {/* Banner Sale */}
          <div className="col-span-1 row-span-2 overflow-hidden rounded-lg group">
              <img 
                  src="https://digital-world-2.myshopify.com/cdn/shop/files/banner4-bottom-home2_92e12df0-500c-4897-882a-7d061bb417fd_400x.jpg?v=1613166661"
                  alt='banner'
                  className='w-full h-[150px] sm:h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-110 group-hover:brightness-90 group-hover:shadow-xl'
              />
          </div>

          {/* Banner Olloclip */}
          <div className="col-span-1 h-full overflow-hidden rounded-lg group">
              <img 
                  src="https://digital-world-2.myshopify.com/cdn/shop/files/banner3-bottom-home2_400x.jpg?v=1613166661"
                  alt='banner'
                  className='w-full h-[150px] sm:h-full object-cover transition-all duration-500 cursor-pointer group-hover:scale-110 group-hover:brightness-90 group-hover:shadow-xl'
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureProduct;

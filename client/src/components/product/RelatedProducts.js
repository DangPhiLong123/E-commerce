import React, { useState, useEffect, useRef } from 'react';
import { apiGetProducts } from '../../apis/product';
import { formatPrice } from '../../ultils/helpers';
import { FaHeart, FaEye } from 'react-icons/fa';
import { LuMenu } from 'react-icons/lu';
import SelectOption from '../common/SelectOption';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';

const RelatedProducts = ({ category, pid }) => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const handleProductClick = (productUrl) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(productUrl);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching related products with:', { category, pid });
      const response = await apiGetProducts({
        category: category,
        limit: 8,
        sort: '-createdAt'
      });

      if (response?.success) {
        const filteredProducts = response.products
          .filter(product => product._id !== pid)
          .slice(0, 8);
        console.log('Related products:', filteredProducts);
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category && pid) {
      fetchProducts();
    }
  }, [category, pid]);

  if (loading) return (
    <div className='w-full min-h-[200px] flex items-center justify-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
    </div>
  );

  if (!products || products.length === 0) return null;

  return (
    <div className='w-full'>
      <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>
        OTHER CUSTOMERS ALSO BUY:
      </h3>
      <div className='mt-6'>
        <Slider ref={sliderRef} {...settings}>
          {products?.map((product) => (
            <div key={product._id} className='px-3 pb-6'>
              <div className='relative group border hover:shadow-md rounded-lg bg-white transition-all duration-300 h-[440px] flex flex-col'>
                <div className='w-full h-[320px] relative overflow-hidden'>
                  <img
                    src={product.thumb}
                    alt={product.title}
                    className='w-full h-full object-contain p-4 transition-all duration-500 group-hover:opacity-0'
                  />
                  
                  {/* Description Overlay */}
                  <div className='absolute inset-0 bg-white p-4 pt-10 opacity-0 group-hover:opacity-100 transition-all duration-300'>
                    {Array.isArray(product?.description) && product.description.length > 0 ? (
                      <div className='grid grid-cols-1 gap-0.5 text-xs text-gray-600'>
                        {product.description.slice(0, 10).map((desc, index) => {
                          const [label, value] = desc.split(':').map(s => s.trim());
                          return (
                            <div key={index} className='flex items-start gap-1'>
                              <span className='font-medium min-w-[70px] text-gray-700'>{label}:</span>
                              <span className='flex-1'>{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className='text-xs text-gray-600'>No description available</div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className='p-4 flex-1 flex flex-col justify-between relative'>
                  {/* Action Buttons */}
                  <div className='absolute -top-8 left-0 right-0 flex justify-center gap-2 
                              transition-all duration-300 opacity-0 group-hover:opacity-100 z-10'>
                    <SelectOption icon={<FaHeart size={16} />} />
                    <SelectOption 
                      icon={<LuMenu size={16} />} 
                      pid={product._id} 
                      title={product.title} 
                      category={product.category}
                      onClick={() => handleProductClick(`/${product?.category?.toLowerCase()}/${product._id}/${product.title}`)}
                    />
                    <SelectOption icon={<FaEye size={16} />} />
                  </div>

                  <div className='text-center mt-4'>
                    <h3 className='text-base line-clamp-2 font-medium mb-2'>
                      {product.title}
                    </h3>
                    <span className='text-red-500 font-semibold text-lg'>
                      {formatPrice(product.price)} VND
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default RelatedProducts; 
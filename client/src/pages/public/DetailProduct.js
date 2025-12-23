import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apigetProduct, } from '../../apis'
import { Breadcrumb, RelatedProducts } from '../../components'
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import ReactImageMagnify from 'react-image-magnify';
import { FaFacebookF, FaTwitter, FaPinterestP, FaShippingFast, FaGift, FaUndoAlt, FaHeadphones } from 'react-icons/fa';
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import Ratings from '../../components/product/Ratings';
import { formatMoney } from '../../ultils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from 'store/cartSlice';
import { toast } from 'react-toastify';

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: false,
  responsive: [
    {
      breakpoint: 1024,
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

const tabs = [
  { id: 1, name: 'DESCRIPTION' },
  { id: 2, name: 'WARRANTY' },
  { id: 3, name: 'DELIVERY' },
  { id: 4, name: 'PAYMENT' },
  { id: 5, name: 'CUSTOMER REVIEW' }
];

const DetailProduct = ({isQuickView, pid: modalPid, title: modalTitle, category: modalCategory}) => {
  const [product, setProduct] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [variantSelected, setVariantSelected] = useState({})
  const [activeTab, setActiveTab] = useState('DESCRIPTION')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const { pid: urlPid, title: urlTitle, category: urlCategory } = useParams()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(state => state.user.isLoggedIn);
  
  // Use props from modal if in quick view mode, otherwise use URL params
  const pid = isQuickView ? modalPid : urlPid
  const title = isQuickView ? modalTitle : urlTitle
  const category = isQuickView ? modalCategory : urlCategory

  const fetchProductData = async () => {
    const response = await apigetProduct(pid)
    if (response.success) {
      setProduct(response.productData)
      setCurrentImage(response.productData?.thumb)
      setSelectedVariant(null)

      // Initialize selected variants for old variant structure
      if (
        Array.isArray(response.productData?.variants) &&
        response.productData.variants.length > 0 &&
        response.productData.variants[0].label &&
        Array.isArray(response.productData.variants[0].variants)
      ) {
        const initialVariants = {}
        response.productData.variants.forEach(variant => {
          initialVariants[variant.label] = variant.variants[0]
        })
        setVariantSelected(initialVariants)
      }
    }
  }

  useEffect(() => {
    if (pid) fetchProductData()
  }, [pid])

  useEffect(() => {
    if (selectedVariant) {
      let newCurrentImage = selectedVariant.thumb || 
        (selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images[0] : product?.thumb)
      setCurrentImage(newCurrentImage)
    } else {
      setCurrentImage(product?.thumb)
    }
  }, [selectedVariant, product?.thumb])

  const handleVariantChange = (label, value) => {
    setVariantSelected(prev => ({
      ...prev,
      [label]: value
    }))
  }

  const handleResetVariant = () => {
    setSelectedVariant(null)
    setCurrentImage(product?.thumb)
  }

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant)
  }

  const getDisplayImages = () => {
    if (selectedVariant) {
      const images = []
      
      if (selectedVariant.thumb && selectedVariant.thumb.trim() !== '') {
        images.push(selectedVariant.thumb)
      }

      if (selectedVariant.images && Array.isArray(selectedVariant.images)) {
        selectedVariant.images.forEach(img => {
          if (img && img.trim() !== '' && !images.includes(img)) {
            images.push(img)
          }
        })
      }

      if (images.length > 0) {
        return images
      }
    }

    // Fallback to product images
    const productImages = []
    if (product?.thumb) productImages.push(product.thumb)
    if (product?.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !productImages.includes(img)) {
          productImages.push(img)
        }
      })
    }

    return productImages
  }

  const handleAddToCart = () => {
    if (!product) return;
    if (!isLoggedIn) {
      toast.warning('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!');
      return;
    }
    dispatch(addToCart({
      product,
      quantity,
      variant: selectedVariant || variantSelected
    }));
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <div className='w-full'>
      {!isQuickView && <div className='w-full bg-white border-b border-gray-200'>
        <div className='h-[81px] w-full flex items-center'>
          <div className='w-main mx-auto'>
            <h3 className='font-semibold text-[18px] mb-2'>{title}</h3>
            <Breadcrumb title={title} category={product?.category} />
          </div>
        </div>
      </div>}
      <div className={isQuickView ? 'flex items-center gap-12 w-[750px] mx-auto' : 'w-main flex mx-auto mt-4'}>
        <div className={isQuickView ? 'w-[420px] flex flex-col items-center' : 'w-[458px] flex flex-col'}>
          <div className={isQuickView ? 'h-[380px] w-full border flex items-center justify-center bg-white overflow-hidden' : 'h-[458px] w-full border'}>
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: product?.title,
                  isFluidWidth: true,
                  src: currentImage || product?.thumb,
                },
                largeImage: {
                  src: currentImage || product?.thumb,
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerStyle: {
                  zIndex: 1000,
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb'
                },
                enlargedImageContainerDimensions: {
                  width: 400,
                  height: 400
                },
                enlargedImagePosition: 'beside'
              }}
            />
          </div>
          <div className={isQuickView ? 'w-full mt-6' : 'w-full mt-2'}>
            <Slider {...settings} key={selectedVariant?._id || 'original'}>
              {getDisplayImages().map((image, index) => (
                <div key={`${selectedVariant?._id || 'original'}-${index}`} className='px-2'>
                  <img
                    src={image}
                    alt={`${product?.title}-${index}`}
                    className={isQuickView ? 'w-[120px] h-[120px] object-contain border cursor-pointer' : 'w-[143px] h-[143px] object-contain border cursor-pointer'}
                    onClick={() => setCurrentImage(image)}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
        <div className={isQuickView ? 'flex-1 p-2' : 'flex-4 w-2/5 p-4'}>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <span className='line-through text-gray-500 text-sm'>{`${formatMoney((selectedVariant?.price || product?.price) * 1.5)} VND`}</span>
              <h2 className='text-[30px] font-semibold text-main'>{`${formatMoney(selectedVariant?.price || product?.price)} VND`}</h2>
            </div>
            <div className='flex items-center gap-4 text-sm text-gray-800'>
              <span>Availability: <span className='text-main'>{product?.quantity} in stock</span></span>
              <span>Sold: <span className='text-main'>{product?.sold}</span></span>
            </div>
            <ul className='list-disc text-sm text-gray-700 px-4'>
              <li className='py-1'>{`Processor: ${product?.description?.[0]}`}</li>
              <li className='py-1'>{`Memory: ${product?.description?.[1]}`}</li>
              <li className='py-1'>{`Display: ${product?.description?.[2]}`}</li>
              <li className='py-1'>{`Graphic: ${product?.description?.[3]}`}</li>
              <li className='py-1'>{`Storage: ${product?.description?.[4]}`}</li>
              <li className='py-1'>{`Camera: ${product?.description?.[5]}`}</li>
              <li className='py-1'>{`Networking: ${product?.description?.[6]}`}</li>
              <li className='py-1'>{`Battery: ${product?.description?.[7]}`}</li>
              <li className='py-1'>{`Dimensions: ${product?.description?.[8]}`}</li>
              <li className='py-1'>{`Weight: ${product?.description?.[9]}`}</li>
            </ul>
            {/* Variants Selection */}
            {Array.isArray(product?.variants) && product.variants.length > 0 && (
              <>
                {product.variants[0].label && product.variants[0].variants ? (
                  product.variants.map((variant) => (
                    <div key={variant.label} className='flex flex-col gap-2'>
                      <span className='font-medium'>{variant.label}</span>
                      <div className='flex gap-2 items-center'>
                        {variant.variants.map((item) => (
                          <button
                            key={item}
                            className={`px-4 py-2 border ${variantSelected[variant.label] === item
                                ? 'border-main text-main'
                                : 'border-gray-300 hover:border-gray-400'
                              }`}
                            onClick={() => handleVariantChange(variant.label, item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>Color</span>
                      <div className='flex items-center gap-2'>
                        {selectedVariant && (
                          <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                            Viewing: {selectedVariant.title || selectedVariant.color}
                          </span>
                        )}
                        {selectedVariant && (
                          <button
                            onClick={handleResetVariant}
                            className='text-sm text-gray-500 hover:text-main underline'
                          >
                            View Original
                          </button>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-2 items-center flex-wrap'>
                      {product.variants.map((variant, idx) => (
                        <div
                          key={idx}
                          className={`border rounded p-2 flex flex-col items-center min-w-[120px] cursor-pointer transition-all ${selectedVariant?._id === variant._id
                              ? 'border-main border-2 bg-blue-50 shadow-md'
                              : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                            }`}
                          onClick={() => handleSelectVariant(variant)}
                        >
                          {variant.thumb && (
                            <img src={variant.thumb} alt={variant.title} className='w-12 h-12 object-cover mb-1 rounded' />
                          )}
                          <span className='font-semibold text-center text-xs'>{variant.title || variant.color}</span>
                          <span className='text-xs text-gray-500'>{variant.color}</span>
                          <span className='text-main font-bold text-sm'>{formatMoney(variant.price)} VND</span>
                          {selectedVariant?._id === variant._id && (
                            <span className='text-xs text-blue-600 font-medium mt-1'>✓ Selected</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Quantity Selection */}
            <div className='flex items-center gap-4'>
              <span className='font-medium'>Quantity</span>
              <div className='flex items-center'>
                <button
                  className='p-2 border hover:bg-gray-100'
                  onClick={() => setQuantity(prev => prev > 1 ? prev - 1 : prev)}
                >
                  -
                </button>
                <input
                  type="number"
                  className='py-2 px-4 border-t border-b w-[80px] text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  value={quantity}
                  onChange={e => setQuantity(+e.target.value)}
                  min={1}
                />
                <button
                  className='p-2 border hover:bg-gray-100'
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>
            {/* Add to Cart Button */}
            <button
              className='w-full py-3 bg-main text-white font-medium uppercase hover:opacity-90'
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
            {/* Social Share Buttons */}
            {!isQuickView && <div className='flex items-center gap-4 mt-4'>
              <button className='p-3 bg-black text-white rounded-full hover:opacity-90'>
                <FaFacebookF size={16} />
              </button>
              <button className='p-3 bg-black text-white rounded-full hover:opacity-90'>
                <FaTwitter size={16} />
              </button>
              <button className='p-3 bg-black text-white rounded-full hover:opacity-90'>
                <FaPinterestP size={16} />
              </button>
            </div>}
          </div>
        </div>
        {!isQuickView && <div className='flex-2'>
          <div className='flex flex-col gap-3 p-4'>
            {/* Guarantee */}
            <div className='flex items-center gap-4 p-4 border rounded-sm'>
              <span className='p-2 bg-gray-800 rounded-full text-white flex items-center justify-center'>
                <IoShieldCheckmarkSharp size={20} />
              </span>
              <div className='flex flex-col'>
                <span className='font-medium'>Guarantee</span>
                <span className='text-sm text-gray-500'>Quality Checked</span>
              </div>
            </div>

            {/* Free Shipping */}
            <div className='flex items-center gap-4 p-4 border rounded-sm'>
              <span className='p-2 bg-gray-800 rounded-full text-white flex items-center justify-center'>
                <FaShippingFast size={20} />
              </span>
              <div className='flex flex-col'>
                <span className='font-medium'>Free Shipping</span>
                <span className='text-sm text-gray-500'>Free On All Products</span>
              </div>
            </div>

            {/* Special Gift Cards */}
            <div className='flex items-center gap-4 p-4 border rounded-sm'>
              <span className='p-2 bg-gray-800 rounded-full text-white flex items-center justify-center'>
                <FaGift size={20} />
              </span>
              <div className='flex flex-col'>
                <span className='font-medium'>Special Gift Cards</span>
                <span className='text-sm text-gray-500'>Special Gift Cards</span>
              </div>
            </div>

            {/* Free Return */}
            <div className='flex items-center gap-4 p-4 border rounded-sm'>
              <span className='p-2 bg-gray-800 rounded-full text-white flex items-center justify-center'>
                <FaUndoAlt size={20} />
              </span>
              <div className='flex flex-col'>
                <span className='font-medium'>Free Return</span>
                <span className='text-sm text-gray-500'>Within 7 Days</span>
              </div>
            </div>

            {/* Consultancy */}
            <div className='flex items-center gap-4 p-4 border rounded-sm'>
              <span className='p-2 bg-gray-800 rounded-full text-white flex items-center justify-center'>
                <FaHeadphones size={20} />
              </span>
              <div className='flex flex-col'>
                <span className='font-medium'>Consultancy</span>
                <span className='text-sm text-gray-500'>Lifetime 24/7/356</span>
              </div>
            </div>
          </div>
        </div>}
      </div>

      {/* Product Information Tabs */}
      {!isQuickView && <div className='w-main mx-auto mt-8'>
        <div className='flex items-center gap-2 relative'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`p-4 px-8 ${activeTab === tab.name
                  ? 'bg-white border border-b-0 relative'
                  : 'bg-gray-100'
                }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.name}
            </button>
          ))}
          <div className='absolute bottom-0 left-0 w-full h-[1px] bg-gray-200'></div>
        </div>

        <div className='w-full p-4 border mt-[-1px]'>
          {activeTab === 'DESCRIPTION' && (
            <div className='text-sm text-gray-500'>
              <ul className='list-disc pl-4 mb-4'>
                {product?.description?.map((item, index) => (
                  <li key={index} className='leading-6'>{item}</li>
                ))}
              </ul>
              {product?.infomations?.DESCRIPTION && (
                <div className='mt-4 leading-6 whitespace-pre-line'>
                  {product.infomations.DESCRIPTION.trim()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'WARRANTY' && (
            <div className='text-sm text-gray-500 leading-6 whitespace-pre-line'>
              {product?.infomations?.WARRANTY?.trim()}
            </div>
          )}

          {activeTab === 'DELIVERY' && (
            <div className='text-sm text-gray-500 leading-6 whitespace-pre-line'>
              {product?.infomations?.DELIVERY?.trim()}
            </div>
          )}

          {activeTab === 'PAYMENT' && (
            <div className='text-sm text-gray-500 leading-6 whitespace-pre-line'>
              {product?.infomations?.PAYMENT?.trim()}
            </div>
          )}

          {activeTab === 'CUSTOMER REVIEW' && (
            <div className='text-sm text-gray-500'>
              <Ratings
                totalRatings={product?.totalRatings || 0}
                ratings={product?.ratings || []}
                totalCount={product?.ratings?.length || 0}
                pid={pid}
                title={product?.title}
                rerender={fetchProductData}
              />
            </div>
          )}
        </div>
      </div>}
      {!isQuickView && <div className='w-main mx-auto mt-8'>
        {product && (
          <RelatedProducts
            category={product?.category}
            pid={pid}
          />
        )}
      </div>}
    </div>
  )
}

export default DetailProduct

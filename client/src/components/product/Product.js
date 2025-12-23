import React, { memo } from "react";
import SelectOption from "components/common/SelectOption";
import {renderStarFromNumber} from 'ultils/helpers'
import icons from 'ultils/icons'
import { useNavigate } from "react-router-dom";
import withBase from "hocs/withBase";
import { showModal } from "store/appSlice";
import { addToWishlist, removeFromWishlist } from "store/wishlistSlice";
import { useSelector, useDispatch } from "react-redux";
import DetailProduct from "pages/public/DetailProduct";
import useI18n from 'hooks/useI18n';
const { FaEye,LuMenu,FaHeart } = icons

const Product = ({ data, isNew, tagType }) => {
  const { t } = useI18n();
  const wishlistItems = useSelector(state => state.wishlist.items);
  const reduxDispatch = useDispatch();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isInWishlist = wishlistItems.some(item => item._id === data?._id);
  
  const handleClickOptions = (e, flag) => {
    e.stopPropagation()
    
    if(flag === 'WISHLIST') {
      if (isInWishlist) {
        reduxDispatch(removeFromWishlist({ productId: data._id }));
      } else {
        reduxDispatch(addToWishlist({ product: data }));
      }
    }
    if(flag === 'QUICK_VIEW') {
        dispatch(showModal({
          isShowModal: true, 
          modalChildren: <DetailProduct isQuickView pid={data?._id} title={data?.title} category={data?.category} />
        }))
      }
  }
  const handleProductClick = () => {
    window.scrollTo(0, 0);
    navigate(`/${data?.category}/${data?._id}/${data?.title}`);
  };

  return (
    <div className="w-full">
      <div className="product-card group">
        <div className="relative">
          <div className="w-full h-[250px] overflow-hidden">
            <div 
              onClick={handleProductClick}
              className="w-full block cursor-pointer"
            >
              <div className="w-full relative cursor-pointer">
                <img 
                  src={data?.thumb || data?.images?.[0]} 
                  alt={data?.title || 'Product image'} 
                  className="w-full h-[210px] object-contain p-2"
                />
                {isNew && tagType === 'hot' && (
                  <span className="absolute top-0 right-0 m-1 px-1 py-0.5 bg-red-500 text-white text-xs font-semibold rounded">{t('common.hot')}</span>
                )}
                {isNew && tagType === 'new' && (
                  <span className="absolute top-0 right-0 m-1 px-1 py-0.5 bg-yellow-500 text-white text-xs font-semibold rounded">{t('common.new')}</span>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 sm:gap-3 transition-all duration-300 group-hover:bottom-2 opacity-0 group-hover:opacity-100">
            <span title={t('common.quick_view')} onClick={(e)=> handleClickOptions(e, 'QUICK_VIEW')}> <SelectOption icon={<FaEye />} />   </span>
            <span title={t('common.more_options')} onClick={(e)=> handleClickOptions(e, 'MORE_OPTIONS')}><SelectOption icon={<LuMenu />} pid={data?._id} title={data?.title} category={data?.category}/></span>
            <span 
              title={isInWishlist ? t('common.remove_from_wishlist') : t('common.add_to_wishlist')} 
              onClick={(e)=> handleClickOptions(e, 'WISHLIST')}
              className={`cursor-pointer ${isInWishlist ? 'text-red-500' : 'text-gray-600'}`}
            > 
              <SelectOption icon={<FaHeart />} /> 
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-3">
          <span className="flex h-4">{renderStarFromNumber(data?.totalRatings)}</span>  
          <h3 className="text-sm font-medium line-clamp-1">{data?.title}</h3>
          <div className="flex flex-col gap-0.5">
            {data?.originalPrice && data?.originalPrice > data?.price && (
              <span className="text-gray-500 text-xs line-through">
                {Number(data?.originalPrice).toLocaleString()} VND
              </span>
            )}
            <span className="text-red-500 font-semibold text-sm">
              {Number(data?.price).toLocaleString()} VND
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withBase(memo(Product));
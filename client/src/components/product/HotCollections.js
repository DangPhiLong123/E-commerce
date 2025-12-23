import React from 'react';
import { Link } from 'react-router-dom';
import data from '../../utils/cate_brand';
import { FaAngleRight } from 'react-icons/fa';
import useI18n from 'hooks/useI18n';

const HotCollections = () => {
  const { t } = useI18n();
  // Lọc bỏ Speaker và Camera, chỉ lấy 6 danh mục đầu
  const filteredData = data.filter(item => !['Speaker', 'Camera'].includes(item.cate)).slice(0, 6);

  return (
    <div className='w-full'>
      <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main hidden lg:block'>
        {t('common.hot_collections')}
      </h3>
      <div className='grid grid-cols-3 gap-4 mt-4'>
        {filteredData.map((category) => (
          <div key={category.cate} className='border p-4 flex justify-center gap-6 min-h-[160px]'>
            {/* Image on the left */}
            <div className='w-[144px] flex items-center pl-6'>
              <img 
                src={category.image}
                alt={category.cate}
                className='w-full h-auto object-contain'
              />
            </div>

            {/* Content on the right */}
            <div className='flex-1 pl-10'>
              <div className='text-gray-700 uppercase font-semibold text-[15px] mb-3'>{category.cate}</div>
              <div className='flex flex-col gap-2'>
                {category.brand.map((brand, index) => (
                  <Link 
                    key={index}
                    to={`/${category.cate.toLowerCase()}/${brand.toLowerCase()}`}
                    className='text-[13px] text-gray-500 hover:text-main flex items-center gap-2'
                  >
                    <FaAngleRight size={10} />
                    <span>{brand}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotCollections; 
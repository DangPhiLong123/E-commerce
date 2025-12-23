import React from "react";
// import { apiGetCategories } from "../apis/app";
import { NavLink } from "react-router-dom";
import { createSlug } from 'ultils/helpers'
import { useSelector } from 'react-redux'
import useI18n from 'hooks/useI18n'

const Sidebar = () => {
  const {categories} = useSelector(state => state.app)
  const { t } = useI18n()
  
  // Mapping category names to translation keys
  const getCategoryTranslation = (categoryTitle) => {
    const categoryMap = {
      'Accessories': 'accessories',
      'Laptop': 'laptop', 
      'Smartphone': 'smartphone',
      'Tablet': 'tablet',
      'Television': 'television',
      'Printer': 'printer',
      'Camera': 'camera',
      'Speaker': 'speaker'
    }
    return categoryMap[categoryTitle] ? t(`common.${categoryMap[categoryTitle]}`) : categoryTitle
  }
  
  return (
    <div className="w-full flex flex-col border">
      {categories?.map(el => (
        <NavLink
          key={createSlug(el.title)}
          to={createSlug(el.title)}
          className={({isActive}) => isActive ? 
          'bg-main text-white py-[15px] px-[20px] pb-[14px] text-sm hover:text-main' 
          : 'py-[15px] px-[20px] pb-[14px] text-sm hover:text-main'}
        > 
          {getCategoryTranslation(el.title)}
        </NavLink>
      ))}
      
    </div>
  )
};

export default Sidebar;

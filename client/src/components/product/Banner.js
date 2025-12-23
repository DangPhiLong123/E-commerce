import React from "react";
import banner from 'assets/banner.jpg'

const Banner = () => {
  return (
    <div className='w-full'>
      <img src={banner} alt="banner" className='h-[200px] sm:h-[300px] lg:h-[400px] w-full object-cover'></img>
    </div>
  )
};

export default Banner;

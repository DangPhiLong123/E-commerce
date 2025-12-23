import React, {memo} from 'react'
import { MdEmail, MdLocationPin } from 'react-icons/md'
import { FaPhoneAlt, FaLinkedin, FaInstagramSquare, FaGoogle, FaPinterest, FaTwitter, FaFacebookF } from 'react-icons/fa'
import BackToTop from '../common/BackToTop'

const Footer = () => {
  return (
    <div className='w-full '>
      <div className='h-[103px] w-full flex items-center justify-center bg-main'>
        <div className='w-main flex items-center justify-between'>
            <div className='flex flex-col flex-1'>
                <span className='text-[20px] text-gray-100'>Sign up to Newsletter</span>
                <small className='text-[13px] text-gray-300'>Subscribe now and receive weekly newsletter</small>
            </div>
            <div className='flex-1 flex - items-center'>
                <input
                className='p-4 pr-0 rounded-l-full  w-full bg-[#F04646] outline-none text-gray-100
                placeholder:text-sm placeholder:text-gray-200 placeholder:italic placeholder:opacity-50'
                type='text' 
                placeholder='Email Address'
                />
                <div className='h-[56px] w-[56px] bg-[#F04646] rounded-r-full flex items-center justify-center text-white'>
                     <MdEmail size={18}/>
                </div>
            </div>
        </div>
      </div>
      <div className='h-[407px] w-full flex items-center justify-center bg-black text-white text-[13px]'>
        <div className='w-main flex'>
            <div className="flex-2 flex flex-col gap-4">
                <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px]'>
                    ABOUT US
                </h3>
                <span className='flex items-center gap-2'>
                    <MdLocationPin size={14} className='min-w-[14px]'/>
                    <span className='flex gap-1'>
                        <span>Address:</span>
                        <span className='opacity-70'>123, Bac Tu Liem, Ha Noi, Viet Nam</span>
                    </span>
                </span>
                <span className='flex items-center gap-2'>
                    <FaPhoneAlt size={14} className='min-w-[14px]'/>
                    <span className='flex gap-1'>
                        <span>Phone:</span>
                        <span className='opacity-70'>(+1234)56789xxx</span>
                    </span>
                </span>
                <span className='flex items-center gap-2'>
                    <MdEmail size={14} className='min-w-[14px]'/>
                    <span className='flex gap-1'>
                        <span>Mail:</span>
                        <span className='opacity-70'>support@digitalXpress.com</span>
                    </span>
                </span>
                <div className='flex items-center gap-4 mt-4'>
                    <span className='p-2 bg-[#3B5998] rounded-sm cursor-pointer hover:opacity-70'><FaFacebookF size={14}/></span>
                    <span className='p-2 bg-[#1DA1F2] rounded-sm cursor-pointer hover:opacity-70'><FaTwitter size={14}/></span>
                    <span className='p-2 bg-[#DD4B39] rounded-sm cursor-pointer hover:opacity-70'><FaGoogle size={14}/></span>
                    <span className='p-2 bg-[#BD081C] rounded-sm cursor-pointer hover:opacity-70'><FaPinterest size={14}/></span>
                    <span className='p-2 bg-[#E4405F] rounded-sm cursor-pointer hover:opacity-70'><FaInstagramSquare size={14}/></span>
                    <span className='p-2 bg-[#0077B5] rounded-sm cursor-pointer hover:opacity-70'><FaLinkedin size={14}/></span>
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px]'>
                    Information
                </h3>
                <span className='opacity-70 flex flex-col gap-2'>
                    <span>Typography</span>
                    <span>Gallery</span>
                    <span>Store Location</span>
                    <span>Today's Deals</span>
                    <span>Contact</span>
                </span>
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px]'>
                    Who we are
                </h3>
                <span className='opacity-70 flex flex-col gap-2'>
                    <span>Help</span>
                    <span>Free Shipping</span>
                    <span>FAQs</span>
                    <span>Return & Exchange</span>
                    <span>Testimonials</span>
                </span>
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px]'>
                    #DigitalWorldStore
                </h3>
            </div>
        </div>
      </div>
      <BackToTop />
    </div>
  )
}

export default memo(Footer)

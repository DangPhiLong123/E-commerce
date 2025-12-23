import React, {memo, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import path from 'ultils/path'
import { useDispatch, useSelector} from 'react-redux'
import { FaFacebookF, FaTwitter, FaGoogle, FaPinterest, FaInstagramSquare, FaLinkedin } from 'react-icons/fa'
import { getCurrent } from 'store/asyncActionsUser'
import icons from 'ultils/icons'
import { logout, clearMessage } from 'store/userSlice'
import Swal from 'sweetalert2'



const {MdLogout} = icons

const TopHeader = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {isLoggedIn, current, mes } = useSelector(state => state.user)
  const language = useSelector(state => state.app.language)

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      if (isLoggedIn) dispatch(getCurrent())
    }, 300)

    return () => {
      clearTimeout(setTimeoutId)
    }
  },[dispatch, isLoggedIn])


  useEffect(() => {
    if(mes) Swal.fire({
      title: 'Oops...',
      text: mes,
      icon: 'info',
      confirmButtonColor: '#d33'
    }).then(() => {
      dispatch(clearMessage())
      navigate(`/${path.LOGIN}`)
    })
  },[mes, dispatch, navigate])

  return (
    <div className='h-[38px] w-full bg-main flex items-center justify-center'>
      <div className='w-full max-w-[1220px] mx-auto px-4 text-xs text-white flex items-center justify-between'>
          {/* Desktop: Full content */}
          <div className='hidden lg:flex items-center gap-2'>
            <span>
              {language === 'en' ? 'ORDER ONLINE OR CALL US (+84) 123 456 789' : 'ĐẶT HÀNG ONLINE HOẶC GỌI (+84) 123 456 789'}
            </span>
            <button
              onClick={() => dispatch({ type: 'app/toggleLanguage' })}
              className='ml-2 px-2 py-[2px] rounded border border-white/70 hover:bg-white hover:text-main transition-colors'
              aria-label='Toggle Language'
            >
              {language === 'en' ? 'VI' : 'EN'}
            </button>
          </div>
          
          {/* Mobile: Simplified content */}
          <div className='lg:hidden flex items-center gap-2'>
            <span className='text-center'>
              {language === 'en' ? 'CALL US (+84) 123 456 789' : 'GỌI NGAY (+84) 123 456 789'}
            </span>
          </div>
          
          <div className='flex items-center gap-2'>
           {isLoggedIn && current
           ? <div className='flex items-center gap-2'> 
                <span className='hidden md:block'>{`Welcome, ${current?.lastname} ${current?.firstname}`}</span>
                <span className='md:hidden'>Welcome!</span>
                <span 
                  onClick={() => dispatch(logout())}
                  className='hover:rounded-full hover:bg-gray-200 hover:text-main p-1'>
                  <MdLogout size={14} className='cursor-pointer' /></span>
             </div> 
           : <Link
                className='hover:text-black border-r pr-2 sm:pr-4 text-xs sm:text-sm'
                to={`/${path.LOGIN}`}
             >{language === 'en' ? 'Sign In' : 'Đăng nhập'}</Link>}
            
            {/* Desktop: Social icons */}
            <div className='hidden lg:flex items-center'>
              <span className='cursor-pointer hover:text-black border-r px-2'><FaFacebookF size={14}/></span>
              <span className='cursor-pointer hover:text-black border-r px-2'><FaTwitter size={14}/></span>
              <span className='cursor-pointer hover:text-black border-r px-2'><FaGoogle size={14}/></span>
              <span className='cursor-pointer hover:text-black border-r px-2'><FaPinterest size={14}/></span>
              <span className='cursor-pointer hover:text-black border-r px-2'><FaInstagramSquare size={14}/></span>
              <span className='cursor-pointer hover:text-black px-2'><FaLinkedin size={14}/></span>
            </div>
          </div>
      </div>
    </div>
  )
}

export default memo(TopHeader)

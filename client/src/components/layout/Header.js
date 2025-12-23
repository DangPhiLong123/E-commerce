import React, {Fragment, useEffect, useState, memo} from "react";
import logo from 'assets/logo.png'
import icons from 'ultils/icons'
import { Link } from 'react-router-dom'
import path from 'ultils/path'
import { useDispatch, useSelector } from "react-redux";
import { logout } from "store/userSlice";
import withBase from "hocs/withBase";
import { showCart } from "store/appSlice";


const { FaPhoneAlt, MdEmail, FaShoppingBag, FaUserCircle, FaBars } = icons
const Header = ({dispatch}) => {
  const {current} = useSelector(state => state.user)
  const cartItems = useSelector(state => state.cart.items);
  const [isShowOption, setIsShowOption] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const profileOption = document.getElementById('profile-option') 
      const searchBar = document.querySelector('[placeholder="Search products..."]')
      
      // Đóng profile dropdown nếu click bên ngoài profile option
      // nhưng không đóng nếu click vào search bar
      if(profileOption && !profileOption.contains(e.target) && 
         (!searchBar || !searchBar.contains(e.target))) {
        setIsShowOption(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      const mobileMenu = document.getElementById('mobile-menu')
      const menuButton = document.getElementById('mobile-menu-button')
      if(mobileMenu && menuButton && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
        setIsMobileMenuOpen(false)
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])
  return (
    <div className="w-main flex justify-between h-[110px] py-[35px] relative">
      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center">
        <button
          id="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-main"
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Logo */}
      <Link to={`/${path.HOME}`} className="flex items-center">
        <img src={logo} alt="logo" className='w-[180px] lg:w-[234px] object-contain'></img>
      </Link>

      {/* Desktop Header Content */}
      <div className='hidden lg:flex text-[13px]'>
        <div className='flex flex-col px-6 border-r items-center'>
          <span className='flex gap-4 items-center'>
            <FaPhoneAlt color='red' />
            <span className='font-semibold'>(+84) 123 456 789</span>
          </span>
          <span>Mon-Sat 9:00AM - 8:00PM</span>
        </div>
        <div className='flex flex-col items-center px-6 border-r'>
          <span className='flex gap-4 items-center'>
            <MdEmail color='red' />
            <span className='font-semibold'>support@digitalXpress.com</span>
          </span>
          <span>Online Support 24/7</span>
        </div>
        {current && <Fragment>
            <div 
              onClick={() => dispatch(showCart())}
              className='flex items-center justify-center gap-2 px-6 border-r cursor-pointer' >
              <FaShoppingBag color='red' />
              <span>{`${cartItems.length} item(s)`}</span>
            </div>
            <div 
              className='flex items-center justify-center gap-2 px-6 cursor-pointer relative'
              onClick={() => setIsShowOption(prev => !prev)}
              id="profile-option"
            >
              <FaUserCircle  color='red' />
              <span>Profile</span>
              {isShowOption && (<div className="absolute top-full left-[16px] w-full bg-gray-100 shadow-md rounded-md py-2 z-[100]"> 
                <div className="flex flex-col gap-2">
                  <Link className="p-2 w-full hover:bg-sky-200" to={`/${path.MEMBER}/${path.PERSONAL}`}>
                    <span>Personal</span>
                  </Link>
                  {+current?.role === 1223 && (
                    <Link className="p-2 w-full hover:bg-sky-200" to={`/${path.ADMIN}/${path.DASHBOARD}`}>
                      <span>Admin</span>
                    </Link>
                  )}
                  <span
                   className="p-2 w-full hover:bg-sky-200"
                   onClick={() => dispatch(logout())} 
                  >Logout</span>
                </div>
              </div>)}
            </div>
          </Fragment>}
      </div>

      {/* Mobile Header Content - Cart */}
      <div className="lg:hidden flex items-center">
        <div 
          onClick={() => dispatch(showCart())}
          className='flex items-center justify-center gap-1 cursor-pointer' >
          <FaShoppingBag color='red' size={20} />
          <span className="text-sm">{cartItems.length}</span>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="fixed top-[148px] left-0 right-0 bg-white shadow-lg border-t z-50 lg:hidden">
          <div className="px-4 py-4 space-y-2">
            <Link 
              to={`/${path.HOME}`} 
              className="block py-2 text-gray-600 hover:text-main"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to={`/${path.PRODUCTS}`} 
              className="block py-2 text-gray-600 hover:text-main"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to={`/${path.BLOGS}`} 
              className="block py-2 text-gray-600 hover:text-main"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to={`/${path.OUR_SERVICES}`} 
              className="block py-2 text-gray-600 hover:text-main"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to={`/${path.FAQ}`} 
              className="block py-2 text-gray-600 hover:text-main"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
          </div>
        </div>
      )}
    </div>

  )
};

export default withBase(memo(Header));

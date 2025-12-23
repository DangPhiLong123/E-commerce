import React, {memo, Fragment, useState} from 'react'
import logo from 'assets/logoad.png'
import { adminSidebar } from 'ultils/contants'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {FaCaretDown, FaCaretRight} from 'react-icons/fa'
import icons from 'ultils/icons'

const { FaHome } = icons

const activedStyle = 'px-4 py-2 flex items-center gap-2 text-gray-200 bg-gray-500'
const notActivedStyle = 'px-4 py-2 flex items-center gap-2 text-gray-200 hover:bg-gray-100 hover:text-gray-900'

const AdminSidebar = () => {
  const handleShowTabs = (tabID) => {
    if (actived.some(el => el === tabID)) setActived(prev => prev.filter(el => el !== tabID))
      else setActived(prev => [...prev, tabID])
  }
  const [actived, setActived] = useState([])

  return (
    <div className='bg-sky-800 h-full text-white py-4 flex flex-col'>
      <div className='flex-1 overflow-y-auto'>
        <div className='flex flex-col justify-center items-center p-4 gap-2'>
          <img src={logo} alt='logo' className='w-[200px] object-contain' />
          <small>Admin Workspace</small>
        </div>
        <div>
          {adminSidebar.map(el => (
              <Fragment key={el.id}>
                  {el.type === 'SINGLE' && <NavLink 
                  to={el.path}
                  className={({isActive}) => clsx(isActive && activedStyle, !isActive && notActivedStyle)}
                  >
                      <span>{el.icon}</span>
                      <span>{el.text}</span>
                  </NavLink>}
                  {el.type === 'PARENT' && <div  
                    onClick={() => handleShowTabs(+el.id)}
                    className='flex flex-col text-gray-200'>
                      <div className='flex items-center justify-between px-4 py-2 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'>
                          <div className='flex items-center gap-2'>
                            <span>{el.icon}</span>
                            <span>{el.text}</span>
                          </div>
                          {actived.some(id => id === el.id) ? <FaCaretDown/> : <FaCaretRight/>}
                      </div>
                      {actived.some(id => +id === +el.id) && <div 
                      className='flex flex-col'
                      >
                          {el.submenu.map(item => (
                              <NavLink 
                              key={el.text} 
                              to={item.path}
                              onClick={e => e.stopPropagation()}
                              className={({isActive}) => clsx(isActive && activedStyle, !isActive && notActivedStyle, 'pl-10')}
                              >
                                  {item.text}
                              </NavLink>
                          ))}
                      </div>}
                  </div>}
              </Fragment>
          ))}
        </div>
      </div>
      {/* Go Home at bottom */}
      <div className='mt-2'>
        <NavLink 
          to='/'
          className={({isActive}) => clsx(isActive && activedStyle, !isActive && notActivedStyle)}
        >
          <span><FaHome /></span>
          <span>Go Home</span>
        </NavLink>
      </div>
    </div>
  )
}

export default memo(AdminSidebar)

import React, {memo, Fragment, useState} from 'react'
import avatar from 'assets/avatar.png'
import { memberSidebar } from 'ultils/contants'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {FaCaretDown, FaCaretRight} from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { AiOutlineHome } from 'react-icons/ai';


const activedStyle = 'px-4 py-2 flex items-center gap-2 text-gray-200 bg-gray-500'
const notActivedStyle = 'px-4 py-2 flex items-center gap-2 text-gray-200 hover:bg-gray-100 hover:text-gray-900'

const MemberSidebar = () => {
  const handleShowTabs = (tabID) => {
    if (actived.some(el => el === tabID)) setActived(prev => prev.filter(el => el !== tabID))
      else setActived(prev => [...prev, tabID])
  }
  const [actived, setActived] = useState([])
  const {current} = useSelector(state => state.user)

  return (
    <div className='bg-sky-800 h-full text-white py-4 w-[250px] flex-none'>
      <div className='flex flex-col h-full justify-between'>
        <div>
          <div className='w-full flex flex-col justify-center items-center py-4 gap-2'>
            <img src={current?.avatar || avatar} alt='avatar' className='w-20 h-20 object-contain rounded-full' />
            <small className='text-gray-200'>{current?.firstname} {current?.lastname}</small>
          </div>
          <div>
            {memberSidebar.map(el => (
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
        <div className='w-full flex flex-col items-center mb-2'>
          <NavLink to='/' className='flex items-center gap-2 text-white hover:text-sky-300 font-semibold text-lg'>
            <AiOutlineHome size={22} />
            <span>Go Home</span>
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default memo(MemberSidebar)

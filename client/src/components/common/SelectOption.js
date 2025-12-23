import React from 'react'
import { useNavigate } from 'react-router-dom'

const SelectOption = ({ icon, pid, title, category, onClick }) => {
  const navigate = useNavigate()
  
  const handleClick = (e) => {
    if (pid && title && category) {
      window.scrollTo(0, 0);
      navigate(`/${category.toLowerCase()}/${pid}/${title}`)
    }
    if (onClick) onClick(e)
  }

  return (
    <button 
      onClick={handleClick}
      className='w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all duration-300'
    >
      {icon}
    </button>
  )
}

export default SelectOption

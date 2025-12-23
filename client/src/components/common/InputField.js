import React from 'react'
import clsx from 'clsx'

const InputField = ({value, setValue, nameKey, type, invalidFields, setInvalidFields, style, fullWidth, placeholder, isHideLabel}) => {
    
  const handleChange = (e) => {
    if (typeof setValue === 'function') {
      if (nameKey) {
        setValue(prev => ({...prev, [nameKey]: e.target.value}))
      } else {
        setValue(e.target.value)
      }
    }
  }

  return (
    <div className={clsx('flex flex-col relative mb-2', fullWidth && 'w-full')}>
        { (!isHideLabel && value?.toString()?.trim() !== '') && <label
         className='text-[10px] absolute top-0 left-[12px] block bg-white px-1 animate-slide-top-sm'
         htmlFor={nameKey}> {nameKey?.slice(0,1).toUpperCase() + nameKey?.slice(1)} </label>}
      <input 
      type={type || 'text'}
      className={clsx('px-4 py-2 rounded-md border mt-2 placeholder:text-sm placeholder:italic outline-none', fullWidth && 'w-full', style)}
      placeholder={placeholder || nameKey?.slice(0,1)?.toUpperCase() + nameKey?.slice(1)}
      value={value}
      onChange={handleChange}
      onFocus={() => setInvalidFields && setInvalidFields([])}
      />
      {invalidFields?.some(el => el.name === nameKey) && 
      <small className='text-main font-[12px] italic'>{invalidFields.find
      (el => el.name === nameKey)?.mes}</small>}
    </div>
  )
}

export default InputField

import React, {memo} from 'react'
import clsx from 'clsx'

const InputForm = ({ style,label, disabled, register, errors, id, validate, type= 'text', placeholder, fullwidth, defaultValue}) => {
  return (
    <div className={clsx('flex flex-col h-[78px] gap-2', style)}>
      {label && <label className='text-lg font-medium' htmlFor={id}>{label}</label>}
      <input
      type={type}
      id={id}
      {...register(id, validate)}
      disabled={disabled}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className={clsx('form-input my-auto', fullwidth && 'w-full',  style)}
      />
      {errors[id] && <small className="text-red-500 no-underline block mb-2 font-medium">{errors[id]?.message}</small>}
    </div>
  )
}

export default memo(InputForm)

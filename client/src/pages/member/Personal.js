import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { InputForm } from 'components'
import { useSelector, useDispatch } from 'react-redux'
import { roles } from 'ultils/contants';
import { toast } from 'react-toastify'
import avatar from 'assets/avatar.png'
import { useState } from 'react'
import { apiUpdateCurrent } from 'apis/user'
import { getCurrent } from 'store/asyncActionsUser'

const Personal = () => {
  const {register, handleSubmit, formState: {errors}, reset} = useForm()
  const {current} = useSelector(state => state.user)
  const dispatch = useDispatch()
  useEffect(() => {
    reset({
      firstname: current?.firstname,
      lastname: current?.lastname,
      email: current?.email,
      mobile: current?.mobile,
      avatar: current?.avatar,
    })
  }, [current])
  const handleUpdateInfo = async (data) => {
    const formData = new FormData()
    if (data.avatar.length > 0) formData.append('avatar', data.avatar[0])
    delete data.avatar
    for (let i of Object.entries(data)) formData.append(i[0], i[1])
    
    const response = await apiUpdateCurrent(formData)
    if (response.success) {
      dispatch(getCurrent())
      toast.success('Update information successfully!')
    } else toast.error(response.message || 'Update failed!')
  }
  return (
    <div className='w-full relative px-4'>
      <header className='w-full text-3xl bg-white shadow-md flex items-center justify-center font-semibold py-4'>
        <h1 className='text-3xl'>Personal</h1>
      </header>
      <form onSubmit={handleSubmit(handleUpdateInfo)} className='w-4/5 mx-auto py-8 flex flex-col gap-6'>
        <InputForm 
            label='First Name'
            register={register}
            errors={errors}
            id='firstname'
            validate={{
              required: 'Need fill this field'
            }}
            fullWidth
            placeholder='First Name'
          />
        <InputForm 
            label='Last Name'
            register={register}
            errors={errors}
            id='lastname'
            validate={{
              required: 'Need fill this field'
            }}
            fullWidth
            placeholder='Last Name'
        />
        <InputForm 
            label='Email'
            register={register}
            errors={errors}
            id='email'
            validate={{
              required: 'Need fill this field',
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: 'Email invalid'
              }
            }}
            fullWidth
            placeholder='Email'
          />
          <InputForm 
            label='Phone'
            register={register}
            errors={errors}
            id='mobile'
            validate={{
              required: 'Need fill this field',
              pattern: {
                value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/gm,
                message: 'Phone invalid'
              }     
            }}
            fullWidth
            placeholder='Phone'
          />
          <div className='mt-2 flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Account Status:</span>
              <span className={`${current?.isBlocked ? 'text-red-500' : 'text-green-500'} font-medium`}>{current?.isBlocked ? 'Blocked' : 'Actived'}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Role:</span>
              <span
                className={`${
                  +current?.role === 1223 ? 'text-purple-600' : 'text-green-500'
                } font-medium`}
              >
                {roles.find(r => +r.code === +current?.role)?.value || 'Unknown'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Created At :</span>
              <span className={`${current?.createdAt ? 'text-blue-500' : 'text-green-500'} font-medium`}>
                {current?.createdAt ? new Date(current.createdAt).toLocaleDateString('vi-VN') : ''}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='font-medium'>Profile Picture:</span>
            <div className='flex items-center gap-2'>
              <label htmlFor='file' className='cursor-pointer'>
                <img src={current?.avatar || avatar} alt='avatar' className='w-20 h-20 ml-8 object-cover rounded-full' />
              </label>
              <input type='file' id='file' {...register('avatar')} hidden />
            </div>
          </div>
          <div className='w-full flex justify-end'>
            <button type='submit' className='bg-sky-600 text-white px-4 py-2 rounded-md'>Update Information</button>
          </div>
      </form>
    </div>
  )
}

export default Personal

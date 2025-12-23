import React, { useState, useEffect } from 'react'
import { InputField, Button } from 'components'
import { roles } from 'ultils/contants'
import { apiUpdateUser } from 'apis/user'
import Swal from 'sweetalert2'

const UpdateUser = ({ editUser, setEditUser, render }) => {
  const [payload, setPayload] = useState({
    email: '',
    firstname: '',
    lastname: '',
    mobile: '',
    role: '',
    isBlocked: false
  })

  useEffect(() => {
    setPayload({
      email: editUser.email,
      firstname: editUser.firstname,
      lastname: editUser.lastname,
      mobile: editUser.mobile,
      role: editUser.role,
      isBlocked: editUser.isBlocked
    })
  }, [editUser])

  const handleSubmit = async () => {
    try {
      const response = await apiUpdateUser(payload, editUser._id)
      if (response?.success) {
        setEditUser(null)  // Close modal first
        Swal.fire({
          icon: 'success',
          title: 'Update user successfully',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK'
        }).then(() => {
          // Add a small delay before rendering to ensure server has updated
          setTimeout(() => {
            render() // Call render to update the list
          }, 300)
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: response?.mes || 'Something went wrong!',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.mes || 'Something went wrong!',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
      <div className='bg-white w-[500px] rounded-md p-4'>
        <h3 className='font-semibold text-xl mb-4 border-b pb-2'>Update User Information</h3>
        <div className='flex flex-col gap-4'>
          <InputField 
            value={payload.email}
            setValue={setPayload}
            nameKey='email'
            invalidFields={[]}
            setInvalidFields={() => {}}
            fullWidth
            disabled
          />
          <div className='flex gap-4'>
            <InputField 
              value={payload.firstname}
              setValue={setPayload}
              nameKey='firstname'
              invalidFields={[]}
              setInvalidFields={() => {}}
              label='First name'
            />
            <InputField 
              value={payload.lastname}
              setValue={setPayload}
              nameKey='lastname'
              invalidFields={[]}
              setInvalidFields={() => {}}
              label='Last name'
            />
          </div>
          <InputField 
            value={payload.mobile}
            setValue={setPayload}
            nameKey='mobile'
            invalidFields={[]}
            setInvalidFields={() => {}}
            fullWidth
          />
          <select 
            value={payload.role} 
            onChange={e => setPayload(prev => ({...prev, role: e.target.value}))}
            className='px-4 py-2 border rounded-md w-full outline-none'
          >
            <option value="">Choose role</option>
            {roles.map(el => (
              <option key={el.code} value={el.code}>{el.value}</option>
            ))}
          </select>
          <div className='flex items-center gap-2'>
            <input 
              type="checkbox" 
              id="block"
              checked={payload.isBlocked}
              onChange={e => setPayload(prev => ({...prev, isBlocked: e.target.checked}))}
            />
            <label htmlFor="block">Block this user</label>
          </div>
          <div className='flex justify-end gap-4'>
            <Button 
              name='Cancel'
              style='px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600'
              handleOnClick={() => setEditUser(null)}
            />
            <Button 
              name='Update'
              style='px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600'
              handleOnClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateUser 
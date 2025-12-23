import React from 'react'
import { Button } from 'components'
import { apiDeleteUser } from 'apis/user'
import Swal from 'sweetalert2'

const DeleteUser = ({ deleteUser, setDeleteUser, render }) => {
  const handleDelete = async () => {
    const response = await apiDeleteUser(deleteUser._id)
    if (response.success) {
      setDeleteUser(null)
      render()
      Swal.fire({
        icon: 'success',
        title: 'Delete user successfully',
        showConfirmButton: false,
        timer: 1500
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: response.mes
      })
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
      <div className='bg-white w-[400px] rounded-md p-4'>
        <h3 className='font-semibold text-xl mb-4 border-b pb-2'>Delete User</h3>
        <div className='flex flex-col gap-4'>
          <p>Are you sure you want to delete this user?</p>
          <p><span className='font-semibold'>Email:</span> {deleteUser.email}</p>
          <p><span className='font-semibold'>Name:</span> {`${deleteUser.lastname} ${deleteUser.firstname}`}</p>
          <div className='flex justify-end gap-4'>
            <Button 
              name='Cancel'
              style='px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600'
              handleOnClick={() => setDeleteUser(null)}
            />
            <Button 
              name='Delete'
              style='px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600'
              handleOnClick={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteUser 
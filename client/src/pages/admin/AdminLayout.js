import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import path from '../../ultils/path'
import { useSelector } from 'react-redux'
import { AdminSidebar } from 'components'
import { Modal } from 'components'

const AdminLayout = () => {
  const { isLoggedIn, current } = useSelector(state => state.user)
  if (!isLoggedIn || !current || +current?.role !== 1223) return <Navigate to={`/${path.LOGIN}`} replace={true} />
  return (
    <div className='flex w-full bg-white min-h-screen'>
      <div className='w-[327px] fixed top-0 bottom-0 left-0'>
        <AdminSidebar />
      </div>
      <div className='ml-[327px] flex-1'>
        <Outlet />
      </div>
      <Modal />
    </div>
  )
}

export default AdminLayout

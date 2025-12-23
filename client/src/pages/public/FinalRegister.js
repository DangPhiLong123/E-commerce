import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import path from '../../ultils/path'
import Swal from 'sweetalert2'

const FinalRegister = () => {
    const { status } = useParams()
    const navigate = useNavigate()
    useEffect(() => {
        // Loại bỏ khoảng trắng và chuyển về lowercase để đảm bảo so sánh chính xác
        const currentStatus = status?.trim()?.toLowerCase()
        console.log('Current status:', currentStatus)
        
        if (currentStatus === 'failsed') {
            Swal.fire({
                title: 'Oops!',
                text: 'Đăng kí không thành công',
                icon: 'error',
                confirmButtonColor: '#ee3131'
            }).then(() => {
                navigate(`/${path.LOGIN}`)
            })
        }
        if (currentStatus === 'success') {
            Swal.fire({
                title: 'Congratulation!',
                text: 'Đăng kí thành công. Hãy đăng nhập',
                icon: 'success',
                confirmButtonColor: '#ee3131'
            }).then(() => {
                navigate(`/${path.LOGIN}`)
            })
        }
    }, [status, navigate])
  return (
    <div className='h-screen w-screen bg-gray-100'>

    </div>
  )
}

export default FinalRegister

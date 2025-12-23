import React from 'react'
import { apiDeleteProduct } from '../../apis/product'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { FaTrash } from 'react-icons/fa'

const DeleteProduct = ({ productId, onDeleteSuccess }) => {
    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            })

            if (result.isConfirmed) {
                const response = await apiDeleteProduct(productId)
                if (response.success) {
                    toast.success('Product deleted successfully')
                    onDeleteSuccess()
                } else {
                    toast.error(response.message || 'Failed to delete product')
                }
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('Failed to delete product')
        }
    }

    return (
        <button
            onClick={handleDelete}
            className='p-2 bg-red-500 text-white rounded-md hover:bg-red-600'
        >
            <FaTrash />
        </button>
    )
}

export default DeleteProduct 
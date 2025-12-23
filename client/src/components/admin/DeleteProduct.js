import React from 'react'
import { apiDeleteProduct } from '../../apis/product'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

const DeleteProduct = ({ deleteProduct, setDeleteProduct, render }) => {
    const handleDeleteProduct = async () => {
        const response = await apiDeleteProduct(deleteProduct._id)
        if (response.success) {
            toast.success('Deleted product successfully!')
            render()
            setDeleteProduct(null)
        } else {
            toast.error('Something went wrong!')
        }
    }

    return (
        <div className='absolute inset-0 min-h-screen bg-gray-100/60 z-50 flex justify-center'>
            <div className='bg-white w-[400px] h-fit p-4 mx-4 mt-12 flex flex-col gap-4 rounded-md'>
                <h1 className='text-center text-xl font-bold py-4 border-b'>Delete Product</h1>
                <div className='flex flex-col gap-4'>
                    <span>Are you sure you want to delete product: <strong>{deleteProduct.title}</strong>?</span>
                </div>
                <div className='flex items-center justify-end gap-4'>
                    <button
                        type='button'
                        className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
                        onClick={handleDeleteProduct}
                    >
                        Delete
                    </button>
                    <button
                        type='button'
                        className='px-4 py-2 rounded-md text-white bg-gray-500 hover:bg-gray-600'
                        onClick={() => setDeleteProduct(null)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteProduct
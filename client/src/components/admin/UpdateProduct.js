import React, { useCallback, useEffect, useState } from 'react'
import { InputField, Loading } from '..'
import { apiUpdateProduct } from '../../apis/product'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

const UpdateProduct = ({ editProduct, setEditProduct, render }) => {
    const [payload, setPayload] = useState({
        title: editProduct?.title || '',
        price: editProduct?.price || '',
        quantity: editProduct?.quantity || '',
        color: editProduct?.color || '',
        category: editProduct?.category || '',
        brand: editProduct?.brand || '',
        description: editProduct?.description?.join(', ') || '',
    })

    const handleUpdate = async () => {
        const finalPayload = { ...payload }
        finalPayload.description = payload.description.split(',').map(item => item.trim())
        const response = await apiUpdateProduct(editProduct._id, finalPayload)
        if (response.success) {
            toast.success('Updated product successfully!')
            render()
            setEditProduct(null)
        } else {
            toast.error('Something went wrong!')
        }
    }

    return (
        <div className='absolute inset-0 min-h-screen bg-gray-100/60 z-50 flex justify-center'>
            <div className='bg-white w-[500px] h-fit p-4 mx-4 mt-12 flex flex-col gap-4 rounded-md'>
                <h1 className='text-center text-xl font-bold py-4 border-b'>Update Product</h1>
                <div className='flex flex-col gap-4'>
                    <InputField
                        value={payload.title}
                        setValue={setPayload}
                        nameKey='title'
                        fullWidth
                    />
                    <InputField
                        value={payload.price}
                        setValue={setPayload}
                        nameKey='price'
                        type='number'
                        fullWidth
                    />
                    <InputField
                        value={payload.quantity}
                        setValue={setPayload}
                        nameKey='quantity'
                        type='number'
                        fullWidth
                    />
                    <InputField
                        value={payload.color}
                        setValue={setPayload}
                        nameKey='color'
                        fullWidth
                    />
                    <InputField
                        value={payload.category}
                        setValue={setPayload}
                        nameKey='category'
                        fullWidth
                    />
                    <InputField
                        value={payload.brand}
                        setValue={setPayload}
                        nameKey='brand'
                        fullWidth
                    />
                    <InputField
                        value={payload.description}
                        setValue={setPayload}
                        nameKey='description'
                        type='textarea'
                        fullWidth
                    />
                </div>
                <div className='flex items-center justify-end gap-4'>
                    <button
                        type='button'
                        className='px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600'
                        onClick={handleUpdate}
                    >
                        Update
                    </button>
                    <button
                        type='button'
                        className='px-4 py-2 rounded-md text-white bg-gray-500 hover:bg-gray-600'
                        onClick={() => setEditProduct(null)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UpdateProduct
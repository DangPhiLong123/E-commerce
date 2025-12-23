import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { apiUploadImages } from '../../apis/product'
import axios from '../../axios'
import { FaCloudUploadAlt } from 'react-icons/fa'

const UpdateProduct = ({ product, onClose, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        title: product.title,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        brand: product.brand,
        description: product.description,
        thumb: product.thumb
    })
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState(product.thumb)
    const [uploadedImage, setUploadedImage] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            if (!file.type.match(/image\/(png|jpg|jpeg)/i)) {
                toast.error('File type must be PNG, JPG or JPEG')
                return
            }
            
            setUploadedImage(file)
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadImage = async () => {
        if (!uploadedImage) return null

        const formData = new FormData()
        formData.append('images', uploadedImage)

        try {
            const response = await apiUploadImages(formData)
            if (response.success) {
                return response.urls[0]
            }
            return null
        } catch (error) {
            console.error('Error uploading image:', error)
            throw error
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)

            // Upload image first if there's a new image
            let updatedThumb = formData.thumb
            if (uploadedImage) {
                const imageUrl = await uploadImage()
                if (imageUrl) {
                    updatedThumb = imageUrl
                } else {
                    toast.error('Failed to upload image')
                    return
                }
            }

            const response = await axios.put(`/product/${product._id}`, 
                { ...formData, thumb: updatedThumb },
                { withCredentials: true }
            )
            
            if (response.success) {
                toast.success('Product updated successfully')
                onUpdateSuccess()
            } else {
                toast.error(response.message || 'Failed to update product')
            }
        } catch (error) {
            console.error('Error updating product:', error)
            toast.error(error.message || 'Failed to update product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Update Product</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block mb-2">Product Image</label>
                            <div className="flex items-center space-x-4">
                                <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Product preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaCloudUploadAlt className="w-8 h-8 text-gray-400" />
                                    )}
                                    <input
                                        type="file"
                                        onChange={handleImageChange}
                                        accept="image/png, image/jpeg, image/jpg"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>Drop your image here, or click to browse</p>
                                    <p>PNG, JPG or JPEG (max. 2MB)</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows="4"
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdateProduct 
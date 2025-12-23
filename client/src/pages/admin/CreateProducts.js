import React, { useState, useEffect } from 'react'
import { InputForm, Select } from 'components'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { apiCreateProduct } from 'apis/product'
import Swal from 'sweetalert2'
import ImageUpload from 'components/products/ImageUpload'
import axios from 'axios'
import DescriptionField from 'components/products/DescriptionField'

const CreateProducts = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.user)
  const {register, formState: {errors}, reset, handleSubmit, watch, setValue} = useForm()
  const [thumbImage, setThumbImage] = useState(null)
  const [productImages, setProductImages] = useState([])
  const [apiCategories, setApiCategories] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URI}/prodcategory/`)
        if (response.data.success) {
          setApiCategories(response.data.prodCategories)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchCategories()
  }, [])

  // Watch for category changes
  const selectedCategory = watch('category')
  useEffect(() => {
    if (selectedCategory) {
      const category = apiCategories.find(cat => cat._id === selectedCategory)
      console.log('Selected category:', category) // Debug log
      if (category?.brand && Array.isArray(category.brand)) {
        console.log('Brands found:', category.brand) // Debug log
        setBrands(category.brand)
        // Reset brand when category changes
        setValue('brand', '')
      } else {
        console.log('No brands found for category') // Debug log
        setBrands([])
      }
    }
  }, [selectedCategory, apiCategories, setValue])

  const handlePreviewThumb = (file) => {
    setThumbImage(file)
  }

  const handlePreviewImages = (files) => {
    setProductImages(files)
  }

  const handleCreateProduct = async (data) => {
    try {
      const finalPayload = { ...data }
      delete finalPayload.thumb
      delete finalPayload.images

      // Get category information first
      const selectedCategory = apiCategories.find(cat => cat._id === data.category)
      if (!selectedCategory) {
        throw new Error('Invalid category selected')
      }
      
      // Set category information
      finalPayload.category = selectedCategory.title
      finalPayload.categoryId = selectedCategory._id

      // Upload thumb image
      if (data.thumb?.[0]) {
        const formData = new FormData()
        formData.append('image', data.thumb[0])
        try {
          const uploadResponse = await axios.post(
            `${process.env.REACT_APP_API_URI}/product/upload-thumb`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          )
          if (uploadResponse.data.success) {
            finalPayload.thumb = uploadResponse.data.url
          } else {
            throw new Error('Failed to upload thumb image')
          }
        } catch (error) {
          if (error.response?.status === 401) {
            throw new Error('Please login to upload images')
          }
          throw new Error('Failed to upload thumb image: ' + (error.response?.data?.message || error.message))
        }
      } else {
        throw new Error('Thumb image is required')
      }

      // Upload product images
      if (data.images?.length > 0) {
        const formData = new FormData()
        for (let image of data.images) {
          formData.append('images', image)
        }
        try {
          const uploadResponse = await axios.post(
            `${process.env.REACT_APP_API_URI}/product/upload-images`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          )
          if (uploadResponse.data.success) {
            finalPayload.images = uploadResponse.data.urls
          }
        } catch (error) {
          console.log('Warning: Failed to upload product images:', error)
        }
      }

      // Create product only if we have the thumb image
      if (!finalPayload.thumb) {
        throw new Error('Thumb image is required')
      }

      const response = await apiCreateProduct(finalPayload)
      if (response.success) {
        reset()
        setThumbImage(null)
        setProductImages([])
        Swal.fire({
          icon: 'success',
          title: 'Created new product successfully',
          confirmButtonColor: '#3085d6'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || error.response?.data?.message || 'Something went wrong!',
        confirmButtonColor: '#dc2626'
      })
    }
  }

  return (
    <div className='w-full'>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Create New Product</span>
      </h1>
      <div className='p-4'>
        <form onSubmit={handleSubmit(handleCreateProduct)}>
          <InputForm 
            label='Name Product'
            register={register}
            errors={errors}
            id='title'
            validate={{
              required: 'Need fill this field'
            }}
            fullWidth
            placeholder='Name of new product'
          />
          <div className='flex my-6 w-full gap-4'>
            <InputForm 
              label='Price'
              register={register}
              errors={errors}
              id='price'
              validate={{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Price of new product'
              type='number'
            />
            <InputForm 
              label='Quantity'
              register={register}
              errors={errors}
              id='quantity'
              validate={{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Quantity of new product'
              type='number'
            />
            <InputForm 
              label='Color'
              register={register}
              errors={errors}
              id='color'
              validate={{
                required: 'Need fill this field'
              }}
              style='flex-1'
              placeholder='Color of new product'
            />
          </div>
          <div className='flex my-6 w-full gap-4'>
            <div className='flex-1'>
              <Select 
                label='Category'
                options={apiCategories?.map(el => ({code: el._id, value: el.title})) || []}
                register={register}
                id='category'
                validate={{required: 'Need fill this field'}}
                errors={errors}
              />
            </div>
            <div className='flex-1'>
              <Select 
                label='Brand'
                options={brands?.map(el => ({code: el, value: el})) || []}
                register={register}
                id='brand'
                validate={{required: 'Need fill this field'}}
                errors={errors}
                disabled={!selectedCategory}
              />
            </div>
          </div>
          <div className='mt-8'>
            <DescriptionField 
              setValue={setValue}
              watch={watch}
            />
          </div>
          <div className='flex flex-col gap-4 mt-8'>
            <ImageUpload 
              label="Thumb Image"
              register={register}
              id="thumb"
              preview={thumbImage}
              handlePreview={handlePreviewThumb}
              required={true}
              error={errors.thumb?.message}
            />
            <ImageUpload 
              label="Product Images"
              register={register}
              id="images"
              preview={productImages}
              handlePreview={handlePreviewImages}
              multiple={true}
            />
          </div>
          <div className='mt-8'>
            <button 
              type='submit'
              className='px-4 py-2 bg-main text-white rounded-md hover:bg-main/90'
            >
              Create new product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProducts

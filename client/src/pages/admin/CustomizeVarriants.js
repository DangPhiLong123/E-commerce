import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { apiAddVarriant, apiUploadImages, apiUpdateProduct, apigetProduct, apiRemoveVarriant } from '../../apis/product';
import { toast } from 'react-toastify';

const CustomizeVarriants = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const product = state?.product || {};

  // State cho sản phẩm (thumb, images)
  const [thumb, setThumb] = useState('');
  const [imagesProduct, setImagesProduct] = useState([]);
  const [previewThumb, setPreviewThumb] = useState([]);
  const [previewImagesProduct, setPreviewImagesProduct] = useState([]);

  // State cho variant mới
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [productData, setProductData] = useState(product);

  // State cho confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);

  // Upload thumb sản phẩm
  const handleThumbChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const previewUrl = URL.createObjectURL(file);
    setPreviewThumb([previewUrl]);
    
    const formData = new FormData();
    formData.append('images', file);
    setUploading(true);
    
    try {
      const res = await apiUploadImages(formData);
      
      if (res.success && res.urls && res.urls.length > 0) {
        const uploadedUrl = res.urls[0];
        setThumb(uploadedUrl);
        setPreviewThumb([uploadedUrl]);
        toast.success('Thumb uploaded for variant');
      } else if (res.data?.success && res.data?.urls && res.data.urls.length > 0) {
        const uploadedUrl = res.data.urls[0];
        setThumb(uploadedUrl);
        setPreviewThumb([uploadedUrl]);
        toast.success('Thumb uploaded for variant');
      } else {
        toast.error('Upload failed - unexpected response structure');
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    }
    
    setUploading(false);
  };

  // Upload images sản phẩm
  const handleImagesProductChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImagesProduct(previewUrls);
    
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    setUploading(true);
    
    try {
      const res = await apiUploadImages(formData);
      
      if (res.success && res.urls && res.urls.length > 0) {
        const uploadedUrls = res.urls;
        setImagesProduct(uploadedUrls);
        setPreviewImagesProduct(uploadedUrls);
        toast.success(`${uploadedUrls.length} images uploaded for variant`);
      } else if (res.data?.success && res.data?.urls && res.data.urls.length > 0) {
        const uploadedUrls = res.data.urls;
        setImagesProduct(uploadedUrls);
        setPreviewImagesProduct(uploadedUrls);
        toast.success(`${uploadedUrls.length} images uploaded for variant`);
      } else {
        toast.error('Upload failed - unexpected response structure');
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    }
    
    setUploading(false);
  };

  // // Thêm variant mới
  const handleAddVariant = async () => {
    if (!color || !price) return toast.error('Color and Price are required');
    
    try {
      const variantData = { color, price, title };
      
      if (thumb && thumb.trim() !== '') {
        variantData.thumb = thumb;
      }
      
      if (imagesProduct && imagesProduct.length > 0) {
        variantData.images = imagesProduct;
      }
      
      if (!variantData.thumb && (!variantData.images || variantData.images.length === 0)) {
        toast.warn('Consider uploading at least a thumb or some images for better variant display');
      }
      
      const res = await apiAddVarriant(id, variantData);
      
      if ((res && res.data && (res.data.success === true || res.data.success === 'true')) || (res && res.success === true)) {
        toast.success('Add Variant Success!');
        
        // Reset form
        setColor('');
        setPrice('');
        setTitle('');
        setThumb('');
        setImagesProduct([]);
        setPreviewThumb([]);
        setPreviewImagesProduct([]);
        
        // Fetch updated product data
        try {
          const productRes = await apigetProduct(id);
          if (productRes.success) {
            setProductData(productRes.productData);
            toast.info('Variant added! Check the product detail page to see the new variant.');
          }
        } catch (err) {
          console.log('Error fetching updated product:', err);
        }
      } else {
        toast.error('Add Variant Failed!');
      }
    } catch (err) {
      toast.error('Add Variant Failed: ' + err.message);
    }
  };

  // Xóa variant
  const handleRemoveVariant = async (variantId) => {
    setVariantToDelete(variantId);
    setShowConfirmModal(true);
  };

  // Xác nhận xóa variant
  const confirmDeleteVariant = async () => {
    if (!variantToDelete) return;

    try {
      const res = await apiRemoveVarriant(id, variantToDelete);
      if ((res && res.data && (res.data.success === true || res.data.success === 'true')) || (res && res.success === true)) {
        toast.success('Variant deleted successfully!');
        const productRes = await apigetProduct(id);
        if (productRes.success) {
          setProductData(productRes.productData);
        }
      } else {
        toast.error('Delete variant failed!');
      }
    } catch (err) {
      toast.error('Delete variant failed!');
    }

    setShowConfirmModal(false);
    setVariantToDelete(null);
  };

  // Hủy xóa variant
  const cancelDeleteVariant = () => {
    setShowConfirmModal(false);
    setVariantToDelete(null);
  };

  return (
    <div className='w-full min-h-screen bg-gray-50 p-8'>
      <div className='max-w-3xl mx-auto bg-white rounded shadow p-8'>
        <h1 className='text-3xl font-bold mb-6'>Customize Variants for <span className='text-blue-600'>{product.title}</span></h1>
        {/* Danh sách variants đã có */}
        {productData?.variants && productData.variants.length > 0 && (
          <div className='mb-6'>
            <label className='block font-semibold mb-1'>Existing Variants</label>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {productData.variants.map((variant, idx) => (
                <div key={variant._id || idx} className='border rounded p-4 bg-gray-50'>
                  <div className='flex justify-between items-start mb-2'>
                    <span className='font-semibold text-lg'>{variant.title || variant.color}</span>
                    <button
                      onClick={() => handleRemoveVariant(variant._id)}
                      className='text-red-500 hover:text-red-700 font-bold text-xl'
                      title='Delete variant'
                    >
                      ×
                    </button>
                  </div>
                  <div className='mb-2'>
                    <span className='text-sm text-gray-600'>Color: </span>
                    <span className='font-medium'>{variant.color}</span>
                  </div>
                  <div className='mb-2'>
                    <span className='text-sm text-gray-600'>Price: </span>
                    <span className='font-bold text-main'>{Number(variant.price).toLocaleString()} VND</span>
                  </div>
                  {variant.thumb && (
                    <div className='mb-2'>
                      <img src={variant.thumb} alt={variant.title} className='w-20 h-20 object-cover rounded' />
                    </div>
                  )}
                  {variant.images && variant.images.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {variant.images.map((img, imgIdx) => (
                        <img key={imgIdx} src={img} alt='variant' className='w-12 h-12 object-cover rounded' />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Variant Form */}
        <div className='mb-6 grid grid-cols-1 gap-4'>
          <div>
            <label className='block font-semibold mb-1'>Original Name</label>
            <input value={product.title || ''} disabled className='w-full p-2 border rounded bg-gray-100' />
          </div>
          <div>
            <label className='block font-semibold mb-1'>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Variant Title (e.g., iPhone 64GB Gold)' className='p-2 border rounded w-full' />
          </div>
          <div>
            <label className='block font-semibold mb-1'>Price *</label>
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder='Price' type='number' className='p-2 border rounded w-full' />
          </div>
          <div>
            <label className='block font-semibold mb-1'>Color *</label>
            <input value={color} onChange={e => setColor(e.target.value)} placeholder='Color (e.g., Red)' className='p-2 border rounded w-full' />
          </div>
        </div>
        {/* Upload Thumb */}
        <div className='mb-6'>
          <label className='block font-semibold mb-1'>Upload Thumb for Variant</label>
          <p className='text-sm text-gray-500 mb-2'>Upload thumbnail image that will be displayed for this specific variant</p>
          <input type='file' accept='image/*' onChange={handleThumbChange} className='mb-2' />
          {uploading && <p className='text-sm text-blue-500'>Uploading thumb...</p>}
          {thumb && <p className='text-sm text-green-500'>✓ Thumb uploaded successfully</p>}
          {!thumb && <p className='text-sm text-gray-400'>No thumb uploaded yet</p>}
          
          <div className='flex flex-wrap gap-2 mt-2'>
            {previewThumb.map((img, idx) => (
              <div key={idx} className='relative'>
                <img src={img} alt='thumb' className='w-24 h-24 object-cover rounded border-2 border-green-300' />
                <span className='absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded'>✓</span>
              </div>
            ))}
          </div>
        </div>
        {/* Upload Images of Product */}
        <div className='mb-6'>
          <label className='block font-semibold mb-1'>Upload Images for Variant</label>
          <p className='text-sm text-gray-500 mb-2'>Upload additional images that will be shown when this variant is selected</p>
          <input type='file' accept='image/*' multiple onChange={handleImagesProductChange} className='mb-2' />
          {uploading && <p className='text-sm text-blue-500'>Uploading images...</p>}
          {imagesProduct.length > 0 && <p className='text-sm text-green-500'>✓ {imagesProduct.length} images uploaded successfully</p>}
          {imagesProduct.length === 0 && <p className='text-sm text-gray-400'>No images uploaded yet</p>}
          
          <div className='flex flex-wrap gap-2 mt-2'>
            {previewImagesProduct.map((img, idx) => (
              <div key={idx} className='relative'>
                <img src={img} alt='product' className='w-20 h-20 object-cover rounded border-2 border-green-300' />
                <span className='absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded'>✓</span>
              </div>
            ))}
          </div>
        </div>
        {/* Save Button */}
        <div className='flex justify-end gap-2 mt-8'>
          <button onClick={() => navigate(-1)} className='px-4 py-2 border rounded'>Cancel</button>
          <button onClick={handleAddVariant} disabled={uploading} className='px-4 py-2 bg-blue-500 text-white rounded'>{uploading ? 'Saving...' : 'Add Variant'}</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4'>
            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                <svg className='h-6 w-6 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Xác nhận xóa variant</h3>
              <p className='text-sm text-gray-500 mb-6'>
                Bạn có chắc chắn muốn xóa variant này không? Hành động này không thể hoàn tác.
              </p>
              <div className='flex gap-3 justify-center'>
                <button
                  onClick={cancelDeleteVariant}
                  className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors'
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteVariant}
                  className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizeVarriants;

import React from 'react'

const ImageUpload = ({ label, register, id, preview, handlePreview, multiple = false, required = false, error }) => {
  const handleFileChange = (e) => {
    const files = e.target.files
    if (!files.length) return

    if (multiple) {
      handlePreview(Array.from(files))
    } else {
      handlePreview(files[0])
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <p className='font-medium mb-2'>{label}</p>
        <div className='flex items-center gap-2'>
          <input
            type='file'
            id={id}
            className='block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100'
            accept='.jpg,.jpeg,.png,.webp'
            multiple={multiple}
            {...register(id, {
              required: required ? 'This field is required' : false,
              onChange: handleFileChange
            })}
          />
          {multiple && <span className='text-sm text-gray-500'>{preview?.length || 0} files</span>}
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className={`grid ${multiple ? 'grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {multiple ? (
            Array.isArray(preview) && preview.map((file, index) => (
              <div key={index} className='relative w-[150px] h-[150px] border rounded-lg overflow-hidden'>
                <img
                  src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className='w-full h-full object-contain p-2'
                />
              </div>
            ))
          ) : (
            <div className='relative w-[200px] h-[200px] border rounded-lg overflow-hidden'>
              <img
                src={typeof preview === 'string' ? preview : URL.createObjectURL(preview)}
                alt="preview"
                className='w-full h-full object-contain p-2'
              />
            </div>
          )}
        </div>
      )}

      {error && <span className='text-red-500 text-sm'>{error}</span>}
    </div>
  )
}

export default ImageUpload 
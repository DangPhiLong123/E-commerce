import React, { useEffect } from 'react'
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai'

const SPEC_FIELDS = [
  { key: 'Technology', placeholder: 'e.g., Apple A15 Bionic' },
  { key: 'Dimensions', placeholder: 'e.g., 8GB RAM, 128GB Storage' },
  { key: 'Weight', placeholder: 'e.g., 6.1-inch Super Retina XDR' },
  { key: 'Display', placeholder: 'e.g., Apple GPU (5-core)' },
  { key: 'Resolution', placeholder: 'e.g., 128GB/256GB/512GB' },
  { key: 'OS', placeholder: 'e.g., 12MP Wide + 12MP Ultra Wide' },
  { key: 'Chipset', placeholder: 'e.g., 5G, Wi-Fi 6, Bluetooth 5.0' },
  { key: 'CPU', placeholder: 'e.g., 3240mAh, Fast charging' },
  { key: 'Internal', placeholder: 'e.g., 146.7 x 71.5 x 7.4 mm' },
  { key: 'Camera', placeholder: 'e.g., 174 grams' }
]

const DescriptionField = ({ setValue, watch }) => {
  const [specs, setSpecs] = React.useState(
    SPEC_FIELDS.reduce((acc, field) => ({
      ...acc,
      [field.key]: ''
    }), {})
  )

  // Watch for description changes
  const description = watch('description')

  // Initialize specs from existing description if any
  useEffect(() => {
    if (description && Array.isArray(description)) {
      const newSpecs = { ...specs }
      description.forEach(desc => {
        const [key, value] = desc.split(':').map(s => s.trim())
        if (SPEC_FIELDS.find(field => field.key === key)) {
          newSpecs[key] = value
        }
      })
      setSpecs(newSpecs)
    }
  }, [])

  const handleChange = (key, value) => {
    const newSpecs = {
      ...specs,
      [key]: value
    }
    setSpecs(newSpecs)

    // Update form value immediately
    const descriptionArray = Object.entries(newSpecs)
      .filter(([_, val]) => val.trim() !== '')
      .map(([k, val]) => `${k}: ${val.trim()}`)

    setValue('description', descriptionArray, { shouldValidate: true })
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <label className='font-semibold'>Technical Specifications</label>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {SPEC_FIELDS.map((field) => (
          <div key={field.key} className='flex flex-col gap-2'>
            <label className='text-sm text-gray-600'>{field.key}</label>
            <input
              type='text'
              placeholder={field.placeholder}
              className='w-full px-3 py-2 border rounded-md focus:border-main'
              value={specs[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DescriptionField 
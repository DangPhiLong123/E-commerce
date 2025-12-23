import React from 'react'
import { FaTruck, FaCreditCard, FaShieldAlt, FaHeadset } from 'react-icons/fa'
import useI18n from 'hooks/useI18n'

const Services = () => {
  const { t } = useI18n()

  const services = [
    {
      id: 1,
      icon: <FaTruck size={40} />,
      title: t('common.fast_delivery'),
      description: t('common.fast_delivery_desc')
    },
    {
      id: 2,
      icon: <FaCreditCard size={40} />,
      title: t('common.flexible_payment'),
      description: t('common.flexible_payment_desc')
    },
    {
      id: 3,
      icon: <FaShieldAlt size={40} />,
      title: t('common.genuine_warranty'),
      description: t('common.genuine_warranty_desc')
    },
    {
      id: 4,
      icon: <FaHeadset size={40} />,
      title: t('common.support_24_7'),
      description: t('common.support_24_7_desc')
    }
  ]

  return (
    <div className='w-full mb-8 px-4'>
      <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main text-center'>
        {t('common.our_services')}
      </h3>
      
      <div className='mt-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {services.map((service) => (
            <div key={service.id} className='text-center group hover:transform hover:scale-105 transition-all duration-300'>
              {/* Service Icon */}
              <div className='flex justify-center mb-6'>
                <div className='w-20 h-20 bg-main rounded-full flex items-center justify-center text-white group-hover:bg-red-600 transition-colors duration-300'>
                  {service.icon}
                </div>
              </div>
              
              {/* Service Title */}
              <h4 className='text-lg font-bold text-gray-800 mb-4 uppercase'>
                {service.title}
              </h4>
              
              {/* Service Description */}
              <p className='text-sm text-gray-600 leading-relaxed px-2'>
                {service.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Call to Action Button */}
        <div className='flex justify-center mt-12'>
          <button className='bg-main hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-300 uppercase'>
            {t('common.view_more_services')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Services

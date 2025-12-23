import React from 'react'
import useI18n from 'hooks/useI18n'

const FAQ = () => {
  const { t } = useI18n()

  const faqItems = [
    {
      id: 1,
      question: t('common.faq_q1'),
      answer: t('common.faq_a1')
    },
    {
      id: 2,
      question: t('common.faq_q2'),
      answer: t('common.faq_a2')
    },
    {
      id: 3,
      question: t('common.faq_q3'),
      answer: t('common.faq_a3')
    },
    {
      id: 4,
      question: t('common.faq_q4'),
      answer: t('common.faq_a4')
    }
  ]

  return (
    <div className='w-full mb-8 px-4'>
      <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main text-center'>
        {t('common.faqs_title')}
      </h3>
      
      <div className='mt-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 px-4'>
          {faqItems.map((item) => (
            <div key={item.id} className='flex flex-col gap-3'>
              {/* Question */}
              <h4 className='text-red-500 font-bold text-lg leading-tight'>
                {item.question}
              </h4>
              
              {/* Answer */}
              <p className='text-gray-700 text-base leading-relaxed'>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ

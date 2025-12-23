import React, { useState, memo } from 'react'
import { FaStar } from 'react-icons/fa'
import logo from 'assets/logo.png'

const VoteOption = ({ nameProduct, handleSubmitVote, handleCloseVote }) => {
    const [payload, setPayload] = useState({
        comment: '',
        score: 0
    })
    const [hover, setHover] = useState(null)
    
    const renderStarText = (score) => {
        switch(score) {
            case 1:
                return 'Terrible'
            case 2:
                return 'Bad'
            case 3:
                return 'Neutral'
            case 4:
                return 'Good'
            case 5:
                return 'Perfect'
            default:
                return 'Rate this product'
        }
    }

    return (
        <div className='fixed inset-0 z-50'>
            <div className='absolute inset-0 bg-overlay' onClick={handleCloseVote}></div>
            <div className='w-[700px] h-[440px] bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-md'>
                <div className='h-full flex flex-col p-4'>
                    <div className='flex justify-center mb-2'>
                        <img src={logo} alt="Logo" className='h-12 object-contain' />
                    </div>
                    
                    <h2 className='text-center text-lg font-medium border-b py-3'>{`Voting product ${nameProduct}`}</h2>
                    
                    <div className='flex flex-col items-center justify-center gap-4 py-6'>
                        <p className='text-lg text-gray-700'>Do you like this product?</p>

                        <div className='flex items-center gap-2'>
                            {Array.from(Array(5).keys()).map((star, index) => (
                                <span 
                                    key={index}
                                    className='cursor-pointer p-2 border rounded-md flex flex-col items-center'
                                    onMouseEnter={() => setHover(index + 1)}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => setPayload(prev => ({...prev, score: index + 1}))}
                                >
                                    <FaStar 
                                        size={25}
                                        color={(hover || payload.score) > index ? '#f59e0b' : '#ccc'}
                                    />
                                    <span className='text-sm'>{index === (hover - 1 || payload.score - 1) ? renderStarText(index + 1) : ''}</span>
                                </span>
                            ))}
                        </div>

                        <textarea 
                            className='form-textarea w-full placeholder:italic placeholder:text-sm border rounded-md p-3'
                            placeholder='Share your thoughts about this product...'
                            value={payload.comment}
                            onChange={e => setPayload(prev => ({...prev, comment: e.target.value}))}
                            rows={3}
                        />
                    </div>

                    <button 
                        className='py-2 px-4 bg-main text-white rounded-md hover:bg-main/90 w-full'
                        onClick={() => handleSubmitVote(payload)}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default memo(VoteOption) 
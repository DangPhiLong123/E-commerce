import React from 'react'
import { VoteOption, VoteBar, Ratings } from '..'

const DetailProduct = ({ product }) => {
  return (
    <div className='w-full'>
      <div className='flex flex-col gap-4'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <img src={product?.thumb} alt={product?.title} className='w-full h-[400px] object-contain' />
          </div>
          <div className='flex-1'>
            <h2 className='text-2xl font-bold'>{product?.title}</h2>
            <div className='my-4'>
              <VoteBar product={product} />
            </div>
            <div className='my-4'>
              <span className='text-red-500 text-2xl font-bold'>{Number(product?.price).toLocaleString()} VND</span>
            </div>
            <div className='my-4'>
              <p>{product?.description}</p>
            </div>
          </div>
        </div>
        <div>
          <Ratings pid={product?._id} totalRatings={product?.totalRatings} ratings={product?.ratings} />
        </div>
      </div>
    </div>
  )
}

export default DetailProduct 
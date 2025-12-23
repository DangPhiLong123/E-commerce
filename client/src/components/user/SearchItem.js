import React, {memo, useState, useEffect} from 'react'
import icons from 'ultils/icons'
import { colors } from 'ultils/contants'
import { createSearchParams, useNavigate, useParams } from 'react-router-dom'
import { apiGetProducts } from 'apis/product'
import useDebounce from 'hooks/useDebounce'

const { FaCaretDown } = icons

const SearchItem = ({name, activeClick, changeActiveFilter, type='checkbox'}) => {
  const navigate = useNavigate()
  const {category} = useParams()
  const [selected, setSelected] = useState([])
  const [price, setPrice] = useState({
    from: '',
    to: ''
  })
  const [bestPrice, setBestPrice] = useState(null)
  const handleSelect = (e) => {
    changeActiveFilter(null)
    const alreadyEl = selected.find(el => el === e.target.value)
    if(alreadyEl) setSelected(prev => prev.filter(el => el !== e.target.value))
    else setSelected(prev => [...prev, e.target.value])
  }
  const fetchBestPriceProduct = async() => {
    const response = await apiGetProducts({sort: '-price', limit: 1})
    if (response.success) setBestPrice(response.products[0]?.price)
  }
  
  useEffect(() => {
    if(selected.length > 0) {
      navigate({
        pathname: `/${category}`,
        search: createSearchParams({
          color: selected.join(',')
        }).toString()
      })
    } else {
    }
  }, [selected, category, navigate])

  useEffect(() => {
    if(type === 'input') fetchBestPriceProduct()
  }, [type])

  useEffect(() => {
    if(price.from > price.to) alert('From must be less than To')
  }, [price])

  const debouncePriceFrom = useDebounce(price.from, 500)
  const debouncePriceTo = useDebounce(price.to, 500)
  useEffect(() => {
    const data = {}
    if(Number(price.from) > 0) data.from = price.from
    if(Number(price.to) > 0) data.to = price.to
      navigate({
        pathname: `/${category}`,
        search: createSearchParams(data).toString()
      })
  }, [debouncePriceFrom, debouncePriceTo, category, navigate, price.from, price.to])
  return (
    <div 
    onClick={() => changeActiveFilter(name)}
    className='cursor-pointer p-3 text-gray-500 text-xs gap-6 border border-gray-800 flex justify-between items-center relative'>
      <span className='capitalize'>{name}</span>
      <FaCaretDown  />
      {activeClick === name && <div className='absolute z-10 top-[calc(100%+1px)] left-0 w-fit p-4 border bg-white shadow-md min-w-[200px]'>
        {type === 'checkbox' && <div className=''>
            <div className='py-2 items-center flex justify-between gap-8 border-b'>
              <span className='whitespace-nowrap'>{`${selected.length} selected`}</span>
              <span onClick={e => {
                e.stopPropagation() 
                setSelected([])
              }} 
              className='underline cursor-pointer hover:text-main'>Reset</span>
            </div> 
            <div onClick={e => e.stopPropagation()} className='flex flex-col gap-3 mt-4'>
              {colors.map((el, index) => (
              <div key={index} className='flex items-center gap-2'>
                <input 
                type='checkbox' 
                onChange={handleSelect} 
                value={el} 
                id={el} 
                checked={selected.some(selectedItem => selectedItem === el)}
                
                />
                <label className='w-5 h-5 capitalize'  htmlFor={el}>{el}</label>
              </div>
            ))}</div>        
          </div>}
        {type === 'input' && <div onClick={e => e.stopPropagation()}>
          <div  className='py-2 items-center flex justify-between gap-8 border-b'>
              <span className='whitespace-nowrap'>{`The highest price is ${Number(bestPrice).toLocaleString()} VND `}</span>
              <span onClick={e => {
                e.stopPropagation() 
                setPrice({from: '', to: ''})
                changeActiveFilter(null)
              }} 
              className='underline cursor-pointer hover:text-main'>Reset</span>
            </div>
            <div className='flex items-center p-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <label htmlFor='from'>From</label>
                <input 
                value={price.from}
                onChange={e => setPrice(prev => ({...prev, from: +e.target.value}))}
                className='form-input' type='number' id='from' />
              </div>
              <div className='flex flex-col gap-2'>
                <label htmlFor='to'>To</label>
                <input 
                value={price.to}
                onChange={e => setPrice(prev => ({...prev, to: +e.target.value}))}
                className='form-input' type='number' id='to' />
              </div>
            </div>
          </div>}
      </div>}
    </div>
  )
}

export default memo(SearchItem)

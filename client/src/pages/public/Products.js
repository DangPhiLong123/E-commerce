import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate, createSearchParams } from 'react-router-dom'
import { Breadcrumb, SearchItem, InputSelect } from '../../components'
import { apiGetProducts } from '../../apis'
import { sorts } from '../../ultils/contants'
import ProductList from '../../components/product/ProductList'
import Pagination from '../../components/common/Pagination'

const Products = () => {
  const navigate = useNavigate()
  const { category } = useParams()
  const [products, setProducts] = useState([])
  const [activeClick, setActiveClick] = useState(null)
  const [params] = useSearchParams()
  const [sort, setSort] = useState(params.get('sort') || '')
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 16
  const currentPage = parseInt(params.get('page')) || 1

  const capitalize = (str) => {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1)
  }

  useEffect(() => {
    console.log('=== Products state changed ===', products);
  }, [products]);

  const fetchProductsByCategory = async (queries) => {
    if (loading) return;

    try {
      setLoading(true)
      let queryParams = {
        limit: itemsPerPage,
        page: currentPage
      };

      if (queries) {
        // Handle price range
        if (queries.from) queryParams.from = queries.from;
        if (queries.to) queryParams.to = queries.to;

        // Handle search query
        if (queries.q) queryParams.q = queries.q;

        // Handle other filters
        if (queries.sort) queryParams.sort = queries.sort;
        if (queries.color) queryParams.color = queries.color;
      }

      // Handle category
      if (category && category !== ":category") {
        queryParams.category = category;
      }

      console.log('=== Query Params ===', queryParams);
      const response = await apiGetProducts(queryParams);
      console.log('=== API Response ===', response);
      console.log('=== Products Data ===', response?.products);

      if (response?.success) {
        if (!response.products || !Array.isArray(response.products)) {
          console.error('Invalid products data:', response.products);
          setProducts([]);
          setTotalItems(0);
          return;
        }

        console.log('=== Setting products state ===');
        console.log('Products count:', response.products?.length || 0);
        console.log('Total items:', response.counts || 0);
        
        setProducts(response.products);
        setTotalItems(response.counts || 0);

        // Log state after update
        console.log('=== Current products state ===', products);
      } else {
        console.error('API request not successful:', response);
        setProducts([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let queries = {}
    const validParams = ['q', 'sort', 'color', 'from', 'to']
    for (let [key, value] of params.entries()) {
      if (validParams.includes(key)) {
        queries[key] = value
      }
    }

    if (Object.keys(queries).length === 0 && (!category || category === ":category")) {
      queries = null
    }

    fetchProductsByCategory(queries)
  }, [params, category, currentPage]);

  const changeActiveFilter = useCallback((name) => {
    if (activeClick === name) setActiveClick(null)
    else setActiveClick(name)
  }, [activeClick])

  const handleSort = useCallback((value) => {
    const currentParams = Object.fromEntries(params.entries())
    const newParams = { ...currentParams }

    if (value) {
      newParams.sort = value
    } else {
      delete newParams.sort
    }

    newParams.page = 1

    setSort(value)
    navigate({
      pathname: window.location.pathname,
      search: createSearchParams(newParams).toString()
    })
  }, [navigate, params])

  return (
    <div className='w-full'>
      <div className='h-[81px] w-full flex items-center border-b border-gray-200'>
        <div className='w-main mx-auto'>
          <h3 className='font-semibold text-[18px] uppercase mb-2'>
            {params.get('q')
              ? `Search results for "${params.get('q')}"`
              : category === ":category"
                ? 'ALL PRODUCTS'
                : capitalize(category)}
          </h3>
          <Breadcrumb category={category === ":category" ? 'Products' : capitalize(category)} />
        </div>
      </div>
      <div className='w-main border p-4 flex justify-between mt-8 m-auto'>
        <div className='w-4/5 flex-auto flex flex-col gap-3'>
          <span className='text-sm font-semibold'>Filter By</span>
          <div className='flex items-center gap-4'>
            <SearchItem
              name='price'
              activeClick={activeClick}
              changeActiveFilter={changeActiveFilter}
              type='input'
            />
            <SearchItem
              name='color'
              activeClick={activeClick}
              changeActiveFilter={changeActiveFilter}
            />
          </div>
        </div>
        <div className='w-1/5 flex flex-col gap-3'>
          <span className='text-sm font-semibold'>Sort By</span>
          <InputSelect value={sort} changeValue={handleSort} options={sorts} />
        </div>
      </div>
      <div className='mt-8 w-main mx-auto'>
        {loading ? (
          <div className='flex items-center justify-center min-h-[200px]'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-main'></div>
          </div>
        ) : (
          <>
            {products?.length > 0 ? (
              <>
                <ProductList products={products} />
                {totalItems > 0 && (
                  <Pagination
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                  />
                )}
              </>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                {params.get('q') 
                  ? `No products found for "${params.get('q')}". Try different keywords.`
                  : 'No products found'
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products


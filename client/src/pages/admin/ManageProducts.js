import React, { useEffect, useState } from 'react'
import { apiGetProducts } from '../../apis/product'
import moment from 'moment'
import { InputField, Pagination } from '../../components'
import useDebounce from '../../hooks/useDebounce'
import { useSearchParams, useNavigate } from 'react-router-dom'
import UpdateProduct from '../../components/products/UpdateProduct'
import DeleteProduct from '../../components/admin/DeleteProduct'
import CustomizeVarriants from '../../components/products/CustomizeVarriants'

const ManageProducts = () => {
  const [products, setProducts] = useState(null)
  const [params] = useSearchParams()
  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [variantProduct, setVariantProduct] = useState(null)
  const [queries, setQueries] = useState({
    q: '',
    page: 1,
    limit: 10
  })

  const queriesDebounce = useDebounce(queries.q, 800)
  const navigate = useNavigate()

  const fetchProducts = async (params) => {
    try {
      const response = await apiGetProducts(params)
      if (response.success) {
        setProducts(response)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    const page = params.get('page') || 1
    setQueries(prev => ({ ...prev, page: +page }))
  }, [params])

  useEffect(() => {
    const parameters = {}
    if (queriesDebounce) parameters.q = queriesDebounce
    parameters.page = queries.page
    parameters.limit = queries.limit
    fetchProducts(parameters)
  }, [queriesDebounce, queries.page, queries.limit])

  const handleEdit = (product) => {
    setEditProduct(product)
  }

  const handleDelete = (product) => {
    setDeleteProduct(product)
  }

  const handleVariants = (product) => {
    navigate(`/admin/products/${product._id}/variants`, { state: { product } })
  }

  return (
    <div className='w-full'>
      <div className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Manage Products</span>
      </div>
      <div className='p-4'>
        <div className='w-full flex justify-end items-center gap-4 py-4'>
          <InputField
            nameKey='q'
            value={queries.q}
            setValue={setQueries}
            placeholder='Search by title, category or brand...'
            isHideLabel
            style='w-[500px]'
          />
        </div>
        <table className='table-auto w-full'>
          <thead>
            <tr className='border bg-sky-900 text-white border-white'>
              <th className='text-center p-2'>#</th>
              <th className='text-center p-2'>Thumb</th>
              <th className='text-center p-2'>Title</th>
              <th className='text-center p-2'>Brand</th>
              <th className='text-center p-2'>Category</th>
              <th className='text-center p-2'>Price</th>
              <th className='text-center p-2'>Quantity</th>
              <th className='text-center p-2'>Sold</th>
              <th className='text-center p-2'>Created At</th>
              <th className='text-center p-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.products?.map((el, idx) => (
              <tr key={el._id} className='border-b hover:bg-gray-50'>
                <td className='text-center p-2'>{((queries.page - 1) * queries.limit) + idx + 1}</td>
                <td className='p-2'>
                  <img
                    src={el.thumb}
                    alt={el.title}
                    className='w-16 h-16 object-cover mx-auto'
                  />
                </td>
                <td className='text-center p-2'>{el.title}</td>
                <td className='text-center p-2'>{el.brand}</td>
                <td className='text-center p-2'>{el.category}</td>
                <td className='text-center p-2'>{Number(el.price).toLocaleString()} VND</td>
                <td className='text-center p-2'>{el.quantity}</td>
                <td className='text-center p-2'>{el.sold}</td>
                <td className='text-center p-2'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
                <td className='text-center p-2'>
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      className='px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600'
                      onClick={() => handleEdit(el)}
                    > 
                      Edit
                    </button>
                    <button
                      className='px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600'
                      onClick={() => handleDelete(el)}
                    >
                      Delete
                    </button>
                    <button
                      className='px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                      onClick={() => handleVariants(el)}
                    >
                      Variants
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products?.counts > queries.limit && (
          <div className='w-full flex justify-center mt-4'>
            <Pagination
              totalItems={products?.counts}
              itemsPerPage={queries.limit}
              currentPage={+queries.page}
            />
          </div>
        )}
      </div>
      {editProduct && (
        <UpdateProduct
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdateSuccess={() => {
            setEditProduct(null)
            fetchProducts({
              page: queries.page,
              limit: queries.limit,
              q: queries.q
            })
          }}
        />
      )}
      {deleteProduct && (
        <DeleteProduct
          deleteProduct={deleteProduct}
          setDeleteProduct={setDeleteProduct}
          render={() => fetchProducts({
            page: queries.page,
            limit: queries.limit,
            q: queries.q
          })}
        />
      )}
      {variantProduct && (
        <CustomizeVarriants
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
          onUpdateSuccess={() => {
            setVariantProduct(null)
            fetchProducts({
              page: queries.page,
              limit: queries.limit,
              q: queries.q
            })
          }}
        />
      )}
    </div>
  )
}

export default ManageProducts

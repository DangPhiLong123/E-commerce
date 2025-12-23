import React, { useEffect, useState, useCallback } from 'react'
import { apiGetUsers } from 'apis/user'
import { roles } from 'ultils/contants'
import moment from 'moment'
import { InputField, Pagination } from 'components'
import useDebounce from 'hooks/useDebounce'
import { useSearchParams } from 'react-router-dom'
import UpdateUser from 'components/admin/UpdateUser'
import DeleteUser from 'components/admin/DeleteUser'

const ManageUser = () => {
  const [users, setUsers] = useState(null)
  const [params] = useSearchParams()
  const [editUser, setEditUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [queries, setQueries] = useState({
    q: "",
    page: 1,
    limit: 5
  })

  const fetchUsers = async(params) => {
    const response = await apiGetUsers(params)
    if(response.success) {
      setUsers(response)
    }
  }

  const queriesDebounce = useDebounce(queries.q, 800)
  
  useEffect(() => {
    const page = params.get('page') || 1
    setQueries(prev => ({...prev, page: +page}))
  }, [params])

  useEffect(() => {
    const parameters = {}
    if (queriesDebounce) {
      parameters.q = queriesDebounce
    }
    parameters.page = queries.page
    parameters.limit = queries.limit
    fetchUsers(parameters)
  }, [queriesDebounce, queries.page, queries.limit])

  const getRoleName = (roleCode) => {
    const role = roles.find(role => role.code === +roleCode)
    return role ? role.value : 'Unknown'
  }

  return (
    <div>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
        <span>Manage Users</span>
      </h1>
      <div className='p-4'>
        <div className='flex justify-end py-4'>
          <InputField 
          nameKey={'q'}
          value={queries.q}
          setValue={setQueries}
          style={'w-[500px]'}
          placeholder='Search name or email user...'
          isHideLabel
          />
        </div>
        <table className='table-auto w-full'>
          <thead>
            <tr className='border-b bg-sky-900 text-white'>
              <th className='text-left p-2 border-r'>#</th>
              <th className='text-left p-2 border-r'>Email Address</th>
              <th className='text-left p-2 border-r'>Fullname</th>
              <th className='text-left p-2 border-r'>Role</th>
              <th className='text-left p-2 border-r'>Mobile</th>
              <th className='text-left p-2 border-r'>Status</th>
              <th className='text-left p-2 border-r'>Created At</th>
              <th className='text-left p-2 border-r'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.users?.map((el, idx) => (
              <tr key={el._id} className='border-b hover:bg-gray-50'>
                <td className='p-2'>{((queries.page - 1) * queries.limit) + idx + 1}</td>
                <td className='p-2'>{el.email}</td>
                <td className='p-2'>{`${el.lastname} ${el.firstname}`}</td>
                <td className='p-2'>{getRoleName(el.role)}</td>
                <td className='p-2'>{el.mobile}</td>
                <td className='p-2'>
                  <span className={`px-2 py-1 rounded-full text-white ${el.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}>
                    {el.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className='p-2'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
                <td className='p-2 flex gap-2'>
                  <button 
                    className='px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600'
                    onClick={() => setEditUser(el)}
                  >
                    Edit
                  </button>
                  <button 
                    className='px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600'
                    onClick={() => setDeleteUser(el)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users?.counts > 0 && (
          <div className='w-full flex justify-end mt-4'>
            <Pagination 
              totalItems={users?.counts}
              itemsPerPage={queries.limit}
              currentPage={+queries.page}
            />
          </div>
        )}
      </div>
      {editUser && (
        <UpdateUser 
          editUser={editUser}
          setEditUser={setEditUser}
          render={() => fetchUsers({page: queries.page, limit: queries.limit, q: queries.q})}
        />
      )}
      {deleteUser && (
        <DeleteUser
          deleteUser={deleteUser}
          setDeleteUser={setDeleteUser}
          render={() => fetchUsers({page: queries.page, limit: queries.limit, q: queries.q})}
        />
      )}
    </div>
  )
}

export default ManageUser

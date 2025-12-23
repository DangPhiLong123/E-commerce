import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { showModal } from '../../store/appSlice'

const Modal = () => {
  const { isShowModal, modalChildren } = useSelector(state => state.app)
  const dispatch = useDispatch()

  const handleCloseModal = () => {
    dispatch(showModal({ isShowModal: false, modalChildren: null }))
  }

  if (!isShowModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCloseModal}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
        <div className="p-6">
          {modalChildren}
        </div>
      </div>
    </div>
  )
}

export default Modal 
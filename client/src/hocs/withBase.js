import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'


const withBase = (Component) => (props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  return (
    <div>
      <Component {...props} navigate={navigate} dispatch={dispatch} location={location} />
    </div>
  )
}

export default withBase

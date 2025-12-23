import React, { useState, useCallback } from "react";
import { InputField, Button } from '../../components'
import background from '../../assets/background.png'
import { apiRegister, apiLogin, apiForgotPassword } from '../../apis/user'
import { useNavigate, Link } from 'react-router-dom'
import path from '../../ultils/path'
import { login } from '../../store/userSlice'
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify'
import { validate } from '../../ultils/helpers'
import useI18n from 'hooks/useI18n'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useI18n()

  const [payload, setPayload] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    mobile: ''
  })
  const [invalidFields, setInvalidFields] = useState([])
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')

  const resetForm = () => {
    setPayload({
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      mobile: ''
    })
    setInvalidFields([])
  }

  const handleSubmit = useCallback(async () => {
    try {
      const { firstname, lastname, mobile, ...data } = payload
      const invalids = isRegister ? validate(payload, setInvalidFields) : validate(data, setInvalidFields)

      if (invalids === 0) {
        if (isRegister) {
          const response = await apiRegister(payload)
          if (response.success) {
            toast.success(response.mes || t('auth.register') + ' successfully. ' + 'Please check your email.')
            setIsRegister(false)
            resetForm()
          } else {
            toast.error(response.mes || 'Registration failed')
          }
        } else {
          const response = await apiLogin(data)
          console.log('Login Response:', response)
          if (response.success) {
            console.log('Login Success - Token:', response.accessToken)
            dispatch(login({ isLoggedIn: true, token: response.accessToken, userData: response.userData }))
            navigate(`/${path.HOME}`)
          } else {
            toast.error(response.mes || 'Invalid email or password')
          }
        }
      }
    } catch (error) {
      console.log('Login Error:', error)
      if (isRegister) {
        if (error.response?.data?.mes?.includes('email')) {
          toast.error('Email already exists. Please use a different email.')
        } else {
          toast.error(error.response?.data?.mes || 'Registration failed. Please try again.')
        }
      } else {
        if (error.response?.status === 401) {
          toast.error('Account is not registered. Please register an account.')
        } else {
          toast.error(error.response?.data?.mes || 'Login failed. Please try again.')
        }
      }
    }
  }, [payload, isRegister, navigate, dispatch])

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        toast.error('Please enter your email address')
        return
      }
      const response = await apiForgotPassword({ email })
      if (response.success) {
        toast.success('Password reset instructions have been sent to your email')
        setIsForgotPassword(false)
        setEmail('')
      }
    } catch (error) {
      if (error.response?.data?.mes) {
        toast.error(error.response.data.mes)
      } else {
        toast.error('Email is not registered. Please register email for new account.')
      }
    }
  }

  return (
    <div className="w-screen h-screen relative">
      {isForgotPassword && <div className="absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-white flex flex-col items-center py-8 z-50">
        <div className="flex flex-col gap-4">
          <label htmlFor="email">{t('auth.enter_email')}</label>
          <input
            type="text"
            id="email"
            className="w-[800px] pb-2 border-b outline-none placeholder:text-sm"
            placeholder={t('auth.email_placeholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div className="flex items-center justify-end w-full gap-4">
            <Button
              name={t('auth.back')}
              style='px-4 py-2 rounded-md text-white bg-blue-500 text-semibold my-2'
              handleOnClick={() => setIsForgotPassword(false)}

            />
            <Button
              name={t('auth.submit')}
              handleOnClick={handleForgotPassword}
            />
          </div>
        </div>
      </div>}
      <img src={background}
        alt='bg'
        className="w-full h-full object-cover" />
      <div className="absolute top-0 bottom-0 left-0 right-1/2 items-center justify-center flex">
        <div className="p-8 bg-white flex flex-col items-center rounded-md min-w-[500px] ">
          <h1 className="text-[28px] font-semibold text-main mb-8">{isRegister ? t('auth.register') : t('auth.login')}</h1>
          {isRegister && <div className="flex items-center gap-2 w-full">
            <InputField
              value={payload.firstname}
              setValue={setPayload}
              nameKey='firstname'
              invalidFields={invalidFields}
              setInvalidFields={setInvalidFields}
              fullWidth
            />
            <InputField
              value={payload.lastname}
              setValue={setPayload}
              nameKey='lastname'
              invalidFields={invalidFields}
              setInvalidFields={setInvalidFields}
              fullWidth
            />
          </div>}
          <InputField
            value={payload.email}
            setValue={setPayload}
            nameKey='email'
            invalidFields={invalidFields}
            setInvalidFields={setInvalidFields}
            fullWidth
          />
          {isRegister && <InputField
            value={payload.mobile}
            setValue={setPayload}
            nameKey='mobile'
            invalidFields={invalidFields}
            setInvalidFields={setInvalidFields}
            fullWidth
          />}
          <InputField
            value={payload.password}
            setValue={setPayload}
            nameKey='password'
            type='password'
            invalidFields={invalidFields}
            setInvalidFields={setInvalidFields}
            fullWidth
          />
          <Button
            name={isRegister ? t('auth.register') : t('auth.login')}
            handleOnClick={handleSubmit}
            fw
          />
          <div className="flex items-center justify-between my-2 w-full text-sm">
            {!isRegister && <span onClick={() => setIsForgotPassword(true)} className="text-blue-500 hover:underline cursor-pointer">{t('auth.forgot_account')}</span>}
            {!isRegister && <span className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => {
                setIsRegister(true)
                resetForm()
              }}
            >{t('auth.create_account')}</span>}
            {isRegister && <span className="text-blue-500 hover:underline cursor-pointer w-full text-center"
              onClick={() => {
                setIsRegister(false)
                resetForm()
              }}
            >{t('auth.go_login')}</span>}
          </div>
          <Link
            className="text-blue-500 text-sm hover:underline cursor-pointer"
            to={`/${path.HOME}`}>
            {t('auth.go_home')}</Link>
        </div>
      </div>
    </div>
  )
}
export default Login;

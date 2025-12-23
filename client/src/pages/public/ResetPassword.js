import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { InputField, Button } from '../../components'
import path from '../../ultils/path'
import { apiResetPassword } from '../../apis/user'
import background from '../../assets/background.png'
import { toast } from 'react-toastify'
import useI18n from 'hooks/useI18n'

const ResetPassword = () => {
  const [payload, setPayload] = useState({
    newPassword: ''
  })
  const { token } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()

  const handleResetPassword = async () => {
    try {
      if (!payload.newPassword) {
        toast.error(t('auth.new_password_placeholder'))
        return
      }

      const response = await apiResetPassword({ 
        password: payload.newPassword, 
        token 
      })

      if (response.success) {
        toast.success('Password has been reset successfully')
        setTimeout(() => {
          navigate(`/${path.LOGIN}`)
        }, 1500)
      } else {
        toast.error(response.mes || 'Reset password failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.mes || 'Something went wrong')
    }
  }

  return (
    <div className="w-screen h-screen relative">
      <img 
        src={background} 
        alt="background" 
        className="w-full h-full object-cover"
      />
      <div className="absolute top-0 left-0 right-1/2 bottom-0 flex items-center justify-center">
        <div className="p-8 bg-white flex flex-col items-center rounded-md min-w-[500px]">
          <h3 className='text-[28px] font-semibold text-main mb-8'>
            {t('auth.reset_password')}
          </h3>
          <div className='w-full flex flex-col gap-5'>
            <InputField
              value={payload.newPassword}
              setValue={setPayload}
              nameKey='newPassword'
              type='password'
              placeholder={t('auth.new_password_placeholder')}
            />
            <Button
              name={t('auth.reset_password')}
              handleOnClick={handleResetPassword}
              fw
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

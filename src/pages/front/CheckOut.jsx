import axios from 'axios'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import useMessage from '../../hooks/useMessage'

const API_BASE = import.meta.env.VITE_API_BASE
const API_PATH = import.meta.env.VITE_API_PATH

// 收貨人 input 元件
const UserInput = ({ register, errors, id, labelText, type, rules }) => {
  return (
    <div className="row mb-3 justify-content-center">
      <label
        htmlFor={id}
        className="col-2 col-form-label"
      >
        {labelText}
      </label>

      <div className="col-5">
        <input
          type={type}
          className={`form-control ${errors[id] ? 'is-invalid' : ''}`}
          id={id}
          {...register(id, rules)}
        />
        {errors[id] && (
          <div className="text-start invalid-feedback">
            {errors?.[id]?.message}
          </div>
        )}
      </div>
    </div>
  )
}

const CheckOut = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  })
  const { showSuccess, showError } = useMessage()

  const onSubmit = async (formData) => {
    const cartRes = await axios.get(`${API_BASE}/api/${API_PATH}/cart`)

    if (!cartRes.data.data.carts.length) {
      showError('購物車是空的，無法送出訂單')
      return
    }
    try {
    // 1️⃣ 建立訂單
      await axios.post(`${API_BASE}/api/${API_PATH}/order`, {
        data: {
          user: {
            name: formData.username,
            email: formData.email,
            tel: formData.tel,
            address: formData.address,
          },
          message: formData.comment || '',
        },
      })

      // 3️⃣ 成功提示
      showSuccess('訂單已送出，購物車已清空')

      // 4️⃣ 導頁（依需求）
      navigate('/success')
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  return (
    <div className="container-lg mt-5">
      <form className="bg-white p-4 rounded-4 shadow-sm needs-validation" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="mb-4">收貨人資訊</h2>

        {/* 姓名 */}
        <UserInput
          register={register}
          errors={errors}
          id="username"
          labelText="姓名"
          type="text"
          rules={{ required: {
            value: true,
            message: '姓名是必填的' },
          }}
        />

        {/* Email */}
        <UserInput
          register={register}
          errors={errors}
          id="email"
          labelText="Email"
          type="email"
          rules={{ required: {
            value: true,
            message: 'Email 是必填的',
          },
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Email 格式不正確',
          },
          }}
        />

        {/* 電話 */}
        <UserInput
          register={register}
          errors={errors}
          id="tel"
          labelText="電話"
          type="tel"
          rules={{ required: {
            value: true,
            message: '電話是必填的',
          },
          minLength: {
            value: 8,
            message: '電話不少於 8 碼',
          },
          maxLength: {
            value: 12,
            message: '電話不大於 12 碼',
          },
          pattern: {
            value: /^[0-9]+$/,
            message: '電話只能輸入數字',
          },
          }}
        />

        {/* 地址 */}
        <UserInput
          register={register}
          errors={errors}
          id="address"
          labelText="地址"
          type="text"
          rules={{ required: {
            value: true,
            message: '地址是必填的' },
          }}
        />

        {/* 留言 */}
        <div className="row mb-3 justify-content-center">
          <label
            className="col-2 col-form-label"
            htmlFor="comment"
          >
            留言
          </label>
          <div className="col-5">
            <textarea
              className="form-control"
              placeholder=""
              id="comment"
              {...register('comment')}
            >
            </textarea>
          </div>
        </div>

        {/* 送出 */}
        <div className="row align-items-center justify-content-center">
          <div className="col-7">
            <button
              className="btn btn-outline-primary me-5"
              type="button"
              onClick={() => {
                navigate(-1)
              }}
            >
              返回
            </button>
            <button className="btn btn-primary" type="submit">
              送出
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CheckOut

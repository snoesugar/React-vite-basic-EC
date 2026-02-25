import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Spinner } from '../components/Components'
import useMessage from '../hooks/useMessage'

const API_BASE = import.meta.env.VITE_API_BASE

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { showSuccess, showError } = useMessage()

  const toggleNavbar = () => {
    setIsOpen(prev => !prev)
  }

  const closeNavbar = () => {
    setIsOpen(false)
  }

  // 登出
  const checkLogout = async () => {
    try {
      const response = await axios.post(`${API_BASE}/logout`)
      delete axios.defaults.headers.common['Authorization']
      showSuccess(response.data.message)
      navigate('/login')
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  // 驗證登入，重整仍可停留後台
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('hexToken='))
          ?.split('=')[1]

        if (!token) {
          navigate('/login')
          return
        }

        axios.defaults.headers.common['Authorization'] = token

        await axios.post(`${API_BASE}/api/user/check`)
      }
      catch {
        delete axios.defaults.headers.common['Authorization']
        navigate('/login')
      }
      finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [navigate])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <div className="sticky-top bg-primary-100">
        <div className="container-lg">
          <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid px-0">

              <button
                className="navbar-toggler ms-auto"
                type="button"
                onClick={toggleNavbar}
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div
                className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}
              >
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link
                      className="nav-link px-3 text-primary"
                      to="/admin/product"
                      onClick={closeNavbar}
                    >
                      後台產品清單
                      <i className="bi bi-list-stars ms-1"></i>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      className="nav-link px-3 text-primary"
                      to="/admin/order"
                      onClick={closeNavbar}
                    >
                      後台訂單列表
                      <i className="bi bi-card-checklist ms-1"></i>
                    </Link>
                  </li>
                </ul>

                <ul className="navbar-nav ms-auto align-items-lg-center">
                  <li className="nav-item">
                    <Link
                      type="button"
                      className="nav-link text-primary"
                      onClick={checkLogout}
                    >
                      登出
                      <i className="bi bi-person-walking ms-1"></i>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <Outlet />
    </>
  )
}

export default AdminLayout

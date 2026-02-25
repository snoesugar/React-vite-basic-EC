import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { Modal } from 'bootstrap'
import { Spinner, Pagination, EditOrder } from '../../components/Components'
import useMessage from '../../hooks/useMessage'

const API_BASE = import.meta.env.VITE_API_BASE
const API_PATH = import.meta.env.VITE_API_PATH

function AdminOrders() {
  const [newOrder, setNewOrder] = useState({
    is_paid: false,
    message: '',
    products: {
      L8nBrq8Ym4ARI1Kog4t: {
        id: '',
        product_id: '',
        qty: '',
      },
    },
    user: {
      address: '',
      email: '',
      name: '',
      tel: '',
    },
    num: null,
  })
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({})
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [error, setErrors] = useState({})
  const editOrderRef = useRef(null)
  const editOrderInstance = useRef(null)
  const { showSuccess, showError } = useMessage()

  /* ---------- 編輯 Modal ---------- */
  const closeEditModal = () => {
    if (editOrderInstance.current) editOrderInstance.current.hide()
    setIsEditOpen(false)
    setErrors({}) // 關閉 Modal 時清空錯誤
  }

  // 獲得訂單資料
  const getOrders = async (page = 1) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/orders?page=${page}`,
      )

      setOrders(res.data.orders)
      setPagination(res.data.pagination)
    }
    catch (error) {
      showError(error.response.data.message)
    }
    finally {
      setLoading(false) // 完成抓取
    }
  }

  // 刪除單一品項
  const deleteOrder = async (id) => {
    if (!window.confirm('確定要刪除這個訂單嗎？')) return

    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/order/${id}`,
      )
      showSuccess(response.data.message)

      // 重新取得產品（畫面同步）
      getOrders()
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  // 刪除所有訂單
  const deleteAllOrder = async () => {
    if (!window.confirm('確定要刪除所有訂單嗎？')) return

    try {
      setLoading(true)
      // 1️⃣ 先取得目前所有產品
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/orders?all`,
      )

      const orders = response.data.orders

      if (orders.length === 0) {
        showSuccess('目前沒有訂單可刪除')
        return
      }

      // 2️⃣ 組成刪除請求陣列
      const deleteRequests = orders.map(item =>
        axios.delete(
          `${API_BASE}/api/${API_PATH}/admin/order/${item.id}`,
        ),
      )

      // 3️⃣ 同時刪除所有產品（真的刪資料庫）
      await Promise.all(deleteRequests)

      showSuccess(response.data.message)

      // 4️⃣ 重新取得產品（畫面同步）
      getOrders()
    }
    catch (error) {
      showError(error.response.data.message)
    }
    finally {
      setLoading(false)
    }
  }

  // 編輯訂單資訊
  const updateOrder = async () => {
    const validateErrors = validateOrder(newOrder)

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors)
      return
    }

    setErrors({}) // 清空錯誤

    // 通過驗證才送 API

    try {
      const response = await axios.put(
        `${API_BASE}/api/${API_PATH}/admin/order/${newOrder.id}`,
        { data: newOrder },
      )
      showSuccess(response.data.message)

      // 關閉編輯 modal
      closeEditModal()

      // 重新抓資料
      getOrders()

      // 重置 newProduct
      setNewOrder({
        is_paid: false,
        message: '',
        products: {},
        user: {
          address: '',
          email: '',
          name: '',
          tel: '',
        },
        num: null,
      })
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  // 取建立產品的值
  const handleNewOrderChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith('user.')) {
      const key = name.split('.')[1]
      setNewOrder(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [key]: value,
        },
      }))
    }
    else {
      setNewOrder(prev => ({
        ...prev,
        [name]: value,
      }))
    }

    if (error[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // 更新總價錢
  const updateOrderQty = (id, qty) => {
    const updatedProducts = { ...newOrder.products }
    updatedProducts[id].qty = Number(qty)

    // 計算總金額
    const newTotal = Object.values(updatedProducts).reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.qty,
      0,
    )

    setNewOrder({ ...newOrder, products: updatedProducts, total: newTotal })
  }

  const deleteProduct = (id) => {
    const updatedProducts = { ...newOrder.products }
    delete updatedProducts[id]

    // 計算新總金額
    const newTotal = Object.values(updatedProducts).reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.qty,
      0,
    )

    setNewOrder({ ...newOrder, products: updatedProducts, total: newTotal })
  }

  const validateOrder = (order) => {
    const error = {}
    // 可選：驗證留言是否太長
    if (order.message && order.message.length > 200) {
      error.message = '留言不可超過 200 字'
    }
    // 可選：驗證會員姓名、email
    if (!order.user?.name?.trim()) {
      error.name = '請輸入會員姓名'
    }
    if (!order.user?.email?.trim()) {
      error.email = '請輸入會員 email'
    }
    return error
  }

  useEffect(() => {
    getOrders()
  }, [])

  /* ---------- edit modal ---------- */
  useEffect(() => {
    if (isEditOpen && editOrderRef.current) {
      editOrderInstance.current?.dispose()
      editOrderInstance.current = new Modal(editOrderRef.current)
      editOrderInstance.current.show()

      const modalEl = editOrderRef.current
      const handleHidden = () => {
        setIsEditOpen(false)
        editOrderInstance.current?.dispose()
        editOrderInstance.current = null
        modalEl.removeEventListener('hidden.bs.modal', handleHidden)
      }

      modalEl.addEventListener('hidden.bs.modal', handleHidden)
    }
  }, [isEditOpen])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <div className="container">
        <div className="row mt-5 bg-white p-md-5 py-5 shadow-lg rounded-4">
          <div className="col">
            <h2>訂單列表</h2>
            <div className="text-end mb-3">
              <button type="button" className="btn btn-outline-danger me-3" onClick={deleteAllOrder}>刪除所有訂單</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>訂單編號</th>
                    <th>會員資訊</th>
                    <th>購買商品清單</th>
                    <th>金額</th>
                    <th>付款狀態</th>
                    <th>編輯</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <table className="table-sm">
                          <tbody className="text-start">
                            <tr>
                              <th>姓名:</th>
                              <td>{order.user?.name}</td>
                            </tr>
                            <tr>
                              <th>email:</th>
                              <td>{order.user?.email}</td>
                            </tr>
                            <tr>
                              <th>電話:</th>
                              <td>{order.user?.tel}</td>
                            </tr>
                            <tr>
                              <th>地址:</th>
                              <td>{order.user?.address}</td>
                            </tr>
                            <tr>
                              <th>留言:</th>
                              <td>{order.message ? order.message : '未留言'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td>
                        <table className="table-sm">
                          <tbody className="text-start">
                            <tr>
                              <td>
                                {Object.values(order.products || {}).map(item => (
                                  <div key={item.id}>
                                    <div className="d-flex flex-column mb-2">
                                      <span>
                                        <strong>
                                          {item.product.title}
                                        </strong>
                                        {' '}
                                        {item.qty}
                                        {item.product.unit}
                                      </span>
                                      <span>
                                        單價:
                                        {item.total}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td>{order.total}</td>
                      <td className={order.is_paid ? 'text-success' : 'text-danger'}>
                        {order.is_paid ? '已付款' : '未付款'}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setNewOrder(order) // 填入要編輯的資料
                              setIsEditOpen(true) // 開啟編輯 modal
                            }}
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteOrder(order.id)}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            pagination={pagination}
            changePage={getOrders}
          />
          <EditOrder
            editOrderRef={editOrderRef}
            closeEditModal={closeEditModal}
            updateOrder={updateOrder}
            newOrder={newOrder}
            handleNewOrderChange={handleNewOrderChange}
            setNewOrder={setNewOrder}
            updateOrderQty={updateOrderQty}
            deleteProduct={deleteProduct}
            errors={error}
          />
        </div>
      </div>
    </>
  )
}

export default AdminOrders

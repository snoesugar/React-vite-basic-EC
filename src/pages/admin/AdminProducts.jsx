import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { Modal, Collapse } from 'bootstrap'
import { ProductList, TempProduct, ProductModal, Pagination, Spinner } from '../../components/Components'
import useMessage from '../../hooks/useMessage'

const API_BASE = import.meta.env.VITE_API_BASE
const API_PATH = import.meta.env.VITE_API_PATH

function AdminProducts() {
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: '',
    origin_price: '',
    price: '',
    unit: '',
    description: '',
    content: '',
    is_enabled: 1,
    imageUrl: '',
    imagesUrl: ['', '', '', '', ''],
  })
  const [products, setProducts] = useState([])
  const [tempProduct, setTempProduct] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [error, setErrors] = useState({})
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const productModalRef = useRef(null)
  const addModalRef = useRef(null)
  const editProductRef = useRef(null)
  const productModalInstance = useRef(null)
  const addModalInstance = useRef(null)
  const editProductInstance = useRef(null)
  const { showSuccess, showError } = useMessage()

  /* ---------- 查看細節 ---------- */
  const openModal = item => setTempProduct(item)
  const closeModal = () => {
    if (productModalInstance.current) {
      productModalInstance.current.hide()
    }
  }

  /* ---------- 新增 Modal ---------- */
  const openAddModal = () => {
    // 重置 newProduct
    setNewProduct({
      title: '',
      category: '',
      origin_price: '',
      price: '',
      unit: '',
      description: '',
      content: '',
      is_enabled: 0,
      imageUrl: '',
      imagesUrl: ['', '', '', '', ''],
    })

    setIsAddOpen(true)
  }
  const closeAddModal = () => {
    addModalInstance.current.hide()
    setIsAddOpen(false)
    setErrors({}) // 關閉 Modal 時清空錯誤
  }

  /* ---------- 編輯 Modal ---------- */
  const openEditModal = () => setIsEditOpen(true)
  const closeEditModal = () => {
    if (editProductInstance.current) editProductInstance.current.hide()
    setIsEditOpen(false)
    setErrors({}) // 關閉 Modal 時清空錯誤
  }

  // 取建立產品的值
  const handleNewProductChange = (e) => {
    const { value, id } = e.target
    setNewProduct({
      ...newProduct,
      [id]: value,
    })

    // 有錯就清掉該欄位錯誤
    if (error[id]) {
      setErrors({
        ...error,
        [id]: '',
      })
    }
  }

  // 先宣告工具 抓取產品資料 getProducts
  const getProducts = async (page = 1) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      )

      setProducts(res.data.products) // 只放當頁 10 筆
      setPagination(res.data.pagination) // 分頁資訊
    }
    catch (error) {
      showError(error.response.data.message)
    }
    finally {
      setLoading(false) // 完成抓取
    }
  }

  // 建立新產品
  const addNewProduct = async () => {
    const validateErrors = validateProduct(newProduct)

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors)
      return
    }

    setErrors({}) // 清空錯誤

    // 通過驗證才送 API

    try {
      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/product`,
        {
          data: {
            ...newProduct,
            origin_price: Number(newProduct.origin_price),
            price: Number(newProduct.price),
            is_enabled: newProduct.is_enabled,
          },
        },
      )

      showSuccess(response.data.message)

      closeAddModal() // 關 Modal
      getProducts() // 重新抓資料

      // 重置表單
      setNewProduct({
        title: '',
        category: '',
        origin_price: '',
        price: '',
        unit: '',
        description: '',
        content: '',
        is_enabled: '',
        imageUrl: '',
        imagesUrl: ['', '', '', '', ''],
      })
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  // 刪除所有品項
  const deleteAllProduct = async () => {
    if (!window.confirm('確定要刪除所有品項嗎？')) return

    try {
      setLoading(true)
      // 1️⃣ 先取得目前所有產品
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=1&per_page=1000`,
      )

      const products = response.data.products

      if (products.length === 0) {
        showSuccess('目前沒有產品可刪除')
        return
      }

      // 2️⃣ 組成刪除請求陣列
      const deleteRequests = products.map(item =>
        axios.delete(
          `${API_BASE}/api/${API_PATH}/admin/product/${item.id}`,
        ),
      )

      // 3️⃣ 同時刪除所有產品（真的刪資料庫）
      await Promise.all(deleteRequests)

      showSuccess(response.data.message)

      // 4️⃣ 重新取得產品（畫面同步）
      getProducts()
    }
    catch (error) {
      showError(error.response.data.message)
    }
    finally {
      setLoading(false)
    }
  }

  // 刪除單一品項
  const deleteProduct = async (id) => {
    if (!window.confirm('確定要刪除這個品項嗎？')) return

    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`,
      )
      showSuccess(response.data.message)

      // 重新取得產品（畫面同步）
      getProducts()
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  // 編輯產品資訊
  const updateProduct = async () => {
    const validateErrors = validateProduct(newProduct)

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors)
      return
    }

    setErrors({}) // 清空錯誤

    // 通過驗證才送 API

    try {
      const response = await axios.put(
        `${API_BASE}/api/${API_PATH}/admin/product/${newProduct.id}`,
        {
          data: {
            ...newProduct,
            origin_price: Number(newProduct.origin_price),
            price: Number(newProduct.price),
          },
        },
      )
      showSuccess(response.data.message)

      // 關閉編輯 modal
      closeEditModal()

      // 重新抓資料
      getProducts()

      // 重置 newProduct
      setNewProduct({
        title: '',
        category: '',
        origin_price: '',
        price: '',
        unit: '',
        description: '',
        content: '',
        is_enabled: '',
        imageUrl: '',
        imagesUrl: ['', '', '', '', ''],
      })
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  // 表單驗證資訊
  const validateProduct = (product) => {
    const error = {}

    if (!product.title?.trim()) {
      error.title = '請輸入產品名稱'
    }

    if (!product.category?.trim()) {
      error.category = '請選擇產品分類'
    }

    if (!product.unit?.trim()) {
      error.unit = '請選擇產品單位'
    }

    if (product.price === '') {
      error.price = '請輸入產品售價'
    }
    else if (Number(product.price) < 0) {
      error.price = '售價不可為負數'
    }

    if (product.origin_price === '') {
      error.origin_price = '請輸入產品原價'
    }
    else if (Number(product.origin_price) < 0) {
      error.origin_price = '原價不可為負數'
    }

    return error
  }

  // 檔案上傳
  const handleFileChange = async (e) => {
    const url = `${API_BASE}/api/${API_PATH}/admin/upload`
    const file = e.target.files?.[0]

    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file-to-upload', file)

      let res = await axios.post(url, formData)
      const uploadedImageUrl = res.data.imageUrl

      setNewProduct(pre => ({
        ...pre,
        imageUrl: uploadedImageUrl,
      }))
    }
    catch (error) {
      showError(error.response.data.message)
    }
  }

  useEffect(() => {
    getProducts()
  }, [])

  /* ---------- product modal ---------- */
  useEffect(() => {
    if (!tempProduct || !productModalRef.current) return

    // Modal
    productModalInstance.current?.dispose()
    productModalInstance.current = new Modal(productModalRef.current)
    productModalInstance.current.show()

    const modalEl = productModalRef.current

    // ✅【關鍵】初始化 Collapse（toggle: false）
    const collapseEls = modalEl.querySelectorAll('.accordion-collapse')
    collapseEls.forEach((el) => {
      new Collapse(el, { toggle: false })
    })

    const handleHidden = () => {
      setTempProduct(null)
      productModalInstance.current?.dispose()
      productModalInstance.current = null
      modalEl.removeEventListener('hidden.bs.modal', handleHidden)
    }

    modalEl.addEventListener('hidden.bs.modal', handleHidden)
  }, [tempProduct])

  /* ---------- add modal ---------- */
  useEffect(() => {
    if (isAddOpen && addModalRef.current) {
      if (addModalInstance.current) {
        addModalInstance.current.dispose()
        addModalInstance.current = null
      }

      addModalInstance.current = new Modal(addModalRef.current)
      addModalInstance.current.show()

      const modalEl = addModalRef.current
      const handleHidden = () => {
        setIsAddOpen(false)
        addModalInstance.current.dispose()
        addModalInstance.current = null
        modalEl.removeEventListener('hidden.bs.modal', handleHidden)
      }

      modalEl.addEventListener('hidden.bs.modal', handleHidden)
    }
  }, [isAddOpen])

  /* ---------- edit modal ---------- */
  useEffect(() => {
    if (isEditOpen && editProductRef.current) {
      editProductInstance.current?.dispose()
      editProductInstance.current = new Modal(editProductRef.current)
      editProductInstance.current.show()

      const modalEl = editProductRef.current
      const handleHidden = () => {
        setIsEditOpen(false)
        editProductInstance.current?.dispose()
        editProductInstance.current = null
        modalEl.removeEventListener('hidden.bs.modal', handleHidden)
      }

      modalEl.addEventListener('hidden.bs.modal', handleHidden)
    }
  }, [isEditOpen])

  return (
    <>
      {
        loading
          ? (
            <div className="d-flex justify-content-center align-items-center text-center mt-5">
              <Spinner />
            </div>
          )
          : (
            <div className="container">
              <div className="row mt-5 bg-white p-md-5 py-5 shadow-lg rounded-4">
                <div className="col">
                  <h2>產品列表</h2>
                  <div className="d-flex justify-content-md-end justify-content-center mb-3">
                    <button type="button" className="btn btn-outline-danger me-3" onClick={deleteAllProduct}>刪除所有品項</button>
                    <button type="button" className="btn btn-outline-primary me-md-3" onClick={openAddModal}>建立新的產品</button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>產品名稱</th>
                          <th>原價</th>
                          <th>售價</th>
                          <th>是否啟用</th>
                          <th>查看細節</th>
                          <th>編輯</th>
                        </tr>
                      </thead>
                      <tbody>
                        <ProductList
                          products={products}
                          openModal={openModal}
                          deleteProduct={deleteProduct}
                          setNewProduct={setNewProduct}
                          openEditModal={openEditModal}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  pagination={pagination}
                  changePage={getProducts}
                />
              </div>
              <TempProduct
                tempProduct={tempProduct}
                modalRef={productModalRef}
                closeModal={closeModal}
              />
              <ProductModal
                modalRef={addModalRef}
                title="建立新的產品"
                closeModal={closeAddModal}
                submitText="儲存"
                submitAction={addNewProduct}
                newProduct={newProduct}
                handleNewProductChange={handleNewProductChange}
                setNewProduct={setNewProduct}
                errors={error}
                handleFileChange={handleFileChange}
              />
              <ProductModal
                modalRef={editProductRef}
                title="編輯產品"
                closeModal={closeEditModal}
                submitText="儲存"
                submitAction={updateProduct}
                newProduct={newProduct}
                handleNewProductChange={handleNewProductChange}
                setNewProduct={setNewProduct}
                errors={error}
                handleFileChange={handleFileChange}
              />
            </div>
          )
      }
    </>
  )
}

export default AdminProducts

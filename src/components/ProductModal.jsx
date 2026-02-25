const ProductModal = ({
  modalRef,
  title,
  closeModal,
  submitText = '儲存',
  submitAction,
  newProduct,
  handleNewProductChange,
  setNewProduct,
  errors,
  handleFileChange,
}) => {
  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex="-1"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">{title}</h1>
            <button type="button" className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <form className="text-start">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">標題</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  id="title"
                  value={newProduct.title}
                  onChange={handleNewProductChange}
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">產品說明</label>
                <input
                  type="text"
                  className="form-control"
                  id="content"
                  value={newProduct.content}
                  onChange={handleNewProductChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">產品描述</label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  value={newProduct.description}
                  onChange={handleNewProductChange}
                />
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">分類</label>
                    <input
                      type="text"
                      className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                      id="category"
                      value={newProduct.category}
                      onChange={handleNewProductChange}
                    />
                    {errors.category && (
                      <div className="invalid-feedback">{errors.category}</div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">單位</label>
                    <input
                      type="text"
                      className={`form-control ${errors.unit ? 'is-invalid' : ''}`}
                      id="unit"
                      value={newProduct.unit}
                      onChange={handleNewProductChange}
                    />
                    {errors.unit && (
                      <div className="invalid-feedback">{errors.unit}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="mb-3">
                    <label htmlFor="origin_price" className="form-label">產品原價</label>
                    <input
                      type="number"
                      className={`form-control ${errors.origin_price ? 'is-invalid' : ''}`}
                      id="origin_price"
                      value={newProduct.origin_price}
                      onChange={handleNewProductChange}
                      min="0"
                      step="1"
                    />
                    {errors.origin_price && (
                      <div className="invalid-feedback">{errors.origin_price}</div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div className="mb-3">
                    <label htmlFor="price" className="form-label">產品售價</label>
                    <input
                      type="number"
                      className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                      id="price"
                      value={newProduct.price}
                      onChange={handleNewProductChange}
                      min="0"
                      step="1"
                    />
                    {errors.price && (
                      <div className="invalid-feedback">{errors.price}</div>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_enabled"
                      checked={newProduct.is_enabled === 1}
                      onChange={(e) => {
                        setNewProduct({
                          ...newProduct,
                          is_enabled: e.target.checked ? 1 : 0,
                        })
                      }}
                    />
                    <label className="form-check-label" htmlFor="is_enabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-12">
                  <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">上傳圖片</label>
                    <input
                      className="form-control"
                      type="file"
                      name="fileUpload"
                      id="fileUpload"
                      accept=".jpg,.jpeg,.png"
                      onChange={e => handleFileChange(e)}
                    />
                  </div>
                </div>
                <p className="text-center m-0">or</p>
                <div className="col-12">
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">輸入主圖網址</label>
                    <input
                      type="text"
                      className="form-control"
                      id="imageUrl"
                      value={newProduct.imageUrl}
                      onChange={handleNewProductChange}
                    />
                    {newProduct.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={newProduct.imageUrl}
                          alt="主圖預覽"
                          className="preview-image-main rounded-3"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <hr />
              <div className="row">
                {(newProduct.imagesUrl || []).map((img, index) => (
                  <div className="col-6" key={index}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor={`imagesUrl${index}`}>
                        輸入圖片網址
                        {index + 1}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`imagesUrl${index}`}
                        value={img}
                        onChange={(e) => {
                          const newImages = [...newProduct.imagesUrl]
                          newImages[index] = e.target.value
                          setNewProduct({
                            ...newProduct,
                            imagesUrl: newImages,
                          })
                        }}
                      />
                      {img && (
                        <img
                          src={img}
                          alt={`副圖預覽 ${index + 1}`}
                          className="mt-2 preview-image"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>取消</button>
            <button type="button" className="btn btn-primary" onClick={submitAction}>{submitText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal

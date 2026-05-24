import React, { useState, useEffect } from 'react';
import snackApi from '../../api/snackApi';
import MenuBar from '../../components/admin_components/MenuBar';

const SnackManagement = () => {
    const [snacks, setSnacks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSnackId, setSelectedSnackId] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    // State Form dữ liệu (Khớp 100% với SnackRequestDTO)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        isActive: true
    });

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Lấy danh sách Snack từ API
    const fetchSnacks = async () => {
        try {
            const params = {
                isActive: true,
                pageNumber: currentPage,
                pageSize: 10,
                sortBy: 'id',
                sortOrder: 'asc'
            };

            const data = await snackApi.getAll(params);

            // Xử lý dữ liệu phân trang trả về từ API
            if (data && data.content) {
                setSnacks(data.content);
                setTotalPages(data.totalPages || 0);
                setIsLastPage(data.lastPage || false);
            } else {
                // Phương án dự phòng nếu API trả về mảng trực tiếp không phân trang
                setSnacks(Array.isArray(data) ? data : []);
                setTotalPages(0);
                setIsLastPage(true);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách bắp nước:", error);
            setSnacks([]); // Tránh crash giao diện khi API lỗi
        }
    };

    useEffect(() => {
        fetchSnacks();
    }, [currentPage]);

    // Định dạng tiền tệ VNĐ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Xử lý Upload Ảnh lên Cloudinary
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('isVideo', false);

        try {
            const fileUrl = await snackApi.uploadFile(uploadData);

            // Nếu đang ở chế độ Sửa, tự động gọi PATCH API cập nhật ảnh ngay lập tức
            if (isEditMode && selectedSnackId) {
                await snackApi.updateImage(selectedSnackId, fileUrl);
                alert("Đã cập nhật ảnh món ăn thành công!");
                fetchSnacks();
            }

            setFormData(prev => ({ ...prev, imageUrl: fileUrl }));
        } catch (error) {
            alert("Tải ảnh lên hệ thống thất bại!");
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Xử lý Lưu Form (Tạo mới hoặc Sửa toàn bộ thông tin qua API PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = {
            ...formData,
            price: parseFloat(formData.price)
        };

        try {
            if (isEditMode) {
                await snackApi.update(selectedSnackId, submitData);
                alert("Cập nhật món ăn thành công!");
            } else {
                await snackApi.create(submitData);
                alert("Đăng món ăn mới thành công!");
            }
            setIsModalOpen(false);
            fetchSnacks();
        } catch (error) {
            if (error.validationErrors) {
                alert("Dữ liệu nhập vào chưa hợp lệ, vui lòng kiểm tra lại!");
            } else {
                alert(error.message || "Thao tác thất bại!");
            }
        }
    };

    // Xóa mềm món ăn (Ẩn/Hết hàng)
    const handleDeleteSnack = async (snackId, snackName) => {
        if (!window.confirm(`Xác nhận đánh dấu báo HẾT HÀNG cho "${snackName}"?`)) return;
        try {
            await snackApi.delete(snackId);
            alert("Đã chuyển trạng thái món ăn thành Hết hàng!");
            fetchSnacks();
        } catch (error) {
            alert("Không thể thao tác ẩn món ăn!");
        }
    };

    // Mở lại món ăn đã ẩn (Khôi phục lại isActive = true qua hàm PUT)
    const handleRestoreSnack = async (snack) => {
        try {
            const restoreData = {
                name: snack.name,
                description: snack.description,
                price: snack.price,
                imageUrl: snack.imageUrl,
                isActive: true
            };
            await snackApi.update(snack.id, restoreData);
            alert("Đã mở bán lại món ăn thành công!");
            fetchSnacks();
        } catch (error) {
            alert("Không thể mở bán lại món ăn!");
        }
    };

    const openEditModal = (snack) => {
        setIsEditMode(true);
        setSelectedSnackId(snack.id);
        setFormData({
            name: snack.name,
            description: snack.description || '',
            price: snack.price,
            imageUrl: snack.imageUrl,
            isActive: snack.isActive
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setSelectedSnackId(null);
        setFormData({ name: '', description: '', price: '', imageUrl: '', isActive: true });
        setIsModalOpen(true);
    };

    return (
        <div>
            <MenuBar />
            <article>
                <div className="snack-manager">
                    <div className="snack-manager__header">
                        <div className="snack-manager__meta">
                            <h2>Quản lý Bắp nước & Combo</h2>
                            <p>Thiết lập thực đơn, giá bán và quản lý trạng thái kho hàng của quầy.</p>
                        </div>
                        <button className="snack-manager__btn-add" onClick={openAddModal}>
                            Thêm món
                        </button>
                    </div>

                    {/* DANH SÁCH MÓN ĂN HIỂN THỊ DẠNG BẢNG (TABLE LAYOUT) */}
                    <div className="snack-manager__table-wrapper">
                        <table className="snack-manager__table">
                            <thead>
                                <tr>
                                    <th style={{ width: '100px' }}>Hình ảnh</th>
                                    <th>Tên món / Combo</th>
                                    <th>Mô tả thành phần</th>
                                    <th style={{ width: '140px' }}>Giá bán</th>
                                    <th style={{ width: '150px' }}>Trạng thái</th>
                                    <th style={{ width: '200px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {snacks.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="snack-manager__empty">
                                            Chưa có món ăn nào trong thực đơn.
                                        </td>
                                    </tr>
                                ) : (
                                    snacks.map((snack) => (
                                        <tr key={snack.id} className={!snack.isActive ? 'row-inactive' : ''}>
                                            <td>
                                                <div className="snack-manager__img-container">
                                                    <img src={snack.imageUrl} alt={snack.name} />
                                                </div>
                                            </td>
                                            <td>
                                                <span className="snack-manager__item-name">{snack.name}</span>
                                            </td>
                                            <td>
                                                <span className="snack-manager__item-desc">{snack.description || '—'}</span>
                                            </td>
                                            <td>
                                                <span className="snack-manager__item-price">{formatCurrency(snack.price)}</span>
                                            </td>
                                            <td>
                                                <span className={`snack-manager__badge snack-manager__badge--${snack.isActive ? 'active' : 'inactive'}`}>
                                                    {snack.isActive ? 'ĐANG MỞ BÁN' : 'HẾT HÀNG / ẨN'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="snack-manager__actions-cell">
                                                    <button className="snack-manager__action-btn snack-manager__action-btn--edit" onClick={() => openEditModal(snack)}>
                                                        Sửa
                                                    </button>
                                                    <span className="snack-manager__divider">|</span>
                                                    {snack.isActive ? (
                                                        <button className="snack-manager__action-btn snack-manager__action-btn--delete" onClick={() => handleDeleteSnack(snack.id, snack.name)}>
                                                            Báo hết hàng
                                                        </button>
                                                    ) : (
                                                        <button className="snack-manager__action-btn snack-manager__action-btn--restore" onClick={() => handleRestoreSnack(snack)}>
                                                            Mở bán
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {(
                        <div className="snack-manager__pagination">
                            <button
                                type="button"
                                className="pagination-btn"
                                style={{ cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            >
                                Trước
                            </button>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                Trang {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                type="button"
                                className="pagination-btn"
                                style={{ cursor: isLastPage ? 'not-allowed' : 'pointer' }}
                                disabled={isLastPage}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Sau
                            </button>
                        </div>
                    )}

                    {/* MODAL FORM THÊM / SỬA */}
                    {isModalOpen && (
                        <div className="snack-modal">
                            <div className="snack-modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
                            <div className="snack-modal__content">
                                <h3 className="snack-modal__title">{isEditMode ? 'Cập nhật Món ăn' : 'Thêm Món mới'}</h3>
                                <form onSubmit={handleSubmit} className="snack-modal__form">
                                    <div className="snack-modal__field">
                                        <label>Tên món / Tên Combo</label>
                                        <input type="text" required placeholder="Ví dụ: Combo Thân Thiết (1 Bắp ngọt + 2 Nước)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>

                                    <div className="snack-modal__field">
                                        <label>Giá bán (VNĐ)</label>
                                        <input type="number" min="0" required placeholder="Ví dụ: 79000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                    </div>

                                    <div className="snack-modal__field">
                                        <label>Mô tả chi tiết</label>
                                        <textarea rows="2" placeholder="Ví dụ: 1 bắp phô mai lớn 60oz và 2 ly Coca-Cola 22oz" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    </div>

                                    <div className="snack-modal__upload-box">
                                        <label>Hình ảnh Món ăn (Bắt buộc)</label>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                                        {isUploadingImage && <span className="snack-modal__loading">Đang tải...</span>}
                                        {formData.imageUrl && (
                                            <img src={formData.imageUrl} alt="Preview" className="snack-modal__preview-img" />
                                        )}
                                    </div>

                                    <div className="snack-modal__actions">
                                        <button type="button" className="snack-modal__btn snack-modal__btn--cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                        <button type="submit" className="snack-modal__btn snack-modal__btn--submit" disabled={isUploadingImage || !formData.imageUrl}>
                                            {isEditMode ? 'Lưu cập nhật' : 'Thêm vào thực đơn'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
};

export default SnackManagement;
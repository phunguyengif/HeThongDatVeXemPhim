import React, { useState, useEffect } from 'react';
import cinemaApi from '../../api/cinemaApi';
import MenuBar from '../../components/admin_components/MenuBar';
import { useNavigate } from 'react-router-dom';


const CinemaManagement = () => {

    const navigate = useNavigate();

    const [cinemas, setCinemas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCinemaId, setSelectedCinemaId] = useState(null);

    const [searchName, setSearchName] = useState('');
    const [searchCity, setSearchCity] = useState('');

    // Form State 
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: ''
    });

    const handleSelectCinema = (cinemaId, cinemaName) => {
        navigate("/RoomManagement", {
            state: { cinemaId, cinemaName }
        });
    };

    const handleToggleStatus = async (cinema) => {
        const confirmMsg = cinema.isActive
            ? `Bạn có chắc chắn muốn TẠM NGƯNG hoạt động rạp "${cinema.name}"?`
            : `Bạn muốn MỞ LẠI hoạt động cho rạp "${cinema.name}"?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const updatedData = {
                ...cinema,
                isActive: !cinema.isActive
            };
            await cinemaApi.update(cinema.id, updatedData);

            fetchCinemas();
        } catch (error) {
            alert("Lỗi: Không thể cập nhật trạng thái rạp!");
        }
    };

    // Tải danh sách cụm rạp từ API
    const fetchCinemas = async (isSearch = false) => {
        try {
            let data;
            if (isSearch && (searchName.trim() !== '' || searchCity.trim() !== '')) {
                data = await cinemaApi.search({
                    name: searchName.trim() || undefined,
                    city: searchCity.trim() || undefined,
                });
            } else {
                data = await cinemaApi.getAll();
            }
            console.log(data)
            

            // Xử lý cả trường hợp response dạng PageImpl hoặc List
            setCinemas(data.content || data);
        } catch (error) {
            console.error("Lỗi tải danh sách cụm rạp:", error);
        }
    };

    useEffect(() => {
        fetchCinemas();
    }, []);

    // Xử lý khi bấm nút "Tìm kiếm"
    const handleSearch = () => {
        fetchCinemas(true);
    };

    // Xử lý khi bấm nút "Xóa lọc"
    const handleClearSearch = () => {
        setSearchName('');
        setSearchCity('');
        // setTimeout để đảm bảo state đã rỗng
        setTimeout(() => fetchCinemas(false), 0);
    };

    // Xử lý gửi Form (Thêm mới hoặc Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await cinemaApi.update(selectedCinemaId, formData);
                alert("Cập nhật thông tin cụm rạp thành công!");
            } else {
                await cinemaApi.create(formData);
                alert("Thêm cụm rạp mới thành công!");
            }
            setIsModalOpen(false);
            fetchCinemas();
        } catch (error) {
            alert(error.message || "Thao tác thất bại, vui lòng kiểm tra lại dữ liệu!");
        }
    };

    // Xóa cụm rạp
    const handleDeleteCinema = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa cụm rạp "${name}" ? Thao tác này có thể ảnh hưởng đến các phòng chiếu thuộc rạp!`)) return;
        try {
            await cinemaApi.delete(id);
            alert("Đã xóa cụm rạp thành công!");
            fetchCinemas();
        } catch (error) {
            alert("Không thể xóa cụm rạp này!");
        }
    };

    const openEditModal = (cinema) => {
        setIsEditMode(true);
        setSelectedCinemaId(cinema.id);
        setFormData({
            name: cinema.name,
            address: cinema.address,
            city: cinema.city
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ name: '', address: '', city: '' });
        setIsModalOpen(true);
    };

    return (
        <div>
            <MenuBar />
            <article>
                <div className="cinema-manager">
                    {/* KHỐI ĐẦU TRANG */}
                    <div className="cinema-manager__header">
                        <div className="cinema-manager__title-group">
                            <h2>Hệ thống Quản lý Cụm rạp</h2>
                            <p>Chọn một cụm rạp cụ thể bên dưới để cấu hình thiết kế sơ đồ phòng chiếu & vị trí ghế ngồi.</p>
                        </div>
                        <button className="cinema-manager__btn-add" onClick={openAddModal}>
                            Thêm cụm rạp mới
                        </button>
                    </div>
                    <div className="cinema-manager__filters">
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Tìm theo tên rạp..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Tìm theo thành phố..."
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="filter-btn filter-btn--clear" onClick={handleSearch}>
                            Tìm kiếm
                        </button>
                        <button className="filter-btn filter-btn--clear" onClick={handleClearSearch}>
                            Xóa bộ lọc
                        </button>
                    </div>

                    {/* LƯỚI DANH SÁCH CÁC CỤM RẠP (GRID CARD LAYOUT) */}
                    <div className="cinema-manager__grid">
                        {cinemas.map((cinema) => (
                            <div key={cinema.id} className="cinema-card">
                                <div
                                    className={`cinema-card__badge cinema-card__badge--${cinema.isActive ? 'active' : 'inactive'}`}
                                    onClick={() => handleToggleStatus(cinema)}
                                    title="Click để thay đổi trạng thái"
                                >
                                    {cinema.isActive ? '🟢 ĐANG HOẠT ĐỘNG' : '🔴 TẠM NGƯNG'}
                                </div>
                                <div className="cinema-card__icon">🏢</div>
                                <div className="cinema-card__body">
                                    <h3 className="cinema-card__name">{cinema.name}</h3>
                                    <p className="cinema-card__address">{cinema.address}</p>
                                    <p className="cinema-card__address">{cinema.city}</p>
                                </div>

                                <div className="cinema-card__footer">
                                    {/* Nút chức năng cốt lõi: Liên kết sang quản lý phòng chiếu của rạp này */}
                                    <button
                                        className="cinema-card__btn-action cinema-card__btn-action--manage"
                                        onClick={() => handleSelectCinema(cinema.id, cinema.name)}
                                    >
                                        Thiết kế Phòng & Ghế
                                    </button>

                                    <div className="cinema-card__admin-controls">
                                        <button
                                            className="cinema-card__btn-link"
                                            onClick={() => openEditModal(cinema)}
                                        >
                                            Sửa
                                        </button>
                                        <span className="cinema-card__divider">|</span>
                                        <button
                                            className="cinema-card__btn-link cinema-card__btn-link--danger"
                                            onClick={() => handleDeleteCinema(cinema.id, cinema.name)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MODAL FORM THÊM / SỬA CỤM RẠP */}
                    {isModalOpen && (
                        <div className="cinema-modal">
                            <div className="cinema-modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
                            <div className="cinema-modal__content">
                                <h3 className="cinema-modal__title">
                                    {isEditMode ? 'Cập nhật thông tin chi nhánh rạp' : 'Đăng ký chi nhánh cụm rạp mới'}
                                </h3>

                                <form onSubmit={handleSubmit} className="cinema-modal__form">
                                    <div className="cinema-modal__field">
                                        <label>Tên cụm rạp hệ thống</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Cinestar Nguyễn Trãi"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="cinema-modal__field">
                                        <label>Địa chỉ chi tiết</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: 271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="cinema-modal__field">
                                        <label>Thành phố</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: HỒ CHÍ MINH"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>

                                    <div className="cinema-modal__actions">
                                        <button
                                            type="button"
                                            className="cinema-modal__btn cinema-modal__btn--cancel"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button type="submit" className="cinema-modal__btn cinema-modal__btn--submit">
                                            {isEditMode ? 'Lưu cập nhật' : 'Xác nhận tạo mới'}
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

export default CinemaManagement;
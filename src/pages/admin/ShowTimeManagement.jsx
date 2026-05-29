import React, { useState, useEffect, useCallback } from 'react';
import showtimeApi from '../../api/showtimeApi';
import roomApi from '../../api/roomApi';
import movieApi from '../../api/movieApi';
import cinemaApi from '../../api/cinemaApi';
import MenuBar from '../../components/admin_components/MenuBar';

const ShowtimeManagement = ({ cinemaId, cinemaName }) => {
    // --- Quản lý bộ lọc ---
    const [currentCinema, setCurrentCinema] = useState({ id: cinemaId || null, name: cinemaName || '' });
    // Khởi tạo ngày mặc định chuẩn format yyyy-MM-dd
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // --- Dữ liệu hệ thống hiển thị ---
    const [rooms, setRooms] = useState([]);
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [cinemaList, setCinemaList] = useState([]);

    // --- Trạng thái Modal UI ---
    const [isCinemaModalOpen, setIsCinemaModalOpen] = useState(!cinemaId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // --- Form và dữ liệu được chọn (Khớp với ShowtimeRequestDTO) ---
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [formData, setFormData] = useState({
        movieId: '',
        roomId: '',
        startDate: '', // Cấu trúc tạm để build ra startTime
        startTimeStr: '', // Cấu trúc tạm để build ra startTime
        basePrice: '90000'
    });

    // Tải danh sách rạp ban đầu nếu Admin chưa chọn rạp
    useEffect(() => {
        if (!currentCinema.id) {
            cinemaApi.getAll().then(res => setCinemaList(res.content || res));
        }
    }, [currentCinema.id]);

    // Tải toàn bộ dữ liệu Phòng và Phim của Rạp phục vụ tạo Suất chiếu 
    const loadConfigurationData = useCallback(async () => {
        if (!currentCinema.id) return;
        try {
            const [roomsData, moviesData] = await Promise.all([
                roomApi.getRoomsByCinemaId(currentCinema.id),
                movieApi.getAll({ pageSize: 100 }) // API 1: MovieResponse trả về content
            ]);
            setRooms(roomsData);
            setMovies(moviesData.content || moviesData);
        } catch (error) {
            console.error("Lỗi tải cấu hình rạp:", error);
        }
    }, [currentCinema.id]);

    // API 26: Lấy lịch chiếu theo Cụm rạp và Ngày được chọn 
    const fetchTimelineSchedule = useCallback(async () => {
        if (!currentCinema.id || !selectedDate) return;
        try {
            // API trả thẳng về mảng List<ShowtimeResponseDTO>
            const data = await showtimeApi.getByCinemaAndDate(currentCinema.id, selectedDate);
            setShowtimes(data);
        } catch (error) {
            console.error("Lỗi tải lịch chiếu:", error);
        }
    }, [currentCinema.id, selectedDate]);

    useEffect(() => {
        if (currentCinema.id) {
            loadConfigurationData();
            fetchTimelineSchedule();
        }
    }, [currentCinema.id, selectedDate, loadConfigurationData, fetchTimelineSchedule]);

    // Format giờ hiển thị (Từ Backend: yyyy-MM-dd HH:mm:ss -> FE: HH:mm) 
    const formatTimeOnly = (dateTimeStr) => {
        if (!dateTimeStr) return '';
        const parts = dateTimeStr.split(' ');
        return parts[1] ? parts[1].substring(0, 5) : dateTimeStr.substring(11, 16);
    };

    // API 23: Xử lý Submit lưu Suất chiếu mới
    const handleCreateShowtime = async (e) => {
        e.preventDefault();

        // Ghép chuỗi chuẩn hóa LocalDateTime format: yyyy-MM-dd HH:mm:ss theo đúng yêu cầu Backend
        const formattedStartTime = `${formData.startDate} ${formData.startTimeStr}:00`;

        const showtimeRequestDTO = {
            movieId: formData.movieId,
            roomId: formData.roomId,
            startTime: formattedStartTime,
            basePrice: parseFloat(formData.basePrice)
        };

        try {
            await showtimeApi.create(showtimeRequestDTO);
            alert("Sắp xếp lịch suất chiếu mới thành công!");
            setIsCreateModalOpen(false);
            fetchTimelineSchedule(); // Load lại mảng phim sau khi tạo
        } catch (error) {
            alert(error.message || error.validationErrors || "Trùng lịch chiếu hoặc phòng đang bảo trì!");
        }
    };

    // API 24: Hủy suất chiếu (Chuyển sang CANCELLED)
    const handleCancelShowtime = async (showtimeId) => {
        if (!window.confirm("Bạn có chắc chắn muốn HỦY suất chiếu này? Thao tác này sẽ thông báo hoàn tiền tới khách hàng.")) return;
        try {
            await showtimeApi.cancel(showtimeId);
            alert("Đã hủy suất chiếu thành công!");
            setIsDetailModalOpen(false);
            fetchTimelineSchedule();
        } catch (error) {
            alert("Không thể hủy suất chiếu này!");
        }
    };

    // API 25: Xem chi tiết suất chiếu
    const handleOpenDetailModal = async (id) => {
        try {
            const data = await showtimeApi.getById(id);
            setSelectedShowtime(data); // Trả về DTO
            setIsDetailModalOpen(true);
        } catch (error) {
            alert("Không thể tải thông tin suất chiếu!");
        }
    };

    const handleOpenCreateModal = (roomId = '') => {
        setFormData({
            movieId: movies[0]?.id || '',
            roomId: roomId || rooms[0]?.id || '',
            startDate: selectedDate, // Khớp với form ngày hiển tại
            startTimeStr: '19:00',
            basePrice: '90000'
        });
        setIsCreateModalOpen(true);
    };

    return (
        <div>
            <MenuBar />
            <article>
                <div className="showtime-manager">
                    {/* THANH ĐIỀU HƯỚNG BỘ LỌC TỐI ƯU */}
                    <div className="showtime-manager__filter-bar">
                        <div className="filter-group">
                            <button className="btn-switch-cinema" onClick={() => setIsCinemaModalOpen(true)}>
                                🏢 Cụm rạp: <b>{currentCinema.name || 'Chưa chọn cơ sở'}</b>
                            </button>
                        </div>
                        <div className="filter-group">
                            <label>Chọn ngày xếp lịch:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="date-picker"
                            />
                        </div>
                        <button className="btn-add-showtime" onClick={() => handleOpenCreateModal()} disabled={rooms.length === 0}>
                            Thêm suất chiếu
                        </button>
                    </div>

                    {/* BẢN ĐỒ TIMELINE SUẤT CHIẾU THEO PHÒNG CHIẾU TRỰC QUAN */}
                    <div className="showtime-timeline">
                        {rooms.map(room => {
                            const roomShowtimes = showtimes.filter(st => st.roomId === room.id);

                            return (
                                <div className="timeline-row" key={room.id}>
                                    <div className="timeline-row__room-info">
                                        <span className="room-name">{room.name}</span>
                                        <span className="room-seats">{room.totalSeats} ghế hoạt động</span>
                                    </div>
                                    <div className="timeline-row__slots">
                                        {roomShowtimes.length === 0 ? (
                                            <div className="empty-slot-hint" onClick={() => handleOpenCreateModal(room.id)}>
                                                Trống lịch — Click để lên lịch chiếu nhanh
                                            </div>
                                        ) : (
                                            roomShowtimes.map(st => (
                                                <div
                                                    className={`showtime-block showtime-block--${st.status.toLowerCase()}`}
                                                    key={st.id}
                                                    onClick={() => handleOpenDetailModal(st.id)}
                                                >
                                                    <div className="showtime-block__time">
                                                        {formatTimeOnly(st.startTime)} - {formatTimeOnly(st.endTime)}
                                                    </div>
                                                    <div className="showtime-block__movie-title">{st.movieTitle}</div>
                                                    <i className="fi fi-sr-wallet"></i>
                                                    <div className="showtime-block__meta">
                                                        <span>{st.basePrice / 1000}k</span>
                                                        <span className="badge-status">{st.status}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* MODAL 1: BẮT BUỘC CHỌN CỤM RẠP LÀM VIỆC */}
                    {isCinemaModalOpen && (
                        <div className="showtime-modal">
                            <div className="showtime-modal__backdrop" onClick={() => currentCinema.id && setIsCinemaModalOpen(false)}></div>
                            <div className="showtime-modal__content">
                                <h3>Chọn chi nhánh </h3>
                                <div className="cinema-selector-list">
                                    {cinemaList.map(c => (
                                        <div
                                            className={`cinema-item ${currentCinema.id === c.id ? 'cinema-item--active' : ''}`}
                                            key={c.id}
                                            onClick={() => {
                                                setCurrentCinema({ id: c.id, name: c.name });
                                                setIsCinemaModalOpen(false);
                                            }}
                                        >
                                            <b>{c.name}</b> <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>{c.address}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL 2: TẠO MỚI SUẤT CHIẾU (API số 26) */}
                    {isCreateModalOpen && (
                        <div className="showtime-modal">
                            <div className="showtime-modal__backdrop" onClick={() => setIsCreateModalOpen(false)}></div>
                            <div className="showtime-modal__content">
                                <h3>Lên lịch </h3>
                                <form onSubmit={handleCreateShowtime} className="showtime-form">
                                    <div className="form-group">
                                        <label>Chọn phim</label>
                                        <select value={formData.movieId} onChange={e => setFormData({ ...formData, movieId: e.target.value })} required>
                                            {movies.map(m => (
                                                <option key={m.id} value={m.id}>{m.title} ({m.duration} phút)</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Chọn Phòng chiếu</label>
                                        <select value={formData.roomId} onChange={e => setFormData({ ...formData, roomId: e.target.value })} required>
                                            {rooms.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Ngày chiếu</label>
                                            <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Giờ bắt đầu phát</label>
                                            <input type="time" value={formData.startTimeStr} onChange={e => setFormData({ ...formData, startTimeStr: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Giá vé cơ bản (VNĐ)</label>
                                        <input type="number" min="0" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} required />
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setIsCreateModalOpen(false)}>Hủy bỏ</button>
                                        <button type="submit" className="btn-submit">Xác nhận</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL 3: XEM CHI TIẾT VÀ HỦY SUẤT CHIẾU (API số 28 & 27) */}
                    {isDetailModalOpen && selectedShowtime && (
                        <div className="showtime-modal">
                            <div className="showtime-modal__backdrop" onClick={() => setIsDetailModalOpen(false)}></div>
                            <div className="showtime-modal__content showtime-modal__content--detail">
                                <h3>Thông tin chi tiết Suất chiếu</h3>

                                <div className="showtime-detail-wrapper">
                                    <img src={selectedShowtime.moviePoster} alt="Poster" className="movie-poster-preview" />
                                    <div className="detail-info">
                                        <h4>{selectedShowtime.movieTitle}</h4>
                                        <p><b>Thời lượng:</b> {selectedShowtime.movieDuration} phút</p>
                                        <p><b>Phòng chiếu:</b> {selectedShowtime.roomName} (Cơ sở: {selectedShowtime.cinemaName})</p>
                                        <p><b>Giờ chiếu công bố:</b> <span className="time-highlight">{selectedShowtime.startTime}</span></p>
                                        <p><b>Giờ kết thúc:</b> <span>{selectedShowtime.endTime}</span></p>
                                        <p><b>Giá vé gốc:</b> <span className="price-tag">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedShowtime.basePrice)}</span></p>
                                        <p><b>Trạng thái:</b> <span className={`status-badge status-badge--${selectedShowtime.status.toLowerCase()}`}>{selectedShowtime.status}</span></p>
                                    </div>
                                </div>

                                <div className="form-actions form-actions--detail">
                                    <button type="button" className="btn-closes" onClick={() => setIsDetailModalOpen(false)}>Đóng</button>
                                    {selectedShowtime.status === 'SCHEDULED' && (
                                        <button type="button" className="btn-danger" onClick={() => handleCancelShowtime(selectedShowtime.id)}>
                                            Hủy suất chiếu
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
};

export default ShowtimeManagement;
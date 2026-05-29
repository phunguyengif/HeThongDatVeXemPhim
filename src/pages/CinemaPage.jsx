import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAllMovies } from '../redux/slices/movieApiSlice';
import { fetchAllCinemas } from '../redux/slices/cinemaApiSlice';
import { initBooking } from '../redux/slices/bookingSlice';
import showtimeApi from '../api/showtimeApi';

// Hàm tạo 7 ngày để lọc lịch
const generateNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        days.push({
            displayDate: `${day}/${month}/${year}`,
            fullDate: `${year}-${month}-${day}`,
            shortDate: `${day}/${month}`
        });
    }
    return days;
};

const CinemaPage = () => {
    const { id: cinemaId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const next7Days = useMemo(() => generateNext7Days(), []);

    const { movieList } = useSelector(state => state.movieStore);
    const { list: cinemaList } = useSelector(state => state.cinemaStore);
    const currentCinema = cinemaList.find(c => c.id === cinemaId);

    const [activeTab, setActiveTab] = useState('DANG_CHIEU'); 
    const [cinemaShowtimes, setCinemaShowtimes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Lưu trữ ngày đang được chọn cho MỖI BỘ PHIM 
    const [selectedDates, setSelectedDates] = useState({});

    useEffect(() => {
        if (movieList.length === 0) dispatch(fetchAllMovies({ pageNumber: 0, pageSize: 100 }));
        if (cinemaList.length === 0) dispatch(fetchAllCinemas({ pageNumber: 0, pageSize: 100, isActive: true }));
    }, [dispatch, movieList.length, cinemaList.length]);

    useEffect(() => {
        const fetchShowtimes = async () => {
            if (!cinemaId) return;
            setIsLoading(true);
            try {
                const promises = next7Days.map(day => showtimeApi.getByCinemaAndDate(cinemaId, day.fullDate));
                const responses = await Promise.all(promises);

                let allSt = [];
                responses.forEach(res => {
                    const data = res.data ? res.data : res;
                    if (Array.isArray(data)) allSt = [...allSt, ...data];
                });
                setCinemaShowtimes(allSt);
            } catch (error) {
                console.error("Lỗi tải lịch chiếu rạp:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchShowtimes();
    }, [cinemaId, next7Days]);

    // Bóc tách dữ liệu hiển thị
    const moviesShowingHere = useMemo(() => {
        const movieIdsWithShowtimes = [...new Set(cinemaShowtimes.map(st => st.movieId))];
        return movieList.filter(m => movieIdsWithShowtimes.includes(m.id) && m.status === 'ACTIVE');
    }, [movieList, cinemaShowtimes]);

    const moviesComingSoon = useMemo(() => {
        return movieList.filter(m => m.status === 'INACTIVE');
    }, [movieList]);

    const displayMovies = activeTab === 'DANG_CHIEU' ? moviesShowingHere : moviesComingSoon;

    // Xử lý đổi ngày cho từng thẻ phim cụ thể
    const handleDateChange = (movieId, dateValue) => {
        setSelectedDates(prev => ({ ...prev, [movieId]: dateValue }));
    };

    // Hàm đặt vé đưa sang luồng Checkout
    const handleBookTicket = (showtime, movie) => {
        dispatch(initBooking({
            showtimeId: showtime.id,
            cinemaName: currentCinema.name,
            cinemaAddress: currentCinema.address,
            movieTitle: movie.title,
            movieAgeRestriction: movie.ageRestriction,
            movieId: movie.id,
            movieDuration:movie.duration,
            showtimeDate: showtime.startTime.substring(0, 10),
            showtimeTime: showtime.startTime.substring(11, 16)
        }));
        console.log(showtime)
        console.log(movie)

        navigate(`/BookingPage?showtimeId=${showtime.id}&movieId=${movie.id}`);
    };

    if (!currentCinema) return <div className="loading-screen">Đang tải thông tin rạp...</div>;

    return (
        <div className="cinema-page-layout">
            <div className="main-content">
                <div className="cinema-banner">
                    <div className="cinema-banner__content">
                        <h1>{currentCinema.name?.toUpperCase()}</h1>
                        <p><i class="fi fi-rr-marker"></i> {currentCinema.address}</p>
                    </div>
                </div>

                {/* TAB MENU */}
                <div className="cinema-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'DANG_CHIEU' ? 'active' : ''}`}
                        onClick={() => setActiveTab('DANG_CHIEU')}
                    >
                        PHIM ĐANG CHIẾU
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'SAP_CHIEU' ? 'active' : ''}`}
                        onClick={() => setActiveTab('SAP_CHIEU')}
                    >
                        PHIM SẮP CHIẾU
                    </button>
                    <button className="tab-btn">SUẤT CHIẾU ĐẶC BIỆT</button>
                    <button className="tab-btn">BẢNG GIÁ VÉ</button>
                </div>

                {/* DANH SÁCH PHIM */}
                <div className="movie-grid-container">
                    <h2 className="section-title">
                        {activeTab === 'DANG_CHIEU' ? 'PHIM ĐANG CHIẾU' : 'PHIM SẮP CHIẾU'}
                    </h2>

                    {isLoading ? (
                        <div className="loading-text">Đang tải danh sách phim...</div>
                    ) : displayMovies.length === 0 ? (
                        <div className="empty-text">Hiện chưa có phim nào trong danh mục này.</div>
                    ) : (
                        <div className="movie-grid">
                            {displayMovies.map(movie => {
                                const movieSts = cinemaShowtimes.filter(st => st.movieId === movie.id);

                                // Ngày được chọn cho phim này (Mặc định là ngày hôm nay nếu chưa chọn)
                                const activeDate = selectedDates[movie.id] || next7Days[0].fullDate;

                                // Lọc suất chiếu theo ngày được chọn
                                const slotsToday = movieSts.filter(st => st.startTime.startsWith(activeDate))
                                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                                return (
                                    <div key={movie.id} className="cinema-movie-card">
                                        <div className="cinema-movie-card__img-wrapper">
                                            <img src={movie.poseUrl} alt={movie.title} />
                                        </div>

                                        <div className="cinema-movie-card__info">
                                            <h3 className="title">{movie.title.toUpperCase()}</h3>

                                            <div className="meta-tags">
                                                <span className="tag"><i className="fi fi-rr-tags"></i> {movie.genre}</span>
                                                <span className="tag">⏱ {movie.duration} phút</span>
                                                <span className="tag">🌐 {movie.country || 'Khác'}</span>
                                                <span className="tag">💬 Phụ Đề</span>
                                            </div>

                                            <div className="age-rating">
                                                <i class="fi fi-rr-user-check"></i> Phim dành cho khán giả từ {movie.ageRestriction || 'mọi lứa tuổi'}
                                            </div>

                                            {/* BỘ LỌC LỊCH CHIẾU BÊN TRONG THẺ PHIM */}
                                            {activeTab === 'DANG_CHIEU' && (
                                                <div className="showtime-box">
                                                    <select
                                                        className="date-selector"
                                                        value={activeDate}
                                                        onChange={(e) => handleDateChange(movie.id, e.target.value)}
                                                    >
                                                        {next7Days.map(day => (
                                                            <option key={day.fullDate} value={day.fullDate}>
                                                                {day.displayDate}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <div className="screen-type-group">
                                                        <p className="screen-label">STANDARD</p>
                                                        <div className="time-slots">
                                                            {slotsToday.length > 0 ? (
                                                                slotsToday.map(st => (
                                                                    <button
                                                                        key={st.id}
                                                                        className="time-btn"
                                                                        onClick={() => handleBookTicket(st, movie)}
                                                                    >
                                                                        {st.startTime.substring(11, 16)}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <span className="no-slot">Không có suất chiếu</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CinemaPage;
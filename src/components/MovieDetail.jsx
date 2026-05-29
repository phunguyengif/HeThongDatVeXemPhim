import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchAllCinemas } from '../redux/slices/cinemaApiSlice.jsx';
import { fetchMovieById } from '../redux/slices/movieApiSlice.jsx';
import { fetchShowtimesByMovie } from '../redux/slices/showtimeApiSlice.jsx';
import { initBooking } from '../redux/slices/bookingSlice.jsx';
import { useNavigate } from 'react-router-dom';
import PreviewPopup from './PopupTrailer.jsx';


const generateNext7Days = () => {
    const days = [];
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        days.push({
            displayDate: `${day}/${month}`,
            fullDate: `${year}-${month}-${day}`,
            dayOfWeek: i === 0 ? 'Hôm nay' : dayNames[d.getDay()]
        });
    }
    return days;
};

const MovieDetail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: movieId } = useParams();

    // 1. TẠO DANH SÁCH NGÀY & STATE
    const daysList = useMemo(() => generateNext7Days(), []);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDayObj, setSelectedDayObj] = useState(daysList[0]);
    const [activePopup, setActivePopup] = useState(null);
    const [address, setAddress] = useState('HỒ CHÍ MINH');

    // 2. LẤY DỮ LIỆU TỪ REDUX
    const { list: cinemas, isLoading: loadingCinemas } = useSelector((state) => state.cinemaStore);
    const { list: showtimes, isLoading: loadingShowtimes } = useSelector((state) => state.showtimeStore);
    const { currentMovie, isLoading: loadingMovies } = useSelector((state) => state.movieStore);

    //Popup Trailer
    const [previewPosterUrl, setPreviewPosterUrl] = useState(null);
    const [previewTrailerUrl, setPreviewTrailerUrl] = useState(null);
    const videoRef = useRef(null);

    const closeTrailerPreview = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setPreviewTrailerUrl(null);
    };

    // GỌI API LẤY DỮ LIỆU CƠ BẢN (PHIM VÀ RẠP)
    useEffect(() => {
        if (movieId) {
            dispatch(fetchMovieById(movieId));
        }
    }, [dispatch, movieId]);

    useEffect(() => {
        if (cinemas.length === 0) {
            dispatch(fetchAllCinemas({ pageNumber: 0, pageSize: 50, isActive: true }));
        }
    }, [dispatch, cinemas.length]);


    // BƯỚC XỬ LÝ LỊCH CHIẾU
    const cinemasInCity = cinemas.filter(c => c?.city?.toUpperCase() === address.toUpperCase());

    useEffect(() => {
        if (movieId && selectedDayObj.fullDate) {
            dispatch(fetchShowtimesByMovie({
                movieId: movieId,
                date: selectedDayObj.fullDate
            }));
        }
    }, [dispatch, movieId, selectedDayObj.fullDate]);

    const renderedTheaters = cinemasInCity.map(cinema => {

        const movieShowtimes = showtimes.filter(st => st.cinemaId === cinema.id);

        const sortedShowtimes = [...movieShowtimes].sort((a, b) =>
            new Date(a.startTime) - new Date(b.startTime)
        );

        const slots = sortedShowtimes.map(st => st.startTime.substring(11, 16));

        return {
            ...cinema,
            screenType: "Standard",
            slots: [...new Set(slots)],
            originalShowtimes: movieShowtimes
        };
    }).filter(theater => theater.slots.length > 0);

    const uniqueCitiesArray = [...new Set(cinemas.map(item => item?.city?.toUpperCase()))].filter(Boolean);

    const handleSelect = (value) => {
        setAddress(value);
        setActivePopup(null);
    };
    const togglePopup = (index) => {
        setActivePopup(activePopup === index ? null : index);
    };


    if (loadingMovies || (!currentMovie && movieId)) {
        if (loadingMovies) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Đang tải thông tin phim...</div>;
    }

    if (!currentMovie) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Không tìm thấy bộ phim này!</div>;
    }

    return (
        <div className="main-content">
            <div className="movie-detail">
                <div className="movie-detail__left">
                    <div className="movie-detail__poster-box ">
                        <img
                            src={currentMovie.poseUrl}
                            alt={currentMovie.title}
                            className="movie-detail__poster"
                        />
                    </div>
                </div>
                <div className="movie-detail__right">
                    <h1 className="movie-detail__title">{currentMovie.title}</h1>

                    {/* Các dòng thông số cơ bản */}
                    <div className="movie-detail__meta">
                        <div className="meta-item">
                            <i className="fas fa-tags"></i>
                            <span><strong>{currentMovie.genre || 'Đang cập nhật'}</strong></span>
                        </div>
                        <div className="meta-item">
                            <i className="fas fa-clock"></i>
                            <span><strong>{currentMovie.duration} phút</strong></span>
                        </div>
                        <div className="meta-item">
                            <i className="fas fa-globe"></i>
                            <span><strong>{currentMovie.country || 'Đang cập nhật'}</strong></span>
                        </div>
                        <div className="meta-item">
                            <i className="fas fa-comment-dots"></i>
                            <span><strong>Phụ Đề</strong></span>
                        </div>
                        <div className="meta-item">
                            <i className="fas fa-comment-dots"></i>
                            <span><strong>Phim dành cho khán giả {currentMovie.ageRestriction || 'mọi lứa tuổi'}</strong></span>
                        </div>
                        <h1 className="movie-detail__title">MÔ TẢ</h1>
                        <div className="meta-item">
                            <p>
                                Đạo diễn: {currentMovie.director || 'Đang cập nhật'}
                                <br />Diễn viên: {currentMovie.actors || 'Đang cập nhật'}
                                <br />Khởi chiếu: {currentMovie.releaseDate}
                            </p>
                        </div>
                        <h1 className="movie-detail__title">NỘI DUNG PHIM</h1>
                        <div className="movie-detail__synopsis">
                            <p className={`synopsis-text ${isExpanded ? 'expanded' : ''}`}>
                                {currentMovie.description}
                            </p>
                            <span className="toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                            </span>
                        </div>
                        <div className="movie-detail__actions">
                            <button
                                className="btn-trailer"
                                onClick={() => setPreviewTrailerUrl(currentMovie.trailerUrl)}>
                                <div className="icon-play">▶</div>
                                <span className="text-underline">Xem Trailer</span>
                            </button>
                        </div>

                        <PreviewPopup
                            type="poster"
                            url={previewPosterUrl}
                            onClose={() => setPreviewPosterUrl(null)}
                        />

                        {/* Popup Trailer */}
                        <PreviewPopup
                            type="video"
                            url={previewTrailerUrl}
                            onClose={closeTrailerPreview}
                            videoRef={videoRef}
                        />
                    </div>
                </div>
            </div>


            <div className="movie-schedule">
                <h1 className="movie-schedule__date-title">LỊCH CHIẾU</h1>

                {/* THANH CHỌN NGÀY */}
                <div className="movie-schedule__shedule-dates">
                    {daysList.map((item) => (
                        <div
                            key={item.fullDate}
                            className={`schedule-date-item ${selectedDayObj.fullDate === item.fullDate ? 'active' : ''}`}
                            onClick={() => setSelectedDayObj(item)}
                        >
                            <p className="schedule-date-item__text-date">{item.displayDate}</p>
                            <p className="schedule-date-item__text-day">{item.dayOfWeek}</p>
                        </div>
                    ))}
                </div>

                <div className="movie-schedule__time">
                    <div className="movie-schedule__time-header">
                        <div className="movie-schedule__time-item">
                            <h1 className='movie-schedule__date-title'>DANH SÁCH RẠP</h1>

                            {/* POPUP CHỌN TỈNH/THÀNH PHỐ */}
                            <div className={`movie-schedule__popup-menu ${activePopup === 1 ? 'active' : ''}`} onClick={() => togglePopup(1)}>
                                <p className='movie-schedule__text'>{address}</p>
                                <span className='movie-scheduleg__arrow'>▼</span>
                                {activePopup === 1 && (
                                    <div className="movie-schedule__dropdown">
                                        {uniqueCitiesArray.map(item => (
                                            <div key={item} className="movie-schedule__item" onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(item);
                                            }}>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RENDER KẾT QUẢ SUẤT CHIẾU */}
                    <div className="movie-schedule__time-container">
                        {loadingCinemas || loadingShowtimes ? (
                            <p style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
                                Đang tải lịch chiếu...
                            </p>
                        ) : renderedTheaters.length > 0 ? (
                            renderedTheaters.map((theater) => (
                                <div key={theater.id} className="theater-time-box">
                                    <div className="theater-time-box__info">
                                        <h2 className="theater-name">{theater.name}</h2>
                                        <p className="theater-address">{theater.address}</p>
                                    </div>
                                    <div className="theater-time-box__slots-wrapper">
                                        <div className="screen-type-tag">{theater.screenType}</div>
                                        <div className="slots-grid">
                                            {theater.slots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    className="slot-btn"
                                                    onClick={() => {
                                                        const showtimeId = theater.originalShowtimes.find(st => st.startTime.includes(slot)).id;
                                                        dispatch(initBooking({
                                                            showtimeId: showtimeId,
                                                            cinemaName: theater.name,
                                                            cinemaAddress: theater.address,
                                                            movieTitle: currentMovie.title,
                                                            movieAgeRestriction: currentMovie.ageRestriction,
                                                            movieId: currentMovie.id,
                                                            movieDuration: currentMovie.duration,
                                                            showtimeDate: selectedDayObj.displayDate,
                                                            showtimeTime: slot
                                                        }));
                

                                                        navigate(`/BookingPage?showtimeId=${showtimeId}&movieId=${currentMovie.id}`);
                                                    }}>
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-schedule-ticket">
                                <p style={{ color: 'white', padding: '20px' }}>
                                    Hiện tại chưa có suất chiếu nào cho khu vực và ngày bạn chọn.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MovieDetail;
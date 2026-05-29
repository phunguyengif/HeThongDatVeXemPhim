import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllMovies } from '../redux/slices/movieApiSlice';
import { fetchAllCinemas } from '../redux/slices/cinemaApiSlice';
import { initBooking } from '../redux/slices/bookingSlice';

import MovieSlider from '../components/MovieSlider';
import showtimeApi from '../api/showtimeApi';

const DatVe = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const generateNext7Days = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);

            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();

            days.push({
                displayDate: `${day}/${month}`,
                fullDate: `${year}-${month}-${day}`,
            });
        }
        return days;
    };

    const { movieList, isLoading: isMovieLoading } = useSelector((state) => state.movieStore);
    const { list: cinemaList } = useSelector((state) => state.cinemaStore);

    // State quản lý giỏ đặt vé
    const [bookingData, setBookingData] = useState({
        theater: '', // lưu ID rạp (Cinema ID) 
        movie: '',   // Lưu ID Phim
        date: '',    // Lưu Object ngày: { displayDate, fullDate }
        time: ''     // Lưu Giờ chiếu
    });

    const [activePopup, setActivePopup] = useState(null);
    const bookingRef = useRef(null);
    const bannerRef = useRef(null);

    const next7Days = useMemo(() => generateNext7Days(), []);

    // State chứa danh sách động lọc
    const [moviesInCinema, setMoviesInCinema] = useState([]); 
    const [availableDates, setAvailableDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);  
    const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);
    const [currentShowtimes, setCurrentShowtimes] = useState([]);

    // Load danh mục Phim và Rạp ban đầu
    useEffect(() => {
        if (movieList.length === 0) {
            dispatch(fetchAllMovies({ pageNumber: 0, pageSize: 100 }));
        }
        if (cinemaList.length === 0) {
            dispatch(fetchAllCinemas({ pageNumber: 0, pageSize: 100, isActive: true }));
        }
    }, [dispatch, movieList.length, cinemaList.length]);

    const phimDangChieu = movieList.filter(movie => movie.status === 'ACTIVE');
    const phimSapChieu = movieList.filter(movie => movie.status === 'INACTIVE');


    useEffect(() => {
        const getMoviesByCinema = async () => {
            if (!bookingData.theater) {
                setMoviesInCinema([]);
                return;
            }

            try {
                setIsLoadingShowtimes(true);
                const promises = next7Days.map(day =>
                    showtimeApi.getByCinemaAndDate(bookingData.theater, day.fullDate) 
                );
                const responses = await Promise.all(promises);

                let allShowtimes = [];
                responses.forEach(res => {
                    const data = res.data ? res.data : res;
                    if (Array.isArray(data)) allShowtimes = [...allShowtimes, ...data];
                });

                const uniqueMovieIds = [...new Set(allShowtimes.map(st => st.movieId))];

                const filteredMovies = movieList.filter(movie => uniqueMovieIds.includes(movie.id));
                setMoviesInCinema(filteredMovies);

            } catch (error) {
                console.error("Lỗi lấy danh sách phim của rạp:", error);
                setMoviesInCinema([]);
            } finally {
                setIsLoadingShowtimes(false);
            }
        };

        if (cinemaList.length > 0 && movieList.length > 0) {
            getMoviesByCinema();
        }
    }, [bookingData.theater, cinemaList, movieList, next7Days]);


    useEffect(() => {
        const getDatesByMovieAndCinema = async () => {
            if (!bookingData.theater || !bookingData.movie) {
                setAvailableDates([]);
                return;
            }

            try {
                const promises = next7Days.map(day =>
                    showtimeApi.getByCinemaAndDate(bookingData.theater, day.fullDate) 
                );
                const responses = await Promise.all(promises);

                const validDays = [];
                responses.forEach((res, index) => {
                    const data = res.data ? res.data : res;
                    if (Array.isArray(data)) {
                        const hasMovie = data.some(st => st.movieId === bookingData.movie);
                        if (hasMovie) {
                            validDays.push(next7Days[index]); 
                        }
                    }
                });

                setAvailableDates(validDays);

            } catch (error) {
                console.error("Lỗi lọc ngày chiếu:", error);
                setAvailableDates([]);
            }
        };

        getDatesByMovieAndCinema();
    }, [bookingData.movie, bookingData.theater, next7Days]);

    // KHI CHỌN NGÀY -> LẤY CHÍNH XÁC CÁC GIỜ CHIẾU 
    useEffect(() => {
        const getSlotsByDate = async () => {
            if (!bookingData.theater || !bookingData.movie || !bookingData.date) {
                setAvailableSlots([]);
                return;
            }

            try {
                setIsLoadingShowtimes(true);
                const response = await showtimeApi.getByCinemaAndDate(bookingData.theater, bookingData.date.fullDate); //
                const data = response.data ? response.data : response;

                if (Array.isArray(data)) {
                    const matchShowtimes = data.filter(st => st.movieId === bookingData.movie);

                    setCurrentShowtimes(matchShowtimes);

                    const slots = matchShowtimes.map(st => {
                        if (!st.startTime) return '';
                        return st.startTime.substring(11, 16);
                    }).filter(t => t !== '');

                    setAvailableSlots([...new Set(slots)].sort());
                }
            } catch (error) {
                console.error("Lỗi lấy giờ chiếu:", error);
                setAvailableSlots([]);
            } finally {
                setIsLoadingShowtimes(false);
            }
        };

        getSlotsByDate();
    }, [bookingData.date, bookingData.movie, bookingData.theater]);

    const handleBookNow = () => {
        if (!bookingData.time) return;

        const selectedShowtime = currentShowtimes.find(st => st.startTime.includes(bookingData.time));
        const selectedCinema = cinemaList.find(c => c.id === bookingData.theater);
        const selectedMovie = movieList.find(m => m.id === bookingData.movie);

        if (selectedShowtime) {
            dispatch(initBooking({
                showtimeId: selectedShowtime.id,
                cinemaName: selectedCinema?.name || '',   
                cinemaAddress: selectedCinema?.address || '',
                movieTitle: selectedMovie?.title || '',
                movieAgeRestriction: selectedMovie?.ageRestriction || '',
                showtimeDate: bookingData.date?.displayDate || '',
                showtimeTime: bookingData.time
            }));
            navigate('/BookingPage');
        } else {
            alert("Lỗi: Không tìm thấy dữ liệu suất chiếu này!");
        }
    };


    // Tìm tên Rạp và tên Phim hiển thị
    const selectedCinemaName = cinemaList.find(c => c.id === bookingData.theater)?.name;
    const selectedMovieName = movieList.find(m => m.id === bookingData.movie)?.title;

    // Bộ điều khiển chọn bước
    const handleSelect = (step, value) => {
        const newData = { ...bookingData, [step]: value };

        if (step === 'theater') {
            newData.movie = ''; newData.date = ''; newData.time = '';
        }
        if (step === 'movie') {
            newData.date = ''; newData.time = '';
        }
        if (step === 'date') {
            newData.time = '';
        }

        setBookingData(newData);

        if (step === 'theater') setActivePopup(2);
        else if (step === 'movie') setActivePopup(3);
        else if (step === 'date') setActivePopup(4);
        else setActivePopup(null);
    };

    const togglePopup = (index) => {
        if (index === 2 && !bookingData.theater) return;
        if (index === 3 && !bookingData.movie) return;
        if (index === 4 && !bookingData.date) return;

        setActivePopup(activePopup === index ? null : index);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bookingRef.current && !bookingRef.current.contains(event.target)) {
                setActivePopup(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="main-content">
            <div className="quick-booking" ref={bookingRef}>
                <div className="quick-booking__form">
                    <h2 className="quick-booking__title">ĐẶT VÉ NHANH</h2>

                    {/* BƯỚC 1: CHỌN RẠP */}
                    <div className={`quick-booking__select-box ${activePopup === 1 ? 'active' : ''}`}
                        onClick={() => togglePopup(1)}>
                        <p className="quick-booking__text">
                            {selectedCinemaName || '1. Chọn Rạp'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 1 && (
                            <div className="quick-booking__dropdown">
                                {cinemaList.map(cinema => (
                                    <div key={cinema.id} className="quick-booking__item" onClick={() => handleSelect('theater', cinema.id)}>
                                        {cinema.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BƯỚC 2: CHỌN PHIM  */}
                    <div className={`quick-booking__select-box ${activePopup === 2 ? 'active' : ''} ${!bookingData.theater ? 'disabled' : ''}`}
                        onClick={() => togglePopup(2)}>
                        <p className="quick-booking__text">
                            {selectedMovieName || '2. Chọn Phim'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 2 && (
                            <div className="quick-booking__dropdown">
                                {isLoadingShowtimes ? (
                                    <div className="quick-booking__item" style={{ color: '#64748b', cursor: 'default' }}>Đang tìm phim...</div>
                                ) : moviesInCinema.length > 0 ? (
                                    moviesInCinema.map(movie => (
                                        <div key={movie.id} className="quick-booking__item" onClick={() => handleSelect('movie', movie.id)}>
                                            {movie.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="quick-booking__item" style={{ color: '#94a3b8', cursor: 'default' }}>Rạp hiện tại chưa lên lịch phim nào</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BƯỚC 3: CHỌN NGÀY */}
                    <div className={`quick-booking__select-box ${activePopup === 3 ? 'quick-booking__item-select--active' : ''}`}
                        onClick={() => togglePopup(3)}>
                        <p className="quick-booking__text">
                            {bookingData.date ? bookingData.date.displayDate : '3. Chọn Ngày'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 3 && (
                            <div className="quick-booking__dropdown">
                                {availableDates.length > 0 ? (
                                    availableDates.map(day => (
                                        <div key={day.fullDate} className="quick-booking__item" onClick={() => handleSelect('date', day)}>
                                            {day.displayDate}
                                        </div>
                                    ))
                                ) : (
                                    <div className="quick-booking__item" style={{ color: '#94a3b8', cursor: 'default', fontSize: '13px' }}>
                                        Vui lòng chọn Rạp và Phim trước
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BƯỚC 4: CHỌN SUẤT CHIẾU  */}
                    <div className={`quick-booking__select-box ${activePopup === 4 ? 'quick-booking__item-select--active' : ''}`}
                        onClick={() => togglePopup(4)}>
                        <p className="quick-booking__text">
                            {bookingData.time || '4. Chọn Suất'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 4 && (
                            <div className="quick-booking__dropdown">
                                {isLoadingShowtimes ? (
                                    <div className="quick-booking__item" style={{ color: '#64748b', cursor: 'default' }}>Đang tìm suất...</div>
                                ) : availableSlots.length > 0 ? (
                                    availableSlots.map(timeSlot => (
                                        <div key={timeSlot} className="quick-booking__item" onClick={() => handleSelect('time', timeSlot)}>
                                            {timeSlot}
                                        </div>
                                    ))
                                ) : (
                                    <div className="quick-booking__item" style={{ color: '#94a3b8', cursor: 'default', fontSize: '13px' }}>
                                        Chưa có lịch cho ngày đã chọn
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button 
                        className={`quick-booking__btn ${!bookingData.time ? 'btn-disabled' : ''}`}
                        onClick={handleBookNow}
                        disabled={!bookingData.time}
                    >
                        ĐẶT NGAY 
                    </button>
                </div>
            </div>

            {/* PHẦN DANH SÁCH SLIDER PHIM */}
            {isMovieLoading ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'white' }}>Đang tải dữ liệu phim...</div>
            ) : (
                <>
                    <MovieSlider title="PHIM ĐANG CHIẾU" movies={phimDangChieu} />
                    <MovieSlider title="PHIM SẮP CHIẾU" movies={phimSapChieu} />
                </>
            )}
        </div>
    );
};

export default DatVe;
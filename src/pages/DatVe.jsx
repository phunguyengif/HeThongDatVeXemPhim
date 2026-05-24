import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllMovies } from '../redux/slices/movieApiSlice';
import { fetchAllCinemas } from '../redux/slices/cinemaApiSlice';

import MovieSlider from '../components/MovieSlider';
// import Headers from '../components/Header'; // Tạm ẩn nếu không dùng đến

const DatVe = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. LẤY DỮ LIỆU TỪ REDUX STORE
    const { movieList, isLoading: isMovieLoading } = useSelector((state) => state.movieStore);
    const { list: cinemaList } = useSelector((state) => state.cinemaStore);

    // 2. GỌI API KHI COMPONENT VỪA RENDER
    useEffect(() => {
        // Lấy danh sách phim (Lấy số lượng lớn để đủ cả phim đang chiếu và sắp chiếu)
        if (movieList.length === 0) {
            dispatch(fetchAllMovies({ pageNumber: 0, pageSize: 100 }));
        }
        // Lấy danh sách rạp cho Form đặt vé nhanh
        if (cinemaList.length === 0) {
            dispatch(fetchAllCinemas({ pageNumber: 0, pageSize: 100, isActive: true }));
        }
    }, [dispatch, movieList.length, cinemaList.length]);
    console.log(movieList);



    const phimDangChieu = movieList.filter(movie => movie.status === 'NOW_SHOWING');
    const phimSapChieu = movieList.filter(movie => movie.status === 'COMING_SOON');


    const [bookingData, setBookingData] = useState({
        theater: '',
        movie: '',
        date: '',
        time: ''
    });

    const [activePopup, setActivePopup] = useState(null);
    const bookingRef = useRef(null);
    const bannerRef = useRef(null); // Thêm ref cho banner nếu bạn đang dùng handleScrollArrow

    // popup menu cho đặt chỗ
    const handleSelect = (step, value) => {
        const newData = { ...bookingData, [step]: value };

        if (step === 'theater') {
            newData.movie = ''; newData.date = ''; newData.time = '';
        }
        if (step === 'movie') {
            newData.date = ''; newData.time = '';
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

    // hook banner
    const handleScrollArrow = (direction) => {
        if (bannerRef.current) {
            const { scrollLeft, offsetWidth } = bannerRef.current;
            const scrollAmount = direction === 'next' ? scrollLeft + offsetWidth : scrollLeft - offsetWidth;

            bannerRef.current.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };


    return (
        <div className="main-content">
            <div className="quick-booking" ref={bookingRef}>
                <div className="quick-booking__form">
                    <h2 className="quick-booking__title">ĐẶT VÉ NHANH</h2>

                    {/* Bước 1: Chọn Rạp (Dữ liệu động từ DB) */}
                    <div className={`quick-booking__select-box ${activePopup === 1 ? 'active' : ''}`}
                        onClick={() => togglePopup(1)}>
                        <p className="quick-booking__text">
                            {bookingData.theater || '1. Chọn Rạp'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 1 && (
                            <div className="quick-booking__dropdown">
                                {cinemaList.length > 0 ? (
                                    cinemaList.map(item => (
                                        <div key={item.id} className="quick-booking__item" onClick={() => handleSelect('theater', item.name)}>
                                            {item.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="quick-booking__item">Đang tải danh sách rạp...</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bước 2: Chọn Phim (Dữ liệu động từ phim đang chiếu) */}
                    <div className={`quick-booking__select-box ${activePopup === 2 ? 'active' : ''} ${!bookingData.theater ? 'disabled' : ''}`}
                        onClick={() => togglePopup(2)}>
                        <p className="quick-booking__text">
                            {bookingData.movie || '2. Chọn Phim'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 2 && (
                            <div className="quick-booking__dropdown">
                                {phimDangChieu.length > 0 ? (
                                    phimDangChieu.map(item => (
                                        <div key={item.id} className="quick-booking__item" onClick={() => handleSelect('movie', item.title)}>
                                            {item.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="quick-booking__item">Không có phim nào đang chiếu</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bước 3: Chọn Ngày (Tạm thời giữ mảng cứng vì chưa có API suất chiếu) */}
                    <div className={`quick-booking__select-box ${activePopup === 3 ? 'active' : ''} ${!bookingData.movie ? 'disabled' : ''}`}
                        onClick={() => togglePopup(3)}>
                        <p className="quick-booking__text">
                            {bookingData.date || '3. Chọn Ngày'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 3 && (
                            <div className="quick-booking__dropdown">
                                {['Hôm nay 17/05', 'Ngày mai 18/05'].map(item => (
                                    <div key={item} className="quick-booking__item" onClick={() => handleSelect('date', item)}>{item}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bước 4: Chọn Suất (Tạm thời giữ mảng cứng vì chưa có API suất chiếu) */}
                    <div className={`quick-booking__select-box ${activePopup === 4 ? 'active' : ''} ${!bookingData.date ? 'disabled' : ''}`}
                        onClick={() => togglePopup(4)}>
                        <p className="quick-booking__text">
                            {bookingData.time || '4. Chọn Suất'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 4 && (
                            <div className="quick-booking__dropdown">
                                {['09:00', '13:00', '19:00', '22:00'].map(item => (
                                    <div key={item} className="quick-booking__item" onClick={() => handleSelect('time', item)}>{item}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className={`quick-booking__btn ${!bookingData.time ? 'btn-disabled' : ''}`}>
                        ĐẶT NGAY
                    </button>
                </div>
            </div>

            {/* THÀNH PHẦN 2: CÁC KHỐI SLIDER PHIM (NẰM DƯỚI ĐẶT VÉ NHANH) */}
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
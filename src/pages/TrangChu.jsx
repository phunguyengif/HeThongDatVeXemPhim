import React, { useRef, useState, useEffect } from 'react';
import MovieSlider from '../components/MovieSlider';
import Headers from '../components/Header';

const TrangChu = () => {

    const banners = [
        { id: 15, title: "Làng Khát Máu", bannerUrl: "public/banner_web_2_.jpg" },
        { id: 16, title: "Thám Tử Lừng Danh Conan", bannerUrl: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/banner_web_2_.jpg" },
        { id: 17, title: "Làng Khát Máu", bannerUrl: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/banner_web_2_.jpg" },
        { id: 18, title: "Thám Tử Lừng Danh Conan", bannerUrl: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/banner_web_2_.jpg" },

    ];

    const phimDangChieu = [
        { id: 1, title: "Phim điện ảnh Doraemon: Nobita và lâu đài dưới đáy biển", ageTag: "P", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/d/o/doraemon_dr3_poster_1_.jpg", trailerUrl: "#" },
        { id: 2, title: "Làng Trùng Tang", ageTag: "T18", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/l/a/lang_trung_tang_poster.jpg", trailerUrl: "#" },
        { id: 3, title: "Bài Trùng Phá Án", ageTag: "T16", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/b/a/bai_trung_pha_an.jpg", trailerUrl: "#" },
        { id: 4, title: "Mandalorian và Grogu", ageTag: "Chưa phân loại", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/m/a/mandalorian.jpg", trailerUrl: "#" },
        { id: 8, title: "Phim điện ảnh Doraemon: Nobita và lâu đài dưới đáy biển", ageTag: "P", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/d/o/doraemon_dr3_poster_1_.jpg", trailerUrl: "#" },
        { id: 9, title: "Làng Trùng Tang", ageTag: "T18", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/l/a/lang_trung_tang_poster.jpg", trailerUrl: "#" },
        { id: 10, title: "Bài Trùng Phá Án", ageTag: "T16", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/b/a/bai_trung_pha_an.jpg", trailerUrl: "#" },
        { id: 11, title: "Mandalorian và Grogu", ageTag: "Chưa phân loại", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/m/a/mandalorian.jpg", trailerUrl: "#" }
    ];

    const phimSapChieu = [
        { id: 5, title: "Làng Khát Máu", ageTag: "T18", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/l/a/lang_khat_mau.jpg", trailerUrl: "#" },
        { id: 6, title: "Thám Tử Lừng Danh Conan", ageTag: "P", type: "2D", poster: "https://cinestar.com.vn/media/catalog/product/c/o/conan_2026.jpg", trailerUrl: "#" },
        // Bạn có thể thêm nhiều phim tùy ý...
    ];

    const [bookingData, setBookingData] = useState({
        theater: '',
        movie: '',
        date: '',
        time: ''
    });

    const [activePopup, setActivePopup] = useState(null);
    const bookingRef = useRef(null);
    const bannerRef = useRef(null);
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
            <div className="slice-banner">
                <div className="slice-banner__container" ref={bannerRef}>
                    {banners.map((item) => (
                        <div className="slice-banner__item " >
                            <img
                                key={item.id}
                                src={item.bannerUrl}
                                alt={item.title}
                                className="silce-banner__img"
                            />
                        </div>
                    ))}
                </div>
                <button className="slice-banner__arrow-btn slice-banner__btn-prev" onClick={() => handleScrollArrow('prev')}>❮</button>
                <button className="slice-banner__arrow-btn slice-banner__btn-next" onClick={() => handleScrollArrow('next')}>❯</button>
            </div>
            <div className="quick-booking" ref={bookingRef}>
                <div className="quick-booking__form">
                    <h2 className="quick-booking__title">ĐẶT VÉ NHANH</h2>

                    {/*Chọn Rạp */}
                    <div className={`quick-booking__select-box ${activePopup === 1 ? 'active' : ''}`}
                        onClick={() => togglePopup(1)}>
                        <p className="quick-booking__text">
                            {bookingData.theater || '1. Chọn Rạp'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 1 && (
                            <div className="quick-booking__dropdown">
                                {['Cinestar Quốc Thanh', 'Cinestar Parkcity Hà Nội', 'Cinestar Đà Lạt'].map(item => (
                                    <div key={item} className="quick-booking__item" onClick={() => handleSelect('theater', item)}>{item}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chọn Phim  */}
                    <div className={`quick-booking__select-box ${activePopup === 2 ? 'active' : ''} ${!bookingData.theater ? 'disabled' : ''}`}
                        onClick={() => togglePopup(2)}>
                        <p className="quick-booking__text">
                            {bookingData.movie || '2. Chọn Phim'}
                        </p>
                        <span className="quick-booking__arrow">▼</span>
                        {activePopup === 2 && (
                            <div className="quick-booking__dropdown">
                                {['Lật Mặt 7', 'Doraemon', 'Haikyu!!'].map(item => (
                                    <div key={item} className="quick-booking__item" onClick={() => handleSelect('movie', item)}>{item}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/*Chọn Ngày */}
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

                    {/*Chọn Suất */}
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
            {/* Gọi lần 1 cho phim đang chiếu */}
            <MovieSlider title="PHIM ĐANG CHIẾU" movies={phimDangChieu} />

            {/* Gọi lần 2 cho phim sắp chiếu, tái sử dụng hoàn chỉnh cấu trúc */}
            <MovieSlider title="PHIM SẮP CHIẾU" movies={phimSapChieu} />
        </div>
    );
};

export default TrangChu;
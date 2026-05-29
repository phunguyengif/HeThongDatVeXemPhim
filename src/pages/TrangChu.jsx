import React, { useRef, useState, useEffect } from 'react';
import MovieSlider from '../components/MovieSlider';
import Headers from '../components/Header';
import DatVe from './DatVe';

const TrangChu = () => {

    const banners = [
        { id: 15, title: "Làng Khát Máu", bannerUrl: "public/banner_web_2_.jpg" },
        { id: 16, title: "Thám Tử Lừng Danh Conan", bannerUrl: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/banner_web_2_.jpg" },
        { id: 17, title: "Làng Khát Máu", bannerUrl: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/banner_web_2_.jpg" },
        { id: 18, title: "Thám Tử Lừng Danh Conan", bannerUrl: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/banner_web_2_.jpg" },

    ];

    const [activePopup, setActivePopup] = useState(null);
    const bannerRef = useRef(null);
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

           <DatVe/>
        </div>
    );
};

export default TrangChu;
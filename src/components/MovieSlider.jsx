import React, { useRef, useState, useEffect } from 'react';
import MovieCard from './MovieCard';

const MovieSlider = ({ title, movies }) => {
    const sliderRef = useRef(null);
    const [activePage, setActivePage] = useState(0);

    if (!movies || movies.length === 0) return null;

    const totalPages = Math.ceil(movies.length / 4);

    const handleDotClick = (pageIndex) => {
        if (sliderRef.current) {
            const offsetWidth = sliderRef.current.offsetWidth;
            sliderRef.current.scrollTo({
                left: pageIndex * offsetWidth,
                behavior: 'smooth'
            });
            setActivePage(pageIndex);
        }
    };

    const handleScrollEvent = () => {
        if (sliderRef.current) {
            const { scrollLeft, offsetWidth } = sliderRef.current;
            const currentPage = Math.round(scrollLeft / offsetWidth);
            if (currentPage !== activePage && currentPage < totalPages) {
                setActivePage(currentPage);
            }
        }
    };

    const handleScrollArrow = (direction) => {
        if (sliderRef.current) {
            const { scrollLeft, offsetWidth } = sliderRef.current;
            const scrollAmount = direction === 'next' ? scrollLeft + offsetWidth : scrollLeft - offsetWidth;

            sliderRef.current.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="movie-slider">
            <div className="movie-slider__header">
                <h2 className="movie-slider__title">{title}</h2>
            </div>

            <div className="movie-slider__wrapper">
                <div className="movie-slider__container" ref={sliderRef} onScroll={handleScrollEvent}>
                    {movies.map((item) => (
                        <div key={item.id} className="movie-slider__item">
                            <MovieCard movie={item} />
                        </div>
                    ))}
                </div>

                <button className="movie-slider__arrow-btn movie-slider__btn-prev" onClick={() => handleScrollArrow('prev')}>❮</button>
                <button className="movie-slider__arrow-btn movie-slider__btn-next" onClick={() => handleScrollArrow('next')}>❯</button>
            </div>

            {/*  KHU VỰC FOOTER */}
            <div className="movie-slider__footer">
                <div className="movie-slider__dots">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <span
                            key={index}
                            className={`movie-slider__dot ${activePage === index ? 'active' : ''}`}
                            onClick={() => handleDotClick(index)}
                        ></span>
                    ))}
                </div>

                {/* Nút xem thêm */}
                <button className="movie-slider__btn-more">XEM THÊM</button>
            </div>
        </div>
    );
};

export default MovieSlider;
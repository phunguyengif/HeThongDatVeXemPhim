import React from 'react';
import { useNavigate } from 'react-router-dom';
const MovieCard = ({ movie }) => {
    const navigate = useNavigate();

    const handleGoToDetail = () => {
        navigate(`/movie/${movie.id}`);
    };
    return (
        <div className="movie-card">
            <div
                className="movie-card__poster-box"
                onClick={handleGoToDetail}
                style={{ cursor: 'pointer' }}>
                <img
                    src={movie.poseUrl}
                    alt={movie.title}
                    className="movie-card__img"
                />
            </div>
            <h3 className="movie-card__title">{movie.title}</h3>
            <div className="movie-card__actions">
                <a href={movie.trailerUrl} className="movie-card__btn-trailer" target="_blank" rel="noreferrer">
                    <span className="movie-card__icon-play">▶</span>
                    <span className="movie-card__text-underline">Xem Trailer</span>
                </a>
                <button className="movie-card__btn-book">ĐẶT VÉ</button>
            </div>
        </div>
    );
};
export default MovieCard;
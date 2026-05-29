import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PreviewPopup from './PopupTrailer.jsx';

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();

    const [previewPosterUrl, setPreviewPosterUrl] = useState(null);
    const [previewTrailerUrl, setPreviewTrailerUrl] = useState(null);
    const videoRef = useRef(null);

    const closeTrailerPreview = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setPreviewTrailerUrl(null);
    };

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
                    src={movie.posterUrl || movie.poseUrl}
                    alt={movie.title}
                    className="movie-card__img"
                />
            </div>

            <h3 className="movie-card__title">{movie.title}</h3>

            <div className="movie-card__actions">
                <button
                    className="movie-card__btn-trailer"
                    onClick={() => setPreviewTrailerUrl(movie.trailerUrl)}
                    style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
                >
                    <span className="movie-card__icon-play">▶</span>
                    <span className="movie-card__text-underline">Xem Trailer</span>
                </button>

                <button
                    className="movie-card__btn-book"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    style={{ cursor: 'pointer' }}
                >
                    ĐẶT VÉ
                </button>
            </div>

            {/* --- COMPONENT POPUP --- */}

            <PreviewPopup
                type="poster"
                url={previewPosterUrl}
                onClose={() => setPreviewPosterUrl(null)}
            />

            <PreviewPopup
                type="video"
                url={previewTrailerUrl}
                onClose={closeTrailerPreview}
                videoRef={videoRef}
            />
        </div>
    );
};

export default MovieCard;
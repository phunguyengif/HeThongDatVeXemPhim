import React, { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllMovies } from '../redux/slices/movieApiSlice.jsx';
import MovieCard from '../components/MovieCard.jsx';

const AllMoviesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Đọc query parameters từ URL 
    const [searchParams, setSearchParams] = useSearchParams();
    const currentStatus = searchParams.get('status');

    const { movieList, isLoading } = useSelector((state) => state.movieStore);

    useEffect(() => {
        if (movieList.length === 0) {
            dispatch(fetchAllMovies({ pageNumber: 0, pageSize: 100 }));
        }
    }, [dispatch, movieList.length]);

    const filteredMovies = useMemo(() => {
        return movieList.filter(movie => movie.status === currentStatus);
    }, [movieList, currentStatus]);


    return (
        <div className="all-movies-page">
            {/* THANH TAB DANH MỤC TRÊN ĐẦU */}
            <div className="all-movies-page__tabs">
                <h1>{currentStatus === 'ACTIVE' ? 'PHIM ĐANG CHIẾU' : 'PHIM SẮP CHIẾU'}</h1>

            </div>
            <div className="main-content">


                {/* LƯỚI GRID HIỂN THỊ DANH SÁCH BỘ PHIM */}
                <div className="all-movies-page__content">
                    {isLoading ? (
                        <div className="status-text">Đang tải danh sách phim từ rạp...</div>
                    ) : filteredMovies.length === 0 ? (
                        <div className="status-text">Hiện tại không có bộ phim nào thuộc mục này.</div>
                    ) : (
                        <div className="movies-grid">
                            {filteredMovies.map(movie => (
                                <div>
                                    <div className="movie-details">
                                        <MovieCard movie={movie} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllMoviesPage;
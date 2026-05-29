import React, { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllMovies } from '../redux/slices/movieApiSlice';
import { fetchAllCinemas } from '../redux/slices/cinemaApiSlice';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || ''; 

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { movieList, isLoading: isMovieLoading } = useSelector(state => state.movieStore);
    const { list: cinemaList, isLoading: isCinemaLoading } = useSelector(state => state.cinemaStore);

    useEffect(() => {
        if (movieList.length === 0) dispatch(fetchAllMovies({ pageNumber: 0, pageSize: 100 }));
        if (cinemaList.length === 0) dispatch(fetchAllCinemas({ pageNumber: 0, pageSize: 100, isActive: true }));
    }, [dispatch, movieList.length, cinemaList.length]);

    const filteredMovies = useMemo(() => {
        if (!query.trim()) return movieList;
        return movieList.filter(movie =>
            movie.title.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, movieList]);

    const filteredCinemas = useMemo(() => {
        if (!query.trim()) return [];
        return cinemaList.filter(cinema =>
            cinema.name.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, cinemaList]);

    return (
        <div className="search-page-layout">
            <div className="main-content">
                <div className="search-header">
                    <h1>KẾT QUẢ TÌM KIẾM</h1>
                </div>

                <div className="search-content">
                    {/* 1. KẾT QUẢ TÌM RẠP (Chỉ hiện khi có gõ từ khóa và tìm thấy rạp) */}
                    {query.trim() && filteredCinemas.length > 0 && (
                        <div className="search-section">
                            <h2 className="section-title"><i class="fi fi-rr-marker"></i>CỤM RẠP ({filteredCinemas.length})</h2>
                            <div className="cinema-results-grid">
                                {filteredCinemas.map(cinema => (
                                    <div key={cinema.id} className="cinema-card" onClick={() => navigate(`/cinemas/${cinema.id}`)}>
                                        <h3>{cinema.name}</h3>
                                        <p>{cinema.address}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. KẾT QUẢ TÌM PHIM */}
                    <div className="search-section">
                        <h2 className="section-title">PHIM ({filteredMovies.length})</h2>

                        {isMovieLoading ? (
                            <div className="loading-text">Đang tải dữ liệu phim...</div>
                        ) : filteredMovies.length > 0 ? (
                            <div className="movie-results-grid">
                                {filteredMovies.map(movie => (
                                    <div key={movie.id} className="movie-card-search" onClick={() => navigate(`/movie/${movie.id}`)}>
                                        <div className="img-wrapper">
                                            <img src={movie.poseUrl || movie.poster} alt={movie.title} />
                                            <div className="status-tag">
                                                {movie.status === 'ACTIVE' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                                            </div>
                                        </div>
                                        <div className="info">
                                            <h3>{movie.title}</h3>
                                            <p>Thể loại: {movie.genre || 'Đang cập nhật'}</p>
                                            <p>Thời lượng: {movie.duration} phút</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-text">Không tìm thấy bộ phim nào phù hợp với từ khóa của bạn.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
import React, { useState, useEffect, useRef } from 'react';
import movieApi from '../../api/movieApi';
import MenuBar from '../../components/admin_components/MenuBar';


const MovieManagement = () => {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    // --- State mới cho tính năng Xem nhanh Poster & Trailer ---
    const [previewPosterUrl, setPreviewPosterUrl] = useState(null);
    const [previewTrailerUrl, setPreviewTrailerUrl] = useState(null);

    // useRef điều khiển thẻ video trailer xem nhanh
    const videoRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        duration: '',
        releaseDate: '',
        description: '',
        poseUrl: '',
        trailerUrl: '',
        status: 'NOW_SHOWING'
    });

    const [isUploadingPoster, setIsUploadingPoster] = useState(false);
    const [isUploadingTrailer, setIsUploadingTrailer] = useState(false);

    const fetchMovies = async () => {
        try {
            const data = searchQuery
                ? await movieApi.searchByTitle(searchQuery)
                : await movieApi.getAll();
            setMovies(data.content || data);
        } catch (error) {
            console.error("Không thể tải danh sách phim:", error);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [searchQuery]);

    const handleFileUpload = async (e, isVideo) => {
        const file = e.target.files[0];
        if (!file) return;

        if (isVideo) setIsUploadingTrailer(true);
        else setIsUploadingPoster(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('isVideo', isVideo);

        try {
            const fileUrl = await movieApi.uploadFile(uploadData);
            setFormData(prev => ({
                ...prev,
                [isVideo ? 'trailerUrl' : 'poseUrl']: fileUrl
            }));
        } catch (error) {
            alert("Hệ thống tải tệp tin lên đám mây thất bại!");
        } finally {
            if (isVideo) setIsUploadingTrailer(false);
            else setIsUploadingPoster(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await movieApi.update(selectedMovieId, formData);
                alert("Cập nhật thông tin phim thành công!");
            } else {
                await movieApi.create(formData);
                alert("Đăng tải bộ phim mới thành công!");
            }
            setIsModalOpen(false);
            fetchMovies();
        } catch (error) {
            if (error.validationErrors) {
                alert("Dữ liệu nhập vào chưa hợp lệ, vui lòng kiểm tra kỹ!");
            } else {
                alert(error.message || "Có lỗi bất ngờ xảy ra!");
            }
        }
    };

    const handleDeleteMovie = async (movieId) => {
        if (!window.confirm("Bạn có chắc chắn muốn ngừng hiển thị bộ phim này?")) return;
        try {
            await movieApi.delete(movieId);
            alert("Trạng thái phim đã được đồng bộ sang STOPPED thành công!");
            fetchMovies();
        } catch (error) {
            alert("Không thể thay đổi trạng thái phim!");
        }
    };

    const handleRestoreMovie = async (movie) => {
        if (!window.confirm(`Bạn có muốn mở lại bộ phim "${movie.title}" không?`)) return;
        const restoreData = { ...movie, status: 'NOW_SHOWING' };
        try {
            await movieApi.update(movie.id, restoreData);
            alert("Đã mở lại phim thành công!");
            fetchMovies();
        } catch (error) {
            alert("Không thể mở lại phim!");
        }
    };

    // Hàm đóng popup xem nhanh trailer và tắt âm thanh ngay lập tức bằng .current.pause()
    const closeTrailerPreview = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setPreviewTrailerUrl(null);
    };

    const openEditModal = (movie) => {
        setIsEditMode(true);
        setSelectedMovieId(movie.id);
        setFormData({
            title: movie.title,
            duration: movie.duration,
            releaseDate: movie.releaseDate,
            description: movie.description,
            poseUrl: movie.poseUrl,
            trailerUrl: movie.trailerUrl,
            status: movie.status
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ title: '', duration: '', releaseDate: '', description: '', poseUrl: '', trailerUrl: '', status: 'NOW_SHOWING' });
        setIsModalOpen(true);
    };

    return (
        <div>
            <MenuBar />
            <article>
                <div className="movie-manager">
                    <div className="movie-manager__header">
                        <input
                            type="text"
                            placeholder="Nhập tên phim cần tìm kiếm..."
                            className="movie-manager__search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="movie-manager__btn-add" onClick={openAddModal}>
                            Đăng phim mới
                        </button>
                    </div>

                    <div className="movie-manager__table-wrapper">
                        <table className="movie-manager__table">
                            <thead>
                                <tr>
                                    <th>Poster</th>
                                    <th>Tên phim</th>
                                    <th>Thời lượng</th>
                                    <th>Ngày phát hành</th>
                                    <th>Xem nhanh</th> {/* CỘT MỚI THÊM */}
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movies.map(movie => (
                                    <tr key={movie.id}>
                                        <td>
                                            <img src={movie.poseUrl} alt={movie.title} className="movie-manager__poster-img" />
                                        </td>
                                        <td className="movie-manager__title-cell">{movie.title}</td>
                                        <td>{movie.duration} phút</td>
                                        <td>{movie.releaseDate}</td>

                                        {/* --- NỘI DUNG CỘT XEM NHANH MỚI --- */}
                                        <td>
                                            <button
                                                className="movie-manager__view-link"
                                                onClick={() => setPreviewPosterUrl(movie.poseUrl)}
                                            >
                                                Poster
                                            </button>
                                            <span className="movie-manager__divider">|</span>
                                            <button
                                                className="movie-manager__view-link"
                                                onClick={() => setPreviewTrailerUrl(movie.trailerUrl)}
                                            >
                                                Trailer
                                            </button>
                                        </td>

                                        <td>
                                            <span className={`movie-manager__status-badge movie-manager__status-badge--${movie.status?.toLowerCase()}`}>
                                                {movie.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="movie-manager__action-btn movie-manager__action-btn--edit" onClick={() => openEditModal(movie)}>Sửa</button>
                                            {movie.status === 'STOPPED' ? (
                                                <button className="movie-manager__action-btn movie-manager__action-btn--active" onClick={() => handleRestoreMovie(movie)}>Mở lại</button>
                                            ) : (
                                                <button className="movie-manager__action-btn movie-manager__action-btn--delete" onClick={() => handleDeleteMovie(movie.id)}>Ngừng chiếu</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- FORM MODAL THÊM/SỬA CHÍNH (GIỮ NGUYÊN) --- */}
                    {isModalOpen && (
                        <div className="movie-modal">
                            <div className="movie-modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
                            <div className="movie-modal__content">
                                <h2 className="movie-modal__title">{isEditMode ? 'Cập nhật thông tin phim' : 'Thêm phim mới'}</h2>
                                <form onSubmit={handleSubmit} className="movie-modal__form">
                                    <div className="movie-modal__field">
                                        <label>Tên tác phẩm phim</label>
                                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="movie-modal__row-grid">
                                        <div className="movie-modal__field">
                                            <label>Thời lượng (Phút)</label>
                                            <input type="number" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                                        </div>
                                        <div className="movie-modal__field">
                                            <label>Ngày phát hành rạp</label>
                                            <input type="date" required value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="movie-modal__field">
                                        <label>Trạng thái phát hành</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="COMING_SOON">COMING_SOON</option>
                                            <option value="NOW_SHOWING">NOW_SHOWING</option>
                                            <option value="STOPPED">STOPPED</option>
                                        </select>
                                    </div>
                                    <div className="movie-modal__field">
                                        <label>Tóm tắt cốt truyện phim</label>
                                        <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                    <div className="movie-modal__upload-box">
                                        <label>Hình ảnh Poster phim</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
                                        {isUploadingPoster && <p className="movie-modal__loading-text">Đang tải ảnh lên hệ thống...</p>}
                                        {formData.poseUrl && <img src={formData.poseUrl} alt="Preview" className="movie-modal__preview-img" />}
                                    </div>
                                    <div className="movie-modal__upload-box">
                                        <label>Video Trailer phim</label>
                                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, true)} />
                                        {isUploadingTrailer && <p className="movie-modal__loading-text">Đang xử lý tải video...</p>}
                                        {formData.trailerUrl && <p className="movie-modal__success-text">Tải trailer thành công!</p>}
                                    </div>
                                    <div className="movie-modal__actions">
                                        <button type="button" className="movie-modal__btn movie-modal__btn--cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                        <button type="submit" className="movie-modal__btn movie-modal__btn--submit" disabled={isUploadingPoster || isUploadingTrailer}>
                                            {isEditMode ? 'Cập nhật' : 'Xác nhận đăng'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ==================================================== */}
                    {/* --- POPUP 1: PHÓNG TO XEM ẢNH POSTER KHI CLICK --- */}
                    {previewPosterUrl && (
                        <div className="preview-popup" onClick={() => setPreviewPosterUrl(null)}>
                            <div className="preview-popup__content preview-popup__content--poster">
                                <img src={previewPosterUrl} alt="Poster to" />
                                <span className="preview-popup__close-hint">Nhấp chuột ra ngoài để đóng</span>
                            </div>
                        </div>
                    )}

                    {/* --- POPUP 2: XEM NHANH VIDEO TRAILER KHI CLICK --- */}
                    {previewTrailerUrl && (
                        <div className="preview-popup">
                            <div className="preview-popup__backdrop" onClick={closeTrailerPreview}></div>
                            <div className="preview-popup__content preview-popup__content--video">
                                <video
                                    ref={videoRef}
                                    src={previewTrailerUrl}
                                    controls
                                    autoPlay
                                    className="preview-popup__video-player"
                                />
                                <button className="preview-popup__close-btn" onClick={closeTrailerPreview}>Đóng ✕</button>
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
};

export default MovieManagement;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllCinemas } from '../redux/slices/cinemaApiSlice';
import { fetchAllMovies } from '../redux/slices/movieApiSlice';

const Footer = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = localStorage.getItem('accessToken');

    const { list: cinemaList } = useSelector((state) => state.cinemaStore);
    const { movieList } = useSelector((state) => state.movieStore);

    useEffect(() => {
        if (cinemaList.length === 0) {
            dispatch(fetchAllCinemas({ pageNumber: 0, pageSize: 100, isActive: true }));
        }
        if (movieList.length === 0) {
            dispatch(fetchAllMovies({ pageNumber: 0, pageSize: 100 }));
        }
    }, [dispatch, cinemaList.length, movieList.length]);
    const phimDangChieu = movieList.filter(movie => movie.status === 'ACTIVE');
    const phimSapChieu = movieList.filter(movie => movie.status === 'INACTIVE');

    const hanldeDatVe = () => {
        navigate('/DatVe');
    };
    const hanldeLogin = () => {
        if (!token || token.trim() === "" || token === "null") {
            navigate('/Login');
        } else {
            alert("Bạn đã đăng nhập rồi!")
        }
    };

    return (
        <footer className="footer">
            <div className="footer__container">

                {/* Cột 1: Logo và Mạng xã hội */}
                <div className="footer__brand-col">
                    <div className="footer__logo">
                        <p>CINEMA</p>
                    </div>
                    <p className="footer__slogan">BE HAPPY, BE A STAR</p>

                    <div className="top-actions-button">
                        <button className="btn btn-dat-ve" onClick={hanldeDatVe}>ĐẶT VÉ</button>
                        {/* <button className="btn btn-dat-bap">ĐẶT BẮP NƯỚC</button> */}
                    </div>

                    <div className="footer__socials">
                        <a href="#" className="footer__social-icon"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="footer__social-icon"><i className="fab fa-youtube"></i></a>
                        <a href="#" className="footer__social-icon"><i className="fab fa-tiktok"></i></a>
                        <a href="#" className="footer__social-icon"><i className="fab fa-line"></i></a>
                    </div>

                    <div className="footer__language">
                        <span>Ngôn ngữ:</span>
                        <span className="footer__lang-current">
                            <img src="https://flagcdn.com/w20/vn.png" alt="VN Flag" /> VN
                        </span>
                    </div>
                </div>

                {/* Cột 2: Tài khoản & Xem phim */}
                <div className="footer__links-col">
                    <div className="footer__section">
                        <h3 className="footer__title">TÀI KHOẢN</h3>
                        <ul className="footer__list">
                            <li
                                onClick={hanldeLogin}>
                                <a href="#">Đăng nhập</a>
                            </li>
                            <li
                                onClick={hanldeLogin}>
                                <a href="#">Đăng ký</a>
                            </li>
                            {/* <li><a href="#">Membership</a></li> */}
                        </ul>
                    </div>

                    <div className="footer__section">
                        <h3 className="footer__title">XEM PHIM</h3>
                        <ul className="footer__list">
                            <li onClick={() => navigate('/allmoviespage?status=ACTIVE')}
                            >
                                <a href="#">Phim đang chiếu</a>
                            </li>

                            <li
                                onClick={() => navigate('/allmoviespage?status=INACTIVE')}>
                                <a href="#">Phim sắp chiếu</a>
                            </li>
                            {/* <li><a href="#">Suất chiếu đặc biệt</a></li> */}
                        </ul>
                    </div>
                </div>

                {/* Cột 3: Thuê sự kiện & Cinestar */}
                <div className="footer__links-col">
                    <div className="footer__section">
                        <h3 className="footer__title">THUÊ SỰ KIỆN</h3>
                        <ul className="footer__list">
                            <li><a href="#">Thuê rạp</a></li>
                            <li><a href="#">Các loại hình cho thuê khác</a></li>
                        </ul>
                    </div>

                    <div className="footer__section">
                        <h3 className="footer__title">CINESTAR</h3>
                        <ul className="footer__list">
                            <li><a href="#">Giới thiệu</a></li>
                            <li><a href="#">Liên hệ</a></li>
                            <li><a href="#">Tuyển dụng</a></li>
                        </ul>
                    </div>
                </div>

                {/* Cột 4: Dịch vụ khác */}
                <div className="footer__links-col">
                    <div className="footer__section">
                        <h3 className="footer__title">DỊCH VỤ KHÁC</h3>
                        <ul className="footer__list">
                            <li><a href="#">Nhà hàng</a></li>
                            <li><a href="#">Kidzone</a></li>
                            <li><a href="#">Bowling</a></li>
                            <li><a href="#">Billiards</a></li>
                            <li><a href="#">Gym</a></li>
                            <li><a href="#">Nhà hát Opera</a></li>
                            <li><a href="#">Coffee</a></li>
                        </ul>
                    </div>
                </div>

                {/* Cột 5: Hệ thống rạp */}
                <div className="footer__links-col footer__links-col--wide">
                    <div className="footer__section">
                        <h3 className="footer__title">HỆ THỐNG RẠP</h3>
                        <ul className="footer__list">
                            <li><a href="#" className="footer__link--highlight">Tất cả hệ thống rạp</a></li>
                            {cinemaList.length > 0 ? (
                                cinemaList.map((cinema) => (
                                    <li key={cinema.id}>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(`/cinemas/${cinema.id}`);
                                            }}
                                        >
                                            {cinema.name}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li><span style={{ color: '#94a3b8' }}>Đang tải danh sách rạp...</span></li>
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
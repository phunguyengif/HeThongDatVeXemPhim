import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/AuthApiSlice.jsx';
import { fetchAllCinemas } from '../redux/slices/cinemaApiSlice.jsx';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.authStore);
    const [searchQuery, setSearchQuery] = useState('');

    const { list: cinemaList } = useSelector((state) => state.cinemaStore);
    const [showCinemaMenu, setShowCinemaMenu] = useState(false);

    const handleSearch = () => {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        if (cinemaList.length === 0) {
            dispatch(fetchAllCinemas({ pageNumber: 0, pageSize: 100, isActive: true }));
        }
    }, [dispatch, cinemaList.length]);

    const handleLogin = () => {
        navigate('/Login');
    };
    const hanldeDatVe = () => {
        navigate('/DatVe');
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            dispatch(logout());
            navigate('/Login');
        }
    };

    return (
        <div className="cinestar-container">
            <header className="cinestar-header">
                <div className="header-top">
                    <div className="container">
                        <div className="logo">
                            <img src="/logo.gif" alt="Cinemar" style={{ width: '50px', height: 'auto' }} />
                        </div>

                        <div className="top-actions-button">
                            <button
                                className="btn btn-dat-ve"
                                onClick={hanldeDatVe}><i className="fi fi-rr-ticket"></i> ĐẶT VÉ NGAY</button>
                            {/* <button className="btn btn-dat-bap">
                                <i className="fi fi-rr-popcorn"></i> ĐẶT BẮP NƯỚC
                            </button> */}
                        </div>

                        <div className="top-actions-active">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Tìm phim, rạp..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="search-btn" onClick={handleSearch}><i className="fi fi-rr-search"></i></button>
                                
                            </div>

                            {/* HIỂN THỊ ĐỘNG TRẠNG THÁI NGƯỜI DÙNG*/}
                            <div className="user-action">
                                <span style={{ paddingTop: '5px' }}><i className="user-icon"><i className="fi fi-rr-portrait"></i></i></span>

                                {currentUser ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', flex: 1, minWidth: 0 }}>
                                        <span style={{ fontWeight: 'bold' }} className='user-title'>Chào, {currentUser}</span>
                                        <span
                                            onClick={handleLogout}
                                            style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginTop: '2px' }}
                                        >
                                            Đăng xuất
                                        </span>
                                    </div>
                                ) : (
                                    <span onClick={handleLogin} style={{ cursor: 'pointer' }}>Đăng nhập</span>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                <nav className="header-bottom">
                    <div className="container">
                        <div className="menu-left">
                            <div
                                className="dropdown-trigger-wrapper"
                                onMouseEnter={() => setShowCinemaMenu(true)}
                                onMouseLeave={() => setShowCinemaMenu(false)}
                            >
                                <a style={{ cursor: 'pointer' }}><i className="loc-icon"><i class="fi fi-rr-marker"></i></i> Chọn rạp</a>

                                {/* Khối thả xuống */}
                                {showCinemaMenu && (
                                    <div className="header-cinema-dropdown">
                                        {cinemaList.length > 0 ? (
                                            cinemaList.map(cinema => (
                                                <div
                                                    key={cinema.id}
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setShowCinemaMenu(false);
                                                        navigate(`/cinemas/${cinema.id}`);
                                                    }}
                                                >
                                                    {cinema.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-item">Đang tải danh sách rạp...</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <a href="#"><i className="cal-icon">📅</i> Lịch chiếu</a>
                        </div>
                        <div className="menu-right">
                            <a href="#">Khuyến mãi</a>
                            <a href="#">Tổ chức sự kiện</a>
                            <a href="#">Dịch vụ giải trí khác</a>
                            <a href="#">Giới thiệu</a>
                        </div>
                    </div>
                </nav>
            </header>
        </div>
    );
};

export default Header;
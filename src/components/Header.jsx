
const Header = () => {
    return (
        <div className="cinestar-container">
            <header className="cinestar-header">
                <div className="header-top">
                    <div className="container">
                        <div className="logo">
                            <img src="logo.png" alt="Cinestar" />
                        </div>

                        <div className="top-actions-button">
                            <button className="btn btn-dat-ve" ><i className="fi fi-rr-ticket"></i> ĐẶT VÉ NGAY</button>
                            <button className="btn btn-dat-bap"><i className="fi fi-rr-popcorn"></i> ĐẶT BẮP NƯỚC</button>

                        </div>
                        <div className="top-actions-active">
                            <div className="search-bar">
                                <input type="text" placeholder="Tìm phim, rạp" />
                                <button className="search-btn"><i className="fi fi-rr-search"></i></button>
                            </div>

                            <div className="user-action">
                                <i className="user-icon"><i className="fi fi-rr-portrait"></i></i>
                                <span>Đăng nhập</span>
                            </div>

                            <div className="lang-switch">
                                <img src="vn-flag.png" alt="VN" width="20" /> VN ▾
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="header-bottom">
                    <div className="container">
                        <div className="menu-left">
                            <a href="#"><i className="loc-icon">📍</i> Chọn rạp</a>
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
import React from 'react';
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container">

                {/* Cột 1: Logo và Mạng xã hội */}
                <div className="footer__brand-col">
                    <div className="footer__logo">
                        <p>CINESTAR</p>
                    </div>
                    <p className="footer__slogan">BE HAPPY, BE A STAR</p>

                    <div className="top-actions-button">
                        <button className="btn btn-dat-ve">ĐẶT VÉ</button>
                        <button className="btn btn-dat-bap">ĐẶT BẮP NƯỚC</button>
                    </div>

                    <div className="footer__socials">
                        <a href="#" className="footer__social-icon"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="footer__social-icon"><i className="fab fa-youtube"></i></a>
                        <a href="#" className="footer__social-icon"><i className="fab fa-tiktok"></i></a>
                        <a href="#" className="footer__social-icon"><i className="fab fa-line"></i></a> {/* Hoặc icon Zalo tự chế */}
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
                            <li><a href="#">Đăng nhập</a></li>
                            <li><a href="#">Đăng ký</a></li>
                            <li><a href="#">Membership</a></li>
                        </ul>
                    </div>

                    <div className="footer__section">
                        <h3 className="footer__title">XEM PHIM</h3>
                        <ul className="footer__list">
                            <li><a href="#">Phim đang chiếu</a></li>
                            <li><a href="#">Phim sắp chiếu</a></li>
                            <li><a href="#">Suất chiếu đặc biệt</a></li>
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
                            <li><a href="#">Cinestar Quốc Thanh (TP.HCM)</a></li>
                            <li><a href="#">Cinestar Parkcity Hà Nội</a></li>
                            <li><a href="#">Cinestar Sinh Viên (TP.HCM)</a></li>
                            <li><a href="#">Cinestar Huế (TP. Huế)</a></li>
                            <li><a href="#">Cinestar Đà Lạt (Lâm Đồng)</a></li>
                            <li><a href="#">Cinestar Lâm Đồng (Đức Trọng)</a></li>
                        </ul>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
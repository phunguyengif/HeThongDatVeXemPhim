import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearBooking } from '../../redux/slices/bookingSlice';
import paymentApi from '../../api/paymentApi';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { bookingId, movieTitle, cinemaName, selectedSeats, snacks, totalPrice } = useSelector(state => state.bookingStore);

    const [checkoutStep, setCheckoutStep] = useState(1);
    const [timeLeft, setTimeLeft] = useState(600);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
    const [agreed, setAgreed] = useState({ age: false, terms: false });
    const [paymentMethod, setPaymentMethod] = useState('momo');

    useEffect(() => {
        if (!bookingId) {
            navigate('/');
        }
    }, [bookingId, navigate]);

    // Đồng hồ đếm ngược giữ chỗ
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Hóa đơn đã hết hạn. Vui lòng đặt vé lại từ đầu!");
            dispatch(clearBooking());
            navigate('/');
        }
        return () => clearInterval(timer);
    }, [timeLeft, navigate, dispatch]);

    const formatTime = () => {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Xử lý nút Tiếp Tục (Sang bước chọn phương thức thanh toán)
    const handleContinue = () => {
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
            return alert("Vui lòng điền đầy đủ thông tin liên hệ!");
        }
        if (!agreed.age || !agreed.terms) {
            return alert("Vui lòng đồng ý với các điều khoản của rạp!");
        }
        setCheckoutStep(2);
    };

    // Xử lý nút Thanh Toán (Gọi API MoMo)
    const handlePayment = async () => {
        if (paymentMethod !== 'momo') {
            return alert("Hệ thống hiện tại chỉ đang hỗ trợ thanh toán qua Ví MoMo!");
        }
        try {
            const momoRes = await paymentApi.createMoMoPayment(bookingId);
            const momoData = momoRes.data || momoRes;

            if (momoData?.payUrl) {
                dispatch(clearBooking());
                window.location.href = momoData.payUrl;
            } else {
                alert("Không thể khởi tạo cổng thanh toán MoMo.");
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Lỗi giao dịch thanh toán!");
        }
    };

    const seatNames = selectedSeats.map(s => s.name).join(', ');
    const seatType = selectedSeats.map(s => s.type).join(', ');
    const snackNames = Object.values(snacks).map(s => `${s.name} (x${s.quantity})`).join(', ') || 'Không có';

    return (
        <div className="checkout-page">
            <div className="main-content">
                <h1 className="checkout-page__title">TRANG THANH TOÁN</h1>

                <div className="checkout-page__stepper">
                    <div className={`step-item ${checkoutStep >= 1 ? 'active' : ''}`}>
                        <span className="step-num">1</span>
                        <span className="step-text">THÔNG TIN KHÁCH HÀNG</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step-item ${checkoutStep >= 2 ? 'active' : ''}`}>
                        <span className="step-num">2</span>
                        <span className="step-text">THANH TOÁN</span>
                    </div>
                    <div className="step-line"></div>
                    <div className="step-item active">
                        <span className="step-num">3</span>
                        <span className="step-text">THÔNG TIN VÉ PHIM</span>
                    </div>
                </div>

                <div className="checkout-page__content">
                    {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN HOẶC CHỌN MOMO */}
                    <div className="checkout-left">
                        {checkoutStep === 1 ? (
                            <div className="customer-info-form">
                                <div className="form-group">
                                    <label>Họ và tên <span>*</span></label>
                                    <input type="text" placeholder="Họ và tên" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại <span>*</span></label>
                                    <input type="text" placeholder="Số điện thoại" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email <span>*</span></label>
                                    <input type="email" placeholder="Email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
                                </div>

                                <div className="checkbox-group">
                                    <label>
                                        <input type="checkbox" checked={agreed.age} onChange={e => setAgreed({ ...agreed, age: e.target.checked })} />
                                        Đảm bảo mua vé đúng số tuổi quy định.
                                    </label>
                                    <label>
                                        <input type="checkbox" checked={agreed.terms} onChange={e => setAgreed({ ...agreed, terms: e.target.checked })} />
                                        Đồng ý với điều khoản của rạp.
                                    </label>
                                </div>

                                <button className="btn-yellow" onClick={handleContinue}>TIẾP TỤC</button>
                            </div>
                        ) : (
                            <div className="payment-methods-form">
                                <label className={`method-card ${paymentMethod === 'momo' ? 'selected' : ''}`}>
                                    <input type="radio" name="payment" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} />
                                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="momo-icon" />
                                    <span>Thanh toán qua Ví MoMo</span>
                                </label>
                                <label className="method-card disabled">
                                    <input type="radio" name="payment" disabled />
                                    <span className="icon-atm">💳</span>
                                    <span>Thanh toán qua thẻ nội địa (Bảo trì)</span>
                                </label>
                                <label className="method-card disabled">
                                    <input type="radio" name="payment" disabled />
                                    <span className="icon-visa">🌐</span>
                                    <span>Thanh toán qua thẻ quốc tế (Bảo trì)</span>
                                </label>

                                <div className="action-buttons-row">
                                    <button className="btn-yellow" onClick={() => setCheckoutStep(1)}>QUAY LẠI</button>
                                    <button className="btn-grey" onClick={handlePayment}>THANH TOÁN</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: THẺ THÔNG TIN ĐƠN HÀNG MÀU XANH */}
                    <div className="checkout-right">
                        <div className="summary-card">
                            <div className="summary-card__header">
                                <h2 className="movie-title">{movieTitle}</h2>
                                <div className="timer">
                                    <span>THỜI GIAN GIỮ VÉ:</span>
                                    <span className="time-box">{formatTime()}</span>
                                </div>
                            </div>
                            <p className="age-warning">Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+)</p>

                            <div className="summary-card__body">
                                <h3>{cinemaName}</h3>
                                <p className="subtitle">Hệ thống rạp chiếu phim Cinestar</p>

                                <div className="info-grid">
                                    <div>
                                        <span className="label">Phòng chiếu</span>
                                        <span className="val">01</span>
                                    </div>
                                    <div>
                                        <span className="label">Số vé</span>
                                        <span className="val">{selectedSeats.length}</span>
                                    </div>
                                    <div>
                                        <span className="label">Loại ghế</span>
                                        <span className="val">{seatType}</span>
                                    </div>
                                    <div>
                                        <span className="label">Số ghế</span>
                                        <span className="val">{seatNames}</span>
                                    </div>
                                </div>

                                <div className="snack-info">
                                    <span className="label">Bắp nước</span>
                                    <span className="val">{snackNames}</span>
                                </div>
                            </div>

                            <div className="summary-card__footer">
                                <span className="total-label">SỐ TIỀN CẦN THANH TOÁN</span>
                                <span className="total-price">{totalPrice.toLocaleString()} VNĐ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
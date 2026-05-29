import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStep, clearBooking, setBookingResult } from '../redux/slices/bookingSlice';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import paymentApi from '../api/paymentApi';

const BottomBar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { movieTitle, cinemaName, roomName, showtimeTime, step, totalPrice, selectedSeats, showtimeId, snacks, } = useSelector(state => state.bookingStore);

    const [timeLeft, setTimeLeft] = useState(600);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Hết thời gian giữ ghế!");
            dispatch(clearBooking());
            navigate('/TrangChu');
        }
        return () => clearInterval(timer);
    }, [timeLeft, navigate, dispatch]);

    const formatTime = () => {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleNext = async () => {
        if (step === 1) {
            if (selectedSeats.length === 0) return alert("Vui lòng chọn ghế!");
            dispatch(setStep(2));
        } else {
            try {
                const formattedSnacks = Object.values(snacks).map(s => ({
                    snackId: s.id,
                    quantity: s.quantity,

                }));

                const payload = {
                    showtimeId,
                    seats: selectedSeats.map(s => ({ seatId: s.id })),
                    snacks: formattedSnacks
                };

                // 1. Tạo đơn Hold
                const holdRes = await bookingApi.holdBooking(payload);
                const holdData = holdRes.data || holdRes;

                // 2. chuyển sang pages checkout
                if (holdData.bookingId) {
                    dispatch(setBookingResult(holdData.bookingId));
                    navigate('/checkout');
                }


            } catch (error) {
                alert(error?.message || "Lỗi giao dịch!");
            }
        }
    };

    const handleBack = () => {
        dispatch(setStep(1));
    };
    const seatNames = selectedSeats.map(s => s.name).join(', ') || '';
    const snackDisplay = Object.values(snacks)
        .map(s => ` ${s.quantity} ${s.name}`)
        .join(', ');

    return (
        <div className="bottom-checkout-bar">
            <div className="container">
                <div className="summary-info">
                    <div className="info-block">
                        <span className="val highlight-title">{movieTitle}</span>
                    </div>
                    <div className="info-block">
                        <span className="val highlight">{cinemaName}</span>
                    </div>
                    {seatNames && (
                        <div className="info-block">
                            <span className="val highlight">{roomName} | {seatNames} | {showtimeTime}</span>
                        </div>
                    )}
                    {snackDisplay && (
                        <div className="info-block">
                            <span className="val highlight">
                                {snackDisplay}
                            </span>
                        </div>
                    )}
                </div>

                <div className="action-bottombar">
                    <div className="timer-box">
                        <span>Thời gian giữ vé: </span>
                        <b>{formatTime()}</b>
                    </div>
                    <div className="payment-box">
                        <div className="payment-info">
                            <p>Tạm tính: </p>
                            <span className="val price">{totalPrice.toLocaleString()} VNĐ</span>
                        </div>
                        <div className="action-button">
                            {step === 2 && (
                                <button className="action-btn-back" onClick={handleBack}>
                                    QUAY LẠI
                                </button>
                            )}
                            <button className="action-bottombar__next" onClick={handleNext}>
                                {step === 1 ? 'CHỌN BẮP NƯỚC ➔' : 'DẶT VÉ ➔'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BottomBar;
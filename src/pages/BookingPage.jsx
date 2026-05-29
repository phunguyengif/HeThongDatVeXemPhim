import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SeatStep from '../components/SeatStep';
import SnackStep from '../components/SnackStep';
import BottomBar from '../components/BottomBar';
import { setStep } from '../redux/slices/bookingSlice.jsx';

const BookingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const urlShowtimeId = searchParams.get('showtimeId');
    const urlMovieId = searchParams.get('movieId');

    const bookingStore = useSelector(state => state.bookingStore);

    useEffect(() => {
        if (!urlShowtimeId || urlShowtimeId !== bookingStore.showtimeId) {
            alert("Suất chiếu không hợp lệ hoặc đã hết hạn! Vui lòng chọn lại suất chiếu.");
            if (urlMovieId) {
                navigate(`/movie/${urlMovieId}`);
            } else {
                navigate('/');
            }
        }
    }, [urlShowtimeId, urlMovieId, bookingStore.showtimeId, navigate]);

    return (
        <div className="booking-layout">
            <header className="booking-layout__header">
                <div className="booking-steps-indicator">
                    <span
                        className={bookingStore.step === 1 ? 'active' : ''}
                        onClick={() => dispatch(setStep(1))}
                        style={{ cursor: 'pointer' }}
                    >
                        CHỌN GHẾ NGỒI
                    </span>

                    <span className={bookingStore.step === 2 ? 'active' : ''}>
                        CHỌN BẮP NƯỚC
                    </span>
                </div>
            </header>

            <main className="booking-layout__body">
                {bookingStore.step === 1 ? <SeatStep /> : <SnackStep />}
            </main>

            <BottomBar />
        </div>
    );
};

export default BookingPage;
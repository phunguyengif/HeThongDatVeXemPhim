import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import bookingApi from '../api/bookingApi';
import { toggleSeatSelection, setRoomInfo } from '../redux/slices/bookingSlice';

const SeatStep = () => {
    const dispatch = useDispatch();
    const { showtimeId, selectedSeats } = useSelector(state => state.bookingStore);
    const [matrix, setMatrix] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeatMap = async () => {
            try {
                const res = await bookingApi.getSeatsByShowtime(showtimeId);
                const data = res.data ? res.data : res;
                setMatrix(data.seatMatrix || []);
                if (data.roomName) {
                    dispatch(setRoomInfo(data.roomName));
                }
            } catch (err) {
                alert("Không thể tải sơ đồ ghế!");
            } finally {
                setLoading(false);
            }
        };
        if (showtimeId) fetchSeatMap();
    }, [showtimeId]);


    const getPriceByType = (type) => {
        if (type === 'VIP') return 90000;
        if (type === 'COUPLE') return 148000;
        return 69000; 
    };

    if (loading) return <div className="loading-text">Đang tải phòng chiếu...</div>;

    return (
        <div className="seat-step-container">
            <div className="screen-curve-indicator">MÀN HÌNH</div>
            <div className="seats-matrix-area">
                {matrix.map((row, rIdx) => (
                    <div key={rIdx} className="seat-row-line">
                        {row.map((seat) => {
                            const isChosen = selectedSeats.some(s => s.id === seat.id);
                            const isDisabled = seat.status !== 'AVAILABLE';
                            const seatPrice = seat.price || getPriceByType(seat.type);

                            return (
                                <div
                                    key={seat.id}
                                    className={`cinema-seat-cell type-${seat.type.toLowerCase()} status-${seat.status.toLowerCase()} ${isChosen ? 'chosen' : ''}`}
                                    onClick={() => {
                                        if (!isDisabled && seat.type !== 'EMPTY') {
                                            dispatch(toggleSeatSelection({
                                                id: seat.id,
                                                name: `${seat.row}${seat.col}`,
                                                type: seat.type,
                                                price: seatPrice
                                            }));
                                        }
                                    }}
                                >
                                    {seat.type !== 'EMPTY' ? `${seat.row}${seat.col}` : ''}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="seats-legend-bar">
                <span className="legend"><span className="box normal"></span> Thường </span>
                <span className="legend"><span className="box vip"></span> VIP</span>
                <span className="legend"><span className="box couple"></span> Đôi </span>
                <span className="legend"><span className="box chosen"></span> Đang Chọn</span>
                <span className="legend"><span className="box sold"></span> Đã Bán/Bảo trì</span>
            </div>
        </div>
    );
};

export default SeatStep;
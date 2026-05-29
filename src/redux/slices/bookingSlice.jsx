import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    step: 1,
    showtimeId: null,
    cinemaName: '',
    cinemaAddress: '',
    movieTitle: '',
    movieAgeRestriction: '',
    movieId: '',
    showtimeDate: '',
    showtimeTime: '',
    roomName: '',

    selectedSeats: [],
    snacks: {},
    totalPrice: 0,
    bookingId: null
};

const bookingSlice = createSlice({
    name: 'bookingStore',
    initialState,
    reducers: {
        initBooking: (state, action) => {
            const p = action.payload;
            state.showtimeId = p.showtimeId;
            state.cinemaName = p.cinemaName;
            state.cinemaAddress = p.cinemaAddress;
            state.movieTitle = p.movieTitle;
            state.movieAgeRestriction = p.movieAgeRestriction;
            state.movieId = p.movieId;
            state.showtimeDate = p.showtimeDate;
            state.showtimeTime = p.showtimeTime;

            state.step = 1;
            state.selectedSeats = [];
            state.snacks = {};
            state.totalPrice = 0;
            state.bookingId = null;
            state.roomName = '';
        },
        setRoomInfo: (state, action) => {
            state.roomName = action.payload;
        },
        toggleSeatSelection: (state, action) => {
            const seat = action.payload;
            const exists = state.selectedSeats.find(s => s.id === seat.id);
            if (exists) {
                state.selectedSeats = state.selectedSeats.filter(s => s.id !== seat.id);
                state.totalPrice -= seat.price;
            } else {
                const currentSeatsCount = state.selectedSeats.reduce((sum, s) => sum + (s.type === 'COUPLE' ? 2 : 1), 0);
                const incomingWeight = seat.type === 'COUPLE' ? 2 : 1;
                if (currentSeatsCount + incomingWeight > 8) {
                    alert("Mỗi giao dịch chỉ được đặt tối đa 8 chỗ ngồi!");
                    return;
                }
                state.selectedSeats.push(seat);
                state.totalPrice += seat.price;
            }
        },
        updateSnackQuantity: (state, action) => {
            const { id, name, quantity, price } = action.payload;

            if (quantity < 0) {
                quantity = 0;
            }

            const oldQty = state.snacks[id]?.quantity || 0;
            if (quantity === 0) {
                delete state.snacks[id];
            } else {
                state.snacks[id] = { id, name, quantity, price };
            }
            state.totalPrice += (quantity - oldQty) * price;
        },
        setStep: (state, action) => {
            state.step = action.payload;
        },
        setBookingResult: (state, action) => {
            state.bookingId = action.payload;
        },
        clearBooking: () => initialState
    }
});

export const { initBooking, setRoomInfo, toggleSeatSelection, updateSnackQuantity, setStep, setBookingResult, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
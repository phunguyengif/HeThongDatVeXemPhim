import { configureStore } from '@reduxjs/toolkit';
import cinemaReducer from './slices/cinemaApiSlice.jsx';
import roomReducer from './slices/roomApiSlice.jsx';
import showtimeReducer from './slices/showtimeApiSlice.jsx';
import movieReducer from './slices/movieApiSlice.jsx';



export const store = configureStore({
    reducer: {
        cinemaStore: cinemaReducer, 
        roomStore: roomReducer,
        showtimeStore: showtimeReducer,
        movieStore: movieReducer,
    },
});
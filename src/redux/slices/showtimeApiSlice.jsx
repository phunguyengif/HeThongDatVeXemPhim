import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import showtimeApi from '../../api/showtimeApi';

export const fetchShowtimesByMovie = createAsyncThunk(
    'showtime/fetchShowtimesByMovie',
    async ({ movieId, date }, thunkAPI) => {
        try {
            const response = await showtimeApi.getByMovieAndDate(movieId, date);
            return response; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// 2. TẠO SLICE QUẢN LÝ TRẠNG THÁI
const showtimeApiSlice = createSlice({
    name: 'showtime',
    initialState: {
        list: [], 
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShowtimesByMovie.pending, (state) => {
                state.isLoading = true;
                state.list = []; 
            })
            .addCase(fetchShowtimesByMovie.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload || []; 
            })
            .addCase(fetchShowtimesByMovie.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default showtimeApiSlice.reducer;
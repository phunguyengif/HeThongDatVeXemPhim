import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import showtimeApi from '../../api/showtimeApi';

export const fetchShowtimesByMovie = createAsyncThunk(
    'showtime/fetchShowtimesByMovie',
    async ({ movieId, date }, thunkAPI) => {
        try {
            const response = await showtimeApi.getByMovieAndDate(movieId, date);
            return response; // Trả về mảng Array<ShowtimeResponseDTO>
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// 2. TẠO SLICE QUẢN LÝ TRẠNG THÁI
const showtimeApiSlice = createSlice({
    name: 'showtime',
    initialState: {
        list: [], // Chứa danh sách suất chiếu lấy về
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShowtimesByMovie.pending, (state) => {
                state.isLoading = true;
                state.list = []; // Xóa lịch chiếu cũ khi đổi ngày/đổi phim
            })
            .addCase(fetchShowtimesByMovie.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload || []; // Lưu danh sách suất chiếu
            })
            .addCase(fetchShowtimesByMovie.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default showtimeApiSlice.reducer;
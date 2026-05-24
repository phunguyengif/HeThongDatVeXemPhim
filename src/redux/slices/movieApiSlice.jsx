import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import movieApi from "../../api/movieApi"; 


// Lấy danh sách tất cả phim (Có phân trang)
export const fetchAllMovies = createAsyncThunk(
    'movie/fetchAllMovies',
    async (params, thunkAPI) => {
        try {
            const response = await movieApi.getAll(params);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Lấy danh sách phim theo trạng thái (SHOWING, COMING_SOON...)
export const fetchMoviesByStatus = createAsyncThunk(
    'movie/fetchMoviesByStatus',
    async ({ status, ...params }, thunkAPI) => {
        try {
            // Tách riêng status đưa vào path, các thông số còn lại (pageNumber, pageSize) đưa vào params
            const response = await movieApi.getMoviesByStatus(status, params);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Tìm kiếm phim theo tên
export const searchMoviesByTitle = createAsyncThunk(
    'movie/searchMoviesByTitle',
    async (title, thunkAPI) => {
        try {
            const response = await movieApi.searchByTitle(title);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);
//Lấy chi tiết phim
export const fetchMovieById = createAsyncThunk(
    'movie/fetchMovieById',
    async (id, thunkAPI) => {
        try {
            const response = await movieApi.getById(id);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);



// ==========================================================
// 2. TẠO SLICE ĐỂ QUẢN LÝ STATE TRONG REDUX
// ==========================================================

const movieApiSlice = createSlice({
    name: 'movie',
    initialState: {
        movieList: [],        
        isLoading: false,     
        error: null,   
        currentMovie: null,       
        
        
        totalPages: 0,
        totalElements: 0,
        currentPage: 0
    },
    reducers: {
        clearMovieError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- XỬ LÝ FETCH ALL MOVIES ---
            .addCase(fetchAllMovies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllMovies.fulfilled, (state, action) => {
                state.isLoading = false;
                // Nếu backend trả về dạng phân trang (PageImpl) thì lấy action.payload.content
                // Nếu trả về List thuần thì lấy action.payload
                state.movieList = action.payload.content || action.payload || [];
                state.totalPages = action.payload.totalPages || 0;
                state.totalElements = action.payload.totalElements || 0;
                state.currentPage = action.payload.pageNumber || 0;
            })
            .addCase(fetchAllMovies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // XỬ LÝ FETCH MOVIE DETAIL BY ID
            .addCase(fetchMovieById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMovieById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentMovie = action.payload;
            })
            .addCase(fetchMovieById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- XỬ LÝ FETCH MOVIES BY STATUS ---
            .addCase(fetchMoviesByStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMoviesByStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.movieList = action.payload.content || action.payload || [];
                state.totalPages = action.payload.totalPages || 0;
                state.totalElements = action.payload.totalElements || 0;
            })
            .addCase(fetchMoviesByStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- XỬ LÝ SEARCH MOVIES BY TITLE ---
            .addCase(searchMoviesByTitle.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(searchMoviesByTitle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.movieList = action.payload.content || action.payload || [];
            })
            .addCase(searchMoviesByTitle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
            
    }
});

export const { clearMovieError } = movieApiSlice.actions;
export default movieApiSlice.reducer;
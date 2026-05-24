import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cinemaApi from '../../api/cinemaApi.jsx'; 

// ĐỊNH NGHĨA CÁC ASYNC THUNK GỌI API

// Thunk lấy danh sách rạp dùng chung 
export const fetchAllCinemas = createAsyncThunk(
    'cinema/fetchAllCinemas',
    async (params, thunkAPI) => {
        try {
            const response = await cinemaApi.getAll(params); 
            return response.content || response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Thunk tạo rạp mới
export const createNewCinema = createAsyncThunk(
    'cinema/createNewCinema',
    async (cinemaData, thunkAPI) => {
        try {
            const response = await cinemaApi.create(cinemaData); 
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Thunk cập nhật thông tin rạp 
export const updateExistingCinema = createAsyncThunk(
    'cinema/updateExistingCinema',
    async ({ id, cinemaData }, thunkAPI) => {
        try {
            const response = await cinemaApi.update(id, cinemaData); 
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Thunk xóa mềm rạp 
export const softDeleteCinema = createAsyncThunk(
    'cinema/softDeleteCinema',
    async (id, thunkAPI) => {
        try {
            const response = await cinemaApi.delete(id); 
            return { id, response };
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// CẤU HÌNH SLICE QUẢN LÝ TRẠNG THÁI (STATE) TẬP TRUNG 
const cinemaSlice = createSlice({
    name: 'cinema',
    initialState: {
        list: [],          
        isLoading: false,
        isError: false,
        errorMessage: ''
    },
    reducers: {
        // viết các action đồng bộ
    },
    extraReducers: (builder) => {
        builder
            // Xử lý logic khi fetch danh sách rạp
            .addCase(fetchAllCinemas.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchAllCinemas.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload; 
            })
            .addCase(fetchAllCinemas.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || 'Lỗi tải danh sách rạp!';
            })

            // Tự động thêm rạp mới vào danh sách local của Redux sau khi API POST thành công
            .addCase(createNewCinema.fulfilled, (state, action) => {
                state.list.unshift(action.payload); 
            })

            // Tự động cập nhật rạp trong danh sách local sau khi API PUT thành công ]
            .addCase(updateExistingCinema.fulfilled, (state, action) => {
                const index = state.list.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload; 
                }
            })

            // Tự động cập nhật trạng thái rạp hoặc xóa khỏi danh sách local sau khi API DELETE thành công
            .addCase(softDeleteCinema.fulfilled, (state, action) => {
                const index = state.list.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.list[index].isActive = false; 
                    // state.list = state.list.filter(c => c.id !== action.payload.id);
                }
            });
    },
});

export default cinemaSlice.reducer;
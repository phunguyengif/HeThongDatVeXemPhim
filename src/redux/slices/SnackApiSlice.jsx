import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import snackApi from '../../api/snackApi';

// Thunk gọi API lấy danh sách Snack có phân trang
export const fetchAllSnacks = createAsyncThunk(
    'snack/fetchAllSnacks',
    async (params, thunkAPI) => {
        try {
            const response = await snackApi.getAll(params);

            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const snackApiSlice = createSlice({
    name: 'snack',
    initialState: {
        list: [],       
        totalPages: 0,  
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSnacks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllSnacks.fulfilled, (state, action) => {
                state.isLoading = false;

                const responseData = action.payload;

                state.list = responseData.content || [];

                state.totalPages = responseData.totalPages || 0;
            })
            .addCase(fetchAllSnacks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export default snackApiSlice.reducer;
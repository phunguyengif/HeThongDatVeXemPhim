import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import roomApi from "../../api/roomApi.jsx";

export const fetchAllRooms = createAsyncThunk(
    'room/fetchAllRooms',
    async (params, thunkAPI) => {   
        try {
            const response = await roomApi.getAll(params);
            return response.content || response;
        } catch (error){
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const getRoomsByCinemaId = createAsyncThunk(
    'room/getRoomsByCinemaId',
    async (cinemaId, thunkAPI) => {
        try{
            const response = await roomApi.getRoomsByCinemaId(cinemaId);
            return response;
        
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const roomSlice = createSlice({
    name: 'room',
    initialState: {
        list: [],
        isLoading: false,
        isError: false,
        errorMessage: ''
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllRooms.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchAllRooms.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchAllRooms.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload?.message || 'Lỗi tải danh sách phòng!';
            })

            .addCase(getRoomsByCinemaId.fulfilled, (state, action) => {
                state.list = action.payload;
            });
    },
});

export default roomSlice.reducer;
                
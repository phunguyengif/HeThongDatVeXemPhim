import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from "../../api/authApi";

// Thunk Đăng nhập
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, thunkAPI) => {
        try {
            const response = await authApi.login(credentials);
            // Redux xử lý luôn việc lưu thông tin vào trình duyệt
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('role', response.role);
            localStorage.setItem('userName', response.userName || response.username); 
            localStorage.setItem('userId', response.userId);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
        }
    }
);

// Thunk Đăng ký
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (credentials, thunkAPI) => {
        try {
            const response = await authApi.register(credentials);
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Tên đăng nhập hoặc email đã tồn tại');
        }
    }
);

const AuthApiSlice = createSlice({
    name: 'auth',
    initialState: {
        currentUser: localStorage.getItem('userName') || null,
        role: localStorage.getItem('role') || null,
        isLoading: false,
        isError: false,
        errorMessage: ''
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('role');
            localStorage.removeItem('userName');
            localStorage.removeItem('userId');
            state.currentUser = null;
            state.role = null;
        }
    },
    extraReducers: (builder) => {
        builder
            //  XỬ LÝ ĐĂNG NHẬP
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload.userName || action.payload.username;
                state.role = action.payload.role;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload;
            })

            //XỬ LÝ ĐĂNG KÝ 
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload;
            });
    },
});

export const { logout } = AuthApiSlice.actions;
export default AuthApiSlice.reducer;
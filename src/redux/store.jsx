import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Dùng localStorage mặc định

import cinemaReducer from './slices/cinemaApiSlice.jsx';
import roomReducer from './slices/roomApiSlice.jsx';
import showtimeReducer from './slices/showtimeApiSlice.jsx';
import movieReducer from './slices/movieApiSlice.jsx';
import authReducer from './slices/AuthApiSlice.jsx';
import bookingReducer from './slices/bookingSlice.jsx';
import snackApiReducer from './slices/SnackApiSlice';
const customStorage = {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, item) => Promise.resolve(localStorage.setItem(key, item)),
    removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};
// 1. Gộp tất cả các reducer của bạn lại bằng combineReducers
const rootReducer = combineReducers({
    cinemaStore: cinemaReducer,
    roomStore: roomReducer,
    showtimeStore: showtimeReducer,
    movieStore: movieReducer,
    authStore: authReducer,
    bookingStore: bookingReducer,
    snackStore: snackApiReducer,
});

// 2. Cấu hình Persist
const persistConfig = {
    key: 'root',
    storage: customStorage,
    whitelist: ['bookingStore']
};

// 3. Tạo persistedReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Khởi tạo Store với middleware tắt cảnh báo của Toolkit
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// 5. Xuất persistor để dùng cho PersistGate
export const persistor = persistStore(store);
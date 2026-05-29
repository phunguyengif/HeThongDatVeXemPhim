import axiosClient from './axiosClient';

const bookingApi = {
    // Lấy sơ đồ ghế của suất chiếu
    getSeatsByShowtime: (showtimeId) => {
        return axiosClient.get(`/booking/showtimes/${showtimeId}/seats`);
    },
    // Giữ ghế (Tạo đơn PENDING 10 phút)
    holdBooking: (bookingData) => {
        return axiosClient.post('/booking/hold', bookingData);
    }
};

export default bookingApi;
import axiosClient from './axiosClient';
const roomApi = {
    //  Lấy danh sách tất cả phòng chiếu 
    getAll: (params) => {
        return axiosClient.get('/catalog/rooms', { params });
    },

    // Tạo phòng chiếu mới đính kèm sơ đồ ghế 
    createRoom: (roomData) => {
        return axiosClient.post('/catalog/rooms', roomData);
    },
    getRoomsByCinemaId: (cinemaId) => {
        return axiosClient.get(`/catalog/rooms/cinema/${cinemaId}`);
    },

    getRoomById: (roomId) => {
        return axiosClient.get(`/catalog/rooms/${roomId}`);
    },

    //  Cập nhật phòng 
    updateRoom: (roomId, roomData) => {
        return axiosClient.put(`/catalog/rooms/${roomId}`, roomData);
    },

    // Xóa mềm phòng
    deleteRoom: (roomId) => {
        return axiosClient.delete(`/catalog/rooms/${roomId}`);
    },

    // Lấy danh sách ghế theo phòng 
    getSeatsByRoomId: (roomId) => {
        return axiosClient.get(`/catalog/rooms/internal/${roomId}/seats`);
    },

    //  Cập nhật loại ghế hàng loạt 
    updateSeatsTypeBulk: (seatIds, seatType) => {
        return axiosClient.put('/catalog/seats/type', { seatIds, seatType });
    },
    // Mở lại phòng chiếu 
    reopenRoom: (roomId) => {
        return axiosClient.patch(`/catalog/rooms/${roomId}`);
    }
};

export default roomApi;
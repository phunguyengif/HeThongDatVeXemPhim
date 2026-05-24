import axiosClient from './axiosClient';
const roomApi = {
    // 1. Lấy danh sách tất cả phòng chiếu (Hỗ trợ phân trang quản lý)
    getAll: (params) => {
        return axiosClient.get('/catalog/rooms', { params });
    },

    // 3. Tạo phòng chiếu mới đính kèm sơ đồ ghế (RoomRequestDTO)
    createRoom: (roomData) => {
        return axiosClient.post('/catalog/rooms', roomData);
    },
    getRoomsByCinemaId: (cinemaId) => {
        return axiosClient.get(`/catalog/rooms/cinema/${cinemaId}`);
    },

    getRoomById: (roomId) => {
        return axiosClient.get(`/catalog/rooms/${roomId}`);
    },

    // 22. Cập nhật phòng [@PutMapping] 
    updateRoom: (roomId, roomData) => {
        return axiosClient.put(`/catalog/rooms/${roomId}`, roomData);
    },

    // 23. Xóa mềm phòng [@DeleteMapping] 
    deleteRoom: (roomId) => {
        return axiosClient.delete(`/catalog/rooms/${roomId}`);
    },

    // 24. Lấy danh sách ghế theo phòng [@GetMapping] 
    getSeatsByRoomId: (roomId) => {
        return axiosClient.get(`/catalog/rooms/internal/${roomId}/seats`);
    },

    // 25. Cập nhật loại ghế hàng loạt [@PutMapping] 
    updateSeatsTypeBulk: (seatIds, seatType) => {
        return axiosClient.put('/catalog/seats/type', { seatIds, seatType });
    }
};

export default roomApi;
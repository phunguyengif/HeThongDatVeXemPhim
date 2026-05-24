import axiosClient from './axiosClient'; 

const cinemaApi = {
    // 1. Lấy danh sách tất cả các cụm rạp (Hỗ trợ phân trang: page, size)
    getAll: (params) => {
        return axiosClient.get('/catalog/cinemas', { params });
    },

    // 2. Lấy chi tiết thông tin 1 cụm rạp theo ID
    getById: (id) => {
        return axiosClient.get(`/catalog/cinemas/${id}`);
    },

    // 3. Tạo cụm rạp mới (CinemaRequestDTO: name, address)
    create: (cinemaData) => {
        return axiosClient.post('/catalog/cinemas', cinemaData);
    },

    // 4. Cập nhật thông tin cụm rạp (Tên, địa chỉ)
    update: (id, cinemaData) => {
        return axiosClient.put(`/catalog/cinemas/${id}`, cinemaData);
    },

    // 5. Xóa cụm rạp khỏi hệ thống
    delete: (id) => {
        return axiosClient.delete(`/catalog/cinemas/${id}`);
    },
    // Tìm kiếm rạp
    search: (params) => {
        return axiosClient.get('/catalog/cinemas/search', { params });
    }
};

export default cinemaApi;
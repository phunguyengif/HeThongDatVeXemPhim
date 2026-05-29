import axiosClient from './axiosClient';

const movieApi = {
    // API Lấy danh sách phim 
    getAll: (params) => {
        return axiosClient.get('/catalog/movies', { params });
    },
    // lấy phim theo trạng thái
    getMoviesByStatus: (status, params) => {
        return axiosClient.get(`/catalog/movies/status/${status}`, { params });
    },
    // API Lấy chi tiết phim 
    getById: (id) => {
        return axiosClient.get(`/catalog/movies/${id}`);
    },
    // API Tìm phim theo title 
    searchByTitle: (title) => {
        return axiosClient.get(`/catalog/movies/search/${title}`);
    },

    // API Tạo phim mới 
    create: (data) => {
        return axiosClient.post('/catalog/movies', data);
    },

    // API Cập nhật phim 
    update: (id, data) => {
        return axiosClient.put(`/catalog/movies/${id}`, data);
    },

    // API Xóa mềm phim 
    delete: (id) => {
        return axiosClient.delete(`/catalog/movies/${id}`);
    },

    // Cập nhật riêng Poster
    updatePoster: (id, poseUrl) => {
        return axiosClient.patch(`/catalog/movies/${id}/poster`, null, { params: { poseUrl } });
    },

    // Cập nhật riêng Trailer
    updateTrailer: (id, trailerUrl) => {
        return axiosClient.patch(`/catalog/movies/${id}/trailer`, null, { params: { trailerUrl } });
    },

    //  Upload file media 
    uploadFile: (formData) => {
        return axiosClient.post('/catalog/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default movieApi;
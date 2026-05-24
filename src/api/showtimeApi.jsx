import axiosClient from './axiosClient';

const showtimeApi = {
  // Tạo suất chiếu mới (POST) 
  create: (showtimeData) => {
    return axiosClient.post('/catalog/showtimes', showtimeData);
  },

  //  Hủy suất chiếu (PATCH) 
  cancel: (showtimeId) => {
    return axiosClient.patch(`/catalog/showtimes/${showtimeId}/cancel`);
  },

  // Lấy chi tiết suất chiếu (GET) 
  getById: (showtimeId) => {
    return axiosClient.get(`/catalog/showtimes/${showtimeId}`);
  },

  //  Lấy lịch chiếu của rạp theo ngày (GET) 
  getByCinemaAndDate: (cinemaId, date) => {
    return axiosClient.get(`/catalog/showtimes/cinema/${cinemaId}`, {
      params: { date }
    });
  },

  // Lấy toàn bộ suất chiếu của 1 phim trong 1 ngày
  getByMovieAndDate: (movieId, date) => {
    return axiosClient.get(`/catalog/showtimes/movie/${movieId}`, {
      params: { date }
    });
  }
};

export default showtimeApi;
import axiosClient from './axiosClient';

const showtimeApi = {
  // Tạo suất chiếu mới 
  create: (showtimeData) => {
    return axiosClient.post('/catalog/showtimes', showtimeData);
  },

  //  Hủy suất chiếu 
  cancel: (showtimeId) => {
    return axiosClient.patch(`/catalog/showtimes/${showtimeId}/cancel`);
  },

  // Lấy chi tiết suất chiếu 
  getById: (showtimeId) => {
    return axiosClient.get(`/catalog/showtimes/${showtimeId}`);
  },

  // Lấy lịch chiếu của rạp theo ngày 
  getByCinemaAndDate: (cinemaId, date) => {
    return axiosClient.get(`/catalog/showtimes/cinema/${cinemaId}`, {
      params: { date } 
    });
  },

  // Lấy lịch chiếu của phim theo ngày 
  getByMovieAndDate: (movieId, date) => {
    return axiosClient.get(`/catalog/showtimes/movie/${movieId}`, {
      params: { date }
    });
  }
};

export default showtimeApi;
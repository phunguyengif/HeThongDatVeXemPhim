import axiosClient from './axiosClient';

const paymentApi = {
    // Tạo link thanh toán MoMo
    createMoMoPayment: (bookingId) => {
        return axiosClient.post('/payment/momo/create', { bookingId });
    }
};

export default paymentApi;
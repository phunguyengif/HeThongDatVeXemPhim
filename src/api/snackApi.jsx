import axiosClient from './axiosClient';

const snackApi = {
    // 31. Lấy danh sách bắp nước 
    getAll: (params) => {
        return axiosClient.get('/catalog/snacks', { params });
    },

    // 32. Thêm món ăn/combo mới (POST)
    create: (snackData) => {
        return axiosClient.post('/catalog/snacks', snackData);
    },

    // 33. Sửa thông tin và giá tiền combo (PUT)
    update: (snackId, snackData) => {
        return axiosClient.put(`/catalog/snacks/${snackId}`, snackData);
    },

    // 34. Ẩn món ăn khi hết hàng (DELETE -> Soft delete: isActive = false)
    delete: (snackId) => {
        return axiosClient.delete(`/catalog/snacks/${snackId}`);
    },

    // 36. Cập nhật nhanh hình ảnh món ăn (PATCH) - Truyền imageUrl qua query params
    updateImage: (snackId, imageUrl) => {
        return axiosClient.patch(`/catalog/snacks/${snackId}/image`, null, {
            params: { imageUrl }
        });
    },

    // 9. Upload file ảnh lên Cloudinary
    uploadFile: (formData) => {
        return axiosClient.post('/catalog/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default snackApi;
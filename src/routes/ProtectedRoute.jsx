import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    // 💡 Giả sử bạn lưu thông tin user trong localStorage sau khi đăng nhập thành công
    // Cấu trúc user mẫu: { name: "Nguyễn Văn A", role: "ADMIN" hoặc "USER" }
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Nếu chưa đăng nhập -> Đá về trang Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu đã đăng nhập nhưng sai Role (ví dụ User đòi vào trang Admin) -> Đá về trang báo lỗi/trang chủ
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Nếu thỏa mãn hết điều kiện -> Cho phép đi tiếp vào các Route con bên trong
    return <Outlet />;
};

export default ProtectedRoute;
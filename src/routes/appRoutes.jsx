import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';


// Import các trang của bạn
import TrangChu from '../pages/TrangChu.jsx';
import Admin from '../pages/admin/Admin.jsx';
import DatVe from '../pages/DatVe.jsx';
import MovieDetail from '../components/MovieDetail.jsx';
import CinemaManagement from '../pages/admin/CinemaManagement.jsx';
import RoomManagement from '../pages/admin/RoomManagement.jsx';
import QuanLiPhim from '../pages/admin/QuanLiPhim.jsx';
import ShowtimeManagement from '../pages/admin/ShowTimeManagement.jsx';
import SnackManagement from '../pages/admin/SnackManagement.jsx';

export const appRouter = createBrowserRouter([
    { path: "/", element: <Navigate to="/Admin" replace /> },
    { path: "/Home", element: <TrangChu /> }, // Sửa HomeUser -> TrangChu
    { path: "/Admin", element: <Admin /> }, // Sửa AdminDashboard -> Admin
    { path: "/CinemaManagement", element: <CinemaManagement /> },
    { path: "/RoomManagement", element: <RoomManagement /> },
    { path: "/QuanLiPhim", element: <QuanLiPhim /> }, // Sửa MovieManagement -> QuanLiPhim
    { path: "/ShowTimeManagement", element: <ShowtimeManagement /> },
    { path: "/SnackManagement", element: <SnackManagement /> },
    { path: "/DatVe", element: <DatVe /> },
    { path: "/MovieDetail", element: <MovieDetail /> },
    {
        path: "/movie/:id", 
        element: <MovieDetail />
    }
]);
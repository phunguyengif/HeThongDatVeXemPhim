import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import BottomBar from '../components/BottomBar.jsx';


import TrangChu from '../pages/TrangChu.jsx';
import Admin from '../pages/admin/Admin.jsx';
import DatVe from '../pages/DatVe.jsx';
import Login from '../pages/Login.jsx';
import SeatStep from '../components/SeatStep.jsx';
import SnackStep from '../components/SnackStep.jsx';
import BookingPage from '../pages/BookingPage.jsx';
import PaymentResult from '../pages/PaymentResult.jsx';

import MovieDetail from '../components/MovieDetail.jsx';
import CinemaManagement from '../pages/admin/CinemaManagement.jsx';
import RoomManagement from '../pages/admin/RoomManagement.jsx';
import QuanLiPhim from '../pages/admin/QuanLiPhim.jsx';
import ShowtimeManagement from '../pages/admin/ShowTimeManagement.jsx';
import SnackManagement from '../pages/admin/SnackManagement.jsx';
import CheckoutPage from '../pages/admin/CheckoutPage.jsx';
import CinemaPage from '../pages/CinemaPage.jsx';
import SearchPage from '../pages/SearchPage.jsx';


const UserLayout = () => {
    return (
        <>
            <Header />
            <main style={{ minHeight: '80vh' }}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

const AdminLayout = () => {
    return (
        <main style={{ minHeight: '100vh' }}>
            <Outlet />
        </main>
    );
};

// CẤU HÌNH ROUTER: 
export const appRouter = createBrowserRouter([
    {
        //  PUBLIC / USER
        path: "/",
        element: <UserLayout />,
        children: [
            { path: "/", element: <Navigate to="/TrangChu" replace /> },
            { path: "/TrangChu", element: <TrangChu /> },
            { path: "/DatVe", element: <DatVe /> },
            { path: "/MovieDetail", element: <MovieDetail /> },
            { path: "/movie/:id", element: <MovieDetail /> },
            { path: "/Login", element: <Login /> },
            { path: "/BookingPage", element: <BookingPage /> },
            { path: "/SeatStep", element: <SeatStep /> },
            { path: "/SnackStep", element: <SnackStep /> },
            { path: "/BottomBar", element: <BottomBar /> },
            { path: "/payment-result", element: <PaymentResult /> },
            { path: '/checkout', element: <CheckoutPage /> },
            { path: '/cinemas/:id', element: <CinemaPage /> },
            { path: '/search', element: <SearchPage /> },

            { path: "/unauthorized", element: <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Bạn không có quyền truy cập trang này!</h2></div> }
        ]
    },
    {
        // ADMIN 
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { path: "/Admin", element: <Admin /> },
                    { path: "/CinemaManagement", element: <CinemaManagement /> },
                    { path: "/RoomManagement", element: <RoomManagement /> },
                    { path: "/QuanLiPhim", element: <QuanLiPhim /> },
                    { path: "/ShowTimeManagement", element: <ShowtimeManagement /> },
                    { path: "/SnackManagement", element: <SnackManagement /> },
                ]
            }
        ]
    }
]);
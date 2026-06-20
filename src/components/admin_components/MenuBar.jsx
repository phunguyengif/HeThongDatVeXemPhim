import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/AuthApiSlice";
import { useDispatch } from 'react-redux';


const MenuBar = () => {
    const userName = localStorage.getItem('userName');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            dispatch(logout());
            navigate('/Login');
        }
    };
    return (
        <div className="navv">
            {/* Nút quay lại trang chủ Home của User */}
            <li className="Admin-return">
                <div className="d-flex align-items-center justify-content-between ms-3 mb-4">
                    <div className="nav-item dropdown">
                        <a
                            className="nav-link p-0 border-0 bg-transparent"
                            href="#"
                            data-bs-toggle="dropdown"
                        >
                            <img
                                src="https://i.pravatar.cc/40"
                                className="avatar img-fluid rounded-circle"
                                alt="User"
                            />
                        </a>

                        <div className="dropdown-menu dropdown-menu-end shadow">
                            <a className="dropdown-item" href="/Profile">{userName}</a>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>Log out</button>
                        </div>
                    </div>
                </div>
            </li>

            {/* Thanh điều hướng chính (Navigation) */}
            <ul className="navigation">
                <li>
                    <NavLink
                        to="/CinemaManagement"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        QUẢN LÝ RẠP
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/RoomManagement"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        QUẢN LÝ PHÒNG CHIẾU
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/QuanLiPhim"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        QUẢN LÝ PHIM
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/ShowTimeManagement"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        QUẢN LÝ SUẤT CHIẾU
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/SnackManagement"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        KHÁC
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default MenuBar;
import React from "react";
import { NavLink } from "react-router-dom";

const MenuBar = () => {
    return (
        <div className="navv">
            {/* Nút quay lại trang chủ Home của User */}
            <li className="Admin-return">
                <NavLink to="/Home">
                    <i className="fa-solid fa-house" style={{ color: "#ffffff" }}></i>
                </NavLink>
            </li>

            {/* Thanh điều hướng chính (Navigation) */}
            <ul className="navigation">
                <li>
                    <NavLink
                        to="/Admin"
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        HOME
                    </NavLink>
                </li>
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
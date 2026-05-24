import React, { useState } from 'react';
// Nếu bạn chưa nhúng FontAwesome CDN ở file index.html tổng, 
// bạn có thể cài npm i @fortawesome/react-fontawesome hoặc giữ nguyên link CDN ngoài head.

const Login = () => {
    // 1. State quản lý dữ liệu Form Login
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // 2. State quản lý dữ liệu Form Signup
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Hàm xử lý khi người dùng thay đổi dữ liệu ô Input
    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value });
    };

    // Hàm xử lý khi Submit Form Login
    const handleLoginSubmit = (e) => {
        e.preventDefault(); // Ngăn load lại trang
        console.log('Dữ liệu Login gửi lên API:', loginData);
        // Bạn viết logic gọi API đăng nhập ở đây (axios, fetch...)
    };

    // Hàm xử lý khi Submit Form Signup
    const handleSignupSubmit = (e) => {
        e.preventDefault(); // Ngăn load lại trang
        console.log('Dữ liệu Signup gửi lên API:', signupData);
        // Bạn viết logic gọi API đăng ký ở đây
    };

    return (
        <div className="main-content">
            <div className="login-container">
                {/* Thẻ Checkbox dùng để kích hoạt hiệu ứng lật (Flip) CSS */}
                <input type="checkbox" id="flip" />

                <div className="cover">
                    <div className="front">
                        <img src="\public\frontImg.jpg" alt="" />
                        <div className="text">
                            <span className="text-1">Every new friend is a <br /> new adventure</span>
                            <span className="text-2">Let's get connected</span>
                        </div>
                    </div>
                    <div className="back">
                        <img src="\public\backImg.jpg" alt="" />
                        <div className="text">
                            <span className="text-1">Complete miles of journey <br /> with one step</span>
                            <span className="text-2">Let's get started</span>
                        </div>
                    </div>
                </div>

                <div className="forms">
                    <div className="form-content">

                        {/* --- FORM ĐĂNG NHẬP (LOGIN) --- */}
                        <div className="login-form">
                            <div className="title">Login</div>
                            <form onSubmit={handleLoginSubmit}>
                                <div className="input-boxes">
                                    <div className="input-box">
                                        <i className="fas fa-envelope"></i>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={loginData.email}
                                            onChange={handleLoginChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-box">
                                        <i className="fas fa-lock"></i>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={loginData.password}
                                            onChange={handleLoginChange}
                                            required
                                        />
                                    </div>
                                    <div className="text"><a href="#">Forgot password?</a></div>
                                    <div className="button input-box">
                                        <input type="submit" value="Submit" />
                                    </div>
                                    <div className="text sign-up-text">
                                        Don't have an account? <label htmlFor="flip">Signup now</label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* --- FORM ĐĂNG KÝ (SIGNUP) --- */}
                        <div className="signup-form">
                            <div className="title">Signup</div>
                            <form onSubmit={handleSignupSubmit}>
                                <div className="input-boxes">
                                    <div className="input-box">
                                        <i className="fas fa-user"></i>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter your name"
                                            value={signupData.name}
                                            onChange={handleSignupChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-box">
                                        <i className="fas fa-envelope"></i>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={signupData.email}
                                            onChange={handleSignupChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-box">
                                        <i className="fas fa-lock"></i>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={signupData.password}
                                            onChange={handleSignupChange}
                                            required
                                        />
                                    </div>
                                    <div className="button input-box">
                                        <input type="submit" value="Submit" />
                                    </div>
                                    <div className="text sign-up-text">
                                        Already have an account? <label htmlFor="flip">Login now</label>
                                    </div>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
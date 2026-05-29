import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../redux/slices/AuthApiSlice.jsx';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isLoading } = useSelector((state) => state.authStore);

    const [loginData, setLoginData] = useState({
        userName: '',
        password: ''
    });

    const [signupData, setSignupData] = useState({
        userName: '',
        email: '',
        password: ''
    });

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value });
    };

    // Hàm Validate đăng ký
    const validateSignup = () => {
        const { userName, email, password } = signupData;

        if (userName.trim().length < 7) {
            alert("Tên đăng nhập phải có ít nhất 4 ký tự!");
            return false;
        }
        if (/\s/.test(userName)) {
            alert("Tên đăng nhập không được chứa khoảng trắng!");
            return false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert("Vui lòng nhập đúng định dạng email (ví dụ: example@gmail.com)!");
            return false;
        }

        if (password.length < 8) {
            alert("Mật khẩu phải có ít nhất 6 ký tự!");
            return false;
        }

        if (!/[A-Z]/.test(password)) {
            alert("Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa!");
            return false;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            alert("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: @, #, $, %...)!");
            return false;
        }

        return true;
    };

    // Xử lý Submit Form Login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await dispatch(loginUser(loginData)).unwrap();



            if (response.role === 'ADMIN') {
                navigate('/Admin');
            } else {
                navigate('/TrangChu');
            }
        } catch (error) {
            alert(error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
    };

    // Xử lý Submit Form Signup
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (!validateSignup()) return;

        try {
            const response = await dispatch(registerUser(signupData)).unwrap();
            alert(response); // Hiện "Đăng ký thành công!"

            setSignupData({ userName: '', email: '', password: '' });
            document.getElementById('flip').checked = false;

        } catch (error) {
            alert(error || 'Lỗi: Tên đăng nhập hoặc email đã tồn tại!');
        }
    };

    return (
        <div className="main-content">
            <div className="login-container">
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
                                        <i className="fas fa-user"></i>
                                        <input type="text" name="userName" placeholder="Enter your username" value={loginData.userName} onChange={handleLoginChange} required />
                                    </div>
                                    <div className="input-box">
                                        <i className="fas fa-lock"></i>
                                        <input type="password" name="password" placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} required />
                                    </div>
                                    <div className="text"><a href="#">Forgot password?</a></div>
                                    <div className="button input-box">
                                        {/* isLoading lấy từ Redux */}
                                        <input type="submit" value={isLoading ? "Loading..." : "Submit"} disabled={isLoading} />
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
                                        <input type="text" name="userName" placeholder="Enter your username" value={signupData.userName} onChange={handleSignupChange} required />
                                    </div>
                                    <div className="input-box">
                                        <i className="fas fa-envelope"></i>
                                        <input type="email" name="email" placeholder="Enter your email" value={signupData.email} onChange={handleSignupChange} required />
                                    </div>
                                    <div className="input-box">
                                        <i className="fas fa-lock"></i>
                                        <input type="password" name="password" placeholder="Enter your password" value={signupData.password} onChange={handleSignupChange} required />
                                    </div>
                                    <div className="button input-box">
                                        <input type="submit" value={isLoading ? "Loading..." : "Submit"} disabled={isLoading} />
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
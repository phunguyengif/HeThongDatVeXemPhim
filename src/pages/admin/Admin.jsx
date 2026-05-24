import { useNavigate } from "react-router-dom";
import MenuBar from "../../components/admin_components/MenuBar";

const Admin = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Xóa dữ liệu đăng nhập
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Chuyển đến trang đăng nhập
        navigate("/login");
    }

    return (
        <div>
            <MenuBar />
            <article>
                <div className="container-fluid py-2">
                    <div className="row">

                        <div className="d-flex align-items-center justify-content-between ms-3 mb-4">
                            <div classNameName="d-flex align-items-center mb-3">
                                <h3 classNameName="h4 font-weight mb-0 me-3">Dashboard</h3>

                                <div classNameName="position-relative">
                                    <input
                                        type="text"
                                        classNameName="form-control shadow-sm"
                                        placeholder="Search..."
                                        style={{
                                            borderRadius: "30px",
                                            paddingRight: "40px",
                                            backgroundColor: "#f8f9fa",
                                            width: "220px",
                                            transition: "width 0.3s ease",
                                            cursor: "text",
                                        }}
                                    />
                                    <i
                                        classNameName="fa fa-search position-absolute"
                                        style={{
                                            right: "15px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "gray",
                                            pointerEvents: "none",
                                            cursor: "pointer",
                                        }}
                                    ></i>
                                </div>
                            </div>



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
                                    <a className="dropdown-item" href="/Profile">Profile</a>
                                    <a className="dropdown-item" href="#">Settings</a>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={handleLogout}>Log out</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-sm-6 mb-5">
                            <div className="card">
                                <div className="card-header p-2 ps-3">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <p className="text-sm mb-0 text-capitalize">Total Product</p>
                                            <h4 className="mb-0">TotalProducts</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="horizontal-line"></div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-sm-6 mb-5">
                            <div className="card">
                                <div className="card-header p-2 ps-3">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <p className="text-sm mb-0 text-capitalize">Orders List</p>
                                            <h4 className="mb-0">TotalOrders</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="horizontal-line"></div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-sm-6 mb-5">
                            <div className="card">
                                <div className="card-header p-2 ps-3">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <p className="text-sm mb-0 text-capitalize">Total Discounts</p>
                                            <h4 className="mb-0">TotalDiscounts</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="horizontal-line"></div>
                            </div>
                        </div>
                    </div>
                    <div classNameName="row">
                        <main classNameName="content">
                            <div classNameName="container-fluid p-0">
                                <div classNameName="mb-3">
                                    <h1 classNameName="h3 d-inline align-middle">Biểu đồ doanh thu</h1>
                                </div>

                                {/* Hiển thị biểu đồ */}
                                {/* <RevenueCharts /> */}
                            </div>
                        </main>
                    </div>
                </div>

                <div className="container-fluid">
                    <div >
                    </div>
                </div>

            </article>
        </div>
    );

};

export default Admin;

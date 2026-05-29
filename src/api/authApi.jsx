import axiosClient from "./axiosClient";

const authApi = {
    // Tương ứng với @PostMapping("/login")
    login: (loginData) => {
        return axiosClient.post('/auth/login', loginData);
    },

    // Tương ứng với @PostMapping("/register")
    register: (registerData) => {
        return axiosClient.post('/auth/register', registerData);
    }
};

export default authApi;
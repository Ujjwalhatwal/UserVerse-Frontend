import axios from "axios";

// set the backend base url
const BASE_URL = "http://localhost:8085/api";

// Create Axois Instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // important for handling cookies cross origin
});

// response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401: // unauthorized
                    // redirect user to login or logout page
                    authService.logout();
                    window.location.href = "/login";
                    break;

                case 403: // Forbidden
                    console.error("Access forbidden");
                    break;

                case 404: // Resource not found
                    console.error("Resource not found");
                    break;

                case 500: // server error
                    console.error("Internal server error");
                    break;
            }
        } else if (error.request) {
            // request made but no response received
            console.error("No response received ", error.request);
        } else {
            // Something happened in setting up the request
            console.error("Error in setting up request", error.message);
        }
        return Promise.reject(error);
    },
);

// create the backend services

const authService = {
    // sign up method

    signupNormalUser: async (username, email, password) => {
        try {
            const response = await api.post("/auth/register", {
                username,
                email,
                password,
            });
            return response.data;
        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    },

    // login method

    login: async (username, password) => {
        try {
            const response = await api.post("/auth/login", {
                username,
                password,
            });

            // fetch current user
            const user = await authService.fetchCurrentUser();

            return {
                ...response.data,
                user,
            };
        } catch (error) {
            console.error("login failed", error);
            throw error;
        }
    },

    // fetch current user method
    fetchCurrentUser: async () => {
        try {
            const response = await api.get("/auth/currentUser");

            // store userDTO in local storage for quick access
            localStorage.setItem("user", JSON.stringify(response.data));

            return response.data;
        } catch (error) {
            console.error("Error fetching user data", error);

            // if Unauthorized, logout
            if (error.response && error.response.status === 401) {
                await authService.logout();
            }
            return null;
        }
    },

    //get current user from local storage
    getCurrentUser: () => {
        const user = localStorage.getItem("user");
        try {
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("Error parsing user data", error);
            return null;
        }
    },

    // logout method
    logout: async () => {
        try {
            // call the backend api
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        }finally{
            // clear any local storage or state
            localStorage.removeItem("user");
        }
    },

    isAuthenticated: async () => {
        try {
            // verify auth by fetching current user
            const user = await authService.fetchCurrentUser();
            return !!user;
        } catch (error) {
            return false;
        }
    },
    
    updateProfile: async(userData) => {
        try {
            const response = await api.put(`/user/updateUser/${userData.userId}`,userData);
            const currentUser = authService.getCurrentUser();
            const updatedUser = {...currentUser, ...response.data };
            localStorage.setItem('user',JSON.stringify(updatedUser));
        } catch (error) {
            console.error("profile update failed.",error);
            throw error;
        }
    },

    getAllUsers: async() => {
        try {
            const response = await api.get('/user/getAllUsers');
            return response.data;
        } catch (error) {
            console.error("error while fetching all users.",error);
            throw error;
        }
    },

    deleteUser: async(userId) => {
        try {
            const response = await api.delete(`/user/deleteUser/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete the user",error);
            throw error;
        }
    },

    changePassword: async(currentPassword, newPassword, confirmPassword) => {
        try {
            const currentUser = authService.getCurrentUser();
            if(!currentUser || !currentUser.userId){
                throw new Error('User Not Found');
            }
            const response = await api.put(`/user/changePassword/${currentUser.userId}`,{
                currentPassword,
                newPassword,
                confirmPassword
            });
            return response.data;
        } catch (error) {
            console.error('Failed to change Password.',error);
            throw error;
        }
    }
};

export {api, authService};
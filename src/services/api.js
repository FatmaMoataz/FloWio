import axios from "axios";

const BACKEND_URL = "https://flowio-backend.vercel.app";

// إنشاء نسخة Axios الموحدة
const API = axios.create({
  baseURL: BACKEND_URL,
});

// 1. Request Interceptor: إرفاق التوكن تلقائياً مع كل طلب
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["x-auth-token"] = token; // للتوافق مع الأنظمة القديمة والـ Tests
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 2. Response Interceptor: صيانة الـ 401 وتحديث التوكن تلقائياً (Refresh Token Logic)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // لو السيرفر رد بـ 401 والطلب ده معملناش ليه إعادة محاولة قبل كدا
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem("refreshToken");
      const code = error.response.data?.code;

      // لو الـ token منتهي والـ refresh token موجود، نجدده فوراً
      if (code === "TOKEN_EXPIRED" && refreshToken) {
        try {
          // طلب توكن جديد من راوت الـ auth
          const response = await axios.post(`${BACKEND_URL}/api/auth/refresh`, { refreshToken });
          
          if (response.data.success) {
            const newAccessToken = response.data.accessToken;
            localStorage.setItem("token", newAccessToken);
            
            // تحديث الهيدرز للطلب الأصلي وإعادة إرساله بنجاح
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers["x-auth-token"] = newAccessToken;
            return API(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token expired or invalid, logging out...");
        }
      }

      // لو مفيش كود انتهاء أو الـ Refresh token نفسه باظ، نخرجه بأمان للـ Login
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("companyId");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// وحدة معالجة الأخطاء الموحدة للـ Services
export const handleError = (error) => {
  if (!error.response) {
    return {
      message: "Network error. Please check your connection.",
      status: "network_error",
    };
  }

  const { status, data } = error.response;

  return {
    message: data.message || "Something went wrong. Please try again.",
    status: status,
  };
};

export default API;
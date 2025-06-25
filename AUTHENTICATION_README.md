# Hệ thống Authentication với JWT và Cookies

## Tổng quan
Hệ thống authentication đã được cải thiện với các tính năng sau:
- **Đăng ký**: Tạo tài khoản mới và tự động đăng nhập
- **Đăng nhập**: Xác thực người dùng và tạo session
- **Đăng xuất**: Xóa session và cookies
- **Refresh Token**: Tự động làm mới access token
- **Bảo mật**: Sử dụng httpOnly cookies cho refresh token

## Cấu hình Environment Variables

Tạo file `.env` với các biến sau:

```env
# Database
MONGO_URL=mongodb://localhost:27017/your_database_name

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server
PORT=8000
NODE_ENV=development
```

## API Endpoints

### 1. Đăng ký (Register)
```http
POST /users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "gender": "male",
  "address": "123 Main St",
  "role": "user"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Đăng nhập (Login)
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Đăng xuất (Logout)
```http
POST /users/logout
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

### 4. Refresh Token
```http
POST /users/refresh
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Lấy thông tin profile (cần xác thực)
```http
GET /users/profile
Authorization: Bearer your_access_token_here
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "age": 25,
  "gender": "male",
  "address": "123 Main St"
}
```

## Cách hoạt động

### 1. Đăng ký/Đăng nhập
- Hệ thống tạo access token (15 phút) và refresh token (7 ngày)
- Refresh token được lưu trong httpOnly cookie
- Access token được trả về trong response body

### 2. Xác thực
- Sử dụng access token trong header `Authorization: Bearer <token>`
- Token được xác thực bằng JWT Strategy

### 3. Refresh Token
- Khi access token hết hạn, gọi endpoint `/users/refresh`
- Hệ thống sẽ tạo access token mới từ refresh token trong cookie

### 4. Đăng xuất
- Xóa refresh token khỏi database
- Xóa cookie refresh token

## Bảo mật

- **httpOnly cookies**: Refresh token được lưu trong httpOnly cookie, không thể truy cập bằng JavaScript
- **Secure cookies**: Trong production, cookies chỉ được gửi qua HTTPS
- **SameSite**: Ngăn chặn CSRF attacks
- **Token expiration**: Access token có thời hạn ngắn (15 phút)
- **Database storage**: Refresh token được lưu trong database để có thể vô hiệu hóa

## Sử dụng trong Frontend

### JavaScript/TypeScript
```javascript
// Đăng nhập
const login = async (email, password) => {
  const response = await fetch('/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Quan trọng để gửi cookies
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  // Lưu access token
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};

// Gọi API được bảo vệ
const getProfile = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const response = await fetch('/users/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  
  return response.json();
};

// Refresh token khi access token hết hạn
const refreshToken = async () => {
  const response = await fetch('/users/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
};

// Đăng xuất
const logout = async () => {
  await fetch('/users/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  localStorage.removeItem('accessToken');
};
```

### Axios Interceptor
```javascript
import axios from 'axios';

// Tạo axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// Request interceptor để thêm access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor để xử lý token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { data } = await api.post('/users/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        
        // Retry original request
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Lưu ý

1. **CORS**: Đảm bảo frontend và backend có cùng domain hoặc cấu hình CORS đúng
2. **HTTPS**: Trong production, sử dụng HTTPS để bảo mật cookies
3. **Token Storage**: Access token có thể lưu trong localStorage hoặc memory, nhưng refresh token luôn trong httpOnly cookie
4. **Error Handling**: Luôn xử lý lỗi 401 để refresh token tự động 
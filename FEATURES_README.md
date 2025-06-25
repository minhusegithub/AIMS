# Tính năng mới - AIMS System

## Các tính năng đã được thêm mới

### 1. Phân quyền theo vai trò

#### Vai trò "Khách hàng" (Customer)
- **Xem chi tiết sản phẩm**: Click vào nút "Xem chi tiết" để xem thông tin chi tiết sản phẩm
- **Thêm vào giỏ hàng**: 
  - Có thể thêm trực tiếp từ trang chủ (sẽ hiện prompt nhập số lượng)
  - Hoặc thêm từ modal chi tiết sản phẩm (có input số lượng)
- **Quản lý thông tin cá nhân**: Xem và chỉnh sửa thông tin profile

#### Vai trò "Quản trị viên" (Admin)
- **Xem chi tiết sản phẩm**: Click vào nút "Xem chi tiết" để xem thông tin sản phẩm
- **Chỉnh sửa sản phẩm**: Trong modal chi tiết sản phẩm, admin sẽ thấy nút "Chỉnh sửa sản phẩm"
- **Quản lý thông tin cá nhân**: Xem và chỉnh sửa thông tin profile

### 2. Loại bỏ vai trò "Quản lý sản phẩm"
- Vai trò "Quản lý sản phẩm" đã được loại bỏ khỏi hệ thống
- Chỉ còn 2 vai trò: "Khách hàng" và "Quản trị viên"

### 3. Tính năng giỏ hàng

#### Backend APIs
- `GET /carts/my-cart`: Lấy giỏ hàng của user hiện tại
- `POST /carts/add-to-cart`: Thêm sản phẩm vào giỏ hàng
  - Body: `{ productId: string, quantity: number }`

#### Frontend Functions
- `addToCart(productId, quantity)`: Thêm sản phẩm vào giỏ hàng
- `getCart()`: Lấy thông tin giỏ hàng
- `addToCartDirect(productId)`: Thêm trực tiếp với prompt số lượng

### 4. Modal sản phẩm

#### Cho Khách hàng:
- Hiển thị hình ảnh, tên, giá sản phẩm
- Input để nhập số lượng
- Nút "Thêm vào giỏ hàng"

#### Cho Quản trị viên:
- Hiển thị hình ảnh, tên, giá sản phẩm
- Nút "Chỉnh sửa sản phẩm" để mở form chỉnh sửa

### 5. Form chỉnh sửa sản phẩm (Admin only)
- Chỉnh sửa tên sản phẩm
- Chỉnh sửa giá sản phẩm
- Chỉnh sửa URL hình ảnh
- API: `PATCH /products/:id`

## Cách sử dụng

### Đăng ký tài khoản mới
1. Vào trang register.html
2. Chọn vai trò "Khách hàng" hoặc "Quản trị viên"
3. Điền thông tin và đăng ký

### Đăng nhập
1. Vào trang login.html
2. Nhập email và mật khẩu
3. Hệ thống sẽ tự động phân quyền dựa trên vai trò

### Sử dụng tính năng sản phẩm

#### Với vai trò Khách hàng:
1. Click "Xem chi tiết" để xem thông tin sản phẩm
2. Nhập số lượng muốn mua
3. Click "Thêm vào giỏ hàng"
4. Hoặc click "Thêm vào giỏ" trực tiếp từ trang chủ

#### Với vai trò Quản trị viên:
1. Click "Xem chi tiết" để xem thông tin sản phẩm
2. Click "Chỉnh sửa sản phẩm" để mở form chỉnh sửa
3. Thay đổi thông tin sản phẩm
4. Click "Lưu thay đổi"

### Quản lý thông tin cá nhân
1. Click vào tên người dùng trên header
2. Xem thông tin chi tiết
3. Click "Chỉnh sửa" để cập nhật thông tin
4. Click "Lưu thay đổi" hoặc "Hủy"

## Cấu trúc code

### Backend
- `src/carts/`: Module quản lý giỏ hàng
- `src/products/`: Module quản lý sản phẩm (đã cập nhật phân quyền)
- `src/users/`: Module quản lý người dùng
- `src/roles/`: Enum vai trò (đã loại bỏ ProductManager)

### Frontend
- `frontend/js/auth.js`: Quản lý authentication và các tính năng mới
- `frontend/index.html`: Trang chủ với các nút phân quyền
- `frontend/css/style.css`: Styles cho modal và các nút mới

## Lưu ý
- Tất cả API đều yêu cầu JWT authentication
- Refresh token được lưu trong httpOnly cookies
- Access token được lưu trong localStorage
- Hệ thống tự động refresh token khi cần thiết 
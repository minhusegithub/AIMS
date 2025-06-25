# Product Management API - AIMS System

## Tổng quan
Tất cả logic chỉnh sửa sản phẩm đã được chuyển từ frontend sang backend, cung cấp các API endpoints an toàn và có validation đầy đủ.

## Authentication
Tất cả các endpoints chỉnh sửa sản phẩm yêu cầu:
- JWT Authentication (`Authorization: Bearer <token>`)
- Role: `admin`

## API Endpoints

### 1. Tạo sản phẩm mới
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Tên sản phẩm",
  "description": "Mô tả sản phẩm",
  "price": 100.50,
  "stock": 50,
  "thumbnail": "https://example.com/image.jpg" // optional
}
```

### 2. Cập nhật sản phẩm (toàn bộ)
```
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Tên sản phẩm mới",
  "description": "Mô tả mới",
  "price": 120.00,
  "stock": 60,
  "thumbnail": "https://example.com/new-image.jpg"
}
```

### 3. Cập nhật từng trường riêng lẻ

#### Cập nhật tồn kho
```
PATCH /products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "stock": 75
}
```

#### Cập nhật giá
```
PATCH /products/:id/price
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "price": 150.00
}
```

#### Cập nhật tên sản phẩm
```
PATCH /products/:id/title
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Tên sản phẩm mới"
}
```

#### Cập nhật mô tả
```
PATCH /products/:id/description
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "description": "Mô tả mới"
}
```

#### Cập nhật hình ảnh
```
PATCH /products/:id/thumbnail
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "thumbnail": "https://example.com/new-image.jpg"
}
```

### 4. Xóa sản phẩm
```
DELETE /products/:id
Authorization: Bearer <token>
```

### 5. Lấy thông tin sản phẩm
```
GET /products/:id
```

### 6. Lấy danh sách sản phẩm
```
GET /products?current=1&pageSize=10
```

### 7. Sắp xếp sản phẩm
```
POST /products/sort-by-price?option=asc
POST /products/sort-by-price?option=desc
POST /products/sort-by-title?option=asc
POST /products/sort-by-title?option=desc
```

### 8. Tìm kiếm sản phẩm
```
POST /products/search-by-title?title=từ khóa
```

### 9. Lọc theo trạng thái tồn kho
```
GET /products/stock/in-stock    // > 10 sản phẩm
GET /products/stock/out-of-stock // = 0 sản phẩm
GET /products/stock/low-stock   // 1-10 sản phẩm
```

### 10. Thống kê sản phẩm (Admin only)
```
GET /products/stats/overview
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": {
    // Dữ liệu sản phẩm
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "error": "Chi tiết lỗi"
}
```

## Validation Rules

### Tạo sản phẩm
- `title`: Bắt buộc, không được để trống
- `description`: Bắt buộc, không được để trống
- `price`: Bắt buộc, phải >= 0
- `stock`: Bắt buộc, phải >= 0
- `thumbnail`: Tùy chọn, phải là URL hợp lệ

### Cập nhật sản phẩm
- Tất cả trường đều tùy chọn
- Nếu cung cấp, phải tuân theo validation rules tương ứng
- Chỉ cập nhật các trường được gửi

## Error Handling

### Common Errors
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Không có token hoặc token không hợp lệ
- `403 Forbidden`: Không có quyền admin
- `404 Not Found`: Không tìm thấy sản phẩm
- `500 Internal Server Error`: Lỗi server

### Validation Messages
- "Tên sản phẩm không được để trống"
- "Giá sản phẩm không được âm"
- "Số lượng tồn kho không được âm"
- "URL hình ảnh không hợp lệ"
- "ID sản phẩm không hợp lệ"

## Frontend Integration

### Cập nhật sản phẩm
```javascript
// Cập nhật toàn bộ
const response = await fetch(`/products/${productId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData)
});

// Cập nhật từng trường
const response = await fetch(`/products/${productId}/price`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ price: newPrice })
});
```

## Security Features

1. **JWT Authentication**: Tất cả endpoints chỉnh sửa yêu cầu token hợp lệ
2. **Role-based Access**: Chỉ admin có thể chỉnh sửa sản phẩm
3. **Input Validation**: Validation đầy đủ cho tất cả input
4. **Error Handling**: Xử lý lỗi chi tiết và thông báo rõ ràng
5. **Soft Delete**: Sản phẩm bị xóa được đánh dấu thay vì xóa hoàn toàn

## Benefits

1. **Security**: Logic được xử lý ở backend, an toàn hơn
2. **Validation**: Validation đầy đủ ở backend
3. **Consistency**: Response format nhất quán
4. **Flexibility**: Có thể cập nhật từng trường riêng lẻ
5. **Maintainability**: Code dễ bảo trì và mở rộng
6. **Performance**: Giảm tải cho frontend 
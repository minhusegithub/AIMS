# Controller-Service Pattern - AIMS System

## Tổng quan
Dự án AIMS đã được cấu trúc theo **Controller-Service Pattern** để đảm bảo separation of concerns và maintainability.

## Pattern Structure

### 🎯 **Controller Layer**
- **Chỉ nhận HTTP requests** và extract data
- **Gọi Service methods** để xử lý business logic
- **Trả về HTTP responses**
- **Không chứa business logic**

### 🔧 **Service Layer**
- **Chứa toàn bộ business logic**
- **Xử lý validation**
- **Tương tác với database**
- **Xử lý errors và exceptions**

## Implementation Examples

### ✅ **Products Module**

#### Controller (`src/products/products.controller.ts`)
```typescript
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ResponseMessage('Cập nhật sản phẩm thành công')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    // Chỉ nhận request và gọi service
    return this.productsService.update(id, updateProductDto);
  }
}
```

#### Service (`src/products/products.service.ts`)
```typescript
@Injectable()
export class ProductsService {
  async update(id: string, updateProductDto: UpdateProductDto) {
    // Toàn bộ business logic ở đây
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new NotFoundException('ID sản phẩm không hợp lệ');
    }

    // Validation
    if (updateProductDto.price !== undefined && updateProductDto.price < 0) {
      throw new BadRequestException('Giá sản phẩm không được âm');
    }

    // Database operations
    const existingProduct = await this.productModel.findOne({_id: id});
    if(!existingProduct){
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Business logic
    const updateData: any = {};
    if (updateProductDto.title !== undefined) {
      updateData.title = updateProductDto.title.trim();
    }
    // ... more logic

    const result = await this.productModel.updateOne({_id: id}, updateData);
    
    return {
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct
    };
  }
}
```

### ✅ **Users Module**

#### Controller (`src/users/users.controller.ts`)
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update current user profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // Chỉ nhận request và gọi service
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }
}
```

#### Service (`src/users/users.service.ts`)
```typescript
@Injectable()
export class UsersService {
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Toàn bộ business logic ở đây
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('ID người dùng không hợp lệ');
    }

    // Validation
    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Business logic
    const updateData: any = {};
    if (updateProfileDto.name !== undefined) {
      updateData.name = updateProfileDto.name.trim();
    }
    // ... more logic

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password -refreshToken');

    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser
    };
  }
}
```

### ✅ **Carts Module**

#### Controller (`src/carts/carts.controller.ts`)
```typescript
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('add-to-cart')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Add product to cart')
  addToMyCart(
    @CurrentUser() user: any,
    @Body() body: { productId: string; quantity: number }
  ) {
    // Chỉ nhận request và gọi service
    return this.cartsService.addProductToUserCart(user.userId, body.productId, body.quantity);
  }
}
```

#### Service (`src/carts/carts.service.ts`)
```typescript
@Injectable()
export class CartsService {
  async addProductToUserCart(userId: string, productId: string, quantity: number) {
    // Toàn bộ business logic ở đây
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Business logic
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        products: []
      });
    }

    // ... more logic

    return updatedCart;
  }
}
```

## Benefits của Controller-Service Pattern

### 🔒 **Separation of Concerns**
- **Controller**: Chỉ xử lý HTTP layer
- **Service**: Chỉ xử lý business logic
- **Dễ test** và maintain

### 🧪 **Testability**
- **Unit test** Service methods độc lập
- **Integration test** Controller với mock Service
- **Easier mocking** và stubbing

### 🔄 **Reusability**
- **Service methods** có thể được gọi từ nhiều Controller
- **Business logic** được tái sử dụng
- **DRY principle**

### 🛠️ **Maintainability**
- **Code organization** rõ ràng
- **Easy to modify** business logic
- **Clear responsibilities**

### 📈 **Scalability**
- **Easy to add** new features
- **Easy to refactor** existing code
- **Better performance** optimization

## Best Practices Applied

### ✅ **Controller Best Practices**
1. **Thin Controllers**: Chỉ nhận request và gọi service
2. **No Business Logic**: Không xử lý business logic trong controller
3. **Proper Decorators**: Sử dụng decorators cho validation và authorization
4. **Consistent Response**: Trả về response format nhất quán

### ✅ **Service Best Practices**
1. **Thick Services**: Chứa toàn bộ business logic
2. **Proper Error Handling**: Throw appropriate exceptions
3. **Input Validation**: Validate tất cả input
4. **Database Operations**: Xử lý tất cả database operations
5. **Consistent Return Format**: Trả về format nhất quán

### ✅ **Error Handling**
```typescript
// Service layer
if (!mongoose.Types.ObjectId.isValid(id)) {
  throw new NotFoundException('ID không hợp lệ');
}

// Controller layer
// Errors được tự động handled bởi NestJS exception filters
```

### ✅ **Validation**
```typescript
// DTO level validation
export class CreateProductDto {
  @IsNotEmpty({message: 'Tên sản phẩm không được để trống'})
  title: string;
}

// Service level validation
if (price < 0) {
  throw new BadRequestException('Giá sản phẩm không được âm');
}
```

## File Structure

```
src/
├── products/
│   ├── products.controller.ts    # HTTP layer
│   ├── products.service.ts       # Business logic
│   ├── dto/                      # Data transfer objects
│   └── schemas/                  # Database schemas
├── users/
│   ├── users.controller.ts       # HTTP layer
│   ├── users.service.ts          # Business logic
│   ├── dto/                      # Data transfer objects
│   └── schemas/                  # Database schemas
└── carts/
    ├── carts.controller.ts       # HTTP layer
    ├── carts.service.ts          # Business logic
    ├── dto/                      # Data transfer objects
    └── schemas/                  # Database schemas
```

## Conclusion

Việc áp dụng **Controller-Service Pattern** đã giúp:
- ✅ **Code organization** tốt hơn
- ✅ **Maintainability** cao hơn
- ✅ **Testability** dễ dàng hơn
- ✅ **Scalability** tốt hơn
- ✅ **Separation of concerns** rõ ràng

Pattern này đảm bảo rằng mỗi layer có trách nhiệm riêng biệt và không bị overlap, giúp code dễ đọc, dễ test và dễ maintain. 
// Auth utilities for managing user authentication state

class AuthManager {
  constructor() {
    this.baseURL = 'http://localhost:8000/v1';
    this.accessToken = localStorage.getItem('accessToken');
    this.userData = null;
  }

  // Kiểm tra trạng thái đăng nhập
  async checkAuthStatus() {
    if (!this.accessToken) {
      return { isAuthenticated: false, user: null };
    }

    try {
      const response = await fetch(`${this.baseURL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        this.userData = userData;
        return { isAuthenticated: true, user: userData };
      } else {
        // Token không hợp lệ, thử refresh
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          this.userData = refreshResult.user;
          return { isAuthenticated: true, user: refreshResult.user };
        } else {
          this.logout();
          return { isAuthenticated: false, user: null };
        }
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
      this.logout();
      return { isAuthenticated: false, user: null };
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/users/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
        
        // Lấy thông tin user mới
        const userResponse = await fetch(`${this.baseURL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          this.userData = userData;
          return { success: true, user: userData };
        }
      }
      
      return { success: false, user: null };
    } catch (error) {
      console.error('Lỗi khi refresh token:', error);
      return { success: false, user: null };
    }
  }

  // Đăng xuất
  async logout() {
    try {
      await fetch(`${this.baseURL}/users/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      this.accessToken = null;
      this.userData = null;
      localStorage.removeItem('accessToken');
    }
  }

  // Cập nhật UI dựa trên trạng thái đăng nhập
  updateUI(authStatus) {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    if (authStatus.isAuthenticated && authStatus.user) {
      // Hiển thị thông tin user
      if (userName) userName.textContent = authStatus.user.name;
      if (authButtons) authButtons.classList.add('hidden');
      if (userInfo) userInfo.classList.remove('hidden');
    } else {
      // Hiển thị nút đăng nhập/đăng ký
      if (authButtons) authButtons.classList.remove('hidden');
      if (userInfo) userInfo.classList.add('hidden');
    }
  }

  // Lấy access token hiện tại
  getAccessToken() {
    return this.accessToken;
  }

  // Set access token
  setAccessToken(token) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  // Lấy thông tin user hiện tại
  getUserData() {
    return this.userData;
  }

  // Set thông tin user
  setUserData(userData) {
    this.userData = userData;
  }

  // Kiểm tra user có phải admin không
  isAdmin() {
    return this.userData && this.userData.role === 'admin';
  }

  // Kiểm tra user có phải customer không
  isCustomer() {
    return this.userData && this.userData.role === 'customer';
  }

  // Lấy thông tin user từ server
  async fetchUserData() {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        this.userData = userData;
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
      return null;
    }
  }

  // Cập nhật thông tin user
  async updateProfile(profileData) {
    if (!this.accessToken) {
      throw new Error('Không có access token');
    }

    try {
      const response = await fetch(`${this.baseURL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        // Cập nhật thông tin user local
        const updatedUserData = await this.fetchUserData();
        this.userData = updatedUserData;
        
        // Cập nhật UI
        const userName = document.getElementById('userName');
        if (userName && updatedUserData) {
          userName.textContent = updatedUserData.name;
        }
        
        return { success: true, data: updatedUserData };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Cập nhật thất bại' };
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật profile:', error);
      return { success: false, error: 'Lỗi kết nối' };
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(productId, quantity) {
    if (!this.accessToken) {
      throw new Error('Không có access token');
    }

    try {
      const response = await fetch(`${this.baseURL}/carts/add-to-cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Thêm vào giỏ hàng thất bại' };
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      return { success: false, error: 'Lỗi kết nối' };
    }
  }

  // Lấy giỏ hàng của user
  async getCart() {
    if (!this.accessToken) {
      throw new Error('Không có access token');
    }

    try {
      const response = await fetch(`${this.baseURL}/carts/my-cart`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Không thể lấy giỏ hàng' };
      }
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      return { success: false, error: 'Lỗi kết nối' };
    }
  }
}

// Tạo instance global
window.authManager = new AuthManager();

// Function để logout (có thể gọi từ HTML)
window.logout = async function() {
  await window.authManager.logout();
  window.location.reload();
};

// Function để kiểm tra auth status (có thể gọi từ HTML)
window.checkAuthStatus = async function() {
  const authStatus = await window.authManager.checkAuthStatus();
  window.authManager.updateUI(authStatus);
  return authStatus;
};

// Function để hiển thị profile (có thể gọi từ HTML)
window.showUserProfile = async function() {
  const userData = await window.authManager.fetchUserData();
  if (userData) {
    // Tạo modal content
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    
    if (modal && modalContent) {
      // Tạo avatar từ tên
      const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
      
      modalContent.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <div class="user-details">
          <div class="detail-item">
            <span class="detail-label">Họ tên:</span>
            <span class="detail-value">${userData.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${userData.email}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tuổi:</span>
            <span class="detail-value">${userData.age} tuổi</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Giới tính:</span>
            <span class="detail-value">${getGenderText(userData.gender)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Địa chỉ:</span>
            <span class="detail-value">${userData.address}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Vai trò:</span>
            <span class="detail-value">${getRoleText(userData.role)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Ngày tạo:</span>
            <span class="detail-value">${new Date(userData.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-edit" onclick="showEditProfile()">Chỉnh sửa</button>
        </div>
      `;
      
      modal.style.display = 'block';
    }
  } else {
    alert('Không thể tải thông tin người dùng');
  }
};

// Function để hiển thị form chỉnh sửa profile
window.showEditProfile = async function() {
  const userData = await window.authManager.fetchUserData();
  if (userData) {
    const modal = document.getElementById('userModal');
    const modalContent = document.getElementById('userModalContent');
    
    if (modal && modalContent) {
      const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
      
      modalContent.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <form id="editProfileForm" class="edit-profile-form">
          <div class="form-group">
            <label for="editName">Họ tên:</label>
            <input type="text" id="editName" value="${userData.name}" required>
          </div>
          <div class="form-group">
            <label for="editEmail">Email:</label>
            <input type="email" id="editEmail" value="${userData.email}" required>
          </div>
          <div class="form-group">
            <label for="editAge">Tuổi:</label>
            <input type="number" id="editAge" value="${userData.age}" required>
          </div>
          <div class="form-group">
            <label for="editGender">Giới tính:</label>
            <select id="editGender" required>
              <option value="male" ${userData.gender === 'male' ? 'selected' : ''}>Nam</option>
              <option value="female" ${userData.gender === 'female' ? 'selected' : ''}>Nữ</option>
              <option value="other" ${userData.gender === 'other' ? 'selected' : ''}>Khác</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editAddress">Địa chỉ:</label>
            <input type="text" id="editAddress" value="${userData.address}" required>
          </div>
          <div class="form-group">
            <label for="editRole">Vai trò:</label>
            <select id="editRole" required>
              <option value="customer" ${userData.role === 'customer' ? 'selected' : ''}>Khách hàng</option>
              <option value="admin" ${userData.role === 'admin' ? 'selected' : ''}>Quản trị viên</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="showUserProfile()">Hủy</button>
            <button type="submit" class="btn-save">Lưu thay đổi</button>
          </div>
        </form>
      `;
      
      // Thêm event listener cho form
      document.getElementById('editProfileForm').addEventListener('submit', handleUpdateProfile);
    }
  }
};

// Function để xử lý cập nhật profile
window.handleUpdateProfile = async function(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('editName').value,
    email: document.getElementById('editEmail').value,
    age: parseInt(document.getElementById('editAge').value),
    gender: document.getElementById('editGender').value,
    address: document.getElementById('editAddress').value,
    role: document.getElementById('editRole').value,
  };

  const result = await window.authManager.updateProfile(formData);
  
  if (result.success) {
    alert('Cập nhật thông tin thành công!');
    showUserProfile(); // Quay lại view profile
  } else {
    alert(`Lỗi: ${result.error}`);
  }
};

// Function để xem chi tiết sản phẩm
window.viewProductDetail = function(productId) {
  // Tạo modal hiển thị chi tiết sản phẩm
  const modal = document.getElementById('userModal');
  const modalContent = document.getElementById('userModalContent');
  
  if (modal && modalContent) {
    // Lấy thông tin sản phẩm từ data attribute hoặc API
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (productCard) {
      const title = productCard.querySelector('.product-title').textContent;
      const price = productCard.querySelector('.product-price').textContent;
      const image = productCard.querySelector('img').src;
      
      modalContent.innerHTML = `
        <div class="product-detail">
          <img src="${image}" alt="${title}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
          <h3 style="margin: 15px 0; color: #333;">${title}</h3>
          <p style="font-size: 18px; color: #e91e63; font-weight: bold; margin-bottom: 20px;">${price}</p>
          <div class="product-actions">
            ${window.authManager.isCustomer() ? `
              <div style="margin-bottom: 15px;">
                <label for="quantity" style="display: block; margin-bottom: 5px;">Số lượng:</label>
                <input type="number" id="quantity" value="1" min="1" style="width: 80px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <button class="btn-cart" onclick="addToCart('${productId}')">Thêm vào giỏ hàng</button>
            ` : ''}
            ${window.authManager.isAdmin() ? `
              <button class="btn-edit" onclick="editProduct('${productId}')" style="margin-left: 10px;">Chỉnh sửa sản phẩm</button>
            ` : ''}
          </div>
        </div>
      `;
      
      modal.style.display = 'block';
    }
  }
};

// Function để thêm vào giỏ hàng
window.addToCart = async function(productId) {
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  
  const result = await window.authManager.addToCart(productId, quantity);
  
  if (result.success) {
    alert('Đã thêm vào giỏ hàng thành công!');
    closeUserModal();
  } else {
    alert(`Lỗi: ${result.error}`);
  }
};

// Function để chỉnh sửa sản phẩm (cho admin)
window.editProduct = function(productId) {
  // Tạo form chỉnh sửa sản phẩm
  const modal = document.getElementById('userModal');
  const modalContent = document.getElementById('userModalContent');
  
  if (modal && modalContent) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (productCard) {
      const title = productCard.querySelector('.product-title').textContent;
      const price = productCard.querySelector('.product-price').textContent.replace(' USD', '');
      const image = productCard.querySelector('img').src;
      
      modalContent.innerHTML = `
        <h3 style="margin-bottom: 20px;">Chỉnh sửa sản phẩm</h3>
        <form id="editProductForm" class="edit-profile-form">
          <div class="form-group">
            <label for="editProductTitle">Tên sản phẩm:</label>
            <input type="text" id="editProductTitle" value="${title}" required>
          </div>
          <div class="form-group">
            <label for="editProductPrice">Giá (USD):</label>
            <input type="number" id="editProductPrice" value="${price}" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="editProductImage">URL hình ảnh:</label>
            <input type="url" id="editProductImage" value="${image}" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="viewProductDetail('${productId}')">Hủy</button>
            <button type="submit" class="btn-save">Lưu thay đổi</button>
          </div>
        </form>
      `;
      
      // Thêm event listener cho form
      document.getElementById('editProductForm').addEventListener('submit', handleUpdateProduct);
    }
  }
};

// Function để xử lý cập nhật sản phẩm
window.handleUpdateProduct = async function(e) {
  e.preventDefault();
  
  const productId = e.target.closest('.modal-content').querySelector('.btn-cancel').onclick.toString().match(/'([^']+)'/)[1];
  
  const formData = {
    title: document.getElementById('editProductTitle').value,
    price: parseFloat(document.getElementById('editProductPrice').value),
    thumbnail: document.getElementById('editProductImage').value,
  };

  try {
    // Sử dụng API endpoint mới từ backend
    const response = await fetch(`http://localhost:8000/v1/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${window.authManager.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message || 'Cập nhật sản phẩm thành công!');
      window.location.reload(); // Reload để cập nhật UI
    } else {
      const errorData = await response.json();
      alert(`Lỗi: ${errorData.message || 'Cập nhật thất bại'}`);
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    alert('Lỗi kết nối');
  }
};

// Function để cập nhật từng trường riêng lẻ (nếu cần)
window.updateProductField = async function(productId, field, value) {
  try {
    const response = await fetch(`http://localhost:8000/v1/products/${productId}/${field}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${window.authManager.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ [field]: value })
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, message: result.message, data: result.data };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Cập nhật thất bại' };
    }
  } catch (error) {
    console.error(`Lỗi khi cập nhật ${field}:`, error);
    return { success: false, error: 'Lỗi kết nối' };
  }
};

// Helper functions
function getGenderText(gender) {
  const genderMap = {
    'male': 'Nam',
    'female': 'Nữ',
    'other': 'Khác'
  };
  return genderMap[gender] || gender;
}

function getRoleText(role) {
  const roleMap = {
    'customer': 'Khách hàng',
    'admin': 'Quản trị viên'
  };
  return roleMap[role] || role;
}

// Function để đóng modal (có thể gọi từ HTML)
window.closeUserModal = function() {
  const modal = document.getElementById('userModal');
  if (modal) {
    modal.style.display = 'none';
  }
}; 
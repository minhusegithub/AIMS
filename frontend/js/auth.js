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

  // Function để chỉnh sửa sản phẩm (cho admin)
  async updateProduct(productId, productData) {
    if (!this.accessToken) {
      throw new Error('Không có access token');
    }

    try {
      const response = await fetch(`${this.baseURL}/products/admin/update/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, message: result.message, data: result.data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Cập nhật thất bại' };
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      return { success: false, error: 'Lỗi kết nối' };
    }
  }

  // Function để xóa sản phẩm (cho admin)
  async deleteProduct(productId) {
    if (!this.accessToken) {
      throw new Error('Không có access token');
    }

    try {
      const response = await fetch(`${this.baseURL}/products/admin/delete/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, message: result.message, data: result.data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Xóa thất bại' };
      }
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      return { success: false, error: 'Lỗi kết nối' };
    }
  }

  // Function để tạo sản phẩm (cho admin)
  async createProduct(productData) {
    if (!this.accessToken) {
      throw new Error('Không có access token');
    }

    try {
      const response = await fetch(`${this.baseURL}/products/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, message: result.message, data: result.data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Tạo sản phẩm thất bại' };
      }
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
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


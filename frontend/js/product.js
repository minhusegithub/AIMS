// Product utilities for managing product-related operations

class ProductManager {
  constructor() {
    this.baseURL = 'http://localhost:8000/v1';
  }

  // Load tất cả sản phẩm
  async loadProducts() {
    const grid = document.getElementById("productGrid");
    try {
      const res = await fetch(`${this.baseURL}/products?current=1&pageSize=20`);
      const data = await res.json();
      const products = data.result;
      grid.innerHTML = "";

      products.forEach(p => {
        const card = this.createProductCard(p);
        grid.appendChild(card);
      });
    } catch (err) {
      grid.innerHTML = '<p style="text-align:center;color:red">Không thể tải sản phẩm.</p>';
      console.error(err);
    }
  }

  // Tạo card sản phẩm
  createProductCard(p) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute('data-product-id', p._id);
    card.innerHTML = `
      <div class="product-image-container">
        <img src="${p.thumbnail || 'https://via.placeholder.com/200x180'}" alt="Product">
        <div class="product-overlay">
          <div class="product-stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
          </div>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${p.title}</h3>
        <div class="product-price">${p.price.toLocaleString()} USD</div>
        <div class="product-description">${p.description || 'Không có mô tả'}</div>
        <div class="product-stock-info">
          <span class="stock-label">Tồn kho:</span>
          <span class="stock-value ${p.stock > 10 ? 'high' : p.stock > 0 ? 'medium' : 'low'}">${p.stock} sản phẩm</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn-detail" onclick="productManager.viewProductDetail('${p._id}')">
          <span class="btn-icon">👁️</span>
          Xem chi tiết
        </button>
        ${window.authManager && window.authManager.isCustomer() ? 
          `<button class="btn-cart" onclick="productManager.addToCartDirect('${p._id}')" ${p.stock <= 0 ? 'disabled' : ''}>
            <span class="btn-icon">🛒</span>
            ${p.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
          </button>` : 
          ''
        }
        ${window.authManager && window.authManager.isAdmin() ? 
          `<button class="btn-delete" onclick="productManager.deleteProduct('${p._id}')" style="margin-left: 10px;">
            <span class="btn-icon">🗑️</span>
            Xóa sản phẩm
          </button>` : 
          ''
        }
      </div>
    `;
    return card;
  }

  // Tìm kiếm sản phẩm
  async searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
      alert('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }

    // Hiển thị loading
    const grid = document.getElementById("productGrid");
    grid.innerHTML = '<p style="text-align:center;color:#666;">Đang tìm kiếm...</p>';

    try {
      const res = await fetch(`${this.baseURL}/products/search-by-title?title=${encodeURIComponent(searchTerm)}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        this.displaySearchResults(data.data, searchTerm);
      } else {
        alert('Có lỗi xảy ra khi tìm kiếm!');
        await this.loadProducts(); // Quay lại danh sách gốc nếu có lỗi
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
      alert('Không thể kết nối đến server!');
      await this.loadProducts(); // Quay lại danh sách gốc nếu có lỗi
    }
  }

  // Hiển thị kết quả tìm kiếm
  displaySearchResults(products, searchTerm) {
    const grid = document.getElementById("productGrid");
    const searchResults = document.getElementById("searchResults");
    const searchTermSpan = document.getElementById("searchTerm");
    const resultCount = document.getElementById("resultCount");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const sortInfo = document.getElementById("sortInfo");

    // Ẩn thông tin sắp xếp nếu có
    if (sortInfo) {
      sortInfo.style.display = 'none';
    }

    // Hiển thị thông tin tìm kiếm
    searchResults.style.display = 'block';
    searchTermSpan.textContent = searchTerm;
    resultCount.textContent = products.length;
    clearSearchBtn.style.display = 'inline-block';

    // Render sản phẩm
    grid.innerHTML = "";
    
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "${searchTerm}"</p>
          <button onclick="productManager.clearSearch()" class="btn-primary">Quay lại tất cả sản phẩm</button>
        </div>
      `;
      return;
    }

    products.forEach(p => {
      const card = this.createProductCard(p);
      grid.appendChild(card);
    });
  }

  // Xóa tìm kiếm và quay lại tất cả sản phẩm
  async clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById("searchResults");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const sortInfo = document.getElementById("sortInfo");
    const priceSortSelect = document.getElementById('priceSort');
    const titleSortSelect = document.getElementById('titleSort');

    // Reset tìm kiếm
    searchInput.value = '';
    searchResults.style.display = 'none';
    clearSearchBtn.style.display = 'none';
    
    // Reset bộ lọc
    if (priceSortSelect) priceSortSelect.value = '';
    if (titleSortSelect) titleSortSelect.value = '';
    if (sortInfo) sortInfo.style.display = 'none';
    
    await this.loadProducts();
  }

  // Xem chi tiết sản phẩm
  viewProductDetail(productId) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('productModalContent');
    
    if (modal && modalContent) {
      const productCard = document.querySelector(`[data-product-id="${productId}"]`);
      if (productCard) {
        const title = productCard.querySelector('.product-title').textContent;
        const description = productCard.querySelector('.product-description').textContent;
        const price = productCard.querySelector('.product-price').textContent;
        const image = productCard.querySelector('img').src;
        
        modalContent.innerHTML = `
          <div class="product-detail">
            <img src="${image}" alt="${title}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px;">
            <h3 style="margin: 15px 0; color: #333;">${title}</h3>
            <p style="margin: 15px 0; color: #333;">${description}</p>
            <p style="font-size: 18px; color: #e91e63; font-weight: bold; margin-bottom: 20px;">${price}</p>
            <div class="product-actions">
              ${window.authManager.isCustomer() ? `
                <div style="margin-bottom: 15px;">
                  <label for="quantity" style="display: block; margin-bottom: 5px;">Số lượng:</label>
                  <input type="number" id="quantity" value="1" min="1" style="width: 80px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button class="btn-cart" onclick="productManager.addToCart('${productId}')">Thêm vào giỏ hàng</button>
              ` : ''}
              ${window.authManager.isAdmin() ? `
                <button class="btn-edit" onclick="productManager.editProduct('${productId}')" style="margin-left: 10px;">Chỉnh sửa sản phẩm</button>
                <button class="btn-delete" onclick="productManager.deleteProduct('${productId}')" style="margin-left: 10px; background-color: #dc3545;">
                  <span class="btn-icon">🗑️</span>
                  Xóa sản phẩm
                </button>
              ` : ''}
            </div>
          </div>
        `;
        
        modal.style.display = 'block';
      }
    }
  }

  // Thêm vào giỏ hàng từ modal
  async addToCart(productId) {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    const result = await window.authManager.addToCart(productId, quantity);
    
    if (result.success) {
      alert('Đã thêm vào giỏ hàng thành công!');
      if (typeof updateCartBadge === 'function') updateCartBadge();
      this.closeProductModal();
    } else {
      alert(`Lỗi: ${result.error}`);
    }
  }

  // Thêm vào giỏ hàng trực tiếp (không qua modal)
  async addToCartDirect(productId) {
    const quantity = prompt('Nhập số lượng:', '1');
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
      const result = await window.authManager.addToCart(productId, parseInt(quantity));
      
      if (result.success) {
        alert('Đã thêm vào giỏ hàng thành công!');
        if (typeof updateCartBadge === 'function') updateCartBadge();
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } else if (quantity !== null) {
      alert('Vui lòng nhập số lượng hợp lệ!');
    }
  }

  // Chỉnh sửa sản phẩm (cho admin)
  editProduct(productId) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('productModalContent');
    
    if (modal && modalContent) {
      const productCard = document.querySelector(`[data-product-id="${productId}"]`);
      if (productCard) {
        const title = productCard.querySelector('.product-title').textContent;
        const description = productCard.querySelector('.product-description').textContent;
        const price = productCard.querySelector('.product-price').textContent.replace(' USD', '');
        const image = productCard.querySelector('img').src;
        const stock = productCard.querySelector('.stock-value').textContent.replace(' sản phẩm', '');
        
        modalContent.innerHTML = `
          <h3 style="margin-bottom: 20px;">Chỉnh sửa sản phẩm</h3>
          <form id="editProductForm" class="edit-profile-form">
            <div class="form-group">
              <label for="editProductTitle">Tên sản phẩm:</label>
              <input type="text" id="editProductTitle" value="${title}" required>
            </div>
            <div class="form-group">
              <label for="editProductDescription">Mô tả sản phẩm:</label>
              <input type="text" id="editProductDescription" value="${description}" required>
            </div>
            <div class="form-group">
              <label for="editProductPrice">Giá (USD):</label>
              <input type="number" id="editProductPrice" value="${price}" step="0.01" required>
            </div>
            <div class="form-group">
              <label for="editProductStock">Số lượng tồn kho:</label>
              <input type="number" id="editProductStock" value="${stock}" min="0" required>
            </div>
            <div class="form-group">
              <label for="editProductImage">URL hình ảnh:</label>
              <input type="url" id="editProductImage" value="${image}" required>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" onclick="productManager.viewProductDetail('${productId}')">Hủy</button>
              <button type="submit" class="btn-save">Lưu thay đổi</button>
            </div>
          </form>
        `;
        
        // Thêm event listener cho form
        document.getElementById('editProductForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const productData = {
            title: document.getElementById('editProductTitle').value,
            description: document.getElementById('editProductDescription').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            stock: parseInt(document.getElementById('editProductStock').value),
            thumbnail: document.getElementById('editProductImage').value,
          };

          const result = await window.authManager.updateProduct(productId, productData);
          
          if (result.success) {
            alert(result.message || 'Cập nhật sản phẩm thành công!');
            window.location.reload(); // Reload để cập nhật UI
          } else {
            alert(`Lỗi: ${result.error}`);
          }
        });
      }
    }
  }

  // Đóng modal sản phẩm
  closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Xóa sản phẩm (cho admin)
  async deleteProduct(productId) {
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.');
    
    if (!confirmDelete) {
      return;
    }

    const result = await window.authManager.deleteProduct(productId);
    
    if (result.success) {
      alert('Đã xóa sản phẩm thành công!');
      await this.loadProducts(); // Reload danh sách sản phẩm
    } else {
      alert(`Lỗi: ${result.error}`);
    }
  }

  // Lọc sản phẩm theo giá
  async sortByPrice() {
    const priceSortSelect = document.getElementById('priceSort');
    const option = priceSortSelect.value;
    
    if (!option) {
      await this.loadProducts(); // Quay lại danh sách gốc
      return;
    }

    // Hiển thị loading
    const grid = document.getElementById("productGrid");
    grid.innerHTML = '<p style="text-align:center;color:#666;">Đang sắp xếp...</p>';

    try {
      const res = await fetch(`${this.baseURL}/products/sort-by-price?option=${option}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        this.displaySortedProducts(data.data, `Sắp xếp theo giá ${option === 'asc' ? 'tăng dần' : 'giảm dần'}`);
      } else {
        alert('Có lỗi xảy ra khi sắp xếp!');
        await this.loadProducts(); // Quay lại danh sách gốc nếu có lỗi
      }
    } catch (err) {
      console.error('Lỗi sắp xếp theo giá:', err);
      alert('Không thể kết nối đến server!');
      await this.loadProducts(); // Quay lại danh sách gốc nếu có lỗi
    }
  }

  // Lọc sản phẩm theo tiêu đề
  async sortByTitle() {
    const titleSortSelect = document.getElementById('titleSort');
    const option = titleSortSelect.value;
    
    if (!option) {
      await this.loadProducts(); // Quay lại danh sách gốc
      return;
    }

    // Hiển thị loading
    const grid = document.getElementById("productGrid");
    grid.innerHTML = '<p style="text-align:center;color:#666;">Đang sắp xếp...</p>';

    try {
      const res = await fetch(`${this.baseURL}/products/sort-by-title?option=${option}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        this.displaySortedProducts(data.data, `Sắp xếp theo tiêu đề ${option === 'asc' ? 'A-Z' : 'Z-A'}`);
      } else {
        alert('Có lỗi xảy ra khi sắp xếp!');
        await this.loadProducts(); // Quay lại danh sách gốc nếu có lỗi
      }
    } catch (err) {
      console.error('Lỗi sắp xếp theo tiêu đề:', err);
      alert('Không thể kết nối đến server!');
      await this.loadProducts(); // Quay lại danh sách gốc nếu có lỗi
    }
  }

  // Hiển thị sản phẩm đã sắp xếp
  displaySortedProducts(products, sortType) {
    const grid = document.getElementById("productGrid");
    const searchResults = document.getElementById("searchResults");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    
    // Ẩn kết quả tìm kiếm nếu có
    if (searchResults) {
      searchResults.style.display = 'none';
    }
    if (clearSearchBtn) {
      clearSearchBtn.style.display = 'none';
    }

    // Hiển thị thông tin sắp xếp
    const sortInfo = document.getElementById("sortInfo");
    if (sortInfo) {
      sortInfo.style.display = 'block';
      sortInfo.innerHTML = `
        <h3>Sắp xếp: ${sortType}</h3>
        <p>Tìm thấy ${products.length} sản phẩm</p>
        <button onclick="productManager.clearSort()" class="btn-primary">Quay lại tất cả sản phẩm</button>
      `;
    }

    // Render sản phẩm
    grid.innerHTML = "";
    
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <p>Không có sản phẩm nào</p>
          <button onclick="productManager.clearSort()" class="btn-primary">Quay lại tất cả sản phẩm</button>
        </div>
      `;
      return;
    }

    products.forEach(p => {
      const card = this.createProductCard(p);
      grid.appendChild(card);
    });
  }

  // Xóa bộ lọc và quay lại tất cả sản phẩm
  async clearSort() {
    const priceSortSelect = document.getElementById('priceSort');
    const titleSortSelect = document.getElementById('titleSort');
    const sortInfo = document.getElementById("sortInfo");
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById("searchResults");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    
    // Reset các select
    priceSortSelect.value = '';
    titleSortSelect.value = '';
    
    // Ẩn thông tin sắp xếp
    if (sortInfo) {
      sortInfo.style.display = 'none';
    }
    
    // Reset tìm kiếm
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.style.display = 'none';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    
    await this.loadProducts();
  }

  // Hiển thị form thêm sản phẩm (cho admin)
  showAddProductForm() {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('productModalContent');
    
    if (modal && modalContent) {
      modalContent.innerHTML = `
        <h3 style="margin-bottom: 20px;">Thêm sản phẩm mới</h3>
        <form id="addProductForm" class="edit-profile-form">
          <div class="form-group">
            <label for="addProductTitle">Tên sản phẩm:</label>
            <input type="text" id="addProductTitle" required>
          </div>
          <div class="form-group">
            <label for="addProductDescription">Mô tả sản phẩm:</label>
            <textarea id="addProductDescription" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="addProductPrice">Giá (USD):</label>
            <input type="number" id="addProductPrice" step="0.01" min="0" required>
          </div>
          <div class="form-group">
            <label for="addProductStock">Số lượng tồn kho:</label>
            <input type="number" id="addProductStock" min="0" required>
          </div>
          <div class="form-group">
            <label for="addProductImage">URL hình ảnh:</label>
            <input type="url" id="addProductImage" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="productManager.closeProductModal()">Hủy</button>
            <button type="submit" class="btn-save">Thêm sản phẩm</button>
          </div>
        </form>
      `;
      
      // Thêm event listener cho form
      document.getElementById('addProductForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const productData = {
          title: document.getElementById('addProductTitle').value,
          description: document.getElementById('addProductDescription').value,
          price: parseFloat(document.getElementById('addProductPrice').value),
          stock: parseInt(document.getElementById('addProductStock').value),
          thumbnail: document.getElementById('addProductImage').value,
        };

        const result = await window.authManager.createProduct(productData);
        
        if (result.success) {
          alert(result.message || 'Thêm sản phẩm thành công!');
          productManager.closeProductModal();
          await productManager.loadProducts(); // Reload danh sách sản phẩm
        } else {
          alert(`Lỗi: ${result.error}`);
        }
      });
      
      modal.style.display = 'block';
    }
  }

  // Cập nhật UI để hiển thị nút admin
  updateAdminUI() {
    const adminActions = document.getElementById('adminActions');
    if (adminActions && window.authManager && window.authManager.isAdmin()) {
      adminActions.style.display = 'block';
    } else if (adminActions) {
      adminActions.style.display = 'none';
    }
  }
}

// Tạo instance global
window.productManager = new ProductManager();

// Global functions để gọi từ HTML
window.searchProducts = function() {
  window.productManager.searchProducts();
};

window.clearSearch = function() {
  window.productManager.clearSearch();
};

window.viewProductDetail = function(productId) {
  window.productManager.viewProductDetail(productId);
};

window.addToCart = function(productId) {
  window.productManager.addToCart(productId);
};

window.addToCartDirect = function(productId) {
  window.productManager.addToCartDirect(productId);
};

window.editProduct = function(productId) {
  window.productManager.editProduct(productId);
};

window.closeProductModal = function() {
  window.productManager.closeProductModal();
};

window.deleteProduct = function(productId) {
  window.productManager.deleteProduct(productId);
};

window.sortByPrice = function() {
  window.productManager.sortByPrice();
};

window.sortByTitle = function() {
  window.productManager.sortByTitle();
};

window.clearSort = function() {
  window.productManager.clearSort();
};

window.showAddProductForm = function() {
  window.productManager.showAddProductForm();
}; 
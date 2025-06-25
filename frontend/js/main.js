const API_URL = 'http://localhost:8000/products';

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const searchResults = document.getElementById('searchResults');

async function fetchProducts(searchTerm = '') {
  let url = API_URL;
  if (searchTerm) {
    url += `?search=${encodeURIComponent(searchTerm)}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  // data có thể là { result: [...] } hoặc { data: [...] }
  return data.result || data.data || [];
}

function renderProducts(products, searchTerm = '') {
  productGrid.innerHTML = '';
  if (products.length === 0) {
    productGrid.innerHTML = `<div class="no-products">Không có sản phẩm nào để hiển thị</div>`;
    searchResults.style.display = searchTerm ? 'block' : 'none';
    searchResults.innerHTML = searchTerm ? `Không tìm thấy sản phẩm nào cho "${searchTerm}"` : '';
    return;
  }
  searchResults.style.display = searchTerm ? 'block' : 'none';
  searchResults.innerHTML = searchTerm ? `Tìm thấy ${products.length} sản phẩm cho "${searchTerm}"` : '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
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
    `;
    productGrid.appendChild(card);
  });
}

async function loadProducts(searchTerm = '') {
  const products = await fetchProducts(searchTerm);
  renderProducts(products, searchTerm);
}

searchBtn.addEventListener('click', () => {
  const term = searchInput.value.trim();
  loadProducts(term);
  clearSearchBtn.style.display = term ? 'inline-block' : 'none';
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  loadProducts();
  clearSearchBtn.style.display = 'none';
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// Load all products on page load
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
}); 
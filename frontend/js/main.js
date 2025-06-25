// js/main.js
window.onload = function () {
  fetch('http://localhost:8000/products')
    .then(res => res.json())
    .then(data => {
      const grid = document.querySelector('.product-grid');
      grid.innerHTML = ''; // clear template
      data.forEach(p => {
        grid.innerHTML += `
        <div class="product-card">
          <img src="${p.thumbnail}" alt="Product" />
          <div class="product-title">${p.title}</div>
          <div class="product-price">${p.price.toLocaleString()} VND</div>
          <div class="product-actions">
            <button class="btn-detail">Xem chi tiết</button>
            <button class="btn-cart">Thêm vào giỏ</button>
          </div>
        </div>`;
      });
    })
    .catch(err => console.error('Lỗi khi load sản phẩm:', err));
};

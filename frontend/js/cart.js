// Lấy và hiển thị thông tin giỏ hàng

document.addEventListener('DOMContentLoaded', async () => {
  await renderCart();
});

async function renderCart() {
  const cartContainer = document.getElementById('cartContainer');
  cartContainer.innerHTML = '<p>Đang tải giỏ hàng...</p>';

  const result = await window.authManager.getCart();
  try {
    const result = await window.authManager.getCart();
    if (!result.success) {
      cartContainer.innerHTML = `<p style="color:red;">${result.error || 'Không thể lấy giỏ hàng.'}</p>`;
      return;
    }
    const cart = result.data;
    if (!cart || !cart.products || cart.products.length === 0) {
      cartContainer.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
      return;
    }
    let html = '<table class="cart-table"><thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th><th>Tổng</th><th></th></tr></thead><tbody>';
    let total = 0;
    cart.products.forEach(item => {
      const product = item.productId;
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      html += `<tr>
        <td>${product.title}</td>
        <td>${item.quantity}</td>
        <td>${product.price.toLocaleString()} USD</td>
        <td>${itemTotal.toLocaleString()} USD</td>
        <td><button class="remove-btn" onclick="handleRemoveFromCart('${product._id}')" title="Xóa sản phẩm khỏi giỏ hàng">🗑️</button></td>
      </tr>`;
    });
    html += `</tbody></table><div class="cart-total">Tổng tiền: <strong>${total.toLocaleString()} USD</strong></div>`;
    html += `<div style="text-align:right;margin-top:18px;"><button class="order-btn" onclick="location.href='order.html'">ĐẶT HÀNG</button></div>`;
    cartContainer.innerHTML = html;

    // Thêm CSS cho nút xóa và nút đặt hàng
    const style = document.createElement('style');
    style.innerHTML = `
      .remove-btn {
        background: #ef4444;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 1.1em;
        cursor: pointer;
        transition: background 0.2s;
      }
      .remove-btn:hover, .remove-btn:focus {
        background: #b91c1c;
      }
      .order-btn {
        background: #0ea5e9;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 12px 32px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 1px 4px #0002;
        transition: background 0.2s;
        letter-spacing: 1px;
      }
      .order-btn:hover, .order-btn:focus {
        background: #0369a1;
      }
    `;
    document.head.appendChild(style);
  } catch (err) {
    cartContainer.innerHTML = `<p style="color:red;">Lỗi khi tải giỏ hàng.</p>`;
  }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
window.handleRemoveFromCart = async function(productId) {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
  try {
    const result = await window.authManager.removeFromCart(productId);
    if (result.success) {
      await renderCart();
    } else {
      alert(result.error || 'Không thể xóa sản phẩm khỏi giỏ hàng.');
    }
  } catch (err) {
    alert('Lỗi khi xóa sản phẩm khỏi giỏ hàng.');
  }
} 
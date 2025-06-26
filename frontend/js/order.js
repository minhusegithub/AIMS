// Xử lý logic đặt hàng

// Hàm tạo order từ cart hiện tại
async function createOrderFromCart() {
  try {
    // Lấy thông tin cart hiện tại
    const cartResult = await window.authManager.getCart();
    if (!cartResult.success) {
      alert('Không thể lấy thông tin giỏ hàng: ' + cartResult.error);
      return;
    }
    
    const cart = cartResult.data;
    if (!cart || !cart.products || cart.products.length === 0) {
      alert('Giỏ hàng đang trống, không thể đặt hàng!');
      return;
    }

    // Dữ liệu để tạo order
    const orderData = {
      cartId: cart._id,
      placeRushOrder: false, // Mặc định không đặt gấp
      paymentMethod: 'COD' // Mặc định thanh toán khi nhận hàng
    };

    // Gọi API tạo order
    const response = await fetch(`${window.authManager.baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.authManager.accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      const orderResult = await response.json();
      alert('Đặt hàng thành công! Mã đơn hàng: ' + orderResult._id);
      // Chuyển về trang chính sau khi đặt hàng thành công
      window.location.href = 'index.html';
    } else {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Không thể tạo đơn hàng' };
      }
      alert('Lỗi khi đặt hàng: ' + (errorData.message || 'Không thể tạo đơn hàng'));
    }
  } catch (error) {
    console.error('Lỗi khi tạo order:', error);
    alert('Lỗi kết nối khi đặt hàng');
  }
}



// Hàm tạo order với tùy chọn nâng cao (có thể mở rộng sau)
window.createOrderWithOptions = async function(placeRushOrder = false, paymentMethod = 'COD') {
  try {
    const cartResult = await window.authManager.getCart();
    if (!cartResult.success) {
      alert('Không thể lấy thông tin giỏ hàng: ' + cartResult.error);
      return;
    }
    
    const cart = cartResult.data;
    if (!cart || !cart.products || cart.products.length === 0) {
      alert('Giỏ hàng đang trống, không thể đặt hàng!');
      return;
    }

    const orderData = {
      cartId: cart._id,
      placeRushOrder: placeRushOrder,
      paymentMethod: paymentMethod
    };

    const response = await fetch(`${window.authManager.baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.authManager.accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      const orderResult = await response.json();
      alert('Đặt hàng thành công! Mã đơn hàng: ' + orderResult._id);
      window.location.href = 'index.html';
    } else {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Không thể tạo đơn hàng' };
      }
      alert('Lỗi khi đặt hàng: ' + (errorData.message || 'Không thể tạo đơn hàng'));
    }
  } catch (error) {
    console.error('Lỗi khi tạo order:', error);
    alert('Lỗi kết nối khi đặt hàng');
  }
}; 




// Hàm xử lý khi bấm nút "XÁC NHẬN ĐẶT HÀNG"
window.handleOrderConfirm = async function() {
  if (confirm('Bạn có chắc chắn muốn đặt hàng?')) {
    try {
      // Lấy thông tin cart hiện tại
      const cartResult = await window.authManager.getCart();
      if (!cartResult.success) {
        alert('Không thể lấy thông tin giỏ hàng: ' + cartResult.error);
        return;
      }
      
      const cart = cartResult.data;
      if (!cart || !cart.products || cart.products.length === 0) {
        alert('Giỏ hàng đang trống, không thể đặt hàng!');
        return;
      }

      // Lấy giá trị từ form
      const placeRushOrder = document.getElementById('rushOrder').checked;
      const paymentMethod = document.getElementById('paymentMethod').value;

      // Dữ liệu để tạo order
      const orderData = {
        cartId: cart._id,
        placeRushOrder: placeRushOrder,
        paymentMethod: paymentMethod
      };

      // Gọi API tạo order
      const response = await fetch(`${window.authManager.baseURL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.authManager.accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const orderResult = await response.json();
        if (paymentMethod === 'VNPAY') {
          // Gọi API lấy link thanh toán VNPAY
          const vnpayRes = await fetch(`${window.authManager.baseURL}/vnpay/create-payment-url?orderId=${orderResult._id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${window.authManager.accessToken}`
            },
            credentials: 'include'
          });
          if (vnpayRes.ok) {
            const vnpayData = await vnpayRes.json();
            if (vnpayData.paymentUrl) {
              window.location.href = vnpayData.paymentUrl;
              return;
            } else {
              alert('Không lấy được link thanh toán VNPAY!');
            }
          } else {
            alert('Không thể kết nối cổng VNPAY!');
          }
        } else {
          alert('Đặt hàng thành công! Mã đơn hàng: ' + orderResult._id);
          window.location.href = 'index.html';
        }
      } else {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Không thể tạo đơn hàng' };
        }
        alert('Lỗi khi đặt hàng: ' + (errorData.message || 'Không thể tạo đơn hàng'));
      }
    } catch (error) {
      console.error('Lỗi khi tạo order:', error);
      alert('Lỗi kết nối khi đặt hàng');
    }
  }
};
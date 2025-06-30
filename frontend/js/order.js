// Hàm xử lý khi bấm nút "XÁC NHẬN ĐẶT HÀNG"
window.handleOrderConfirm = async function() {
  if (confirm('Bạn có chắc chắn muốn đặt hàng?')) {
    try {
      // Lấy thông tin cart hiện tại
      const cartResult = await window.authManager.getCart();
      const cart = cartResult.data;
      // Lấy giá trị từ form
      const placeRushOrder = document.getElementById('rushOrder').checked;
      const paymentMethod = document.getElementById('paymentMethod').value;

      // Dữ liệu để tạo order
      const orderData = {
        cartId: cart._id,
        placeRushOrder: placeRushOrder,
        paymentMethod: paymentMethod
      };
      // PAY ORDER
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
              // Không làm trống giỏ hàng ngay, để VNPay có thể xử lý
              window.location.href = vnpayData.paymentUrl;  
              await clearCart();
              return;
            }
          }
    
        }
        else { // thanh toán COD
          await clearCart();
          alert('Đặt hàng thành công! Mã đơn hàng: ' + orderResult._id);
          window.location.href = 'index.html';
        }
      }
      // End PAY ORDER
      
    } catch (error) {
      console.error('Lỗi khi tạo order:', error);
      alert('Lỗi kết nối khi đặt hàng');
    }
  }
};


async function clearCart(){
  const clearCartResponse = await fetch(`${window.authManager.baseURL}/carts/clear`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${window.authManager.accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  if (clearCartResponse.ok) {
    console.log('Đã làm trống giỏ hàng thành công');
  } else {
    console.warn('Không thể làm trống giỏ hàng:', clearCartResponse.status);
  }


  
}
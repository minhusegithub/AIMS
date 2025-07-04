


window.handleBackToHome = async function(){
  await clearCart();
  window.location.href = 'index.html';
}

// Xóa giỏ
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


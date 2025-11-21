// Sistema de notificações toast

export function showError(message) {
  showNotification(message, 'error')
}

export function showSuccess(message) {
  showNotification(message, 'success')
}

function showNotification(message, type) {
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ff4444' : '#44ff44'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `
  notification.textContent = message
  
  // Adicionar animação CSS
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse'
      setTimeout(() => {
        notification.parentNode.removeChild(notification)
        document.head.removeChild(style)
      }, 300)
    }
  }, type === 'error' ? 5000 : 3000)
}


// Social Icons Enhancement Script
document.addEventListener('DOMContentLoaded', function() {
    // Ensure Font Awesome icons are loaded properly
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        const icon = link.querySelector('i');
        if (icon) {
            // Add fallback content if icon doesn't load
            setTimeout(() => {
                if (window.getComputedStyle(icon, ':before').content === 'none' || 
                    window.getComputedStyle(icon, ':before').content === '""') {
                    
                    // Fallback text for each social platform
                    if (link.classList.contains('facebook')) {
                        icon.textContent = 'f';
                    } else if (link.classList.contains('instagram')) {
                        icon.textContent = '📷';
                    } else if (link.classList.contains('linkedin')) {
                        icon.textContent = 'in';
                    } else if (link.classList.contains('whatsapp')) {
                        icon.textContent = '💬';
                    }
                }
            }, 1000);
        }
    });
    
    // Add hover effects
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Force reload Font Awesome if not loaded
function checkFontAwesome() {
    const testElement = document.createElement('i');
    testElement.className = 'fab fa-facebook-f';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement, ':before');
    const isLoaded = computedStyle.content !== 'none' && computedStyle.content !== '""';
    
    document.body.removeChild(testElement);
    
    if (!isLoaded) {
        console.log('Font Awesome not loaded, attempting to reload...');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
        link.crossOrigin = 'anonymous';
        link.referrerPolicy = 'no-referrer';
        document.head.appendChild(link);
    }
}

// Check Font Awesome loading after page load
window.addEventListener('load', function() {
    setTimeout(checkFontAwesome, 500);
});
// Main JavaScript File for Airline Website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavigation();
    initLanguageToggle();
    initScrollEffects();
    initFormValidation();
    initAnimations();
    initDestinationsFilter();
});

// Navigation Functions
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Active navigation link
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Language Toggle Function
function initLanguageToggle() {
    let currentLang = 'ar';
    const langBtn = document.querySelector('.lang-btn span');
    
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }
}

function toggleLanguage() {
    const langBtn = document.querySelector('.lang-btn span');
    const html = document.documentElement;
    
    if (html.lang === 'ar') {
        html.lang = 'en';
        html.dir = 'ltr';
        langBtn.textContent = 'AR';
        currentLang = 'en';
        translateToEnglish();
    } else {
        html.lang = 'ar';
        html.dir = 'rtl';
        langBtn.textContent = 'EN';
        currentLang = 'ar';
        translateToArabic();
    }
}

// Translation Functions
function translateToEnglish() {
    // Hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const searchBtn = document.querySelector('.search-btn');
    const bookingTitle = document.querySelector('.booking-title');
    const bookingSubtitle = document.querySelector('.booking-subtitle');
    
    if (heroTitle) heroTitle.textContent = 'Discover the World with Us';
    if (heroSubtitle) heroSubtitle.textContent = 'Best prices and highest quality service for all your favorite destinations';
    if (searchBtn) searchBtn.innerHTML = '<i class="fas fa-search"></i> Search Flights';
    if (bookingTitle) bookingTitle.textContent = 'Book Your Flight Now';
    if (bookingSubtitle) bookingSubtitle.textContent = 'Find the best flights at affordable prices';
    
    // Form labels
    const formLabels = document.querySelectorAll('.form-group label');
    const placeholders = document.querySelectorAll('.form-group input[placeholder]');
    
    if (formLabels[0]) formLabels[0].textContent = 'From';
    if (formLabels[1]) formLabels[1].textContent = 'To';
    if (formLabels[2]) formLabels[2].textContent = 'Departure Date';
    if (formLabels[3]) formLabels[3].textContent = 'Return Date';
    if (formLabels[4]) formLabels[4].textContent = 'Passengers';
    if (formLabels[5]) formLabels[5].textContent = 'Class';
    
    if (placeholders[0]) placeholders[0].placeholder = 'Departure City';
    if (placeholders[1]) placeholders[1].placeholder = 'Arrival City';
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks[0]) navLinks[0].textContent = 'Home';
    if (navLinks[1]) navLinks[1].textContent = 'About';
    if (navLinks[2]) navLinks[2].textContent = 'Destinations';
    if (navLinks[3]) navLinks[3].textContent = 'Booking';
    if (navLinks[4]) navLinks[4].textContent = 'News & Offers';
    if (navLinks[5]) navLinks[5].textContent = 'Contact';
    
    // Sections
    const sectionTitles = document.querySelectorAll('.section-title');
    const sectionSubtitles = document.querySelectorAll('.section-subtitle');
    
    if (sectionTitles[0]) sectionTitles[0].textContent = 'Why Choose Us?';
    if (sectionTitles[1]) sectionTitles[1].textContent = 'Our Featured Destinations';
    if (sectionTitles[2]) sectionTitles[2].textContent = 'Latest Offers';
    
    if (sectionSubtitles[0]) sectionSubtitles[0].textContent = 'We provide the best services for our valued customers';
    if (sectionSubtitles[1]) sectionSubtitles[1].textContent = 'Discover the most beautiful cities around the world';
    if (sectionSubtitles[2]) sectionSubtitles[2].textContent = 'Get the best offers and discounts';
}

function translateToArabic() {
    // Hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const searchBtn = document.querySelector('.search-btn');
    const bookingTitle = document.querySelector('.booking-title');
    const bookingSubtitle = document.querySelector('.booking-subtitle');
    
    if (heroTitle) heroTitle.textContent = 'اكتشف العالم معنا';
    if (heroSubtitle) heroSubtitle.textContent = 'أفضل الأسعار وأعلى جودة في الخدمة لجميع وجهاتك المفضلة';
    if (searchBtn) searchBtn.innerHTML = '<i class="fas fa-search"></i> ابحث عن الرحلات';
    if (bookingTitle) bookingTitle.textContent = 'احجز رحلتك الآن';
    if (bookingSubtitle) bookingSubtitle.textContent = 'ابحث عن أفضل الرحلات بأسعار مناسبة';
    
    // Form labels
    const formLabels = document.querySelectorAll('.form-group label');
    const placeholders = document.querySelectorAll('.form-group input[placeholder]');
    
    if (formLabels[0]) formLabels[0].textContent = 'من';
    if (formLabels[1]) formLabels[1].textContent = 'إلى';
    if (formLabels[2]) formLabels[2].textContent = 'تاريخ المغادرة';
    if (formLabels[3]) formLabels[3].textContent = 'تاريخ العودة';
    if (formLabels[4]) formLabels[4].textContent = 'عدد الركاب';
    if (formLabels[5]) formLabels[5].textContent = 'فئة المقعد';
    
    if (placeholders[0]) placeholders[0].placeholder = 'مدينة المغادرة';
    if (placeholders[1]) placeholders[1].placeholder = 'مدينة الوصول';
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks[0]) navLinks[0].textContent = 'الرئيسية';
    if (navLinks[1]) navLinks[1].textContent = 'من نحن';
    if (navLinks[2]) navLinks[2].textContent = 'الوجهات';
    if (navLinks[3]) navLinks[3].textContent = 'الحجز';
    if (navLinks[4]) navLinks[4].textContent = 'الأخبار والعروض';
    if (navLinks[5]) navLinks[5].textContent = 'اتصل بنا';
    
    // Sections
    const sectionTitles = document.querySelectorAll('.section-title');
    const sectionSubtitles = document.querySelectorAll('.section-subtitle');
    
    if (sectionTitles[0]) sectionTitles[0].textContent = 'لماذا تختارنا؟';
    if (sectionTitles[1]) sectionTitles[1].textContent = 'وجهاتنا المميزة';
    if (sectionTitles[2]) sectionTitles[2].textContent = 'أحدث العروض';
    
    if (sectionSubtitles[0]) sectionSubtitles[0].textContent = 'نقدم أفضل الخدمات لعملائنا الكرام';
    if (sectionSubtitles[1]) sectionSubtitles[1].textContent = 'اكتشف أجمل المدن حول العالم';
    if (sectionSubtitles[2]) sectionSubtitles[2].textContent = 'احصل على أفضل العروض والخصومات';
}

// Scroll Effects
function initScrollEffects() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .destination-card, .offer-card').forEach(el => {
        observer.observe(el);
    });
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showError(input, 'هذا الحقل مطلوب');
            isValid = false;
        } else {
            clearError(input);
        }
    });
    
    // Date validation
    const departureDate = form.querySelector('input[name="departure"]');
    const returnDate = form.querySelector('input[name="return"]');
    
    if (departureDate && returnDate && departureDate.value && returnDate.value) {
        if (new Date(returnDate.value) <= new Date(departureDate.value)) {
            showError(returnDate, 'تاريخ العودة يجب أن يكون بعد تاريخ المغادرة');
            isValid = false;
        }
    }
    
    return isValid;
}

function showError(input, message) {
    clearError(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = '#ef4444';
}

function clearError(input) {
    const errorDiv = input.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    input.style.borderColor = '';
}

// Animations
function initAnimations() {
    // Add animation classes
    const animatedElements = document.querySelectorAll('.feature-card, .destination-card, .offer-card');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Destinations Filter Function
function initDestinationsFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const destinationCards = document.querySelectorAll('.destination-card');
    
    if (filterButtons.length === 0 || destinationCards.length === 0) {
        return; // Exit if not on destinations page
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter destination cards
            destinationCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    const cardCategories = card.getAttribute('data-category');
                    if (cardCategories && cardCategories.includes(filterValue)) {
                        card.style.display = 'block';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
            
            // Add animation effect
            setTimeout(() => {
                destinationCards.forEach((card, index) => {
                    if (card.style.display !== 'none') {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }
                });
            }, 100);
        });
    });
}

// Global functions for external use
window.showNotification = showNotification;
window.toggleLanguage = toggleLanguage; 
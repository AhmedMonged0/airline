// Booking System JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initBookingForm();
    initDateValidation();
    initPassengerCounter();
    initFlightSearch();
});

// Booking Form Initialization
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;
    
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Set minimum date for departure
    const departureInput = document.getElementById('departure');
    if (departureInput) {
        const today = new Date().toISOString().split('T')[0];
        departureInput.min = today;
    }
}

// Handle Booking Form Submit
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        from: formData.get('from'),
        to: formData.get('to'),
        departure: formData.get('departure'),
        return: formData.get('return'),
        passengers: formData.get('passengers'),
        class: formData.get('class'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        special_requests: formData.get('special_requests')
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً.', 'success');
            e.target.reset();
            
            // Show booking details modal
            showBookingDetails(result.booking);
        } else {
            showNotification(result.message || 'حدث خطأ في إرسال طلب الحجز.', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showNotification('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Date Validation
function initDateValidation() {
    const departureInput = document.getElementById('departure');
    const returnInput = document.getElementById('return');
    
    if (departureInput && returnInput) {
        departureInput.addEventListener('change', function() {
            returnInput.min = this.value;
            
            // If return date is before departure date, clear it
            if (returnInput.value && returnInput.value <= this.value) {
                returnInput.value = '';
            }
        });
        
        returnInput.addEventListener('change', function() {
            if (this.value && this.value <= departureInput.value) {
                showNotification('تاريخ العودة يجب أن يكون بعد تاريخ المغادرة', 'error');
                this.value = '';
            }
        });
    }
}

// Passenger Counter
function initPassengerCounter() {
    const passengerSelect = document.getElementById('passengers');
    if (!passengerSelect) return;
    
    // Add event listener for passenger count changes
    passengerSelect.addEventListener('change', function() {
        updatePassengerFields(this.value);
    });
}

function updatePassengerFields(count) {
    const passengerFieldsContainer = document.getElementById('passenger-fields');
    if (!passengerFieldsContainer) return;
    
    // Clear existing fields
    passengerFieldsContainer.innerHTML = '';
    
    // Add fields for each passenger
    for (let i = 1; i <= count; i++) {
        const passengerField = document.createElement('div');
        passengerField.className = 'passenger-field';
        passengerField.innerHTML = `
            <h4>المسافر ${i}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label for="passenger_${i}_name">الاسم الكامل</label>
                    <input type="text" id="passenger_${i}_name" name="passenger_${i}_name" required>
                </div>
                <div class="form-group">
                    <label for="passenger_${i}_passport">رقم جواز السفر</label>
                    <input type="text" id="passenger_${i}_passport" name="passenger_${i}_passport" required>
                </div>
            </div>
        `;
        passengerFieldsContainer.appendChild(passengerField);
    }
}

// Flight Search
function initFlightSearch() {
    const searchForm = document.getElementById('flight-search-form');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', handleFlightSearch);
}

async function handleFlightSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchData = {
        from: formData.get('from'),
        to: formData.get('to'),
        departure: formData.get('departure'),
        return: formData.get('return'),
        passengers: formData.get('passengers'),
        class: formData.get('class')
    };
    
    // Show loading state
    const searchBtn = e.target.querySelector('button[type="submit"]');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';
    searchBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show search results
        showFlightResults(searchData);
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('حدث خطأ في البحث. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }
}

// Show Flight Results
function showFlightResults(searchData) {
    const resultsContainer = document.getElementById('flight-results');
    if (!resultsContainer) return;
    
    // Mock flight data
    const flights = [
        {
            id: 1,
            airline: 'شركة الطيران العربية',
            flightNumber: 'AR123',
            departure: '08:00',
            arrival: '10:30',
            duration: '2h 30m',
            price: 1299,
            class: 'economy'
        },
        {
            id: 2,
            airline: 'شركة الطيران العربية',
            flightNumber: 'AR456',
            departure: '14:00',
            arrival: '16:30',
            duration: '2h 30m',
            price: 1499,
            class: 'business'
        },
        {
            id: 3,
            airline: 'شركة الطيران العربية',
            flightNumber: 'AR789',
            departure: '20:00',
            arrival: '22:30',
            duration: '2h 30m',
            price: 999,
            class: 'economy'
        }
    ];
    
    resultsContainer.innerHTML = `
        <div class="search-results-header">
            <h3>نتائج البحث</h3>
            <p>من ${searchData.from} إلى ${searchData.to} - ${searchData.departure}</p>
        </div>
        <div class="flights-list">
            ${flights.map(flight => `
                <div class="flight-card">
                    <div class="flight-info">
                        <div class="flight-airline">
                            <h4>${flight.airline}</h4>
                            <span class="flight-number">${flight.flightNumber}</span>
                        </div>
                        <div class="flight-times">
                            <div class="departure">
                                <span class="time">${flight.departure}</span>
                                <span class="city">${searchData.from}</span>
                            </div>
                            <div class="flight-duration">
                                <i class="fas fa-plane"></i>
                                <span>${flight.duration}</span>
                            </div>
                            <div class="arrival">
                                <span class="time">${flight.arrival}</span>
                                <span class="city">${searchData.to}</span>
                            </div>
                        </div>
                        <div class="flight-class">
                            <span class="class-badge ${flight.class}">${getClassText(flight.class)}</span>
                        </div>
                    </div>
                    <div class="flight-price">
                        <div class="price">
                            <span class="amount">${flight.price}</span>
                            <span class="currency">ريال</span>
                        </div>
                        <button class="btn btn-primary" onclick="selectFlight(${flight.id})">
                            اختر هذه الرحلة
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    resultsContainer.style.display = 'block';
}

function getClassText(flightClass) {
    const classes = {
        'economy': 'اقتصادية',
        'business': 'رجال الأعمال',
        'first': 'الدرجة الأولى'
    };
    return classes[flightClass] || flightClass;
}

// Select Flight
function selectFlight(flightId) {
    showNotification('تم اختيار الرحلة بنجاح!', 'success');
    
    // Redirect to booking page with flight details
    setTimeout(() => {
        window.location.href = `/booking?flight=${flightId}`;
    }, 1500);
}

// Show Booking Details Modal
function showBookingDetails(booking) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تفاصيل الحجز</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="booking-details">
                    <div class="detail-row">
                        <span class="label">رقم الحجز:</span>
                        <span class="value">${booking.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">من:</span>
                        <span class="value">${booking.from}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">إلى:</span>
                        <span class="value">${booking.to}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">تاريخ المغادرة:</span>
                        <span class="value">${booking.departure}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">عدد الركاب:</span>
                        <span class="value">${booking.passengers}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">فئة المقعد:</span>
                        <span class="value">${getClassText(booking.class)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">الحالة:</span>
                        <span class="value status-pending">قيد المراجعة</span>
                    </div>
                </div>
                <div class="booking-note">
                    <p><strong>ملاحظة:</strong> سنتواصل معك خلال 24 ساعة لتأكيد الحجز وتفاصيل الدفع.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal()">حسناً</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        .modal-content {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-body {
            padding: 1.5rem;
        }
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        .booking-details {
            margin-bottom: 1.5rem;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .status-pending {
            color: #f59e0b;
            font-weight: 600;
        }
        .booking-note {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
        }
    `;
    document.head.appendChild(style);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Global functions
window.selectFlight = selectFlight;
window.closeModal = closeModal; 
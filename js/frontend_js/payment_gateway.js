// ===== PAYMENT GATEWAY PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    
    // Payment Method tab switching logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const paymentContent = document.querySelector('.payment-content');
    const gcashNumberField = document.querySelector('.form-field:has(#gcashNumber)');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get payment method
            const method = this.dataset.method;
            paymentContent.setAttribute('data-active', method);
            
            // Show/hide QR section and screenshot field based on method
            if (method === 'cash') {
                gcashNumberField.style.display = 'none';
            } else {
                gcashNumberField.style.display = 'flex';
            }
        });
    });

    // Form submission. TODO: Add proper backend functionality
    const confirmButton = document.querySelector('.btn-confirm');
    
    confirmButton.addEventListener('click', function(e) {
        e.preventDefault();
        

        // TODO: Data should be retrieved from database
        const activeMethod = document.querySelector('.tab-btn.active').dataset.method;
        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const appointmentTime = document.getElementById('appointmentTime').value;
        const appointmentType = document.getElementById('appointmentType').value;
        
        // Validate screenshot for GCash payment
        if (activeMethod === 'gcash') {
            const screenshotInput = document.getElementById('gcashNumber');
            
            if (!screenshotInput.files || screenshotInput.files.length === 0) {
                alert('Please upload a screenshot of your GCash payment.');
                return;
            }
        }
        
        // Create payment data object for DB operation. (prepared in advance)
        const paymentData = {
            paymentMethod: activeMethod,
            fullName: fullName,
            username: username,
            email: email,
            appointmentTime: appointmentTime,
            appointmentType: appointmentType,
            timestamp: new Date().toISOString()
        };
        
        console.log('Payment Data:', paymentData);
        
        // Show success message
        alert(`Payment ${activeMethod === 'gcash' ? 'receipt uploaded' : 'confirmed'}! Your appointment is being processed.`);
        
        // TODO: ADD BACKEND FUNCTIONALITY
  
    });

    // File input preview
    const fileInput = document.getElementById('gcashNumber');
    
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            console.log('Screenshot uploaded:', fileName);
        
        }
    });

    // Generate QR Code (placeholder functionality. TODO: ADD DATABASE RETRIEVAL)
    function generateQRCode() {
        const qrImage = document.getElementById('qrCodeImage');
        
    }
    
    // Call on page load
    generateQRCode();
});
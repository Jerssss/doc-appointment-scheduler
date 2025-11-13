// Frontend codes for bookingdetails.html. Handles mode switching logic

document.addEventListener('DOMContentLoaded', function() {
    
    // Toggle buttons for consultation type
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
        });
    });

    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const consultationType = document.querySelector('.toggle-btn.active').dataset.type;
        const schedule = document.getElementById('schedule').value;
        const reason = document.getElementById('reason').value;
        const prescriptions = document.getElementById('prescriptions').value;
        
        // Validate required fields
        if (!schedule || !reason) {
            alert('Please fill in all required fields marked with *');
            return;
        }
        
        // Create booking object
        const bookingData = {
            consultationType: consultationType,
            schedule: schedule,
            reason: reason,
            prescriptions: prescriptions,
            doctor: 'Bernard Sebasthian Molina',
            timestamp: new Date().toISOString()
        };
        
        console.log('Booking Data:', bookingData);
        
        // Show confirmation
        alert('Booking confirmed! You will receive a confirmation email shortly.');
        

        // TODO ADD BACKEND LOGIC
    });

    // Cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    
    cancelBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel this booking?')) {
            window.location.href = 'book.html';
        }
    });

    // Set minimum date/time to current date/time
    const scheduleInput = document.getElementById('schedule');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    scheduleInput.min = now.toISOString().slice(0, 16);
});
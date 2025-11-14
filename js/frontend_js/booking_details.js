document.addEventListener('DOMContentLoaded', async function () {
    // Retrieve selected doctor from localStorage
    const selectedDoctor = JSON.parse(localStorage.getItem('selectedDoctor'));


    if (!selectedDoctor) {
        alert('No doctor selected. Redirecting...');
        window.location.href = 'list_of_doctors.html';
        return;
    }


    // Insert doctor name into page if needed
    const doctorNameElement = document.getElementById('doctorName');
    if (doctorNameElement) {
        doctorNameElement.textContent = selectedDoctor.name;
    }


    // Toggle buttons for consultation type
    const toggleButtons = document.querySelectorAll('.toggle-btn');


    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });


    const bookingForm = document.getElementById('bookingForm');


    bookingForm.addEventListener('submit', async function (e) {
        e.preventDefault();


        const consultationType = document.querySelector('.toggle-btn.active').dataset.type;
        const schedule = document.getElementById('schedule').value;
        const reason = document.getElementById('reason').value;
        const prescriptions = document.getElementById('prescriptions').value;


        if (!schedule || !reason) {
            alert('Please fill in all required fields.');
            return;
        }


        const bookingData = {
            consultationType: consultationType,
            schedule: schedule,
            reason: reason,
            prescriptions: prescriptions,
            doctor_id: selectedDoctor.user_id,
            doctor_name: selectedDoctor.name,
            timestamp: new Date().toISOString()
        };


        try {
            const response = await fetch('php/create_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });


            const result = await response.json();


            if (result.success) {
                alert('Booking confirmed successfully.');
                window.location.href = 'history.html';
            } else {
                alert('Failed to confirm booking.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while booking.');
        }
    });


    const cancelBtn = document.querySelector('.btn-cancel');
    cancelBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to cancel this booking?')) {
            window.location.href = 'list_of_doctors.html';
        }
    });
});
// ===== PAYMENT GATEWAY PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', async function() {

    // Payment Method tab switching logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const paymentContent = document.querySelector('.payment-content');
    const gcashNumberField = document.querySelector('.form-field:has(#gcashNumber)');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const method = this.dataset.method;
            paymentContent.setAttribute('data-active', method);
            gcashNumberField.style.display = (method === 'gcash') ? 'flex' : 'none';
        });
    });

    // Fetch patient & appointment info from backend
    try {
        const res = await fetch('includes/get_payment_info.php');
        const data = await res.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        document.getElementById('fullName').value = data.patient_name;
        document.getElementById('username').value = data.username;
        document.getElementById('email').value = data.email;
        document.getElementById('appointmentTime').value = data.appointment_time;
        document.getElementById('appointmentType').value = data.appointment_type;

        document.querySelector('.qr-doctor').textContent = data.doctor_name;

        // store appointment_id globally for submission
        window.currentAppointmentId = data.appointment_id;

    } catch (err) {
        console.error('Error fetching payment info:', err);
        alert('Unable to load payment information.');
    }

    // Confirm payment submission
    const confirmButton = document.querySelector('.btn-confirm');
    confirmButton.addEventListener('click', async function(e) {
        e.preventDefault();
        const activeMethod = document.querySelector('.tab-btn.active').dataset.method;
        let screenshotFile = null;

        if (activeMethod === 'gcash') {
            const input = document.getElementById('gcashNumber');
            if (!input.files || input.files.length === 0) {
                alert('Please upload a GCash screenshot.');
                return;
            }
            screenshotFile = input.files[0];
        }

        // Create FormData to send to backend
        const formData = new FormData();
        formData.append('appointment_id', window.currentAppointmentId);
        formData.append('payment_method', activeMethod);
        if (screenshotFile) formData.append('gcash_screenshot', screenshotFile);

        try {
            const res = await fetch('includes/create_payment.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (result.success) {
                alert('Payment recorded successfully!');
            } else {
                alert(result.error || 'Payment failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting payment.');
        }
    });

    // Optional: Preview uploaded screenshot
    const fileInput = document.getElementById('gcashNumber');
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            console.log('Screenshot uploaded:', fileName);
        }
    });
});

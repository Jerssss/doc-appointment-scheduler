document.addEventListener("DOMContentLoaded", function() {

    // First check if the user is actually logged in
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || user.role !== 'patient') {
        alert('Please login as a patient to book an appointment.');
        window.location.href = 'login.html';
        return;
    }


    // Get selected doctor from localStorage
    const doctor = JSON.parse(localStorage.getItem("selectedDoctor"));

    if (!doctor) {
        alert("No doctor selected. Redirecting...");
        window.location.href = "list_of_doctors.html";
        return;
    }

    // Clean doctor name to avoid duplicate "Dr."
    const cleanName = (doctor.full_name || "Doctor").replace(/^Dr\.?\s+/i, '');

    // Populate doctor card
    const doctorImageEl = document.getElementById("doctorImage");
    const doctorSpecialtyEl = document.getElementById("doctorSpecialty");
    const doctorNameEl = document.getElementById("doctorName");
    const doctorMessageEl = document.getElementById("doctorMessage");

    doctorImageEl.src = doctor.profile_image || "images/default-doctor.png";
    doctorImageEl.alt = cleanName;
    doctorSpecialtyEl.textContent = doctor.specialization || "General Consultant";
    doctorNameEl.textContent = cleanName;
    doctorMessageEl.textContent = `Hi! I am Dr. ${cleanName}. Before we officially book your appointment, please enter the necessary information.`;

    // Toggle buttons for consultation type
    const toggleBtns = document.querySelectorAll(".toggle-btn");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            toggleBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Form submission
    const bookingForm = document.getElementById("bookingForm");
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const selectedBtn = document.querySelector(".toggle-btn.active");
        if (!selectedBtn) {
            alert("Please select a consultation type.");
            return;
        }

        const selectedMode = selectedBtn.dataset.type;
        const time = document.getElementById("schedule").value;
        const reason = document.getElementById("reason").value.trim();
        const prescriptions = document.getElementById("prescriptions").value.trim();

        if (!time || !reason) {
            alert("Please fill in the schedule and reason.");
            return;
        }

        // Get user info from sessionStorage
        const userEmail = user.email;

        const notes = prescriptions ? `${reason} | Prescriptions: ${prescriptions}` : reason;

        const payload = {
            patient_id: user.user_id, // Now dynamic
            doctor_id: doctor.user_id?.$oid || doctor.user_id, // Added fallback 
            mode: selectedMode,
            time: time,
            notes: notes,

            // Optional patient info. Static null fields for now
            age: document.getElementById("age")?.value || null,
            gender: document.getElementById("gender")?.value || null,
            address: document.getElementById("address")?.value || null,
            temperature: document.getElementById("temperature")?.value || null,
            blood_pressure: document.getElementById("blood_pressure")?.value || null,
            heart_rate: document.getElementById("heart_rate")?.value || null,
            height_weight: document.getElementById("height_weight")?.value || null
        };

        // Debug
        console.log("PAYLOAD BEING SENT:", payload);

        try {
            const res = await fetch("includes/create_booking.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                alert("Booking confirmed!");
                window.location.href = "history.html";
            } else {
                alert("Booking failed: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Booking failed due to server error.");
        }
    });

    // Cancel button
    document.querySelector(".btn-cancel").addEventListener("click", () => {
        window.location.href = "list_of_doctors.html";
    });

    // Schedule input: disable past dates and round to nearest 30 minutes
    const scheduleInput = document.getElementById("schedule");
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0); // round up to next 30-min
    const pad = (num) => String(num).padStart(2, "0");
    scheduleInput.min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // Round manually entered time up to nearest 30-min
    scheduleInput.addEventListener("change", () => {
        const selected = new Date(scheduleInput.value);
        let mins = selected.getMinutes();

        // Always round UP to the next 30-minute block
        let newMins = Math.ceil(mins / 30) * 30;

        // If rounding hits 60, increase hour
        if (newMins === 60) {
            selected.setHours(selected.getHours() + 1);
            newMins = 0;
        }

        selected.setMinutes(newMins, 0, 0);

        // Format back to datetime-local
        const pad = (n) => String(n).padStart(2, "0");
        scheduleInput.value =
            `${selected.getFullYear()}-${pad(selected.getMonth() + 1)}-${pad(selected.getDate())}T${pad(selected.getHours())}:${pad(selected.getMinutes())}`;
    });
});

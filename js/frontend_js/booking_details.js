document.addEventListener("DOMContentLoaded", () => {
    // Get selected doctor from localStorage
    const doctor = JSON.parse(localStorage.getItem("selectedDoctor"));

    if (!doctor) {
        alert("No doctor selected. Redirecting...");
        window.location.href = "list_of_doctors.html";
        return;
    }

    // Clean doctor name to avoid "Dr. Dr." duplication
    const cleanName = (doctor.full_name || doctor.user_name || "Doctor").replace(/^Dr\.?\s+/i, '');

    // Populate doctor card
    const doctorImageEl = document.getElementById("doctorImage");
    const doctorSpecialtyEl = document.getElementById("doctorSpecialty");
    const doctorNameEl = document.getElementById("doctorName");
    const doctorMessageEl = document.getElementById("doctorMessage");

    doctorImageEl.src = doctor.profile_image || "images/default-doctor.png";
    doctorImageEl.alt = cleanName;
    doctorSpecialtyEl.textContent = doctor.specialization || "General Consultant";
    doctorNameEl.textContent = cleanName;
    doctorMessageEl.textContent = `Hi! I am Dr. ${cleanName}. Before we officially get you booked for an appointment, please enter the necessary information!`;

    // Consultation type toggle buttons
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

        const selectedMode = document.querySelector(".toggle-btn.active").dataset.type;
        const time = document.getElementById("schedule").value;
        const reason = document.getElementById("reason").value;
        const prescriptions = document.getElementById("prescriptions").value;

        const payload = {
            patient_id: localStorage.getItem("user_id") || "PATIENT_ID_PLACEHOLDER",
            doctor_id: doctor.user_id,
            mode: selectedMode,
            time: time,
            notes: reason + (prescriptions ? ` | Prescriptions: ${prescriptions}` : "")
        };

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
    // Disable past dates and restrict to 30-min increments
    const scheduleInput = document.getElementById("schedule");

    const now = new Date();
    // Round up to next 30-minute interval
    const roundedMinutes = now.getMinutes() % 30 === 0 ? now.getMinutes() : now.getMinutes() + (30 - now.getMinutes() % 30);
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    scheduleInput.min = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Optional: round any manually entered time to nearest 30-minute step
    scheduleInput.addEventListener("change", () => {
        const selected = new Date(scheduleInput.value);
        const mins = selected.getMinutes();
        const rounded = Math.round(mins / 30) * 30;
        selected.setMinutes(rounded);
        selected.setSeconds(0);
        scheduleInput.value = selected.toISOString().slice(0, 16);
    });
});

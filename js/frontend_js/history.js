document.addEventListener("DOMContentLoaded", () => {
    const stored = sessionStorage.getItem("user");

    if (!stored) {
        alert("You must log in first");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(stored);
    const userId = user.user_id;

    loadHistory(userId);
});

async function loadHistory(userId) {
    try {
        const res = await fetch(
            `http://localhost/9468_it313-teamarc_mediko/includes/get_consultations.php?user_id=${userId}`
        );
        const data = await res.json();
        console.log(data);

        renderUpcoming(data);
        renderPast(data);

    } catch (err) {
        console.error("Error loading history:", err);
    }
}

/* ========== UPCOMING ========== */
function renderUpcoming(history) {
    const container = document.getElementById("upcoming-cards");
    container.innerHTML = "";

    const upcoming = history.filter(item =>
        item.status === "pending" ||
        item.status === "approved" ||
        item.status === "scheduled"
    );

    if (!upcoming.length) {
        container.innerHTML = `<p>No upcoming consultations.</p>`;
        return;
    }

    upcoming.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${item.doctor_img}" alt="Doctor Image">

            <div class="card-info">
                <h3>${formatConsultationTitle(item)}</h3>

                <p class="schedule">${formatDate(item.time)}</p>

                <p class="note">Please wait for further instructions. Messages will be sent via inbox.</p>
            </div>
        `;

        container.appendChild(card);
    });
}

/* ========== PAST ========== */
function renderPast(history) {
    const container = document.getElementById("past-cards");
    container.innerHTML = "";

    const past = history.filter(item =>
        item.status === "completed" || item.status === "done"
    );

    if (!past.length) {
        container.innerHTML = `<p>No past consultations.</p>`;
        return;
    }

    past.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${item.doctor_img}" alt="Doctor Image">

            <div class="card-info">
                <h3>${formatConsultationTitle(item)}</h3>
                <p class="schedule">${formatDate(item.time)}</p>
            </div>

            <button class="rate-btn" onclick="openRatingModal('${item.appointment_id}')">
                RATE
            </button>
        `;

        container.appendChild(card);
    });
}

/* ========== HELPERS ========== */
function formatConsultationTitle(item) {
    if (item.mode.toLowerCase() === "virtual") {
        return `Virtual Consultation with ${item.doctor_name}`;
    }
    return `Face-to-face Checkup with ${item.doctor_name}`;
}

function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    // Example: August 10, 2025, 10:00 AM
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

/* ========== RATE BUTTON HANDLER ========== */
function openRatingModal(appointmentId) {
    //TODO: Implement rating modal
    alert("Rate feature coming soon. Appointment ID: " + appointmentId);
}

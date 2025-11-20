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

    initializeRatingModal();
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

            <button class="rate-btn" data-appointment="${item.appointment_id}">
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

    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

/* ============================================================
   RATING MODAL (FULL FUNCTIONALITY)
   ============================================================ */

let selectedRating = 0;
let selectedAppointmentId = null;

function initializeRatingModal() {
    const modal = document.getElementById("rateModal");
    const closeBtn = document.querySelector(".close-modal");
    const stars = document.querySelectorAll(".star");
    const submitBtn = document.querySelector(".submit-rating");

    // OPEN MODAL (delegated listener)
    document.addEventListener("click", function(evt) {
        if (evt.target.classList.contains("rate-btn")) {
            selectedAppointmentId = evt.target.dataset.appointment;
            selectedRating = 0;

            stars.forEach(s => s.classList.remove("active"));

            modal.style.display = "flex";
        }
    });

    // CLOSE MODAL
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // CLICK OUTSIDE TO CLOSE
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // STAR LOGIC
    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.star);

            stars.forEach(s => {
                s.classList.remove("active");
                if (parseInt(s.dataset.star) <= selectedRating) {
                    s.classList.add("active");
                }
            });
        });
    });

    // SUBMIT RATING
    submitBtn.addEventListener("click", () => {
        if (selectedRating === 0) {
            // Small feedback (no alert)
            stars.forEach(s => {
                s.style.transform = "scale(1.15)";
                setTimeout(() => s.style.transform = "scale(1)", 150);
            });
            return;
        }

        console.log("Rating submitted:", {
            appointment_id: selectedAppointmentId,
            stars: selectedRating,
        });

        modal.style.display = "none";
    });
}

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

/* ============================================================
// LOAD HISTORY
============================================================ */
async function loadHistory(userId) {
    try {
        const res = await fetch(
            `http://localhost/9468_it313-teamarc_mediko/includes/get_consultations.php?user_id=${userId}`
        );
        const data = await res.json();
        console.log(data);

        renderUpcoming(data);
        renderPast(data);
        initializeRatingModal();

    } catch (err) {
        console.error("Error loading history:", err);
    }
}

/* ============================================================
// UPCOMING
============================================================ */
function renderUpcoming(history) {
    const container = document.getElementById("upcoming-cards");
    container.innerHTML = "";

    const upcoming = history.filter(item =>
        item.status === "pending" || item.status === "approved" || item.status === "scheduled"
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

/* ============================================================
// PAST
============================================================ */
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

            <button class="rate-btn" 
                data-doctor="${item.doctor_id}">
            RATE
            </button>`;
        container.appendChild(card);
    });
}

/* ============================================================
// HELPERS
============================================================ */
function formatConsultationTitle(item) {
    return item.mode.toLowerCase() === "virtual" 
        ? `Virtual Consultation with ${item.doctor_name}`
        : `Face-to-face Checkup with ${item.doctor_name}`;
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
// RATING MODAL
============================================================ */
let selectedRating = 0;
let selectedDoctorId = null;

function initializeRatingModal() {
    const modal = document.getElementById("rateModal");
    const closeBtn = document.querySelector(".close-modal");
    const submitBtn = document.querySelector(".submit-rating");
    const stars = document.querySelectorAll(".star");

    // OPEN MODAL
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("rate-btn")) {
            selectedDoctorId = e.target.dataset.doctor;
            selectedRating = 0;
            stars.forEach(s => s.classList.remove("active", "hovered"));
            modal.style.display = "flex";
        }
    });

    // CLOSE MODAL
    closeBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    // STAR LOGIC
    stars.forEach(star => {
        star.addEventListener("mouseover", () => {
            const hoverVal = parseInt(star.dataset.value);
            stars.forEach(s => {
                const val = parseInt(s.dataset.value);
                s.classList.toggle("hovered", val <= hoverVal);
                s.classList.remove("active");
            });
        });

        star.addEventListener("mouseout", () => {
            stars.forEach(s => s.classList.remove("hovered"));
            highlightStars(selectedRating);
        });

        star.addEventListener("click", () => {
            selectedRating = parseInt(star.dataset.value);
            highlightStars(selectedRating);
        });
    });

    // SUBMIT RATING
    submitBtn.addEventListener("click", async () => {
        if (selectedRating === 0) return;

        if (!selectedDoctorId) {
            console.error("No doctor selected for rating!");
            return;
        }

        try {
            const res = await fetch(
                "http://localhost/9468_it313-teamarc_mediko/includes/rate_doctor.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        doctor_id: selectedDoctorId,
                        rating: selectedRating
                    })
                }
            );

            const result = await res.json();
            if (result.success) {
                alert("Rating submitted!");
                modal.style.display = "none";
                location.reload();
            } else {
                alert("Failed: " + (result.msg || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
        }
    });
}

/* ============================================================
// STAR HIGHLIGHTING
============================================================ */
function highlightStars(count) {
    const stars = document.querySelectorAll(".star");
    stars.forEach(star => {
        const value = parseInt(star.dataset.value);
        star.classList.toggle("active", value <= count);
    });
}

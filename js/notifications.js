document.addEventListener("DOMContentLoaded", async () => {
    const notifContainer = document.getElementById("notifContainer");

    // Get logged-in user
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || user.role !== "patient") {
        notifContainer.innerHTML = "<p>Please log in as a patient to see notifications.</p>";
        return;
    }

    const patientId = user.user_id?.$oid || user.user_id;

    try {
        const res = await fetch("includes/get_notifications.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patient_id: patientId })
        });

        const data = await res.json();

        if (!data.success) {
            notifContainer.innerHTML = `<p>${data.error || "Failed to load notifications."}</p>`;
            return;
        }

        const notifications = data.notifications;
        if (notifications.length === 0) {
            notifContainer.innerHTML = "<p>No notifications yet.</p>";
            return;
        }

        notifications.forEach(notif => {
            const div = document.createElement("div");
            div.classList.add("notif-card");

            const timestamp = notif.accepted_at || notif.time;

            div.innerHTML = `
                <h3>${notif.type === "appointment_accepted" ? "Appointment Accepted" : "Booking Created"}</h3>
                <p>${notif.message}</p>
                <p><strong>Doctor:</strong> ${notif.doctor_name || "TBA"}</p>
                <small>${new Date(timestamp).toLocaleString()}</small>
            `;

            if (notif.type === "appointment_accepted") {
                const btn = document.createElement("button");
                btn.textContent = "Proceed to Payment";
                btn.classList.add("pay-btn");

                // Always include doctor_name in pending_payment
                btn.onclick = () => {
                    sessionStorage.setItem("pending_payment", JSON.stringify({
                        appointment_id: notif.appointment_id,
                        doctor_name: notif.doctor_name || "TBA", 
                        time: notif.time,
                        mode: notif.mode
                    }));
                    window.location.href = "payment_gateway.html";
                };

                div.appendChild(btn);
            }

            notifContainer.appendChild(div);
        });

    } catch (err) {
        console.error("Failed to parse JSON:", err);
        notifContainer.innerHTML = "<p>Error loading notifications.</p>";
    }
});

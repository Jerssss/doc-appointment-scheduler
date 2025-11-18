document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const paymentData = JSON.parse(sessionStorage.getItem("pending_payment"));

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    if (!paymentData) {
        alert("No payment session found.");
        window.location.href = "history.html";
        return;
    }

    // Populate fields safely from sessionStorage
    document.getElementById("fullName").value = user.full_name || user.user_name || "";
    document.getElementById("username").value = user.username || "";
    document.getElementById("email").value = user.user_email || user.email || "";
    document.getElementById("appointmentTime").value = paymentData.time
        ? new Date(paymentData.time).toLocaleString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })
        : "";
    document.getElementById("appointmentType").value = (paymentData.mode || "Virtual") + " Consultation / Checkup";
    document.getElementById("doctorName").textContent = paymentData.doctor_name || "";

    // Payment method toggle
    const tabBtns = document.querySelectorAll(".tab-btn");
    let selectedMethod = "gcash";

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedMethod = btn.dataset.method;

            const gcashField = document.getElementById("gcashUploadField");
            gcashField.style.display = selectedMethod === "gcash" ? "block" : "none";
        });
    });

    document.getElementById("gcashUploadField").style.display = selectedMethod === "gcash" ? "block" : "none";

    // Confirm button
    const payBtn = document.querySelector(".btn-confirm");
    payBtn.addEventListener("click", async () => {
        try {
            let payload;

            if (selectedMethod === "gcash") {
                const fileInput = document.getElementById("gcashFile");
                if (!fileInput.files.length) {
                    alert("Please upload GCash screenshot");
                    return;
                }

                payload = new FormData();
                payload.append("appointment_id", paymentData.appointment_id);
                payload.append("payment_method", "gcash");
                payload.append("amount", paymentData.fee);
                payload.append("gcash_screenshot", fileInput.files[0]);
            } else {
                payload = {
                    appointment_id: paymentData.appointment_id,
                    payment_method: selectedMethod,
                    amount: paymentData.fee
                };
            }

            const res = await fetch("includes/create_payment.php", {
                method: "POST",
                body: selectedMethod === "gcash" ? payload : JSON.stringify(payload),
                headers: selectedMethod === "gcash" ? {} : { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (data.success) {
                alert("Payment successful!");
                sessionStorage.removeItem("pending_payment");
                window.location.href = "history.html";
            } else {
                alert("Payment failed: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Payment failed due to server error.");
        }
    });
});

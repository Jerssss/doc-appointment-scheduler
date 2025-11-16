// js/login.js
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");

    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost/9468_it313-teamarc_mediko/includes/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);

                // Save user info in sessionStorage for later use
                sessionStorage.setItem("user", JSON.stringify(data.user));

                // Redirect based on role
                if (data.user.role === "admin") {
                    window.location.href = "admin.html";
                } else if (data.user.role === "patient") {
                    window.location.href = "index.html";
                } else {
                    // Doctors or other roles can go to their dashboard
                    window.location.href = "doctor-dashboard.html";
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});

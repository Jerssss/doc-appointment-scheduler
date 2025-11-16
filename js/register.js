// Register Button
document.querySelector(".register-btn").addEventListener("click", async () => {
    const username = document.querySelector("#reg-username").value.trim();
    const fullName = document.querySelector("#reg-fullname").value.trim();
    const dob = document.querySelector("#reg-dob").value.trim();
    const sex = document.querySelector("#reg-sex").value.trim();
    const contactNumber = document.querySelector("#reg-contact").value.trim();
    const email = document.querySelector("#reg-email").value.trim();
    const address = document.querySelector("#reg-address").value.trim();
    const emergencyName = document.querySelector("#reg-emergency-name").value.trim();
    const emergencyRelationship = document.querySelector("#reg-emergency-relationship").value.trim();
    const emergencyPhone = document.querySelector("#reg-emergency-phone").value.trim();
    const password = document.querySelector("#reg-password").value.trim();
    const confirmPassword = document.querySelector("#reg-confirm").value.trim();

    // Basic validation
    if (!username || !fullName || !dob || !sex || !contactNumber || !email || !address ||
        !emergencyName || !emergencyRelationship || !emergencyPhone || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch("includes/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                fullName,
                dob,
                sex,
                contactNumber,
                email,
                address,
                emergencyName,
                emergencyRelationship,
                emergencyPhone,
                password
            })
        });

        const result = await response.json();
        alert(result.message);

        if (result.success) {
            // redirect after success
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
});

// Cancel Button: clears form
document.querySelector("#cancel-btn").addEventListener("click", () => {
    window.location.href = "login.html";
});
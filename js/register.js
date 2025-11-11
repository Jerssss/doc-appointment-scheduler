document.querySelector(".register-btn").addEventListener("click", async () => {

    const username = document.querySelector("#reg-username").value.trim();
    const contactNumber = document.querySelector("#reg-contact").value.trim();
    const email = document.querySelector("#reg-email").value.trim();
    const address = document.querySelector("#reg-address").value.trim();
    const password = document.querySelector("#reg-password").value.trim();
    const confirmPassword = document.querySelector("#reg-confirm").value.trim();

    // Basic validation
    if (!username || !contactNumber || !email || !address || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const response = await fetch("includes/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            contactNumber,
            email,
            address,
            password
        })
    });

    const result = await response.json();
    alert(result.message);

    if (result.success) {
        // redirect after success
        window.location.href = "login.html";
    }
});

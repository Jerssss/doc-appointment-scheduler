// js/frontend_js/user_patient_profile.js

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Check if logged-in user exists
  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(storedUser);

  // 2. Fetch full user details (because session only stores limited data)
  try {
    const response = await fetch(
      `http://localhost/9468_it313-teamarc_mediko/includes/get_user_by_email.php?email=${user.email}`
    );
    const fullData = await response.json();

    if (fullData.error) {
      console.error(fullData.error);
      alert("Failed to load profile.");
      return;
    }

    // 3. Populate profile fields dynamically
    document.querySelector(".avatar").src = fullData.profile_image || "images/default-patient.png";
    document.querySelector(".name").textContent = fullData.full_name || "Unknown User";

    // Contact
    document.getElementById("email").textContent = fullData.user_email || "—";
    document.getElementById("phone").textContent = fullData.phone || "—";

    // Personal details
    document.getElementById("dob").textContent = fullData.date_of_birth || "—";
    document.getElementById("sex").textContent = fullData.sex || "—";
    document.getElementById("address").textContent = fullData.address || "—";

    // Emergency contact
    document.getElementById("emergency-name").textContent = fullData.emergency_name || "—";
    document.getElementById("emergency-relationship").textContent = fullData.emergency_relationship || "—";
    document.getElementById("emergency-phone").textContent = fullData.emergency_phone || "—";

    // Security section
    document.getElementById("accountCreated").textContent =
      formatAccountDate(fullData.account_created);


  } catch (err) {
    console.error("Profile load error:", err);
  }

  // Logging out
  document.getElementById("logoutBtnMain").addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
  });
});

// Helper to convert timestamps
function formatAccountDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

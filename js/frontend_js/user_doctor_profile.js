document.addEventListener("DOMContentLoaded", async () => {

  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(storedUser);

  if (!user.email) {
    alert("Email not found in session. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`http://localhost/9468_it313-teamarc_mediko/includes/doctor_profile_data.php?email=${encodeURIComponent(user.email)}`);
    const data = await response.json();

    if (!data.success) {
      alert(data.error || "Failed to load profile.");
      console.error(data.error);
      return;
    }

    const doctor = data.doctor;
    const info = doctor.personal_info || {};


    document.getElementById("profileImage").src = doctor.profile_image || "images/default-doctor.png";
    document.getElementById("doctorName").textContent = info.full_name || "—";
    document.getElementById("email").textContent = doctor.user_email || "—";
    document.getElementById("phone").textContent = doctor.contact_info?.phone || "—";

    document.getElementById("specialization").textContent = info.specialization || "—";
    document.getElementById("fee").textContent = info.fee ? `₱${parseFloat(info.fee).toFixed(2)}` : "—";
    document.getElementById("services").textContent = info.services || "—";

    document.getElementById("hospitalName").textContent = info.hospital_name || "—";
    document.getElementById("hospitalPhone").textContent = info.hospital_phone || "—";
    document.getElementById("hospitalAddress").textContent = info.hospital_address || "—";

    document.getElementById("clinicHours").textContent = info.clinic_hours || "—";
    document.getElementById("languages").textContent = info.languages || "—";

    document.getElementById("rating").textContent = info.rating || "—";
    document.getElementById("reviews").textContent = info.reviews || "—";

  } catch (err) {
    console.error("Profile load error:", err);
    alert("Error loading profile. Please try again.");
  }

  document.getElementById("logoutBtnMain")?.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
  });

  document.getElementById("editProfileBtn")?.addEventListener("click", () => {
    alert("Edit Profile UI not implemented yet.");
  });

  document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
    alert("Change Password UI not implemented yet.");
  });

});

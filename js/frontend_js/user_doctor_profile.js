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

  // =========================================
  //          GLOBAL EDIT PROFILE MODE
  // =========================================
  const editProfileBtn = document.getElementById("editProfileBtn");
  let editMode = false;

  editProfileBtn.addEventListener("click", () => {
    editMode = !editMode;

    const allEditButtons = document.querySelectorAll(".edit-btn");

    if (editMode) {
      allEditButtons.forEach(btn => (btn.style.display = "inline-block"));
      editProfileBtn.textContent = "Done Editing";
    } else {
      allEditButtons.forEach(btn => (btn.style.display = "none"));
      editProfileBtn.textContent = "Edit Profile";
    }
  });

  // =========================================
  //       INLINE EDIT SYSTEM
  // =========================================
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const fieldId = btn.dataset.field;
      const valueEl = document.getElementById(fieldId);
      const currentValue = valueEl.textContent;

      valueEl.innerHTML = `<input type="text" class="edit-input" id="input-${fieldId}" value="${currentValue}">`;
      btn.style.display = "none";

      const saveBtn = document.createElement("button");
      saveBtn.className = "save-btn";
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "cancel-btn";
      cancelBtn.textContent = "Cancel";

      btn.parentElement.appendChild(saveBtn);
      btn.parentElement.appendChild(cancelBtn);

      // SAVE
      saveBtn.addEventListener("click", async () => {
        const newValue = document.getElementById(`input-${fieldId}`).value;
        valueEl.textContent = newValue;

        saveBtn.remove();
        cancelBtn.remove();
        if (editMode) btn.style.display = "inline-block";

        // Prepare payload
        try {
          const payload = { user_id: user.user_id };
          if (fieldId === "email") payload.email = newValue;
          if (fieldId === "phone") payload.phone = newValue;

          const res = await fetch(
            "http://localhost/9468_it313-teamarc_mediko/includes/update_doctor_profile.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }
          );

          const result = await res.json();
          if (!result.success) {
            valueEl.textContent = currentValue;
            alert(result.msg || "Failed to update profile.");
            return;
          }

          // update session if email changed
          if (fieldId === "email") {
            const current = JSON.parse(sessionStorage.getItem("user") || "{}");
            current.email = newValue;
            sessionStorage.setItem("user", JSON.stringify(current));
          }

        } catch (e) {
          valueEl.textContent = currentValue;
          console.error(e);
          alert("Error updating profile. Please try again.");
        }
      });

      // CANCEL
      cancelBtn.addEventListener("click", () => {
        valueEl.textContent = currentValue;
        saveBtn.remove();
        cancelBtn.remove();
        if (editMode) btn.style.display = "inline-block";
      });
    });
  });

  // =========================================
  //         PASSWORD EDIT (MODAL)
  // =========================================
  const passwordBtn = document.querySelector(".change-password-edit");
const passwordModal = document.getElementById("passwordModal");

const newPassInput = document.getElementById("newPassInput");
const confirmPassInput = document.getElementById("confirmPassInput");

const cancelPassBtn = document.getElementById("cancelPassBtn");
const savePassBtn = document.getElementById("savePassBtn");

if (passwordBtn) {
  passwordBtn.addEventListener("click", () => {
    passwordModal.style.display = "flex";
  });
}

// CLOSE MODAL
cancelPassBtn.addEventListener("click", () => {
  newPassInput.value = "";
  confirmPassInput.value = "";
  passwordModal.style.display = "none";
});

// SAVE PASSWORD
savePassBtn.addEventListener("click", async () => {
  const newPass = newPassInput.value.trim();
  const confirmPass = confirmPassInput.value.trim();

  if (newPass === "" || confirmPass === "") {
    alert("Please fill out both fields.");
    return;
  }

  if (newPass !== confirmPass) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const res = await fetch(
      "http://localhost/9468_it313-teamarc_mediko/includes/change_password.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: storedUser.user_id,
          new_password: newPass
        })
      }
    );

    const result = await res.json();
    if (!result.success) {
      alert(result.msg || "Failed to change password.");
      return;
    }

    alert("Password updated successfully.");
    passwordModal.style.display = "none";
    newPassInput.value = "";
    confirmPassInput.value = "";
  } catch (err) {
    console.error(err);
    alert("Error changing password. Please try again.");
  }
});

});

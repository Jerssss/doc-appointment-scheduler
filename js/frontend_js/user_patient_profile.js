document.addEventListener("DOMContentLoaded", async () => {

  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(storedUser);

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

    // =============================
    //     FIXED PROFILE IMAGE
    // =============================
    const avatarEl = document.querySelector(".avatar");
    let profileImage = fullData.profile_image;

    if (profileImage && profileImage.trim() !== "") {
      // Prepend your upload directory path
      profileImage = `http://localhost/9468_it313-teamarc_mediko/${profileImage}`;
    } else {
      // If empty, use default
      profileImage = "images/default-patient.png";
    }

    // Check if file exists, if not fallback to default
    fetch(profileImage, { method: "HEAD" })
      .then(res => {
        if (res.ok) {
          avatarEl.src = profileImage;
        } else {
          avatarEl.src = "images/default-patient.png";
        }
      })
      .catch(() => {
        avatarEl.src = "images/default-patient.png";
      });

    // Load name
    document.querySelector(".name").textContent = fullData.full_name || "Unknown User";

    // Load all text fields
    const fields = {
      email: fullData.user_email,
      phone: fullData.phone,
      address: fullData.address,
      "emergency-name": fullData.emergency_name,
      "emergency-relationship": fullData.emergency_relationship,
      "emergency-phone": fullData.emergency_phone
    };

    for (let id in fields) {
      document.getElementById(id).textContent = fields[id] || "—";
    }

    document.getElementById("account-created").textContent =
      new Date(fullData.account_created).toLocaleDateString();

  } catch (err) {
    console.error("Profile load error:", err);
  }

  // LOGOUT
  document.getElementById("logoutBtnMain").addEventListener("click", () => {
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

      // Prevent interfering with the password edit button
      if (fieldId === "password") return;

      const valueEl = document.getElementById(fieldId);
      const currentValue = valueEl.textContent;

      valueEl.innerHTML = `
        <input type="text" class="edit-input" id="input-${fieldId}" value="${currentValue}">
      `;

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

        // update
        try {
          const payload = { user_id: user.user_id };
          if (fieldId === "email") payload.email = newValue;
          if (fieldId === "phone") payload.phone = newValue;
          if (fieldId === "address") payload.address = newValue;
          if (fieldId === "emergency-name") payload.emergency_name = newValue;
          if (fieldId === "emergency-relationship") payload.emergency_relationship = newValue;
          if (fieldId === "emergency-phone") payload.emergency_phone = newValue;

          const res = await fetch(
            "http://localhost/9468_it313-teamarc_mediko/includes/update_patient_profile.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }
          );

          const result = await res.json();
          if (!result.success) {
            // revert UI on failure
            valueEl.textContent = currentValue;
            alert(result.msg || "Failed to update profile.");
            return;
          }

          // keep session in sync if email changed
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

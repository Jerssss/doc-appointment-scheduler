document.addEventListener("DOMContentLoaded", () => {
  const appointmentList = document.querySelector(".appointment-list");
  const patientHeader = document.querySelector(".patient-header");
  const vitalsContainer = document.querySelector(".vitals");
  const searchInput = document.getElementById("searchInput");
  const acceptBtn = document.querySelector(".accept-btn");
  const declineBtn = document.querySelector(".decline-btn");
  const startConsultationBtn = document.querySelector(".start-consultation-btn");

  // DOCTOR SESSION CHECK
  const doctor = JSON.parse(sessionStorage.getItem('user'));
  if (!doctor || doctor.role !== 'doctor') {
    alert("Please log in as a doctor.");
    window.location.href = "login.html";
  }
  const doctorId = doctor.user_id;

  // Patient Info button
  const patientInfoBtn = document.querySelector(".patient-info-btn");

  const escapeHtml = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const getSelectedPatientIdFromDOM = () => {
    const active = appointmentList.querySelector(".appointment-item.active");
    if (!active) return null;
    return active.dataset.patientId || null;
  };


  // Update button states based on appointment status
  const updateButtonStates = (status) => {
    if (status === "in_progress" || status === "completed") {
      // Disable Accept and Decline buttons
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      acceptBtn.style.opacity = "0.5";
      declineBtn.style.opacity = "0.5";
      acceptBtn.style.cursor = "not-allowed";
      declineBtn.style.cursor = "not-allowed";
    } else if (status === "pending") {
      // Enable Accept and Decline buttons
      acceptBtn.disabled = false;
      declineBtn.disabled = false;
      acceptBtn.style.opacity = "1";
      declineBtn.style.opacity = "1";
      acceptBtn.style.cursor = "pointer";
      declineBtn.style.cursor = "pointer";
    } else {
      // For completed or declined (shouldn't normally show these). Will add just in case for proper validation
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      acceptBtn.style.opacity = "0.5";
      declineBtn.style.opacity = "0.5";
      acceptBtn.style.cursor = "not-allowed";
      declineBtn.style.cursor = "not-allowed";
    }

    // Handle the Start Consultation button
    if(startConsultationBtn) {
      if (status === "in_progress") {
        // Enable Start Consultation button
        startConsultationBtn.disabled = false;
        startConsultationBtn.style.opacity = "1";
        startConsultationBtn.style.cursor = "pointer";
        startConsultationBtn.style.backgroundColor = ""; // Reset to default
      } else if (status === "completed") {
        // Disable and gray out for completed appointments
        startConsultationBtn.disabled = true;
        startConsultationBtn.style.opacity = "0.4";
        startConsultationBtn.style.cursor = "not-allowed";
        startConsultationBtn.style.backgroundColor = "#999999";
      } else {
        // Disable for pending or declined appointments
        startConsultationBtn.disabled = true;
        startConsultationBtn.style.opacity = "0.4";
        startConsultationBtn.style.cursor = "not-allowed";
        startConsultationBtn.style.backgroundColor = "#999999";
      }
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await fetch("includes/get_appointments.php?doctor_id=" + encodeURIComponent(doctorId));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const appointments = await res.json();

      if (!Array.isArray(appointments) || appointments.length === 0) {
        appointmentList.innerHTML = `<p class="empty">No appointments available.</p>`;
        return;
      }

      appointmentList.innerHTML = "";

      appointments.forEach((appt, index) => {
        // Normalize IDs to strings
        if (appt._id?.$oid) appt._id = appt._id.$oid;
        if (appt.patient_id?.$oid) appt.patient_id = appt.patient_id.$oid;
        if (appt.doctor_id?.$oid) appt.doctor_id = appt.doctor_id.$oid;

        const item = document.createElement("div");
        item.classList.add("appointment-item");

        if (appt.patient_id) item.dataset.patientId = appt.patient_id;

        if (index === 0) item.classList.add("active");

        const patientName = appt.patient_name || "Unknown Patient";
        const imgSrc = appt.patient_image || "images/default-patient.png";

        const status = (appt.status || 'pending').toString();
        const statusNormalized = status.replace(/_/g, '-');
        const statusMap = {
          pending: 'Pending',
          in_progress: 'In Progress',
          inprogress: 'In Progress',
          'in-progress': 'In Progress',
          completed: 'Completed',
          declined: 'Declined'
        };
        const statusDisplay = statusMap[status] || statusMap[statusNormalized] || (status.charAt(0).toUpperCase() + status.slice(1));

        let displayDate = "No schedule";
        if (appt.time) {
          const dt = new Date(appt.time);
          displayDate = !isNaN(dt)
            ? `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : String(appt.time);
        }

        item.innerHTML = `
          <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(patientName)}" />
          <div class="details">
            <h4>${escapeHtml(patientName)}</h4>
            <p>${escapeHtml(displayDate)}</p>
          </div>
          <div class="meta">
            <span class="status-label status-${escapeHtml(statusNormalized)}">${escapeHtml(statusDisplay)}</span>
          </div>
        `;

        // expose status on DOM element for later use
        item.dataset.status = status;
        item._appt = appt;

        item.addEventListener("click", () => {
          document.querySelectorAll(".appointment-item").forEach(i => i.classList.remove("active"));
          item.classList.add("active");
          if (appt.patient_id) localStorage.setItem("selectedPatientId", appt.patient_id);
          loadPatientInfo(appt);
        });

        appointmentList.appendChild(item);
      });

      // auto-click first appointment
      const firstItem = appointmentList.querySelector(".appointment-item");
      if (firstItem) firstItem.click();

      // search functionality
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const q = searchInput.value.trim().toLowerCase();
          Array.from(appointmentList.querySelectorAll(".appointment-item")).forEach(it => {
            const ap = it._appt || {};
            const name = (ap.patient_name || "").toLowerCase();
            const date = (ap.time || "").toString().toLowerCase();
            it.style.display = !q || name.includes(q) || date.includes(q) ? "" : "none";
          });
        });
      }

    } catch (err) {
      console.error("Error fetching appointments:", err);
      appointmentList.innerHTML = `<p class="error">Unable to load appointments.</p>`;
    }
  };

  const loadPatientInfo = (appt) => {
    // Debug
    console.log("Appointment data:", appt);
    console.log("Appointment status:", appt.status);

    if (!patientHeader) return;

    const patientImg = patientHeader.querySelector("img");
    if (patientImg) {
      patientImg.src = appt.patient_image || "images/default-patient.png";
      patientImg.alt = appt.patient_name || "Patient Image";
    }

    const info = patientHeader.querySelector(".info");
    if (info) {
      const nameEl = info.querySelector("h3");
      if (nameEl) nameEl.textContent = appt.patient_name || "Unknown Patient";

      const pTags = info.querySelectorAll("p");
      if (pTags.length >= 1) pTags[0].textContent = `${appt.age || "N/A"} years old`;
      if (pTags.length >= 2) pTags[1].textContent = appt.user_email || "";
      if (pTags.length >= 3) pTags[2].textContent = appt.contact_info || "";
      if (pTags.length >= 4) pTags[3].textContent = appt.gender || "";
      if (pTags.length >= 5) pTags[4].textContent = appt.address || "";
    }

    if (!vitalsContainer) return;
    const inputs = vitalsContainer.querySelectorAll("input");

    if (inputs.length >= 4) {
      inputs[0].value = appt.temperature || "-";
      inputs[1].value = appt.blood_pressure || "-";
      inputs[2].value = appt.heart_rate || "-";
      inputs[3].value = appt.height_weight || "-";
    }

    // UPDATE BUTTON STATES based on appointment status
    const status = appt.status || "pending";
    updateButtonStates(status);
  };

  if (patientInfoBtn) {
    patientInfoBtn.addEventListener("click", () => {
      const patientId = getSelectedPatientIdFromDOM() || localStorage.getItem("selectedPatientId");
      if (!patientId) { alert("No patient selected."); return; }
      window.location.href = `patient_info.html?id=${encodeURIComponent(patientId)}`;
    });
  }

  // DECLINE APPOINTMENT
  document.querySelector(".decline-btn").addEventListener("click", async () => {
    // Check if button is disabled
    if (declineBtn.disabled) return;
    
    const activeItem = document.querySelector(".appointment-item.active");
    if (!activeItem) { alert("No appointment selected to decline."); return; }

    const appt = activeItem._appt;
    if (!appt || !appt._id) { alert("Cannot decline: Missing appointment ID."); return; }

    if (!confirm("Are you sure you want to decline this appointment?")) return;

    try {
      const res = await fetch("includes/decline_appointment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: appt._id })
      });
      const data = await res.json();
      if (!data.success) { alert(data.error || "Failed to decline appointment."); return; }

      appt.status = "declined";
      activeItem._appt = appt;
      activeItem.remove();

      const remaining = document.querySelector(".appointment-item");
      if (remaining) remaining.click();
      else {
        document.getElementById("patientName").innerText = "No Appointment";
        document.getElementById("patientAge").innerText = "-";
        document.getElementById("patientGender").innerText = "-";
        document.getElementById("patientAddress").innerText = "-";
      }

      alert("Appointment declined successfully.");
    } catch (err) {
      console.error(err);
      alert("Error declining appointment.");
    }
  });

  // ACCEPT APPOINTMENT
  document.querySelector(".accept-btn").addEventListener("click", async () => {

    // Check if button is disabled
    if (acceptBtn.disabled) return;

    const activeItem = document.querySelector(".appointment-item.active");
    if (!activeItem) { alert("No appointment selected."); return; }

    const appt = activeItem._appt;
    if (!appt || !appt._id) { alert("Cannot accept: Missing appointment ID."); return; }
    if (appt.status !== "pending") { alert("Only pending appointments can be accepted."); return; }

    try {
      const res = await fetch("includes/accept_appointment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: appt._id })
      });
      const data = await res.json();
      if (data.success) {
        appt.status = "in_progress";
        activeItem._appt = appt;
        alert("Appointment accepted.");
        loadAppointments();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  });
  

  // START CONSULTATION
  if (startConsultationBtn) {
    startConsultationBtn.addEventListener("click", async () => {
      const activeItem = document.querySelector(".appointment-item.active");
      if (!activeItem) { alert("No appointment selected."); return; }

      const appt = activeItem._appt;
      if (!appt || !appt._id) { alert("Cannot start consultation: Missing appointment data."); return; }
      if (appt.status !== "in_progress") { alert("You can only start a consultation for appointments in progress."); return; }

      if (!confirm("Start consultation and mark this appointment as completed?")) return;

      try {
        const res = await fetch("includes/complete_appointment.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: appt._id })
        });
        const data = await res.json();
        if (data.success) {
          appt.status = "completed";
          activeItem._appt = appt;
          alert("Consultation started. Appointment marked as completed.");
          loadAppointments();
        } else {
          alert("Failed to update appointment: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Server error while updating appointment.");
      }
    });
  }

  loadAppointments();
});
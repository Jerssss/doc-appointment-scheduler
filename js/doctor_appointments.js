document.addEventListener("DOMContentLoaded", () => {
  const appointmentList = document.querySelector(".appointment-list");
  const patientHeader = document.querySelector(".patient-header");
  const vitalsContainer = document.querySelector(".vitals");
  const searchInput = document.getElementById("searchInput");

  // NEW: Patient Info button
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

  // get selected patient id from active element
  const getSelectedPatientIdFromDOM = () => {
    const active = appointmentList.querySelector(".appointment-item.active");
    if (!active) return null;
    return active.dataset.patientId || null;
  };

  const loadAppointments = async () => {
    try {
      const res = await fetch("includes/get_appointments.php");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const appointments = await res.json();

      if (!Array.isArray(appointments) || appointments.length === 0) {
        appointmentList.innerHTML = `<p class="empty">No appointments available.</p>`;
        return;
      }

      appointmentList.innerHTML = "";

      appointments.forEach((appt, index) => {
        const item = document.createElement("div");
        item.classList.add("appointment-item");

        // store patient ID
        const pid = appt.patient_id;
        if (pid) item.dataset.patientId = pid;

        if (index === 0) item.classList.add("active");

        const patientName = appt.patient_name || "Unknown Patient";
        const imgSrc = appt.patient_image || "images/default-patient.png";

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
        `;

        item._appt = appt;

        item.addEventListener("click", () => {
          document.querySelectorAll(".appointment-item").forEach(i => i.classList.remove("active"));
          item.classList.add("active");

          if (pid) localStorage.setItem("selectedPatientId", pid);

          loadPatientInfo(appt);
        });

        appointmentList.appendChild(item);
      });

      const firstItem = appointmentList.querySelector(".appointment-item");
      if (firstItem) firstItem.click();

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
      if (pTags.length >= 2) pTags[1].textContent = appt.gender || "";
      if (pTags.length >= 3) pTags[2].textContent = appt.address || "";
    }

    if (!vitalsContainer) return;
    const inputs = vitalsContainer.querySelectorAll("input");

    if (inputs.length >= 4) {
      inputs[0].value = appt.temperature || "-";
      inputs[1].value = appt.blood_pressure || "-";
      inputs[2].value = appt.heart_rate || "-";
      inputs[3].value = appt.height_weight || "-";
    }
  };

  if (patientInfoBtn) {
    patientInfoBtn.addEventListener("click", () => {
      const patientId = getSelectedPatientIdFromDOM() || localStorage.getItem("selectedPatientId");

      if (!patientId) {
        alert("No patient selected.");
        return;
      }

      window.location.href = `patient_info.html?id=${encodeURIComponent(patientId)}`;
    });
  }

  loadAppointments();
});

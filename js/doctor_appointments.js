document.addEventListener("DOMContentLoaded", () => {
  const appointmentList = document.querySelector(".appointment-list");
  const patientHeader = document.querySelector(".patient-header");
  const vitalsContainer = document.querySelector(".vitals");

  const loadAppointments = async () => {
    try {
      const response = await fetch("includes/get_appointments.php");
      const appointments = await response.json();

      appointmentList.innerHTML = "";

      appointments.forEach((appt, index) => {
        const item = document.createElement("div");
        item.classList.add("appointment-item");
        if (index === 0) item.classList.add("active");

        const patientName = appt.patient_name || "Unknown Patient";
        const imgSrc = appt.patient_image || "images/default-patient.png";

        // convert ISO time to local date/time display if available
        let displayDate = "Invalid Date";
        if (appt.time) {
          const dt = new Date(appt.time);
          if (!isNaN(dt)) {
            displayDate = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
          }
        }

        item.innerHTML = `
          <img src="${imgSrc}" alt="${patientName}" />
          <div class="details">
            <h4>${patientName}</h4>
            <p>${displayDate}</p>
          </div>
        `;

        item.addEventListener("click", () => {
          document.querySelectorAll(".appointment-item").forEach(i => i.classList.remove("active"));
          item.classList.add("active");
          loadPatientInfo(appt);
        });

        appointmentList.appendChild(item);
      });

      if (appointments.length > 0) loadPatientInfo(appointments[0]);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const loadPatientInfo = (appt) => {
    // Update patient image
    const patientImg = patientHeader.querySelector('img');
    patientImg.src = appt.patient_image || 'images/default-patient.png';
    patientImg.alt = appt.patient_name || 'Unknown Patient';

    // Update info fields
    const info = patientHeader.querySelector('.info');
    info.querySelector('h3').textContent = appt.patient_name || 'Unknown Patient';
    const pTags = info.querySelectorAll('p');
    pTags[0].textContent = `${appt.age || 'N/A'} years old`;
    pTags[1].textContent = appt.gender || '';
    pTags[2].textContent = appt.address || '';

    // Ensure consult button exists
    if (!patientHeader.querySelector('.consult-btn')) {
      const btn = document.createElement('button');
      btn.classList.add('consult-btn');
      btn.textContent = 'Start Consultation';
      patientHeader.appendChild(btn);
    }

    // Update vitals
    const vitalBoxes = vitalsContainer.querySelectorAll('.vital-box input');
    if (vitalBoxes.length === 0) {
      // first time, create boxes
      vitalsContainer.innerHTML = `
        <div class="vital-box"><label>Temperature</label><input readonly /></div>
        <div class="vital-box"><label>Blood Pressure</label><input readonly /></div>
        <div class="vital-box"><label>Heart Rate</label><input readonly /></div>
        <div class="vital-box"><label>Height and Weight</label><input readonly /></div>
      `;
    }
    const inputs = vitalsContainer.querySelectorAll('input');
    inputs[0].value = appt.temperature || '-';
    inputs[1].value = appt.blood_pressure || '-';
    inputs[2].value = appt.heart_rate || '-';
    inputs[3].value = appt.height_weight || '-';
  };

  loadAppointments();
});

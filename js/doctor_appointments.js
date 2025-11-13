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

        const patientName = appt.patient_name || `Patient ${appt.patient_id.$oid || ''}`;
        const imgSrc = "images/default-patient.png";

        item.innerHTML = `
          <img src="${imgSrc}" alt="${patientName}" />
          <div class="details">
            <h4>${patientName}</h4>
            <p>${new Date(appt.time).toLocaleDateString()}<br>${new Date(appt.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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
    const patientName = appt.patient_name || `Patient ${appt.patient_id.$oid || ''}`;
    const imgSrc = "images/default-patient.png";

    patientHeader.innerHTML = `
      <img src="${imgSrc}" alt="${patientName}" />
      <div class="info">
        <h3>${patientName}</h3>
        <p>${appt.age} years old</p>
        <p>${appt.gender}</p>
        <p>${appt.address}</p>
      </div>
      <button class="consult-btn">Start Consultation</button>
    `;

    vitalsContainer.innerHTML = `
      <div class="vital-box">
        <label>Temperature</label>
        <input type="text" value="${appt.temperature}" readonly />
      </div>
      <div class="vital-box">
        <label>Blood Pressure</label>
        <input type="text" value="${appt.blood_pressure}" readonly />
      </div>
      <div class="vital-box">
        <label>Heart Rate</label>
        <input type="text" value="${appt.heart_rate}" readonly />
      </div>
      <div class="vital-box">
        <label>Height and Weight</label>
        <input type="text" value="${appt.height_weight}" readonly />
      </div>
    `;
  };

  loadAppointments();
});

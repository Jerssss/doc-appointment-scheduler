document.addEventListener("DOMContentLoaded", async () => {
  const patientList = document.querySelector(".patient-list");
  const pastConditions = document.getElementById("pastConditions");
  const pastSurgeries = document.getElementById("pastSurgeries");
  const currentConditions = document.getElementById("currentConditions");
  const lastAppointment = document.getElementById("lastAppointment");

  try {
    const res = await fetch("includes/get_patient_list.php");
    const patients = await res.json();

    patientList.innerHTML = "";

    patients.forEach((patient, index) => {
      const card = document.createElement("div");
      card.classList.add("patient-card");
      if (index === 0) card.classList.add("active");
      card.dataset.id = patient._id;

      const imgSrc = patient.image || "images/default-patient.png";

      card.innerHTML = `
        <img src="${imgSrc}" alt="${patient.name}">
        <p>${patient.name}</p>
      `;

      patientList.appendChild(card);

      card.addEventListener("click", async () => {
        document.querySelectorAll(".patient-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        try {
          const detailRes = await fetch(`includes/get_patientdetails.php?id=${patient._id}`);
          const details = await detailRes.json();

          pastConditions.value = (details.past_medical_conditions && details.past_medical_conditions.length) ? details.past_medical_conditions.join(", ") : "N/A";
          pastSurgeries.value = (details.past_surgeries && details.past_surgeries.length) ? details.past_surgeries.join(", ") : "N/A";
          currentConditions.value = (details.current_medical_conditions && details.current_medical_conditions.length) ? details.current_medical_conditions.join(", ") : (details.illness || "N/A");
          lastAppointment.value = details.last_appointment_date || "N/A";

        } catch (err) {
          console.error("Error loading patient details:", err);
        }
      });
    });

    // auto-click first patient to load details
    if (patients.length > 0) {
      document.querySelector(".patient-card.active").click();
    }

  } catch (err) {
    console.error("Error loading patients:", err);
  }
});

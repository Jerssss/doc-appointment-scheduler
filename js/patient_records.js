document.addEventListener("DOMContentLoaded", async () => {
  const patientList = document.querySelector(".patient-list");
  const pastConditions = document.getElementById("pastConditions");
  const pastSurgeries = document.getElementById("pastSurgeries");
  const currentConditions = document.getElementById("currentConditions");
  const lastAppointment = document.getElementById("lastAppointment");

  try {
    // Fetch all patients
    const res = await fetch("includes/get_patient_list.php");
    const patients = await res.json();

    patientList.innerHTML = ""; // clear any existing

    patients.forEach((patient, index) => {
      const card = document.createElement("div");
      card.classList.add("patient-card");
      if (index === 0) card.classList.add("active"); // first patient selected by default
      card.setAttribute("data-id", patient._id);

      card.innerHTML = `
        <img src="${patient.image || 'images/default-patient.png'}" alt="${patient.name}">
        <p>${patient.name}</p>
      `;

      patientList.appendChild(card);

      card.addEventListener("click", async () => {
        // Highlight active card
        document.querySelectorAll(".patient-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        try {
          const detailRes = await fetch(`includes/get_patientdetails.php?id=${patient._id}`);
          const details = await detailRes.json();

          pastConditions.value = details.past_conditions.join(", ") || "N/A";
          pastSurgeries.value = details.past_surgeries.join(", ") || "N/A";
          currentConditions.value = details.current_conditions.join(", ") || "N/A";
          lastAppointment.value = details.last_appointment || "N/A";

        } catch (err) {
          console.error("Error loading patient details:", err);
        }
      });
    });

    // Trigger first patient's details load
    if (patients.length > 0) {
      document.querySelector(".patient-card.active").click();
    }

  } catch (err) {
    console.error("Error loading patients:", err);
  }
});

// STATIC DATA FOR NOW
const patientData = {
  "Fred Terre": {
    pastConditions: "Seasonal allergies",
    pastSurgeries: "Appendectomy (2019)",
    currentConditions: "None",
    lastAppointment: "2024-10-12"
  },
  "Den Ferrer": {
    pastConditions: "Asthma",
    pastSurgeries: "None",
    currentConditions: "Mild asthma symptoms",
    lastAppointment: "2024-09-02"
  },
  "Bernard Molina": {
    pastConditions: "Repeated fractures (sports)",
    pastSurgeries: "Left shoulder surgery (2023)",
    currentConditions: "Muscle strain",
    lastAppointment: "2024-11-01"
  },
  "Lorraine Adame": {
    pastConditions: "None",
    pastSurgeries: "None",
    currentConditions: "Migraines",
    lastAppointment: "2025-01-05"
  },
  "Kristy Grabanzor": {
    pastConditions: "Hypertension",
    pastSurgeries: "Gallbladder removal (2022)",
    currentConditions: "High blood pressure",
    lastAppointment: "2024-12-12"
  }
};



// SELECT UI ELEMENTS 
const patientCards = document.querySelectorAll(".patient-card");
const pastConditionsField = document.querySelector(".patient-details textarea:nth-of-type(1)");
const pastSurgeriesField = document.querySelector(".patient-details textarea:nth-of-type(2)");
const currentConditionsField = document.querySelector(".patient-details textarea:nth-of-type(3)");
const lastAppointmentField = document.querySelector(".patient-details input[type='date']");

// UPDATE WHEN A PATIENT IS CLICKED 
patientCards.forEach(card => {
  card.addEventListener("click", () => {
    // Extract the name from the card
    const name = card.querySelector("span").textContent.trim();
    const info = patientData[name];

    if (!info) return; // no data found

    // Autofill the right panel
    pastConditionsField.value = info.pastConditions;
    pastSurgeriesField.value = info.pastSurgeries;
    currentConditionsField.value = info.currentConditions;
    lastAppointmentField.value = info.lastAppointment;

    // Optional: highlight selected card
    patientCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
  });
});


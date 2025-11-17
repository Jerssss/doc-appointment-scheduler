document.addEventListener("DOMContentLoaded", async () => {
  // Grab form fields
  const pastConditions = document.getElementById("pastConditions");
  const pastSurgeries = document.getElementById("pastSurgeries");
  const currentConditions = document.getElementById("currentConditions");
  const lastAppointment = document.getElementById("lastAppointment");

  // Optional: header info if you have it on the page
  const patientName = document.getElementById("patientName");
  const patientAge = document.getElementById("patientAge");
  const patientGender = document.getElementById("patientGender");
  const patientAddress = document.getElementById("patientAddress");
  const patientImage = document.querySelector(".patient-image"); // if you have an img tag

  // Get patient ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const pid = urlParams.get("id");

  if (!pid) {
    alert("No patient selected. Please select a patient first.");
    return;
  }

  try {
    // Fetch patient details
    const res = await fetch(`includes/get_patientdetails.php?id=${encodeURIComponent(pid)}`);
    const details = await res.json();

    if (details.error) {
      console.error(details.error);
      alert("Error fetching patient details: " + details.error);
      return;
    }

    // Fill form fields
    pastConditions.value = (details.past_medical_conditions && details.past_medical_conditions.length) ? details.past_medical_conditions.join(", ") : "N/A";
    pastSurgeries.value = (details.past_surgeries && details.past_surgeries.length) ? details.past_surgeries.join(", ") : "N/A";
    currentConditions.value = (details.current_medical_conditions && details.current_medical_conditions.length) ? details.current_medical_conditions.join(", ") : (details.illness || "N/A");
    lastAppointment.value = details.last_appointment_date || "N/A";

    // Optional: update header info if you have it
    if (patientName) patientName.textContent = details.personal_info?.full_name || details.name || "Unknown";
    if (patientAge) {
    patientAge.textContent = (details.age && details.age !== "N/A")
        ? `${details.age} years old`
        : "N/A";
    }
    if (patientGender) patientGender.textContent = details.personal_info?.sex || details.gender || "N/A";
    if (patientAddress) patientAddress.textContent = details.personal_info?.address || details.address || "N/A";
    if (patientImage) patientImage.src = details.profile_image || details.image || "images/default-patient.png";

  } catch (err) {
    console.error("Error loading patient details:", err);
    alert("Failed to load patient details. See console for more info.");
  }
});

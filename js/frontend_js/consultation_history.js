document.addEventListener("DOMContentLoaded", () => {

  // Check user session if doctor is still logged in
    const user = JSON.parse(sessionStorage.getItem("user"));

    // Debugging
     const doctorEmail = user.user_email;
     console.log('Doctor Email : ', doctorEmail);

    if (!user || user.role !== "doctor") {
        console.log("No doctor session found. Redirecting...");
        window.location.href = "login.html";
        return;
    }
    
    const doctorId = user.user_id.$oid || user.user_id;
    // Debugging
    console.log("Sending doctor ID:", doctorId);


    // Fetch the consultation history
    fetch(`includes/fetch_consultations.php?doctor_id=${doctorId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Consultation data loaded:", data);
            renderConsultationList(data);
        })
        .catch(err => console.error("Fetch error:", err));
    });


// Display the list of consultations
function renderConsultationList(consultations) {

    const listContainer = document.querySelector(".patients-list");
    const patientCardsWrapper = listContainer.querySelector(".patients-list-items");

    // If wrapper doesn't exist in HTML, create it
    if (!patientCardsWrapper) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("patients-list-items");
        listContainer.appendChild(wrapper);
    }

    const list = listContainer.querySelector(".patients-list-items");
    list.innerHTML = ""; // Clear old static items


    // Right panel fields
    const medicalHistoryField = document.querySelector(".patient-details textarea:nth-of-type(1)");
    const currentConditionsField = document.querySelector(".patient-details textarea:nth-of-type(2)");
    const consultationNotesField = document.querySelector(".patient-details textarea:nth-of-type(3)");
    const lastAppointmentField = document.querySelector(".patient-details input[type='date']");

    // Display cards
    consultations.forEach((c, index) => {

        const card = document.createElement("div");
        card.classList.add("patient-card");
        card.dataset.index = index;

        card.innerHTML = `
            <img src="${c.patient.profile_image}">
            <span>${c.patient.name}</span>
        `;

        // Clicking will fill Right Panel
        card.addEventListener("click", () => {
            medicalHistoryField.value = c.medical_history;
            currentConditionsField.value = c.current_conditions;
            consultationNotesField.value = c.consultation_notes;

            // Handle follow-up date formatting
            if (c.follow_up_date && typeof c.follow_up_date === "string") {
                lastAppointmentField.value = c.follow_up_date.split("T")[0];
            } else {
                lastAppointmentField.value = "";
            }

            // Highlight active card
            document.querySelectorAll(".patient-card").forEach(el => el.classList.remove("active"));
            card.classList.add("active");
        });

        list.appendChild(card);
    });


    // Auto-select first patient if available
    if (consultations.length > 0) {
        list.children[0].click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const historyContainer = document.querySelector('.history-box');

  const fetchConsultations = async () => {
    try {
      const res = await fetch('http://localhost/9468_it313-teamarc_mediko/includes/get_consultations.php');
      const consultations = await res.json();

      if (consultations.error) {
        historyContainer.innerHTML = `<p>${consultations.error}</p>`;
        return;
      }

      renderHistory(consultations);
    } catch (err) {
      console.error(err);
      historyContainer.innerHTML = '<p>Failed to load consultations. Please try again later.</p>';
    }
  };

  const renderHistory = (consultations) => {
    const now = new Date();

    // Separate upcoming vs past
    const upcoming = consultations.filter(c => new Date(c.time) > now);
    const past = consultations.filter(c => new Date(c.time) <= now);

    const upcomingHTML = upcoming.map(c => `
      <div class="card">
        <img src="${c.doctor_img}" alt="Doctor Image">
        <div class="card-info">
          <h3>${c.mode} Consultation with ${c.doctor_name}</h3>
          <p class="schedule">Scheduled for ${new Date(c.time).toLocaleString()}</p>
          <p class="note">${c.notes}</p>
        </div>
      </div>
    `).join('');

    const pastHTML = past.map(c => `
      <div class="card" data-appointment-id="${c.appointment_id}" data-doctor="${c.doctor_name}">
        <img src="${c.doctor_img}" alt="Doctor Image">
        <div class="card-info">
          <h3>${c.mode} with ${c.doctor_name}</h3>
          <p class="schedule">${new Date(c.time).toLocaleString()}</p>
          <p class="diagnosis">Diagnosis: ${c.diagnosis || 'N/A'}</p>
          <p class="prescription">Prescription: ${c.prescription || 'N/A'}</p>
        </div>
        <button class="rate-btn">RATE</button>
      </div>
    `).join('');

    historyContainer.innerHTML = `
      <div class="section">
        <h2>Upcoming</h2>
        ${upcomingHTML || '<p>No upcoming consultations</p>'}
      </div>
      <div class="section">
        <h2>Past Consultations</h2>
        ${pastHTML || '<p>No past consultations</p>'}
      </div>
    `;

    // Add click handler for rate buttons
    document.querySelectorAll('.rate-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const card = e.target.closest('.card');
        const appointmentId = card.dataset.appointmentId;
        const doctorName = card.dataset.doctor;

        const rating = prompt(`Rate ${doctorName} (1-5):`);
        if (!rating) return;

        try {
          // send rating to backend
          await fetch('http://localhost/9468_it313-teamarc_mediko/includes/rate_doctor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointment_id: appointmentId, rating: parseInt(rating) })
          });
          alert(`Thank you! You rated ${doctorName} ${rating} stars.`);
          fetchConsultations(); // refresh ratings
        } catch (err) {
          console.error(err);
          alert('Failed to submit rating.');
        }
      });
    });
  };

  fetchConsultations();
});

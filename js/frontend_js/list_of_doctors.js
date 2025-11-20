document.addEventListener('DOMContentLoaded', () => {
  const doctorGrid = document.getElementById('doctorGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  // Fetch doctors with optional search query
  const fetchDoctors = async () => {
    const search = searchInput.value.trim();

    // Build query params
    const params = new URLSearchParams({
      search: search
    });

    try {
      const res = await fetch("http://localhost:8888/9468_it313-teamarc_mediko/includes/get_doctors.php?" + params.toString());
      const doctors = await res.json();

      renderDoctors(doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      doctorGrid.innerHTML = '<p>Failed to load doctors. Please try again later.</p>';
    }
  };

  // Render doctor cards
  function renderDoctors(doctors) {
    doctorGrid.innerHTML = '';

    if (!doctors.length) {
      doctorGrid.innerHTML = '<p>No doctors found.</p>';
      return;
    }

    doctors.forEach(doc => {
      const card = document.createElement('div');
      card.classList.add('doctor-card');

      let fullName = doc.full_name || doc.user_name || doc.username || "Unknown";
      let footerName = fullName.toLowerCase().startsWith('dr.') ? fullName : 'Dr. ' + fullName;

      card.innerHTML = `
        <div class="doctor-img">
          <img src="${doc.profile_image || 'images/default-doctor.png'}" alt="${fullName}">
        </div>
        <div class="doctor-info">
          <h3>${fullName}</h3>
          <p class="specialty">${doc.specialization || 'General'}</p>
          <p class="desc">Book a consultation with this doctor</p>
          <div class="footer">
            <span class="doc-name">${footerName}</span>
            <button class="view-btn">View</button>
          </div>
        </div>
      `;

      // View button
      card.querySelector('.view-btn').addEventListener('click', () => {
        const doctorData = {
          user_id: doc.user_id,
          full_name: fullName,
          profile_image: doc.profile_image || 'images/default-doctor.png',
          specialization: doc.specialization || 'General',
          fee: doc.fee || '600.00',
          languages: doc.languages || 'English, Filipino',
          rating: doc.rating || '4.8',
          reviews: doc.reviews || '0',
          services: doc.services || 'Online Consultation',
          hospital_name: doc.hospital_name || 'Baguio General Hospital',
          hospital_phone: doc.hospital_phone || '+123 456 7890',
          hospital_address: doc.hospital_address || 'Gov. Pack Rd, Baguio City',
          clinic_hours: doc.clinic_hours || '08:00 AM - 08:00 PM',
          hospital_image: doc.hospital_image || 'images/bgh.png',
          titles: doc.titles || 'MD',
          hospital_title: doc.hospital_title || 'Hospital Consultant'
        };

        localStorage.setItem('selectedDoctor', JSON.stringify(doctorData));
        window.location.href = 'view_doctor.html';
      });

      doctorGrid.appendChild(card);
    });
  }

  // Initial load
  fetchDoctors();

  // Live search (typing updates list)
  searchInput.addEventListener("input", fetchDoctors);

  // Button search
  searchBtn.addEventListener('click', fetchDoctors);
});

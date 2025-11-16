// user_doctor_profile.js
// Doctor profile behaviors (kept minimal — same placeholders as patient view)

document.addEventListener('DOMContentLoaded', () => {
  // Example JSON you provided (kept here as a reference)
  // const doctor = {
  //   user_id: "675b01a88b4a0f4a3c91e70g",
  //   user_name: "dr_smith",
  //   user_email: "dr.smith@example.com",
  //   role: "doctor",
  //   name: "Dr. John Smith",
  //   profile_image: "images/default-doctor.png",
  //   specialization: "Cardiology",
  //   hospital_name: "Baguio General Hospital",
  //   hospital_phone: "+123 456 7890",
  //   hospital_address: "Gov. Pack Rd, Baguio City",
  //   clinic_hours: "08:00 AM - 08:00 PM",
  //   fee: "600.00",
  //   languages: "English, Tagalog",
  //   rating: "4.8",
  //   reviews: "96",
  //   services: "Online Consultation or Home Checkup"
  // };

  // If/when you fetch doctor data from the server, uncomment & use the snippet below:
  /*
  document.getElementById('profileImage').src = doctor.profile_image;
  document.getElementById('doctorName').textContent = doctor.name;
  document.getElementById('userId').textContent = doctor.user_id;
  document.getElementById('role').textContent = doctor.role.charAt(0).toUpperCase() + doctor.role.slice(1);
  document.getElementById('email').textContent = doctor.user_email;
  document.getElementById('phone').textContent = doctor.hospital_phone || ''; // show hospital phone as contact
  document.getElementById('specialization').textContent = doctor.specialization;
  document.getElementById('fee').textContent = `₱${parseFloat(doctor.fee).toFixed(2)}`;
  document.getElementById('services').textContent = doctor.services;
  document.getElementById('hospitalName').textContent = doctor.hospital_name;
  document.getElementById('hospitalPhone').textContent = doctor.hospital_phone;
  document.getElementById('hospitalAddress').textContent = doctor.hospital_address;
  document.getElementById('clinicHours').textContent = doctor.clinic_hours;
  document.getElementById('languages').textContent = doctor.languages;
  document.getElementById('rating').textContent = doctor.rating;
  document.getElementById('reviews').textContent = doctor.reviews;
  document.getElementById('username').textContent = doctor.user_name;
  */

  // Logout action (replace with real auth)
  document.getElementById('logoutBtnMain')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      // clear auth tokens here if present
      window.location.href = 'index.html';
    }
  });

  // Edit / Change password placeholders
  document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    alert('Open Edit Profile UI for doctor (not implemented).');
  });
  document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
    alert('Open Change Password UI (not implemented).');
  });
});

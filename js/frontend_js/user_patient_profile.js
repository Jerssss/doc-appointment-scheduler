// user_patient_profile.js

document.addEventListener('DOMContentLoaded', () => {
  // Logout action (replace with real auth)
  document.getElementById('logoutBtnMain')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      // clear auth tokens here if present
      window.location.href = 'index.html';
    }
  });

  // Edit / Change password placeholders
  document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    alert('Open Edit Profile UI (not implemented).');
  });
  document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
    alert('Open Change Password UI (not implemented).');
  });
});

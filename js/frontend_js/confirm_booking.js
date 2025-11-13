// JS for modal confirmation message

// Wait until DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get elements
  const modal = document.getElementById('confirmationModal');
  const openBtn = document.querySelector('.details button');
  const closeBtn = document.querySelector('.close');
  const cancelBtn = document.querySelector('.cancel-btn');
  const confirmBtn = document.querySelector('.confirm-btn');

  // Show modal when clicking "Book Me"
  openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Close modal when clicking X or Cancel
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Optional: Add confirm action
  confirmBtn.addEventListener('click', () => {
    alert('Your booking with Dr. Molina has been confirmed!');
    modal.style.display = 'none';
  });

  // Close modal if user clicks outside the box
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});

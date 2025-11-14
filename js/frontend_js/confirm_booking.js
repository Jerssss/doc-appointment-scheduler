document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.querySelector('.confirm-btn');


  openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });


  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });


  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });


  confirmBtn.addEventListener('click', async () => {
    document.getElementById('bookingForm').requestSubmit();
    modal.style.display = 'none';
  });


  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});
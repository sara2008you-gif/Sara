const form = document.querySelector('#invitation-form');
const dateField = document.querySelector('#date');
const dialog = document.querySelector('#success-dialog');
const successText = document.querySelector('#success-text');

dateField.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const details = Object.fromEntries(new FormData(form));
  const invitation = { ...details, createdAt: new Date().toISOString() };
  localStorage.setItem('our-evening-invitation', JSON.stringify(invitation));

  const when = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(`${details.date}T12:00:00`));
  successText.textContent = `Приглашение на ${when}, ${details.time} сохранено в этом браузере. Обсудите его вместе и выберите то, что комфортно вам обоим.`;
  dialog.showModal();
  form.reset();
});

document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());

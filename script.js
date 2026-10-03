 const form = document.querySelector('#invitation-form');
const dateField = document.querySelector('#date');
const dialog = document.querySelector('#success-dialog');
const successText = document.querySelector('#success-text');
const api = window.INVITATION_API_BASE?.replace(/\/$/, '') || '';

dateField.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const details = Object.fromEntries(new FormData(form));
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Отправляем…';
  try {
    const response = await fetch(`${api}/api/invitations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details)
    });
    if (!response.ok) throw new Error('request failed');
    const when = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(`${details.date}T12:00:00`));
    successText.textContent = `Приглашение на ${when}, ${details.time} отправлено. Обсудите его вместе и выберите то, что комфортно вам обоим.`;
    dialog.showModal(); form.reset();
  } catch {
    successText.textContent = 'Не удалось отправить приглашение. Проверьте подключение сайта и попробуйте ещё раз.';
    dialog.showModal();
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Отправить приглашение <span>→</span>';
  }
});

document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());

const api = window.INVITATION_API_BASE?.replace(/\/$/, '') || '';

const login = document.querySelector('#login');
const loginForm = document.querySelector('#login-form');
const passwordField = document.querySelector('#password');
const loginMessage = document.querySelector('#login-message');
const inbox = document.querySelector('#inbox');
const invitations = document.querySelector('#invitations');
const logoutButton = document.querySelector('#logout');

function showMessage(message) {
  loginMessage.textContent = message;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date + 'T12:00:00'));
}

function renderInvitations(items) {
  if (!items.length) {
    invitations.innerHTML = '<p class="form-message">Пока нет новых приглашений.</p>';
    return;
  }

  invitations.innerHTML = items.map(item => `
    <article class="card invitation-item">
      <p class="step">${formatDate(item.date)} · ${item.time}</p>
      <h3>${item.mood}</h3>
      ${item.wish ? `<p><strong>Хочу:</strong> ${escapeHtml(item.wish)}</p>` : ''}
      ${item.boundaries ? `<p><strong>Важно:</strong> ${escapeHtml(item.boundaries)}</p>` : ''}
      <button class="outline delete-invitation" type="button" data-id="${item.id}">Удалить</button>
    </article>
  `).join('');

  document.querySelectorAll('.delete-invitation').forEach(button => {
    button.addEventListener('click', () => deleteInvitation(button.dataset.id));
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadInvitations() {
  const response = await fetch(`${api}/api/invitations`, {
    credentials: 'include'
  });

  if (response.status === 401) {
    login.classList.remove('hidden');
    inbox.classList.add('hidden');
    return;
  }

  if (!response.ok) throw new Error('Не удалось загрузить приглашения.');

  const items = await response.json();
  login.classList.add('hidden');
  inbox.classList.remove('hidden');
  renderInvitations(items);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage('');

  const button = loginForm.querySelector('button');
  button.disabled = true;
  button.textContent = 'Проверяем…';

  try {
    const response = await fetch(`${api}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: passwordField.value })
    });

    if (!response.ok) {
      showMessage('Неверный пароль.');
      passwordField.value = '';
      return;
    }

    passwordField.value = '';
    await loadInvitations();
  } catch {
    showMessage('Не удалось подключиться к серверу. Проверь настройки Render.');
  } finally {
    button.disabled = false;
    button.innerHTML = 'Открыть ящик <span>→</span>';
  }
});

logoutButton.addEventListener('click', async () => {
  await fetch(`${api}/api/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  inbox.classList.add('hidden');
  login.classList.remove('hidden');
  passwordField.value = '';
});

async function deleteInvitation(id) {
  if (!confirm('Удалить это приглашение?')) return;

  const response = await fetch(`${api}/api/invitations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (response.ok) {
    await loadInvitations();
  }
}

loadInvitations().catch(() => {
  showMessage('Не удалось подключиться к серверу. Проверь настройки Render.');
});

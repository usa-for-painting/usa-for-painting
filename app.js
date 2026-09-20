const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
  navigation?.classList.remove('is-open');
}
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('is-open', expanded);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
  });
});

const dialog = document.querySelector('#project-dialog');
let previousFocus;
let currentProject;
function showProject(card) {
  currentProject = card;
  const image = document.querySelector('#dialog-image');
  image.src = card.dataset.image;
  image.alt = card.querySelector('img').alt;
  document.querySelector('#dialog-title').textContent = card.dataset.title;
  document.querySelector('#dialog-description').textContent = card.dataset.description;
  const visibleProjects = [...document.querySelectorAll('.project-card')].filter(project => !project.hidden);
  document.querySelector('#project-count').textContent = `${visibleProjects.indexOf(card) + 1} / ${visibleProjects.length} projects`;
}
document.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => {
  previousFocus = card;
  showProject(card);
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
dialog?.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  previousFocus?.focus({ preventScroll: true });
});
document.querySelector('#dialog-cta')?.addEventListener('click', () => {
  const details = document.querySelector('[name="details"]');
  const inspiration = `Project inspiration: ${currentProject.dataset.title}.`;
  if (!details.value.includes(inspiration)) details.value = `${details.value}${details.value ? '\n' : ''}${inspiration}`;
  document.querySelector('#service-select').value = currentProject.dataset.category === 'commercial' ? 'Commercial painting' : 'Residential painting';
  dialog.close();
});
function browseProject(direction) {
  const projects = [...document.querySelectorAll('.project-card')].filter(project => !project.hidden);
  showProject(projects[(projects.indexOf(currentProject) + direction + projects.length) % projects.length]);
}
document.querySelector('#previous-project')?.addEventListener('click', () => browseProject(-1));
document.querySelector('#next-project')?.addEventListener('click', () => browseProject(1));
dialog?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    browseProject(event.key === 'ArrowRight' ? 1 : -1);
  }
});

const film = document.querySelector('#brand-film');
document.querySelectorAll('[data-film-time]').forEach(button => button.addEventListener('click', async () => {
  const status = document.querySelector('#film-status');
  try {
    await film.play();
    film.currentTime = Number(button.dataset.filmTime);
    film.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    status.textContent = '';
  } catch {
    status.textContent = 'Use the video play button to watch the film, or download it from the player.';
  }
}));
film?.addEventListener('timeupdate', () => {
  const chapters = [...document.querySelectorAll('[data-film-time]')];
  chapters.forEach((button, index) => {
    const active = film.currentTime >= Number(button.dataset.filmTime) && (!chapters[index + 1] || film.currentTime < Number(chapters[index + 1].dataset.filmTime));
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
});
document.querySelector('.comparison input')?.addEventListener('input', event => {
  event.target.closest('.comparison').style.setProperty('--position', `${event.target.value}%`);
});
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#service-select').value = link.dataset.service;
}));

const form = document.querySelector('#estimate-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = `Hi USA For Painting! I'd like a free estimate.\n\nName: ${data.get('name').trim()}\nPhone: ${data.get('phone').trim()}\nService: ${data.get('service')}\nProject ZIP: ${data.get('zip').trim()}\n\nProject: ${data.get('details').trim()}`;
  document.querySelector('#request-preview').value = message;
  const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
  document.querySelector('#send-text').href = `sms:+13024524001${separator}body=${encodeURIComponent(message)}`;
  const result = document.querySelector('#request-result');
  result.hidden = false;
  document.querySelector('#copy-status').textContent = '';
  result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  document.querySelector('#request-preview').focus({ preventScroll: true });
});
document.querySelector('#copy-request')?.addEventListener('click', async () => {
  const preview = document.querySelector('#request-preview');
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(preview.value);
    status.textContent = 'Copied. Text your message to (302) 452-4001 when you’re ready.';
  } catch {
    preview.focus();
    preview.select();
    status.textContent = 'Your message is selected. Use your device’s Copy command, then paste it into a text message.';
  }
});
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const palettes = {
  natural: { name: 'Quiet & natural', colors: ['#d9ded5', '#53685b', '#faf6ee'], description: 'A restful mix of soft sage, forest green, and warm white.' },
  coastal: { name: 'Fresh & coastal', colors: ['#dde6e9', '#345871', '#fffaf0'], description: 'An airy mix of mist, deep blue, and ivory.' },
  warm: { name: 'Warm & expressive', colors: ['#e7d8c8', '#965c46', '#f7efdf'], description: 'An inviting mix of sand, terracotta, and cream.' }
};
let selectedPalette = palettes.natural;
document.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => {
  selectedPalette = palettes[button.dataset.palette];
  document.querySelectorAll('[data-palette]').forEach(option => {
    option.classList.toggle('active', option === button);
    option.setAttribute('aria-pressed', String(option === button));
  });
  const preview = document.querySelector('.design-preview');
  ['wall', 'accent', 'trim'].forEach((name, i) => preview.style.setProperty(`--${name}`, selectedPalette.colors[i]));
  document.querySelector('#palette-name').textContent = selectedPalette.name;
  document.querySelector('#palette-description').textContent = selectedPalette.description;
  document.querySelector('.room-art').setAttribute('aria-label', `Illustrated room: ${selectedPalette.description}`);
}));
document.querySelector('#design-cta')?.addEventListener('click', () => {
  const details = form.elements.details;
  const idea = `Color inspiration: ${selectedPalette.name}.`;
  details.value = details.value.replace(/(?:\n)?Color inspiration: (Quiet & natural|Fresh & coastal|Warm & expressive)\./g, '').trim();
  details.value = `${details.value}${details.value ? '\n' : ''}${idea}`;
});

if (!location.hash) {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.addEventListener('pageshow', () => window.scrollTo(0, 0), { once: true });
}
document.querySelectorAll('.topbar-inner > span').forEach(label => {
  label.innerHTML = '<span class="location-dot" aria-hidden="true"></span> Serving customers across the USA';
});

const reviewEntries = [
  { topic: 'ON QUALITY & VALUE', quote: 'The price was good and the quality was the best.', name: 'Dean Allred', source: 'Google review' },
  { topic: 'ON THE ARTISTIC WORK', quote: 'This is the most artistic job I\'ve seen.', name: 'Jordan Ahamad', source: 'Google review' },
  { topic: 'ON GOOD PEOPLE', quote: 'Very good service and good people, thanks Mr Khaled.', name: 'Khaled', source: 'Google review' },
  { topic: 'ON TEAMWORK', quote: 'This is a good team worker. Thank you for work.', name: 'Denis King', source: 'Google review' },
  { topic: 'ON THE FINISHED ROOM', quote: 'He had fixed my walls in my house drywall and he had painted it and he did a really good job.', name: 'gigi abdel', source: 'Google review' },
  { topic: 'ON CLEAN WORK', quote: 'The work team is clean in its work.', name: 'Customer excerpt', source: 'Original website review' }
];
function reviewCard(entry) {
  const initials = entry.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return `<figure class="review-card"><span class="review-topic">${entry.topic}</span><blockquote>“${entry.quote}”</blockquote><figcaption><span class="review-avatar" aria-hidden="true">${initials}</span><span><strong>${entry.name}</strong><small>${entry.source}</small></span><a href="https://www.google.com/maps?cid=9132234197117223065" target="_blank" rel="noopener noreferrer" aria-label="See ${entry.name}'s review source">↗</a></figcaption></figure>`;
}
const reviewWall = document.title.startsWith('Reviews') ? document.querySelector('.feature-grid') : null;
if (reviewWall) reviewWall.innerHTML = reviewEntries.map(reviewCard).join('');
const homepageReviews = document.querySelector('.featured-comments');
if (homepageReviews) homepageReviews.insertAdjacentHTML('afterbegin', reviewEntries.slice(2).map(reviewCard).join(''));

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

document.querySelectorAll('a[href="#estimate"]').forEach(link => link.addEventListener('click', event => {
  const estimate = document.querySelector('#estimate');
  if (!estimate) return;
  event.preventDefault();
  closeMenu();
  estimate.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', '#estimate');
}));

const heroPhoto = document.querySelector('.hero-visual > img');
const heroSlides = [
  { image: 'assets/residential.jpg', alt: 'Finished residential interior with warm neutral walls, white trim, and contrasting stair railings', caption: 'A considered palette.\nA completely different feeling.' },
  { image: 'assets/hero-house.jpg', alt: 'Freshly painted home exterior with crisp trim and dark shutters', caption: 'A fresh welcome home.\nColor that feels composed.' },
  { image: 'assets/project-deck-complete.jpg', alt: 'Finished residential deck and porch with fresh light paint', caption: 'A brighter welcome.\nMade for everyday life.' },
  { image: 'assets/project-room-finish.jpg', alt: 'Residential room with freshly painted walls and clean trim', caption: 'A room reset.\nReady for what comes next.' },
  { image: 'assets/google-profile-photo.jpg', alt: 'Stone fireplace and dark feature wall in a residential interior project', caption: 'A room with character.\nDetails worth noticing.' }
];
if (heroPhoto && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let slideIndex = 0;
  window.setInterval(() => {
    if (document.hidden) return;
    slideIndex = (slideIndex + 1) % heroSlides.length;
    const slide = heroSlides[slideIndex];
    heroPhoto.classList.add('is-switching');
    window.setTimeout(() => {
      heroPhoto.src = slide.image;
      heroPhoto.alt = slide.alt;
      const caption = document.querySelector('.hero-photo-caption span');
      if (caption) caption.innerHTML = slide.caption.replace('\n', '<br>');
      heroPhoto.classList.remove('is-switching');
    }, 280);
  }, 7000);
}

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

document.querySelectorAll('[data-design-idea]').forEach(link => link.addEventListener('click', () => {
  const details = form.elements.details;
  const idea = 'Design inspiration: ' + link.dataset.designIdea + '.';
  if (!details.value.includes(idea)) details.value = details.value + (details.value ? '\n' : '') + idea;
}));

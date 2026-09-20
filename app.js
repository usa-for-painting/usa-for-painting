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
const reviewSource = 'https://www.google.com/maps?cid=9132234197117223065';
const escapeReview = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
function reviewCard(entry) {
  const name = String(entry.name || 'Google reviewer');
  const initials = name.split(' ').map(part => part[0] || '').join('').slice(0, 2).toUpperCase();
  const rating = Number.isInteger(Number(entry.rating)) ? Number(entry.rating) : 0;
  const date = entry.updated && !Number.isNaN(Date.parse(entry.updated)) ? new Date(entry.updated).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
  const quote = entry.quote || (rating >= 1 && rating <= 5 ? `Rated this business ${rating} out of 5.` : 'Read this review on Google.');
  return `<figure class="review-card"><span class="review-topic">${escapeReview(entry.topic || 'CUSTOMER FEEDBACK')}</span>${rating >= 1 && rating <= 5 ? `<span class="review-score" aria-label="${rating} out of 5 stars">${'&#9733;'.repeat(rating)}${'&#9734;'.repeat(5-rating)}</span>` : ''}<blockquote>&ldquo;${escapeReview(quote)}&rdquo;</blockquote><figcaption><span class="review-avatar" aria-hidden="true">${escapeReview(initials)}</span><span><strong>${escapeReview(name)}</strong><small>${escapeReview(entry.source || 'Google review')}${date ? ' &middot; '+date : ''}</small></span><a href="${reviewSource}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escapeReview(name)}'s review on Google">&#8599;</a></figcaption></figure>`;
}
const homepageReviews = document.querySelector('.featured-comments');
const reviewWall = document.title.startsWith('Reviews') ? document.querySelector('.feature-grid') : null;
function renderReviews(entries, note = 'Selected reviews. Read the full history on Google.') {
  if (reviewWall) reviewWall.innerHTML = entries.map(reviewCard).join('') || '<p>No reviews are available to display. Visit our Google profile for the latest information.</p>';
  if (homepageReviews) homepageReviews.innerHTML = `${entries.slice(0, 2).map(reviewCard).join('')}<p class="reviews-note">${escapeReview(note)} <a href="${reviewSource}" target="_blank" rel="noopener noreferrer">Read all reviews on Google &#8599;</a></p>`;
  let status = document.querySelector('.reviews-live-status');
  if (!status && reviewWall) { status = document.createElement('p'); status.className = 'reviews-live-status'; status.setAttribute('role','status'); reviewWall.before(status); }
  if (status) status.textContent = note;
}
function updateReviewSummary(data, live) {
  const rating = Number(data.rating), total = Number(data.total);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5 || !Number.isInteger(total) || total < 0) return;
  const ratingText = rating.toFixed(1), note = live ? 'Updated from Google on this visit' : 'Snapshot checked '+(data.updated || 'September 20, 2026');
  document.querySelectorAll('.google-summary strong,[data-review-rating]').forEach(element => { element.textContent = ratingText; });
  const summary = document.querySelector('.google-summary p'); if (summary) summary.textContent = `${total} Google reviews - ${note}`;
  document.querySelectorAll('.rating-stars').forEach(element => element.setAttribute('aria-label',`${ratingText} out of 5 stars`));
  const heroRating = document.querySelector('.hero-review strong'); if (heroRating) heroRating.textContent = `${ratingText} / 5 on Google`;
  const heroNote = document.querySelector('.hero-review small'); if (heroNote) heroNote.textContent = `${total} reviews - ${note}`;
  const pageNote = document.querySelector('[data-review-summary]'); if (pageNote) pageNote.textContent = `${total} Google reviews. ${note}. Read the complete review history on Google.`;
}
let reviewRequest = 0;
async function loadReviews() {
  if (!homepageReviews && !reviewWall) return;
  const request = ++reviewRequest;
  let snapshot = {reviews:reviewEntries,updated:'2026-09-20',rating:4.9,total:57};
  try { const response = await fetch('content/reviews/reviews.json',{cache:'no-store'}); if(response.ok) snapshot={...snapshot,...await response.json()}; } catch {}
  if (request !== reviewRequest) return;
  renderReviews(snapshot.reviews,`Selected review excerpts, checked ${snapshot.updated}.`); updateReviewSummary(snapshot,false);
  try {
    const configResponse=await fetch('content/reviews/live.json',{cache:'no-store'});if(!configResponse.ok)return;
    const config=await configResponse.json();if(!config.endpoint)return;
    const endpoint=new URL(config.endpoint);if(endpoint.protocol!=='https:')return;
    const response=await fetch(endpoint.href,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Reviews unavailable');
    const data=await response.json();if(!data.live||!Array.isArray(data.reviews))throw Error('Invalid response');if(request!==reviewRequest)return;
    renderReviews(data.reviews,'Recently updated Google reviews, refreshed on this visit.');updateReviewSummary(data,true);
  } catch { if(request===reviewRequest)renderReviews(snapshot.reviews,`Showing selected reviews checked ${snapshot.updated}; live refresh is temporarily unavailable.`); }
}
renderReviews(reviewEntries,'Selected review excerpts, checked September 20, 2026.');
loadReviews();
window.addEventListener('pageshow',event=>{if(event.persisted)loadReviews();});

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

const heroPhoto = document.querySelector('#hero-project-photo');
let heroSlides = [
  {
    "image": "assets/residential.jpg",
    "alt": "Light painted walls and black staircase railings in a double-height living room",
    "caption": "Residential interior.\nLight walls. Bold contrast."
  },
  {
    "image": "assets/exterior.jpg",
    "alt": "Painted home exterior with cream siding, black shutters and white porch columns",
    "caption": "Exterior painting.\nA fresh welcome home."
  },
  {
    "image": "assets/maps-staircase-detail.jpg",
    "alt": "Black stair treads and railing with white walls and trim, from the company Google Maps profile",
    "caption": "Stairs & trim.\nEvery step, considered."
  },
  {
    "image": "assets/restaurant.jpg",
    "alt": "Restaurant interior with warm wood details, exposed brick and dark trim",
    "caption": "Commercial interior.\nA space that welcomes."
  },
  {
    "image": "assets/porch-painting.jpg",
    "alt": "Freshly painted gray porch and railings beside a red entry door",
    "caption": "Porches & exterior details.\nMake an entrance."
  },
  {
    "image": "assets/commercial.jpg",
    "alt": "Dunkin storefront with orange fascia and gray exterior finishes",
    "caption": "Commercial exterior.\nColor that means business."
  }
];

fetch('content/media.json').then(response => response.ok ? response.json() : null).then(media => {
  if (media?.homepage?.length) {
    const existingPhotos = new Set(['google-profile-photo.jpg','hero-house.jpg','project-commercial-wide.jpg','project-deck-complete.jpg','project-room-accent.jpg','project-room-finish.jpg','residential.jpg','restaurant.jpg']);
    const additions = media.homepage.filter(image => !existingPhotos.has(decodeURIComponent(image.split('/').pop())));
    heroSlides = heroSlides.concat(additions.map(image => ({ image, alt: 'USA For Painting uploaded project photo', caption: 'From our project collection.\nSee the work up close.' })));
    heroSlides.forEach(slide => { const image = new Image(); image.src = slide.image; });
  }
  const filmSource = document.querySelector('#brand-film source');
  if (filmSource && document.querySelector('#brand-film').dataset.managedVideo === 'true' && media?.video?.length) {
    filmSource.src = media.video[0];
    document.querySelector('#brand-film').load();
  }
}).catch(() => {});
heroSlides.forEach(slide => { const image = new Image(); image.src = slide.image; });
const heroCount = document.querySelector('#hero-project-count');
let slideIndex = 0;
function showHeroSlide(nextIndex) {
  if (!heroPhoto) return;
  slideIndex = (nextIndex + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[slideIndex];
  heroPhoto.classList.add('is-switching');
  window.setTimeout(() => {
    heroPhoto.src = slide.image;
    heroPhoto.alt = slide.alt;
    const caption = document.querySelector('.hero-photo-caption span');
    if (caption) caption.innerHTML = slide.caption.replace('\n', '<br>');
    if (heroCount) heroCount.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(heroSlides.length).padStart(2, '0')}`;
    heroPhoto.classList.remove('is-switching');
  }, 280);
}
document.querySelector('#hero-previous')?.addEventListener('click', () => showHeroSlide(slideIndex - 1));
document.querySelector('#hero-next')?.addEventListener('click', () => showHeroSlide(slideIndex + 1));
if (heroPhoto && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    if (document.hidden) return;
    showHeroSlide(slideIndex + 1);
  }, 5000);
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
    status.textContent = 'Use the video play button to watch the film.';
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

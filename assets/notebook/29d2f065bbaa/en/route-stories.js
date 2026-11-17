(() => {
  const stories = window.RoutePhotoStories;
  if (!stories) return;
  const label = "View 4 photo stories";
  // Product selection uses the same photo action as the homepage.
  document.querySelectorAll('.route-card[data-route] > figure').forEach(figure => {
    const id = figure.closest('[data-route]').dataset.route;
    if (!stories[id]) return;
    const photo = figure.querySelector('img');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trip-photo-preview';
    button.dataset.routeStory = id;
    button.setAttribute('aria-haspopup', 'dialog');
    photo.before(button);
    button.append(photo);
    const hint = document.createElement('span');
    hint.className = 'photo-preview-label';
    hint.textContent = '＋ ' + label;
    button.append(hint);
  });
  const triggers = [...document.querySelectorAll('[data-route-story]')];
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'brand-photo-dialog route-story-dialog';
  dialog.setAttribute('aria-labelledby', 'route-story-heading');
  dialog.innerHTML = "<header><h2 id=\"route-story-heading\"></h2><button type=\"button\" data-close aria-label=\"Close photo story\">Close ×</button></header><img alt=\"\"><div class=\"story-photo-controls\"><button type=\"button\" data-prev aria-label=\"Previous scene\">←</button><span data-count aria-live=\"polite\"></span><button type=\"button\" data-next aria-label=\"Next scene\">→</button></div><div class=\"story-photo-copy\"><p class=\"story-day\"></p><h3></h3><p data-experience></p><aside><b>We’ll prepare the details</b><p data-preparation></p></aside><p class=\"story-photo-credit\"></p><a data-source target=\"_blank\" rel=\"noopener\">View photo source ↗</a><p class=\"story-photo-status\" role=\"status\" hidden></p><button type=\"button\" data-retry hidden>Retry photo</button></div>";
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  const img = $('img'), previous = $('[data-prev]'), next = $('[data-next]');
  const status = $('.story-photo-status'), retry = $('[data-retry]');
  let story, index = 0, trigger, request = 0;
  function render() {
    const scene = story.scenes[index], currentRequest = ++request;
    previous.disabled = index === 0;
    next.disabled = index === story.scenes.length - 1;
    $('[data-count]').textContent = (index + 1) + ' / ' + story.scenes.length;
    status.hidden = false;
    status.textContent = "Loading the photo.";
    retry.hidden = true;
    const incoming = new Image();
    incoming.onload = () => {
      if (currentRequest !== request) return;
      img.src = scene.file;
      img.alt = scene.title;
      $('.story-day').textContent = scene.day;
      $('h3').textContent = scene.title;
      $('[data-experience]').textContent = scene.experience;
      $('[data-preparation]').textContent = scene.preparation;
      $('.story-photo-credit').textContent = scene.credit;
      $('[data-source]').hidden = !scene.source;
      if (scene.source) $('[data-source]').href = scene.source;
      status.hidden = true;
    };
    incoming.onerror = () => {
      if (currentRequest !== request) return;
      status.textContent = "The photo could not load. Please try again.";
      retry.hidden = false;
    };
    incoming.src = scene.file;
  }
  function move(direction) {
    const target = Math.max(0, Math.min(story.scenes.length - 1, index + direction));
    if (target !== index) { index = target; render(); }
  }
  triggers.forEach(button => button.addEventListener('click', () => {
    story = stories[button.dataset.routeStory];
    if (!story) return;
    trigger = button;
    index = 0;
    // Clear the previous trip before opening another trip's photo story.
    img.removeAttribute('src'); img.alt = '';
    for (const selector of ['.story-day', 'h3', '[data-experience]', '[data-preparation]', '.story-photo-credit']) $(selector).textContent = '';
    $('[data-source]').hidden = true;
    $('#route-story-heading').textContent = story.title;
    dialog.showModal(); dialog.scrollTop = 0;
    render();
  }));
  previous.onclick = () => move(-1);
  next.onclick = () => move(1);
  retry.onclick = render;
  $('[data-close]').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { request++; trigger?.focus({preventScroll:true}); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let touch;
  img.addEventListener('touchstart', event => { touch = event.touches.length === 1 ? event.touches[0] : null; }, {passive:true});
  img.addEventListener('touchend', event => {
    if (!touch) return;
    const end = event.changedTouches[0], dx = end.clientX - touch.clientX, dy = end.clientY - touch.clientY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    touch = null;
  }, {passive:true});
})();

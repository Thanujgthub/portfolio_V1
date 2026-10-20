// The reference uses pixel-based smoothstep windows, not a percentage of the page.
// Keep these breakpoints independent of the content following the sticky scene.
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const phase = (y, start, entered, exit, exited) => {
  const enter = smooth(start, entered, y), leave = smooth(exit, exited, y);
  return { enter, leave, active: enter * (1 - leave) };
};

export function initCinema() {
  const $ = selector => document.querySelector(selector);
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerMedia = matchMedia('(hover: hover) and (pointer: fine)');
  let customReduced = null;
  try {
    const saved = localStorage.getItem('thanuj-reduced-motion');
    if (saved !== null) customReduced = saved === 'true';
  } catch {}
  let reduced = customReduced ?? media.matches;
  const cinema = $('.cinema'), stage = $('.cinema-stage'), header = $('#header');
  const sky = $('.sky'), back = $('.back-stack'), mountain = $('.mountains'), village = $('.village');
  const left = $('.frame-left'), right = $('.frame-right'), bridge = $('.bridge'), arch = $('.frame-two');
  const title = $('.hero-title'), intro = $('.hero-intro'), shade = $('.scene-shade');
  const work = $('.story-work'), about = $('.story-about'), slider = $('.sights-slider');
  const controls = $('.sights-controls'), track = $('.sights-track'), progress = $('.scene-progress');
  const motionButton = $('#motion-toggle'), cards = [...track.children];
  const count = cards.length / 3;
  let index = count, cardStep = 0, scheduled = false, pointerX = 0, pointerY = 0, x = 0, y = 0;
  let viewportHeight = stage.clientHeight, scrollRange = 5000, sceneTop = 0, cardsVisible = false;
  let paused = false, manualUntil = 0;

  function visibility(element, visible) {
    element.inert = !visible;
    element.setAttribute('aria-hidden', String(!visible));
  }
  function moveCards(jump = false) {
    track.classList.toggle('is-jumping', jump);
    track.style.transform = `translate3d(${-index * cardStep - innerWidth * .18}px,0,0)`;
    // Only cards on screen enter keyboard navigation; repeat copies are decorative.
    cards.forEach((card, i) => {
      const visible = i >= index && i <= index + Math.ceil(innerWidth / cardStep);
      card.tabIndex = visible ? 0 : -1;
      card.setAttribute('aria-hidden', String(!visible));
    });
  }
  track.addEventListener('transitionend', event => {
    if (event.target !== track || event.propertyName !== 'transform') return;
    if (index >= count * 2 || index < count) {
      index = count + ((index % count) + count) % count;
      moveCards(true);
    }
  });
  function advance(direction) {
    if (track.classList.contains('is-jumping')) {
      track.classList.remove('is-jumping');
      // Commit the equivalent loop position before animating the next card.
      void track.offsetWidth;
    }
    index += direction;
    moveCards();
  }
  $('#scene-prev').addEventListener('click', () => { manualUntil = performance.now() + 3000; advance(-1); });
  $('#scene-next').addEventListener('click', () => { manualUntil = performance.now() + 3000; advance(1); });
  $('#scene-pause').addEventListener('click', event => {
    paused = !paused;
    event.currentTarget.setAttribute('aria-pressed', String(paused));
    event.currentTarget.setAttribute('aria-label', paused ? 'Play project carousel' : 'Pause project carousel');
    event.currentTarget.textContent = paused ? '▷' : 'Ⅱ';
  });
  setInterval(() => {
    if (!reduced && cardsVisible && !paused && !document.hidden && !$('#project-dialog').open &&
        performance.now() > manualUntil && !slider.matches(':hover,:focus-within') && !controls.matches(':focus-within')) advance(1);
  }, 2800);

  function measure() {
    viewportHeight = stage.clientHeight;
    scrollRange = Math.max(1, cinema.offsetHeight - viewportHeight);
    sceneTop = cinema.getBoundingClientRect().top + scrollY;
    cardStep = cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap);
    moveCards(true);
    requestDraw();
  }
  function draw() {
    scheduled = false;
    const scroll = clamp(scrollY - sceneTop, 0, scrollRange);
    const n = reduced ? 0 : scroll;
    header.classList.toggle('scrolled', scrollY > cinema.offsetHeight - 90);
    header.classList.toggle('scene-away', !reduced && n > 420 && scrollY < cinema.offsetHeight - 90);
    header.inert = header.classList.contains('scene-away');
    if (scrollY > cinema.offsetHeight + viewportHeight) return;
    const targetX = reduced ? 0 : pointerX, targetY = reduced ? 0 : pointerY;
    x += (targetX - x) * .08;
    y += (targetY - y) * .08;
    const workPhase = phase(n, 560, 900, 1300, 1620);
    const aboutPhase = phase(n, 1760, 2140, 2540, 2720);
    const depth = clamp(n / 2700), fade = smooth(90, 650, n);
    const panels = clamp(workPhase.active + aboutPhase.active);
    const scale = .76 + depth * .2 + workPhase.enter * .18 + aboutPhase.enter * .16;
    const rise = depth * -74, zoom = depth * .23, spread = workPhase.enter ** 1.5;
    const cardEntrance = smooth(2760, 3400, n) ** 1.4;
    const cardControls = smooth(3200, 3450, n);
    const cardTop = Math.min(220, Math.max(112, viewportHeight * .19)) - 50;
    const transform = (element, value) => { element.style.transform = value; };
    back.style.opacity = 1 - workPhase.active * .06;
    transform(back, `translate3d(${x * -4}px,${y * -2}px,0) scale(${scale})`);
    transform(mountain, `translate3d(-50%,${(10 + depth * 10) * viewportHeight / 100 - 110}px,0) scale(${.78 + depth * .16})`);
    transform(village, `translate3d(-50%,${(20 - depth * 8) * viewportHeight / 100}px,0) scale(.86)`);
    sky.style.filter = `blur(${panels * 14}px) brightness(${1 - panels * .255})`;
    mountain.style.filter = sky.style.filter;
    village.style.filter = `blur(${workPhase.active * 14}px) brightness(${1 - workPhase.active * .255 - aboutPhase.active * .06}) saturate(${1 + aboutPhase.active * .18})`;
    shade.style.zIndex = workPhase.active > .02 ? 2 : 0;
    shade.style.background = `linear-gradient(180deg,rgba(74,181,224,${panels * .465}),rgba(74,181,224,${panels * .42}) 48%,rgba(74,181,224,${panels * .51}))`;
    transform(title, `translate3d(0,${fade * -210}px,0) scale(${1 - fade * .08})`);
    title.style.opacity = 1 - fade;
    transform(intro, `translate3d(-50%,${fade * 90}px,0)`);
    intro.style.opacity = 1 - fade;
    visibility(intro, fade < .95);
    bridge.style.bottom = `${5 - workPhase.enter * 13}vh`;
    bridge.style.width = `min(${67.2 + workPhase.enter * 37.8}vw,2140px)`;
    transform(bridge, `translate3d(calc(-50% + ${x * 6}px),${y * 4 + rise - workPhase.leave * 760}px,0) scale(${1.02 + zoom + workPhase.leave * .46})`);
    for (const [element, direction] of [[left, -1], [right, 1]]) {
      transform(element, `translate3d(calc(-50% + ${direction * spread * 46}vw + ${x * 6}px),${y * 4 + rise - spread * 180}px,0) scale(${1 + zoom + workPhase.enter * .74})`);
    }
    arch.style.opacity = workPhase.active * (1 - aboutPhase.enter);
    transform(arch, `translate3d(calc(-50% + ${x * 4}px),calc(-50% + ${y * 3 - workPhase.leave * 150}px),0) scale(${1.06 + workPhase.enter * .08 + workPhase.leave * .08})`);
    for (const [panel, state] of [[work, workPhase], [about, aboutPhase]]) {
      const opacity = state.active * (1 - state.leave);
      panel.style.opacity = opacity;
      transform(panel, `translate3d(-50%,calc(-50% + ${-state.leave * 86 + (1 - state.enter) * 58}px),0)`);
      visibility(panel, opacity > .5);
    }
    slider.style.top = `${viewportHeight - (viewportHeight - cardTop) / scale}px`;
    transform(slider, `translate3d(${(1 - cardEntrance) * 120}vw,0,0) scale(${1 / scale})`);
    slider.style.visibility = cardEntrance > .01 ? 'visible' : 'hidden';
    cardsVisible = cardEntrance > .99 && scrollY < cinema.offsetHeight - viewportHeight / 2;
    visibility(slider, cardsVisible);
    controls.style.top = `${cardTop + 236}px`;
    controls.style.opacity = cardControls;
    visibility(controls, cardControls > .9);
    transform(progress, `scaleX(${n / scrollRange})`);
    if (Math.abs(targetX - x) > .0001 || Math.abs(targetY - y) > .0001) requestDraw();
  }
  function requestDraw() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(draw); }
  }
  function applyMotion() {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.setAttribute('aria-label', reduced ? 'Enable full motion' : 'Reduce motion');
    motionButton.innerHTML = reduced ? 'Motion off <span>○</span>' : 'Motion on <span>◉</span>';
    measure();
  }
  motionButton.addEventListener('click', () => {
    // Keep the current reading location when the long sticky section collapses.
    const previousHeight = cinema.offsetHeight, previousScroll = scrollY;
    reduced = !reduced;
    customReduced = reduced;
    try { localStorage.setItem('thanuj-reduced-motion', String(reduced)); } catch {}
    applyMotion();
    if (previousScroll >= previousHeight) scrollTo({ top: previousScroll + cinema.offsetHeight - previousHeight, behavior: 'instant' });
    else scrollTo({ top: sceneTop, behavior: 'instant' });
  });
  media.addEventListener('change', () => {
    if (customReduced === null) { reduced = media.matches; applyMotion(); }
  });
  window.addEventListener('scroll', requestDraw, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pointermove', event => {
    if (!pointerMedia.matches || reduced || scrollY > cinema.offsetHeight) return;
    pointerX = event.clientX / innerWidth - .5;
    pointerY = event.clientY / innerHeight - .5;
    requestDraw();
  }, { passive: true });
  document.querySelectorAll('a[href="#intro"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    scrollTo({ top: reduced ? cinema.offsetHeight : sceneTop + 950, behavior: reduced ? 'instant' : 'smooth' });
  }));
  applyMotion();
}

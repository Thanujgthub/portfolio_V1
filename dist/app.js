import { initCinema } from './cinema.js';
import { profile, projects, skills, milestones } from './content.js';

const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const external = 'target="_blank" rel="noopener noreferrer"';
const tagsHTML = tags => tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('');

function artHTML(project) {
  const layouts = {
    ocr: `<div class="ocr-flow"><div class="handwritten" lang="te">అక్షర</div><span class="flow-dots">···›</span><div class="ocr-output"><span>HELD-OUT EVALUATION</span><strong>76.20<span style="font-size:.5em">%</span></strong><small>EXACT-WORD MATCH</small></div></div>`,
    rag: `<div class="rag-flow"><div class="doc-stack"><i></i><i></i><i></i></div><span class="flow-dots">···›</span><div class="rag-answer"><span>Answers with context.</span><p>Documents → retrieval → response</p><small>↗ Source included</small></div></div>`,
    agents: `<div class="agents-flow">${['Plan', 'Execute', 'Validate', 'Recover', 'Monitor'].map((n,i) => `${i ? '<span class="agent-edge"></span>' : ''}<div class="agent-node"><strong>${['◇','↗','✓','⟳','⌁'][i]}</strong><small>${n}</small></div>`).join('')}</div>`,
    network: `<svg class="network-diagram" viewBox="0 0 420 220" aria-hidden="true"><g>${[[75,65,210,100],[350,55,210,100],[210,100,110,175],[210,100,295,170],[75,65,110,175],[350,55,295,170],[110,175,295,170]].map(a=>`<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}"/>`).join('')}</g>${[[75,65,'192.168.1.1'],[350,55,'192.168.1.2'],[110,175,'192.168.1.3'],[295,170,'192.168.1.4']].map(a=>`<circle cx="${a[0]}" cy="${a[1]}" r="5"/><text x="${a[0]}" y="${a[1]+22}" text-anchor="middle">${a[2]}</text>`).join('')}<circle cx="210" cy="100" r="18"/><circle cx="210" cy="100" r="25" fill="none" opacity=".25"/><text x="210" y="104" text-anchor="middle">/29</text></svg>`,
    voice: `<div class="voice-wave"><span class="voice-play">▷</span>${[14,26,42,25,61,84,51,35,71,98,56,29,46,74,90,60,34,51,25,14,30,45,23,13].map(h=>`<i style="height:${h}px"></i>`).join('')}</div>`,
  };
  return `<span class="art-corner">${escapeHTML(project.name.toUpperCase())} / PROJECT NOTES</span><span class="art-number">${project.number}</span>${layouts[project.visual]}<div class="art-footer"><span>${escapeHTML(project.status.toUpperCase())}</span><span class="art-arrow">↗</span></div>`;
}

$('#project-grid').innerHTML = projects.map(p => `<article class="project-card reveal">
  <button class="project-art-button" data-project="${p.id}" aria-label="Explore ${escapeHTML(p.name)}"><div class="project-art art-${p.visual}">${artHTML(p)}</div></button>
  <div class="project-info"><p class="project-kicker">${p.number} / ${escapeHTML(p.category.toUpperCase())}</p>
  <button class="project-name" data-project="${p.id}">${escapeHTML(p.name)}</button>
  <p class="project-subtitle">${escapeHTML(p.subtitle)}</p><p class="project-description">${escapeHTML(p.description)}</p>
  <div class="tags">${tagsHTML(p.tags)}</div><div class="project-links">
  ${p.live ? `<a href="${p.live}" ${external}>Visit project ↗</a>` : ''}
  <a href="${p.github}" ${external}>Source code ↗</a><button data-project="${p.id}">Read more +</button></div></div></article>`).join('');

$('#timeline').innerHTML = milestones.map(m => `<article class="timeline-row reveal"><div class="timeline-date">${escapeHTML(m.date)}</div><div class="timeline-main"><h3>${m.href ? `<a href="${m.href}" ${external}>${escapeHTML(m.title)} <span style="font-size:.6em">↗</span></a>` : escapeHTML(m.title)}</h3><p class="place">${escapeHTML(m.place)}</p><p>${escapeHTML(m.text)}</p></div><span class="timeline-type">${escapeHTML(m.type)}</span></article>`).join('');

// Repeated cards make a seamless loop; each opens the same project details.
$('#scene-projects').innerHTML = [...projects, ...projects, ...projects].map((p, i) => `
  <button class="sight-card" data-project="${p.id}" aria-label="Explore ${escapeHTML(p.name)}">
    <span class="sight-kicker">${escapeHTML(p.category)} · ${p.number}</span>
    <img class="sight-pin" src="./assets/pin-${i % projects.length % 3 + 1}.webp" alt="" width="68" height="68">
    <span class="sight-name">${escapeHTML(p.name)}</span>
    <span class="sight-description">${escapeHTML(p.subtitle)}</span>
  </button>`).join('');

// Native dialog supplies keyboard trapping, Escape support, and focus restoration.
const dialog = $('#project-dialog');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects.find(p => p.id === button.dataset.project);
    dialogTrigger = button;
    $('#dialog-visual').className = `project-art art-${project.visual}`;
    $('#dialog-visual').innerHTML = artHTML(project);
    $('#dialog-category').textContent = `${project.number} / ${project.category.toUpperCase()}`;
    $('#dialog-title').textContent = project.name;
    $('#dialog-description').textContent = project.detail;
    $('#dialog-tags').innerHTML = tagsHTML(project.tags);
    $('#dialog-links').innerHTML = `${project.live ? `<a href="${project.live}" ${external}>Visit project ↗</a>` : ''}<a href="${project.github}" ${external}>View on GitHub ↗</a>`;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
  });
});
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogTrigger?.focus({ preventScroll: true });
});

const nodes = $('#skill-nodes');
nodes.innerHTML = skills.map((skill, index) => `<button class="skill-node${index === 0 ? ' selected' : ''}" data-skill="${index}" style="--x:${skill.x};--y:${skill.y}" aria-pressed="${index === 0}">${escapeHTML(skill.name)}</button>`).join('');
const edges = [[0,1],[0,4],[0,5],[1,2],[1,9],[2,3],[3,8],[3,9],[4,9],[4,5],[5,6],[5,10],[6,7],[6,12],[7,8],[7,12],[8,11],[9,7],[9,4],[10,12],[11,12],[9,1]];
$('.constellation-lines').innerHTML = edges.map(([a,b])=>`<line data-a="${a}" data-b="${b}" x1="${skills[a].x*10}" y1="${skills[a].y*4.6}" x2="${skills[b].x*10}" y2="${skills[b].y*4.6}"/>`).join('');
function selectSkill(index) {
  const skill = skills[index];
  $('#skill-title').textContent = skill.name;
  $('#skill-description').textContent = skill.text;
  $('#skill-group').textContent = skill.group;
  document.querySelectorAll('.skill-node').forEach(node => {
    const selected = Number(node.dataset.skill) === index;
    node.classList.toggle('selected', selected);
    node.setAttribute('aria-pressed', String(selected));
  });
}
nodes.addEventListener('click', e => {
  const node = e.target.closest('[data-skill]');
  if (node) selectSkill(Number(node.dataset.skill));
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    document.querySelectorAll('.skill-node').forEach(node => {
      const dimmed = filter !== 'All' && skills[Number(node.dataset.skill)].group !== filter;
      node.classList.toggle('dimmed', dimmed);
      node.disabled = dimmed;
    });
    document.querySelectorAll('.constellation-lines line').forEach(line => {
      line.classList.toggle('muted-line', filter !== 'All' && (skills[Number(line.dataset.a)].group !== filter || skills[Number(line.dataset.b)].group !== filter));
    });
    selectSkill(filter === 'All' ? 0 : skills.findIndex(s => s.group === filter));
  });
});

const menuButton = $('.menu-toggle');
const menu = $('#mobile-menu');
function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  menuButton.setAttribute('aria-expanded', String(!menu.hidden));
  menuButton.setAttribute('aria-label', menu.hidden ? 'Open navigation' : 'Close navigation');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });

$('#copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(profile.email);
    $('#copy-status').textContent = 'Email address copied.';
  } catch { $('#copy-status').textContent = `Email: ${profile.email}`; }
});
$('#year').textContent = new Date().getFullYear();

initCinema();
window.addEventListener('resize', () => { if (innerWidth > 700) closeMenu(); }, { passive: true });

// Content remains visible if JavaScript or IntersectionObserver is unavailable.
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

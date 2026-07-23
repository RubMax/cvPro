/* ============================================================
   CV BUILDER PRO — script.js
   ============================================================ */

/* ---------- STATE ---------- */
let state = {
  template: 1,
  photo: null,
  fullName: '',
  email: '',
   phone: '',
  reference: '',
  contact1: '',
  contact2: '',
  birthDate: '',
  nationality: '',
  maritalStatus: '',
  address: '',
  interest: 'A disposição da empresa',
  education: '',
  skills: [],
  customSkills: [],
  coverLetter: 'Busco uma oportunidade para aplicar meus conhecimentos, aprender na prática, desenvolver minhas habilidades e crescer profissionalmente em equipe.',
  experiences: [],
  languages: [],
  formations: [],
  additionalInfo: ''
};

let expCount = 0;
let langCount = 0;
let autoSaveTimer = null;

/* ---------- INIT ---------- */
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  updatePreview();

  // register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
  if (data.formHTML_formacao) {
  document.getElementById('formacaoList').innerHTML = data.formHTML_formacao;
  document.querySelectorAll('[id^="form-curso-"],[id^="form-inst-"],[id^="form-periodo-"]')
    .forEach(el => el.addEventListener('input', updatePreview));
  document.querySelectorAll('[id^="form-situacao-"]')
    .forEach(el => el.addEventListener('change', updatePreview));
}
});

/* ============================================================
   TEMPLATE SELECTOR
   ============================================================ */
function selectTemplate(n) {
  state.template = n;
  document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tpl="${n}"]`).classList.add('active');
  updatePreview();
}

/* ============================================================
   PHOTO
   ============================================================ */
function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.photo = e.target.result;
    const prev = document.getElementById('photoPreview');
    prev.innerHTML = `<img src="${state.photo}" alt="foto" />`;
    updatePreview();
    scheduleAutoSave();
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   EXPERIENCES
   ============================================================ */
function addExperience() {
  if (expCount >= 3) { showToast('Máximo 3 experiências', true); return; }
  expCount++;
  const id = expCount;
  const div = document.createElement('div');
  div.className = 'exp-card';
  div.id = `exp-${id}`;
  div.innerHTML = `
    <div class="exp-header">
      <span>Experiência ${id}</span>
      <button class="btn-remove" onclick="removeExperience(${id})"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Empresa</label>
        <input type="text" id="exp-empresa-${id}" placeholder="Nome da empresa" oninput="updatePreview()" />
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <input type="text" id="exp-cargo-${id}" placeholder="Seu cargo" oninput="updatePreview()" />
      </div>
      <div class="form-group full">
        <label>Período</label>
        <input type="text" id="exp-periodo-${id}" placeholder="Ex: Jan 2022 - Dez 2023" oninput="updatePreview()" />
      </div>
      <div class="form-group full">
        <label>Descrição</label>
        <textarea id="exp-desc-${id}" rows="2" maxlength="250" placeholder="Descreva suas atividades (máx. 250 caracteres)" oninput="updateExpChar(${id}); updatePreview()"></textarea>
        <div class="char-count" id="exp-char-${id}">0 / 250</div>
      </div>
    </div>`;
  document.getElementById('experiencesList').appendChild(div);
  if (expCount >= 3) document.getElementById('addExpBtn').style.display = 'none';
}

function removeExperience(id) {
  document.getElementById(`exp-${id}`)?.remove();
  expCount = Math.max(0, expCount - 1);
  document.getElementById('addExpBtn').style.display = '';
  updatePreview();
}

function updateExpChar(id) {
  const ta = document.getElementById(`exp-desc-${id}`);
  const cc = document.getElementById(`exp-char-${id}`);
  if (!ta || !cc) return;
  const len = ta.value.length;
  cc.textContent = `${len} / 250`;
  cc.classList.toggle('warn', len >= 230);
}

/* ============================================================
   LANGUAGES
   ============================================================ */
function addLanguage() {
  langCount++;
  const id = langCount;
  const div = document.createElement('div');
  div.className = 'lang-card';
  div.id = `lang-${id}`;
  div.innerHTML = `
    <div class="lang-header">
      <span>Idioma ${id}</span>
      <button class="btn-remove" onclick="removeLang(${id})"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Idioma</label>
        <select id="lang-nome-${id}" onchange="updatePreview()">
          <option value="">Selecionar</option>
          <option>Português</option>
          <option>Español</option>
          <option>Français</option>
          <option>English</option>
          <option>Crioulo Haitiano</option>
        </select>
      </div>
      <div class="form-group">
        <label>Nível</label>
        <select id="lang-nivel-${id}" onchange="updatePreview()">
          <option value="">Selecionar</option>
          <option>Básico</option>
          <option>Intermediário</option>
          <option>Avançado</option>
          <option>Fluente</option>
          <option>Nativo</option>
        </select>
      </div>
    </div>`;
  document.getElementById('languagesList').appendChild(div);
}

function removeLang(id) {
  document.getElementById(`lang-${id}`)?.remove();
  langCount = Math.max(0, langCount - 1);
  updatePreview();
}

/* ============================================================
   CUSTOM SKILLS
   ============================================================ */
function addCustomSkill() {
  const container = document.getElementById('customSkills');
  const row = document.createElement('div');
  row.className = 'custom-skill-row';
  row.innerHTML = `
    <input type="text" placeholder="Nova habilidade..." oninput="updatePreview()" />
    <button class="btn-remove-small" onclick="this.parentElement.remove(); updatePreview()"><i class="fa-solid fa-xmark"></i></button>`;
  container.appendChild(row);
}

/* ============================================================
   COLLECT STATE FROM FORM
   ============================================================ */
function collectState() {
  state.fullName = val('fullName');
  state.email = val('email');
  state.phone = val('phone');
  state.reference = val('reference');
  state.contact1 = val('contact1');
  state.contact2 = val('contact2');
  state.birthDate = val('birthDate');
  state.nationality = val('nationality');
  state.maritalStatus = val('maritalStatus');
  state.address = val('address');
  state.interest = val('interest');
  state.education = val('education');
  state.coverLetter = val('coverLetter');
  state.additionalInfo = val('additionalInfo');

  // skills
  state.skills = [];
  document.querySelectorAll('#skillsChecklist input[type="checkbox"]:checked').forEach(cb => {
    state.skills.push(cb.value);
  });
  state.customSkills = [];
  document.querySelectorAll('#customSkills .custom-skill-row input').forEach(inp => {
    if (inp.value.trim()) state.customSkills.push(inp.value.trim());
  });

  // experiences
  state.experiences = [];
  for (let i = 1; i <= 20; i++) {
    const empresa = document.getElementById(`exp-empresa-${i}`);
    if (!empresa) continue;
    state.experiences.push({
      empresa: empresa.value || '',
      cargo: val(`exp-cargo-${i}`),
      periodo: val(`exp-periodo-${i}`),
      desc: val(`exp-desc-${i}`)
    });
  }

  // languages
  state.languages = [];
  for (let i = 1; i <= 20; i++) {
    const nome = document.getElementById(`lang-nome-${i}`);
    if (!nome) continue;
    state.languages.push({
      nome: nome.value || '',
      nivel: val(`lang-nivel-${i}`)
    });
  }
  // Ajoute ce bloc à la fin de collectState(), avant la fermeture }
state.formations = [];
for (let i = 1; i <= 20; i++) {
  const curso = document.getElementById(`form-curso-${i}`);
  if (!curso) continue;
  state.formations.push({
    curso:    curso.value || '',
    inst:     val(`form-inst-${i}`),
    periodo:  val(`form-periodo-${i}`),
    situacao: val(`form-situacao-${i}`)
  });
}
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value || '' : '';
}

/* ============================================================
   HELPER — Détecte si le CV est "léger" (pas d'expériences)
   et retourne la classe d'espacement à appliquer
   ============================================================ */
function getSpacingClass() {
  const hasExp = state.experiences.filter(e => e.empresa || e.cargo).length > 0;
  const hasForm = state.formations && state.formations.filter(f => f.curso).length > 0;
  return (!hasExp && !hasForm) ? 'cv-spacious' : '';
}

/* ============================================================
   UPDATE PREVIEW
   ============================================================ */
function updatePreview() {
  collectState();
  const cv = document.getElementById('cvPreview');
  cv.className = `cv-a4 template-${state.template}`;

  let html = '';
  if (state.template === 1) html = renderTemplate1();
  else if (state.template === 2) html = renderTemplate2();
  else if (state.template === 3) html = renderTemplate3();
  else if (state.template === 4) html = renderTemplate4();
  else if (state.template === 5) html = renderTemplate5();
else if (state.template === 6) html = renderTemplate6();
else if (state.template === 7) html = renderTemplate7();
else if (state.template === 8) html = renderTemplate8();
else if (state.template === 9)  html = renderTemplate9();
else if (state.template === 10) html = renderTemplate10();
else if (state.template === 11) html = renderTemplate11();
else                            html = renderTemplate12();

  cv.innerHTML = html;
  adjustSectionSpacing();
  scheduleAutoSave();
  setTimeout(fitA4, 80);
}

/* ============================================================
   FIT A4
   ============================================================ */
function fitA4() {
  const cv = document.getElementById('cvPreview');
  if (!cv) return;
  const TARGET = 1123;
  let fontSize = 14;
  cv.style.fontSize = fontSize + 'px';
  cv.style.lineHeight = '1.4';

  let attempts = 0;
  while (cv.scrollHeight > TARGET + 5 && attempts < 10) {
    fontSize -= 0.4;
    if (fontSize < 12) { fontSize = 12; cv.style.fontSize = '12px'; break; }
    cv.style.fontSize = fontSize + 'px';
    attempts++;
  }
}

/* ============================================================
   TEMPLATE 1 — CORPORATE GOLD
   ============================================================ */
function renderTemplate1() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  const hasPhoto = s.photo;

  return `
    <div class="t1-sidebar">
      <div class="t1-photo-area">
        ${hasPhoto ? `<div class="t1-photo"><img src="${hasPhoto}" alt="foto" /></div>` : ''}
        ${s.fullName ? `<div class="t1-name">${esc(s.fullName)}</div>` : ''}
        
      </div>
      <div class="t1-divider"></div>
      <div class="t1-section-label">Contatos</div>
      <div class="t1-contact-list">
        ${s.email ? `<div class="t1-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
        ${s.contact1 ? `<div class="t1-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
        ${s.contact2 ? `<div class="t1-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
        ${s.address ? `<div class="t1-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
        ${s.birthDate ? `<div class="t1-contact-item"><i class="fa-solid fa-cake-candles"></i>${formatDate(s.birthDate)}</div>` : ''}
        ${s.nationality ? `<div class="t1-contact-item"><i class="fa-solid fa-flag"></i>${esc(s.nationality).toUpperCase()}</div>` : ''}
        ${s.maritalStatus ? `<div class="t1-contact-item"><i class="fa-solid fa-heart"></i>${esc(s.maritalStatus)}</div>` : ''}
      </div>
      ${s.education ? `
      <div class="t1-divider"></div>
      <div class="t1-section-label">Escolaridade</div>
      <div class="t1-edu-text">${esc(s.education)}</div>` : ''}
      
      ${s.languages.length > 0 ? `
      <div class="t1-divider"></div>
      <div class="t1-section-label">Idiomas</div>
      <div class="t1-lang-list">
        ${s.languages.filter(l=>l.nome).map(l => `
        <div class="t1-lang-item">
          <span>${esc(l.nome)}</span>
          <span class="t1-lang-level">${esc(l.nivel)}</span>
        </div>`).join('')}
      </div>` : ''}

      
      ${s.phone ? `
      ${s.reference ? `
        <div class="t1-divider"></div>
      <div class="t1-section-label">REFERÊNCIAS</div>
      <div class="t1-contact-list">
        <div class="t1-contact-item"><i class="fa-solid fa-user-friends"></i>${esc(s.reference)}</div>
      </div>` : ''}
      <div class="t1-contact-list">
        <div class="t1-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.phone)}</div>
      </div>` : ''}

    </div>
 
    <div class="t1-main ${getSpacingClass()}">
      <div class="t1-header-banner">
        <div class="t1-banner-name">${esc(s.fullName) || 'Seu Nome'}</div>
        
      </div>
      <div class="t1-body ${getSpacingClass()}">
        ${s.coverLetter ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t1-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t1-cover-text">${esc(s.interest)}</div>
        </div>` : ''}

         
        ${s.formations.filter(f => f.curso).length > 0 ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title">
            <i class="fa-solid fa-book-open"></i>Formação Profissional
          </div>
          ${s.formations.filter(f => f.curso).map(f => `
          <div style="margin-bottom:7px; padding-left:4px; border-left:2px solid var(--tpl1-accent);">
            <div style="font-weight:700; font-size:12px; color:#0d2137; text-transform:uppercase;">
              ${esc(f.curso)}
            </div>
            ${f.inst    ? `<div style="font-size:12px;color:#555;">Instituição: <b>${esc(f.inst).toUpperCase()}</b></div>` : ''}
            ${f.periodo ? `<div style="font-size:12px;color:#555;">Período: ${esc(f.periodo)}</div>` : ''}
            ${f.situacao? `<div style="font-size:11px;color:var(--tpl1-accent);font-weight:600;">${esc(f.situacao)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}

        
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          <div class="t1-timeline">
            ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
            <div class="t1-timeline-item">
              <div class="t1-timeline-dot"><span></span></div>
              <div class="t1-timeline-content">
                <div class="t1-job-title">${esc(e.cargo) || 'Cargo'}</div>
                <div class="t1-job-company">${esc(e.empresa) || ''}</div>
                ${e.periodo ? `<div class="t1-job-period">${esc(e.periodo)}</div>` : ''}
                ${e.desc ? `<div class="t1-job-desc">${esc(e.desc)}</div>` : ''}
              </div>
            </div>`).join('')}
          </div>
        </div>` : ''}
        
        ${allSkills.length > 0 ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div class="t1-skills-list" style="padding:0">
            ${allSkills.map(sk => `<div class="t1-skill-item" style="color:#333">${esc(sk)}</div>`).join('')}
          </div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t1-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
    </div>`;
}
/* ============================================================
   TEMPLATE 2 — LINKEDIN PREMIUM
   ============================================================ */
function renderTemplate2() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t2-top-bar"></div>
    <div class="t2-header">
      ${s.photo ? `<div class="t2-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t2-name-area">
        <div class="t2-name">${esc(s.fullName) || 'Seu Nome'}</div>
      </div>
    </div>
    <div class="t2-body ${getSpacingClass()}">
      <div class="t2-main ${getSpacingClass()}">
        ${s.coverLetter ? `
        <div style="margin-bottom:12px">
          <div class="t2-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t2-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div style="margin-bottom:12px">
          <div class="t2-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t2-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t2-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t2-exp-item">
            <div class="t2-job-title">${esc(e.cargo) || 'Cargo'}</div>
            <div class="t2-job-company">${esc(e.empresa) || ''}</div>
            <div class="t2-job-period">${esc(e.periodo) || ''}</div>
            ${e.desc ? `<div class="t2-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}


        ${s.formations.filter(f => f.curso).length > 0 ? `
<div style="margin-bottom:12px">
  <div class="t2-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t2-cover-text" style="margin-bottom:12px;">
      <div style="font-weight:700;">
        ${esc(f.curso)}
      </div>

      ${f.inst ? `<div>Instituição: ${esc(f.inst).toUpperCase()}</div>` : ''}
      ${f.periodo ? `<div>Período: ${esc(f.periodo)}</div>` : ''}
      ${f.situacao ? `<div><strong>${esc(f.situacao)}</strong></div>` : ''}
    </div>
  `).join('')}
</div>` : ''}

        
        ${allSkills.length > 0 ? `
        <div style="margin-top:12px">
          <div class="t2-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t2-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div style="margin-top:12px">
          <div class="t2-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t2-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
      <div class="t2-sidebar">
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-address-card"></i>Contato</div>
          ${s.email ? `<div class="t2-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
          ${s.contact1 ? `<div class="t2-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
          ${s.contact2 ? `<div class="t2-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
          ${s.address ? `<div class="t2-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
        </div>
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-id-card"></i>Pessoal</div>
          <div class="t2-info-box">
            ${s.birthDate ? `<p><b>Nascimento:</b> ${formatDate(s.birthDate)}</p>` : ''}
            ${s.nationality ? `<p><b>Nacionalidade:</b> ${esc(s.nationality).toUpperCase()}</p>` : ''}
            ${s.maritalStatus ? `<p><b>Estado Civil:</b> ${esc(s.maritalStatus)}</p>` : ''}
          </div>
        </div>` : ''}
        ${s.education ? `
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-graduation-cap"></i>Escolaridade</div>
          <div class="t2-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-language"></i>Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t2-lang-row">
            <span>${esc(l.nome)}</span>
            <span class="t2-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}

         ${s.phone ? `
      ${s.reference ? `
        <div style="margin-bottom:10px">
      <div class="t2-section-title"><i class="fa-solid fa-user"></i>REFERÊNCIAS</div>
      <div class="t2-contact-list">
        <div class="t2-contact-item"><i class="fa-solid fa-user-friends"></i>${esc(s.reference)}</div>
      </div>` : ''}
      <div class="t2-contact-list">
        <div class="t2-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.phone)}</div>
      </div>` : ''}

      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 3 — CLEAN PRINT
   ============================================================ */
function renderTemplate3() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t3-top-accent"></div>
    <div class="t3-header">
      ${s.photo ? `<div class="t3-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t3-name-block">
        <div class="t3-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div>
          <div class="t3-section-title">
          <i class="fa-solid fa-bullseye"></i>
          <strong>Área de Interesse:</strong>
          <span style="font-weight: normal;">${esc(s.interest)}</span>
      </div>
          
    </div>
      </div>
      <div class="t3-header-contacts">
        ${s.email    ? `<div class="t3-hc-item">${esc(s.email)}<i class="fa-solid fa-envelope"></i></div>` : ''}
        ${s.contact1 ? `<div class="t3-hc-item">${esc(s.contact1)}<i class="fa-solid fa-phone"></i></div>` : ''}
        ${s.contact2 ? `<div class="t3-hc-item">${esc(s.contact2)}<i class="fa-brands fa-whatsapp"></i></div>` : ''}
        ${s.address  ? `<div class="t3-hc-item">${esc(s.address)}<i class="fa-solid fa-location-dot"></i></div>` : ''}
      </div>
    </div>
    <div class="t3-body">
      <div class="t3-main">
        ${s.coverLetter ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t3-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t3-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t3-exp-card">
            <div class="t3-job-title">${esc(e.cargo) || 'Cargo'}</div>
            <div class="t3-job-company">${esc(e.empresa) || ''}</div>
            ${e.periodo ? `<div class="t3-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc ? `<div class="t3-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}

${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t3-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t3-cover-text" style="margin-bottom:12px;">
      <div style="font-weight:700;">
        ${esc(f.curso)}
      </div>

      ${f.inst ? `<div>Instituição: ${esc(f.inst).toUpperCase()}</div>` : ''}
      ${f.periodo ? `<div>Período: ${esc(f.periodo)}</div>` : ''}
      ${f.situacao ? `<div><strong>${esc(f.situacao)}</strong></div>` : ''}
    </div>
  `).join('')}
</div>` : ''}

        ${allSkills.length > 0 ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t3-skill-tag">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t3-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
      <div class="t3-sidebar">
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div>
          <div class="t3-section-label">Pessoal</div>
          ${s.birthDate    ? `<div class="t3-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
          ${s.nationality  ? `<div class="t3-info-row"><b>Nac.:</b> ${esc(s.nationality).toUpperCase()}</div>` : ''}
          ${s.maritalStatus? `<div class="t3-info-row"><b>E.Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}
        </div>` : ''}
        ${s.education ? `
        <div>
          <div class="t3-section-label">Escolaridade</div>
          <div class="t3-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div>
          <div class="t3-section-label">Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t3-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t3-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}


         ${s.phone ? `
      ${s.reference ? `
        <div style="margin-bottom:1px">
      <div class="t3-section-label">REFERÊNCIAS</div>
      <div class="t3-contact-list">
        <div class="t2-contact-item"><i class="fa-solid fa-user-friends"></i>${esc(s.reference)}</div>
      </div>` : ''}
      <div class="t3-contact-list">
        <div class="t2-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.phone)}</div>
      </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 4 — JHONY KILLER STYLE (VALIDADO COMPLETO)
   Correção: Adicionado Estado Civil, Referência com Telefone e Empresa
   ============================================================ */
function renderTemplate4() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  const hasPhoto = s.photo;
  
  return `
    <div class="t4-cv">
      
      <!-- BARRA LATERAL (ESQUERDA) -->
      <div class="t4-sidebar">
        <!-- Foto -->
        <div class="t4-photo-container">
          ${hasPhoto ? `
          <div class="t4-photo">
            <img src="${hasPhoto}" alt="foto" />
          </div>` : `
          <div class="t4-photo-placeholder">
            <i class=""></i>
          </div>`}
        </div>

        <!-- CONTATO -->
        <div class="t4-section">
          <h3 class="t4-sidebar-title">CONTATO</h3>
          <div class="t4-contact-list">
            ${s.fullName ? `<div class="t4-contact-line-name"><i class="fa-solid fa-user"></i> <span>${esc(s.fullName)}</span></div>` : ''}
            ${s.email ? `<div class="t4-contact-line"><i class="fa-solid fa-envelope"></i> <span>${esc(s.email)}</span></div>` : ''}
            ${s.address ? `<div class="t4-contact-line"><i class="fa-solid fa-location-dot"></i> <span>${esc(s.address)}</span></div>` : ''}
            ${s.whatsapp || s.linkedin ? `<div class="t4-contact-line"><i class="fa-brands fa-whatsapp"></i> <span>${esc(s.whatsapp || s.linkedin)}</span></div>` : ''}

        ${s.contact1 ? `<div class="t4-contact-line"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
        ${s.contact2 ? `<div class="t4-contact-line"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
        ${s.address ? `<div class="t4-contact-line"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
       </div>
        </div>

        <!-- DADOS PESSOAIS (Incluso Estado Civil Corretamente) -->
        ${s.birthDate || s.nationality || s.civilStatus ? `
        <div class="t4-section">
          <h3 class="t4-sidebar-title">DADOS PESSOAIS</h3>
          <div class="t4-contact-list">
            ${s.birthDate ? `<div class="t4-contact-line">  <i class="fa-solid fa-cake-candles"></i>  <span>Nascimento: ${    s.birthDate.split('-').reverse().join('/')  }</span></div>` : ''}
${s.nationality ? `<div class="t4-contact-line"><i class="fa-solid fa-flag"></i> <span>Nacionalidade: ${esc(s.nationality).toUpperCase()}</span></div>` : ''}
            ${s.maritalStatus ? `<div class="t4-contact-line"><i class="fa-solid fa-heart"></i>${esc(s.maritalStatus)}</div>` : ''}
      </div>
        </div>
        ` : ''}

        <!-- IDIOMAS -->
        ${s.languages && s.languages.filter(l => l.nome).length > 0 ? `
        <div class="t4-section">
          <h3 class="t4-sidebar-title">IDIOMAS</h3>
          <div class="t4-level-list">
            ${s.languages.filter(l => l.nome).map(l => {
              let pct = "50%"; 
              const lvl = (l.nivel || "").toLowerCase();
              if (lvl.includes("básico") || lvl.includes("basico") || lvl.includes("a1") || lvl.includes("a2")) pct = "30%";
              else if (lvl.includes("intermediário") || lvl.includes("intermediario") || lvl.includes("b1") || lvl.includes("b2")) pct = "65%";
              else if (lvl.includes("avançado") || lvl.includes("avancado") || lvl.includes("fluente") || lvl.includes("c1") || lvl.includes("c2")) pct = "95%";
              return `
              <div class="t4-level-line">
                <span class="t4-level-name">${esc(l.nome)}</span>
                <div class="t4-bar-container"><div class="t4-bar" style="width: ${pct};"></div></div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <!-- COMPETÊNCIAS -->
        ${allSkills.length > 0 ? `
        <div class="t4-section">
          <h3 class="t4-sidebar-title">COMPETÊNCIAS</h3>
          <div class="t4-level-list">
            ${allSkills.map((skill, index) => {
              const variants = ["85%", "70%", "90%", "60%", "75%"];
              const pct = variants[index % variants.length];
              return `
              <div class="t4-level-line">
                <span class="t4-level-name">${esc(skill)}</span>
                <div class="t4-bar-container"><div class="t4-bar" style="width: ${pct};"></div></div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- PAINEL PRINCIPAL (DIREITA) -->
      <div class="t4-main">
        <div class="t4-header-bg">
          <div class="t4-header-text">
            <h1 class="t4-name">${esc(s.fullName) || ''}</h1>
            <p class="t4-title"><i class="fa-solid fa-bullseye"></i>
          <strong>Área de Interesse:</strong>${esc(s.interest) || 'ÁREA DE INTERESSE'}</p>
          </div>
          <div class="t4-wave-decor"></div>
        </div>

        <div class="t4-main-content">
          <!-- APRESENTAÇÃO -->
          ${s.coverLetter ? `
          <div class="t4-main-block">
            <h3 class="t4-main-title"><i class="fa-solid fa-envelope-open-text"></i> APRESENTAÇÃO</h3>
            <p class="t4-profile-text">${esc(s.coverLetter)}</p>
          </div>
          ` : ''}

          <!-- ESCOLARIDADE -->
          ${s.educationLevel ? `
          <div class="t4-main-block">
            <h3 class="t4-main-title"><i class="fa-solid fa-graduation-cap"></i> ESCOLARIDADE</h3>
            <p class="t4-profile-text" style="font-weight: bold; color: #253334;">${esc(s.educationLevel)}</p>
          </div>
          ` : ''}

          <!-- FORMAÇÃO PROFISSIONAL -->
          ${s.formations && s.formations.filter(f => f.curso).length > 0 ? `
          <div class="t4-main-block">
            <h3 class="t4-main-title"><i class="fa-solid fa-certificate"></i> FORMAÇÃO PROFISSIONAL</h3>
            <div class="t4-education-list">
              ${s.formations.filter(f => f.curso).map(f => `
              <div class="t4-edu-item">
                <div class="t4-edu-header-row">
                  <span class="t4-edu-date">${esc(f.periodo) || ''}</span>
                  ${f.situacao ? `<span class="t4-status-badge">${esc(f.situacao)}</span>` : ''}
                </div>
                <p class="t4-edu-desc"><strong>${esc(f.curso)}</strong> ${f.inst ? ` - ${esc(f.inst)}` : ''}</p>
              </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- EXPERIÊNCIA PROFISSIONAL -->
          ${s.experiences && s.experiences.filter(e => e.empresa || e.cargo).length > 0 ? `
          <div class="t4-main-block">
            <h3 class="t4-main-title"><i class="fa-solid fa-briefcase"></i> EXPERIÊNCIA PROFISSIONAL</h3>
            <div class="t4-experience-list">
              ${s.experiences.filter(e => e.empresa || e.cargo).map(e => `
              <div class="t4-exp-item">
                <div class="t4-exp-header">
                  <span class="t4-exp-date">${esc(e.periodo) || ''}</span>
                  ${e.situacao ? `<span class="t4-status-badge">${esc(e.situacao)}</span>` : ''}
                </div>
                <div class="t4-exp-company">${esc(e.cargo || '')} ${e.empresa && e.cargo ? ' | ' : ''} ${esc(e.empresa || '')}</div>
                ${e.desc ? `<p class="t4-exp-desc">${esc(e.desc)}</p>` : ''}
              </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- REFERÊNCIAS COM NOME, TELEFONE E EMPRESA -->
          ${s.referenceName ? `
          <div class="t4-main-block">
            <h3 class="t4-main-title"><i class="fa-solid fa-address-book"></i> REFERÊNCIAS</h3>
            <div class="t4-edu-item">
              <p class="t4-edu-desc">
                <strong>${esc(s.referenceName)}</strong>
                ${s.referenceCompany ? ` <span style="color:#7f8c8d;">(${esc(s.referenceCompany)})</span>` : ''}
                ${s.referencePhone ? ` <br><i class="fa-solid fa-phone" style="font-size:0.7rem; color:#517283;"></i> Tel: ${esc(s.referencePhone)}` : ''}
              </p>
            </div>
          </div>
          ` : ''}

          <!-- INFORMAÇÕES ADICIONAIS -->
          ${s.additionalInfo ? `
          <div class="t4-main-block">
            <h3 class="t4-main-title"><i class="fa-solid fa-circle-info"></i> INFORMAÇÕES ADICIONAIS</h3>
            <p class="t4-profile-text">${esc(s.additionalInfo)}</p>
          </div>
          ` : ''}

          <!-- CONTACTS -->
          ${s.additionalInfo ? `
          <div class="t4-main-block">
            <h3 class="t4-main-title"><i class="fa-solid fa-user-friends"></i> REFERÊNCIAS</h3>
              ${s.reference ? `<div class="t4-profile-text"><i class="fa-solid fa-user-friends"></i>Ref: ${esc(s.reference)}</div>` : ''}
    

             ${s.phone ? `<div class="t4-profile-text"><i class="fa-solid fa-phone"></i> <span>${esc(s.phone)}</span></div>` : ''}
                      </div>
          ` : ''}


            
        </div>
      </div>
    </div>
  `;
}


/* ============================================================
   TEMPLATE 5 — EXECUTIVE CORPORATE STYLE
   Design: Sóbrio, Elegante, Duas Colunas com Linhas Finas
   ============================================================ */
function renderTemplate5() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  const hasPhoto = s.photo;
  
  return `
    <div class="t5-cv">
      
      <!-- CABEÇALHO REFINADO -->
      <div class="t5-header">
        <div class="t5-header-main">
          <h1 class="t5-name">${esc(s.fullName) || ''}</h1>
          <p class="t5-title"><i class="fa-solid fa-bullseye"></i>
          <strong>Área de Interesse:</strong>${esc(s.interest) || 'ÁREA DE INTERESSE'}</p>
        </div>
        
        ${hasPhoto ? `
        <div class="t5-photo">
          <img src="${hasPhoto}" alt="foto" />
        </div>` : ''}
      </div>

      <!-- GRID DE CONTEÚDO -->
      <div class="t5-container">
        
        <!-- COLONNE ESQUERDA (DADOS E COMPETÊNCIAS) -->
        <div class="t5-sidebar">
          
          <!-- CONTATO -->
          <div class="t5-section">
            <h3 class="t5-section-title">Informações de Contato</h3>
            <div class="t5-contact-list">
             ${s.email ? `<div class="t5-contact-item"><i class="fa-solid fa-envelope"></i> <span>${esc(s.email)}</span></div>` : ''}
              ${s.address ? `<div class="t5-contact-item"><i class="fa-solid fa-location-dot"></i> <span>${esc(s.address)}</span></div>` : ''}
              ${s.contact1 ? `<div class="t5-contact-item"><i class="fa-brands fa-whatsapp"></i> <span>${esc(s.contact1)}</span></div>` : ''}
              ${s.contact2 ? `<div class="t5-contact-item"><i class="fa-solid fa-phone"></i> <span>${esc(s.contact1)}</span></div>` : ''}
            
            </div>
          </div>

          <!-- DADOS PESSOAIS -->
          ${s.birthDate || s.nationality || s.maritalStatus ? `
          <div class="t5-section">
            <h3 class="t5-section-title">Dados Pessoais</h3>
            <div class="t5-contact-list">
              ${s.birthDate ? `<div class="t5-contact-item"><i class="fa-solid fa-calendar"></i> <span>Nascimento: ${esc(s.birthDate)}</span></div>` : ''}
              ${s.nationality ? `<div class="t5-contact-item"><i class="fa-solid fa-globe"></i> <span>Nacionalidade: ${esc(s.nationality).toUpperCase()}</span></div>` : ''}
              ${s.maritalStatus ? `<div class="t5-contact-item"><i class="fa-solid fa-user-tie"></i> <span>Estado Civil: ${esc(s.maritalStatus)}</span></div>` : ''}
            </div>
          </div>
          ` : ''}

          <!-- IDIOMAS -->
          ${s.languages && s.languages.filter(l => l.nome).length > 0 ? `
          <div class="t5-section">
            <h3 class="t5-section-title">Idiomas</h3>
            <div class="t5-lang-list">
              ${s.languages.filter(l => l.nome).map(l => `
                <div class="t5-lang-item">
                  <span class="t5-lang-name">${esc(l.nome)}</span>
                  <span class="t5-lang-level">${esc(l.nivel || '')}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- COMPETÊNCIAS -->
          ${allSkills.length > 0 ? `
          <div class="t5-section">
            <h3 class="t5-section-title">Competências</h3>
            <div class="t5-skills-grid">
              ${allSkills.map(skill => `<span class="t5-skill-tag">${esc(skill)}</span>`).join('')}
            </div>
          </div>
          ` : ''}

        </div>

        <!-- COLONNE DIREITA (HISTÓRICO PRINCIPAL) -->
        <div class="t5-main">
          
          <!-- APRESENTAÇÃO -->
          ${s.coverLetter ? `
          <div class="t5-section">
            <h3 class="t5-main-title">Perfil Profissional</h3>
            <p class="t5-profile-text">${esc(s.coverLetter)}</p>
          </div>
          ` : ''}

          <!-- ESCOLARIDADE -->
          ${s.education ? `
          <div class="t5-section">
            <h3 class="t5-main-title">Escolaridade</h3>
            <div class="t5-edu-box">
              <span class="t5-edu-degree">${esc(s.education)}</span>
            </div>
          </div>
          ` : ''}

          <!-- FORMAÇÃO PROFISSIONAL -->
          ${s.formations && s.formations.filter(f => f.curso).length > 0 ? `
          <div class="t5-section">
            <h3 class="t5-main-title">Formação Complementar</h3>
            <div class="t5-timeline">
              ${s.formations.filter(f => f.curso).map(f => `
                <div class="t5-timeline-item">
                  <div class="t5-timeline-header">
                    <span class="t5-time-date">${esc(f.periodo) || ''}</span>
                    ${f.situacao ? `<span class="t5-badge-status">${esc(f.situacao)}</span>` : ''}
                  </div>
                  <p class="t5-time-title"><strong>${esc(f.curso)}</strong> ${f.inst ? `| ${esc(f.inst)}` : ''}</p>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- EXPERIÊNCIA PROFISSIONAL -->
          ${s.experiences && s.experiences.filter(e => e.empresa || e.cargo).length > 0 ? `
          <div class="t5-section">
            <h3 class="t5-main-title">Experiência Profissional</h3>
            <div class="t5-timeline">
              ${s.experiences.filter(e => e.empresa || e.cargo).map(e => `
                <div class="t5-timeline-item">
                  <div class="t5-timeline-header">
                    <span class="t5-time-date">${esc(e.periodo) || ''}</span>
                    ${e.situacao ? `<span class="t5-badge-status">${esc(e.situacao)}</span>` : ''}
                  </div>
                  <p class="t5-time-company"><strong>${esc(e.cargo || '')}</strong> ${e.empresa ? ` em ${esc(e.empresa)}` : ''}</p>
                  ${e.desc ? `<p class="t5-time-desc">${esc(e.desc)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- REFERÊNCIAS -->
          ${s.reference ? `
          <div class="t5-section">
            <h3 class="t5-main-title">REFERÊNCIAS</h3>
            <div class="t5-ref-box">
              <p class="t5-ref-name"><strong>${esc(s.reference)}</strong></p>
              ${s.contact2 ? `<p class="t5-ref-contact"><i class="fa-solid fa-phone"></i> ${esc(s.contact2)}</p>` : ''}
            </div>
          </div>
          ` : ''}

          <!-- INFORMAÇÕES ADICIONAIS -->
          ${s.additionalInfo ? `
          <div class="t5-section">
            <h3 class="t5-main-title">Informações Adicionais</h3>
            <p class="t5-profile-text" style="white-space: pre-line;">${esc(s.additionalInfo)}</p>
          </div>
          ` : ''}

        </div>
      </div>
    </div>
  `;
}


/* ============================================================
   TEMPLATE 6 — EXECUTIVE STEEL
   ============================================================ */
function renderTemplate6() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t6-topbar">
      ${s.photo ? `<div class="t6-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t6-name-area">
        <div class="t6-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t6-hero-role"><strong>Área de Interesse:</strong> ${esc(s.interest) || 'Área de Interesse'}</div>
      
      </div>
      <div class="t6-header-contacts">
        ${s.email    ? `<div class="t6-hc-item">${esc(s.email)}<i class="fa-solid fa-envelope"></i></div>` : ''}
        ${s.contact1 ? `<div class="t6-hc-item">${esc(s.contact1)}<i class="fa-solid fa-phone"></i></div>` : ''}
        ${s.contact2 ? `<div class="t6-hc-item">${esc(s.contact2)}<i class="fa-brands fa-whatsapp"></i></div>` : ''}
        ${s.address  ? `<div class="t6-hc-item">${esc(s.address)}<i class="fa-solid fa-location-dot"></i></div>` : ''}
      </div>
    </div>
    <div class="t6-body">
      <div class="t6-sidebar">
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div>
          <div class="t6-section-label">Pessoal</div>
          ${s.birthDate     ? `<div class="t6-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
          ${s.nationality   ? `<div class="t6-info-row"><b>Nac.:</b> ${esc(s.nationality).toUpperCase()}</div>` : ''}
          ${s.maritalStatus ? `<div class="t6-info-row"><b>Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}
        </div>` : ''}
        ${s.education ? `
        <div>
          <div class="t6-section-label">Escolaridade</div>
          <div class="t6-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div>
          <div class="t6-section-label">Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t6-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t6-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
      <div class="t6-main">
        ${s.coverLetter ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t6-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t6-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        
${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t6-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t6-cover-text" style="margin-bottom:12px;">
      <strong>${esc(f.curso)}</strong><br>

      ${f.inst ? `Instituição: ${esc(f.inst).toUpperCase()}<br>` : ''}
      ${f.periodo ? `Período: ${esc(f.periodo)}<br>` : ''}
      ${f.situacao ? `Situação: ${esc(f.situacao)}` : ''}
    </div>
  `).join('')}
</div>
` : ''}

        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t6-exp-card">
            <div class="t6-job-title">${esc(e.cargo)||'Cargo'}</div>
            <div class="t6-job-company">${esc(e.empresa)||''}</div>
            ${e.periodo ? `<div class="t6-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc    ? `<div class="t6-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        
        ${allSkills.length > 0 ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t6-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t6-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 7 — CLASSIC B&W
   ============================================================ */
function renderTemplate7() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t7-header">
      ${s.photo ? `<div class="t7-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t7-header-text">
        <div class="t7-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t7-role">${esc(s.interest) || 'Área de Interesse'}</div>
      </div>
      <div class="t7-header-contacts">
        ${s.email    ? `<div class="t7-hc-item">${esc(s.email)}<i class="fa-solid fa-envelope"></i></div>` : ''}
        ${s.contact1 ? `<div class="t7-hc-item">${esc(s.contact1)}<i class="fa-solid fa-phone"></i></div>` : ''}
        ${s.contact2 ? `<div class="t7-hc-item">${esc(s.contact2)}<i class="fa-brands fa-whatsapp"></i></div>` : ''}
        ${s.address  ? `<div class="t7-hc-item">${esc(s.address)}<i class="fa-solid fa-location-dot"></i></div>` : ''}
      </div>
    </div>
    <div class="t7-body">
      <div class="t7-main">
        ${s.coverLetter ? `
        <div>
          <div class="t7-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t7-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}

        ${s.interest ? `
        <div>
          <div class="t7-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t7-cover-text">${esc(s.interest)}</div>
        </div>` : ''}


${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t7-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t7-cover-text" style="margin-bottom:12px;">
      <strong>${esc(f.curso).toUpperCase()}</strong><br>

      ${f.inst ? `Instituição: ${esc(f.inst).toUpperCase()}<br>` : ''}
      ${f.periodo ? `Período: ${esc(f.periodo)}<br>` : ''}
      ${f.situacao ? `Situação: <strong> ${esc(f.situacao)}` : ''}</strong>
    </div>
  `).join('')}
</div>
` : ''}


        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t7-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t7-exp-item">
            <div class="t7-job-title">${esc(e.cargo)||'Cargo'}</div>
            <div class="t7-job-company">${esc(e.empresa)||''}</div>
            ${e.periodo ? `<div class="t7-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc    ? `<div class="t7-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        ${allSkills.length > 0 ? `
        <div>
          <div class="t7-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t7-skill-tag">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        ${s.additionalInfo ? `
        <div>
          <div class="t7-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t7-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
      <div class="t7-sidebar">
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div>
          <div class="t7-section-label">Pessoal</div>
          ${s.birthDate     ? `<div class="t7-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
          ${s.nationality   ? `<div class="t7-info-row"><b>Nac.:</b> ${esc(s.nationality)}</div>` : ''}
          ${s.maritalStatus ? `<div class="t7-info-row"><b>Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}
        </div>` : ''}
        ${s.education ? `
        <div>
          <div class="t7-section-label">Escolaridade</div>
          <div class="t7-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div>
          <div class="t7-section-label">Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t7-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t7-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 8 — MONO SIDEBAR
   ============================================================ */
function renderTemplate8() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t8-sidebar">
      ${s.photo ? `<div class="t8-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      ${s.fullName ? `<div class="t8-name">${esc(s.fullName)}</div>` : ''}
      ${s.interest ? `<div class="t8-role">${esc(s.interest)}</div>` : ''}
      <div class="t8-divider"></div>
      <div class="t8-section-label">Contato</div>
      ${s.email    ? `<div class="t8-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
      ${s.contact1 ? `<div class="t8-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
      ${s.contact2 ? `<div class="t8-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
      ${s.address  ? `<div class="t8-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
      ${(s.birthDate||s.nationality||s.maritalStatus) ? `
      <div class="t8-divider"></div>
      <div class="t8-section-label">Pessoal</div>
      ${s.birthDate     ? `<div class="t8-info-row"><b style="color:#111">Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
      ${s.nationality   ? `<div class="t8-info-row"><b style="color:#111">Nac.:</b> ${esc(s.nationality)}</div>` : ''}
      ${s.maritalStatus ? `<div class="t8-info-row"><b style="color:#111">Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}` : ''}
      ${s.education ? `
      <div class="t8-divider"></div>
      <div class="t8-section-label">Escolaridade</div>
      <div class="t8-edu-text">${esc(s.education)}</div>` : ''}
     
      ${s.languages.filter(l=>l.nome).length > 0 ? `
      <div class="t8-divider"></div>
      <div class="t8-section-label">Idiomas</div>
      ${s.languages.filter(l=>l.nome).map(l => `
      <div class="t8-lang-item">
        <span>${esc(l.nome)}</span>
        <span class="t8-lang-level">${esc(l.nivel)}</span>
      </div>`).join('')}` : ''}
    </div>
    <div class="t8-main">
      <div class="t8-top-banner">
        <div class="t8-banner-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t8-banner-role">${esc(s.interest) || 'Área de Interesse'}</div>
      </div>
      <div class="t8-body">
        ${s.coverLetter ? `
        <div>
          <div class="t8-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t8-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        ${s.interest ? `
        <div>
          <div class="t8-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t8-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        ${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t8-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t8-cover-text" style="margin-bottom:12px;">
      <strong>${esc(f.curso).toUpperCase()}</strong><br>

      ${f.inst ? `Instituição: ${esc(f.inst).toUpperCase()}<br>` : ''}
      ${f.periodo ? `Período: ${esc(f.periodo)}<br>` : ''}
      ${f.situacao ? `Situação: <strong> ${esc(f.situacao)}` : ''}</strong>
    </div>
  `).join('')}
</div>
` : ''}
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t8-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t8-exp-item">
            <div class="t8-job-title">${esc(e.cargo)||'Cargo'}</div>
            <div class="t8-job-company">${esc(e.empresa)||''}</div>
            ${e.periodo ? `<div class="t8-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc    ? `<div class="t8-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        ${allSkills.length > 0 ? `
        <div>
          <div class="t8-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t8-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        ${s.additionalInfo ? `
        <div>
          <div class="t8-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t8-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 9 — PURE MINIMAL
   ============================================================ */
function renderTemplate9() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t9-header">
      <div class="t9-top-row">
        <div class="t9-name-block">
          <div class="t9-name">${esc(s.fullName) || 'Seu Nome'}</div>
          <div class="t9-role">${esc(s.interest) || 'Área de Interesse'}</div>
        </div>
        ${s.photo ? `<div class="t9-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      </div>
      <div class="t9-contact-row">
        ${s.email    ? `<div class="t9-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
        ${s.contact1 ? `<div class="t9-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
        ${s.contact2 ? `<div class="t9-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
        ${s.address  ? `<div class="t9-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
        ${s.birthDate     ? `<div class="t9-contact-item"><i class="fa-solid fa-cake-candles"></i>${formatDate(s.birthDate)}</div>` : ''}
        ${s.nationality   ? `<div class="t9-contact-item"><i class="fa-solid fa-flag"></i>${esc(s.nationality)}</div>` : ''}
        ${s.maritalStatus ? `<div class="t9-contact-item"><i class="fa-solid fa-heart"></i>${esc(s.maritalStatus)}</div>` : ''}
      </div>
    </div>
    <div class="t9-body">
      ${s.coverLetter ? `
      <div>
        <div class="t9-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
        <div class="t9-cover-text">${esc(s.coverLetter)}</div>
      </div>` : ''}
      ${s.interest ? `
      <div>
        <div class="t9-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
        <div class="t9-cover-text">${esc(s.interest)}</div>
      </div>` : ''}
      ${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t9-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t9-cover-text" style="margin-bottom:12px;">
      <strong>${esc(f.curso).toUpperCase()}</strong><br>

      ${f.inst ? `Instituição: ${esc(f.inst).toUpperCase()}<br>` : ''}
      ${f.periodo ? `Período: ${esc(f.periodo)}<br>` : ''}
      ${f.situacao ? `Situação: <strong> ${esc(f.situacao)}` : ''}</strong>
    </div>
  `).join('')}
</div>
` : ''}
      ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
      <div>
        <div class="t9-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
        ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
        <div class="t9-exp-item">
          <div class="t9-exp-row">
            <div>
              <span class="t9-job-title">${esc(e.cargo)||'Cargo'}</span>
              <span class="t9-job-sep">·</span>
              <span class="t9-job-company">${esc(e.empresa)||''}</span>
            </div>
            <div class="t9-job-period">${esc(e.periodo)||''}</div>
          </div>
          ${e.desc ? `<div class="t9-job-desc">${esc(e.desc)}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}
      <div class="t9-bottom">
        <div>
          ${allSkills.length > 0 ? `
          <div class="t9-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t9-skill-tag">${esc(sk)}</span>`).join('')}</div>` : ''}
          ${s.additionalInfo ? `
          <div style="margin-top:10px">
            <div class="t9-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
            <div class="t9-additional-text">${esc(s.additionalInfo)}</div>
          </div>` : ''}
        </div>
        <div>
          ${s.education ? `
          <div class="t9-section-title"><i class="fa-solid fa-graduation-cap"></i>Escolaridade</div>
          <div class="t9-edu-text" style="margin-bottom:10px">${esc(s.education)}</div>` : ''}
          ${s.languages.filter(l=>l.nome).length > 0 ? `
          <div class="t9-section-title"><i class="fa-solid fa-language"></i>Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t9-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t9-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}` : ''}
        </div>
      </div>
    </div>`;
}
/* ============================================================
   TEMPLATE 10 — CORAL SUNSET
   ============================================================ */
function renderTemplate10() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t10-sidebar">
      ${s.photo ? `<div class="t10-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      ${s.fullName ? `<div class="t10-name">${esc(s.fullName)}</div>` : ''}
      ${s.interest ? `<div class="t10-role">${esc(s.interest)}</div>` : ''}
      <div class="t10-divider"></div>
      <div class="t10-section-label">Contato</div>
      ${s.email    ? `<div class="t10-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
      ${s.contact1 ? `<div class="t10-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
      ${s.contact2 ? `<div class="t10-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
      ${s.address  ? `<div class="t10-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
      ${(s.birthDate||s.nationality||s.maritalStatus) ? `
      <div class="t10-divider"></div>
      <div class="t10-section-label">Pessoal</div>
      ${s.birthDate     ? `<div class="t10-info-row"><b style="color:#fff">Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
      ${s.nationality   ? `<div class="t10-info-row"><b style="color:#fff">Nac.:</b> ${esc(s.nationality)}</div>` : ''}
      ${s.maritalStatus ? `<div class="t10-info-row"><b style="color:#fff">Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}` : ''}
      ${s.education ? `
      <div class="t10-divider"></div>
      <div class="t10-section-label">Escolaridade</div>
      <div class="t10-edu-text">${esc(s.education)}</div>` : ''}
      ${allSkills.length > 0 ? `
      <div class="t10-divider"></div>
      <div class="t10-section-label">Habilidades</div>
      ${allSkills.map(sk => `<div class="t10-skill-item">${esc(sk)}</div>`).join('')}` : ''}
      ${s.languages.filter(l=>l.nome).length > 0 ? `
      <div class="t10-divider"></div>
      <div class="t10-section-label">Idiomas</div>
      ${s.languages.filter(l=>l.nome).map(l => `
      <div class="t10-lang-item">
        <span>${esc(l.nome)}</span>
        <span class="t10-lang-level">${esc(l.nivel)}</span>
      </div>`).join('')}` : ''}
    </div>
    <div class="t10-main ${getSpacingClass()}">
      <div class="t10-topbar">
        <div class="t10-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t10-hero-role">${esc(s.interest) || 'Área de Interesse'}</div>
      </div>
      <div class="t10-body">
        ${s.coverLetter ? `
        <div>
          <div class="t10-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t10-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        ${s.interest ? `
        <div>
          <div class="t10-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t10-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t10-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t10-exp-card">
            <div class="t10-job-title">${esc(e.cargo)||'Cargo'}</div>
            <div class="t10-job-company">${esc(e.empresa)||''}</div>
            ${e.periodo ? `<div class="t10-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc    ? `<div class="t10-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        ${allSkills.length > 0 ? `
        <div>
          <div class="t10-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t10-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        ${s.additionalInfo ? `
        <div>
          <div class="t10-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t10-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 11 — OCEAN TEAL
   ============================================================ */
function renderTemplate11() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t11-header">
      ${s.photo ? `<div class="t11-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t11-name-area">
        <div class="t11-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t11-hero-role">${esc(s.interest) || 'Área de Interesse'}</div>
      </div>
      <div class="t11-header-contacts">
        ${s.email    ? `<div class="t11-hc-item">${esc(s.email)}<i class="fa-solid fa-envelope"></i></div>` : ''}
        ${s.contact1 ? `<div class="t11-hc-item">${esc(s.contact1)}<i class="fa-solid fa-phone"></i></div>` : ''}
        ${s.contact2 ? `<div class="t11-hc-item">${esc(s.contact2)}<i class="fa-brands fa-whatsapp"></i></div>` : ''}
        ${s.address  ? `<div class="t11-hc-item">${esc(s.address)}<i class="fa-solid fa-location-dot"></i></div>` : ''}
      </div>
    </div>
    <div class="t11-body">
      <div class="t11-main ${getSpacingClass()}">
        ${s.coverLetter ? `
        <div>
          <div class="t11-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t11-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        ${s.interest ? `
        <div>
          <div class="t11-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t11-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t11-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t11-exp-card">
            <div class="t11-job-title">${esc(e.cargo)||'Cargo'}</div>
            <div class="t11-job-company">${esc(e.empresa)||''}</div>
            ${e.periodo ? `<div class="t11-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc    ? `<div class="t11-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        ${allSkills.length > 0 ? `
        <div>
          <div class="t11-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t11-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        ${s.additionalInfo ? `
        <div>
          <div class="t11-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t11-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
      <div class="t11-sidebar">
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div>
          <div class="t11-section-label">Pessoal</div>
          ${s.birthDate     ? `<div class="t11-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
          ${s.nationality   ? `<div class="t11-info-row"><b>Nac.:</b> ${esc(s.nationality)}</div>` : ''}
          ${s.maritalStatus ? `<div class="t11-info-row"><b>Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}
        </div>` : ''}
        ${s.education ? `
        <div>
          <div class="t11-section-label">Escolaridade</div>
          <div class="t11-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div>
          <div class="t11-section-label">Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t11-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t11-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 12 — SUNSET SPLIT
   ============================================================ */
function renderTemplate12() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t12-header">
      ${s.photo ? `<div class="t12-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t12-name-area">
        <div class="t12-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t12-hero-role">${esc(s.interest) || 'Área de Interesse'}</div>
      </div>
      <div class="t12-header-contacts">
        ${s.email    ? `<div class="t12-hc-item">${esc(s.email)}<i class="fa-solid fa-envelope"></i></div>` : ''}
        ${s.contact1 ? `<div class="t12-hc-item">${esc(s.contact1)}<i class="fa-solid fa-phone"></i></div>` : ''}
        ${s.contact2 ? `<div class="t12-hc-item">${esc(s.contact2)}<i class="fa-brands fa-whatsapp"></i></div>` : ''}
        ${s.address  ? `<div class="t12-hc-item">${esc(s.address)}<i class="fa-solid fa-location-dot"></i></div>` : ''}
      </div>
    </div>
    <div class="t12-body">
      <div class="t12-main ${getSpacingClass()}">
        ${s.coverLetter ? `
        <div>
          <div class="t12-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t12-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        ${s.interest ? `
        <div>
          <div class="t12-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t12-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t12-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t12-exp-card">
            <div class="t12-job-title">${esc(e.cargo)||'Cargo'}</div>
            <div class="t12-job-company">${esc(e.empresa)||''}</div>
            ${e.periodo ? `<div class="t12-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc    ? `<div class="t12-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        ${allSkills.length > 0 ? `
        <div>
          <div class="t12-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t12-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        ${s.additionalInfo ? `
        <div>
          <div class="t12-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t12-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
      <div class="t12-sidebar">
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div>
          <div class="t12-section-label">Pessoal</div>
          ${s.birthDate     ? `<div class="t12-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
          ${s.nationality   ? `<div class="t12-info-row"><b>Nac.:</b> ${esc(s.nationality)}</div>` : ''}
          ${s.maritalStatus ? `<div class="t12-info-row"><b>Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}
        </div>` : ''}
        ${s.education ? `
        <div>
          <div class="t12-section-label">Escolaridade</div>
          <div class="t12-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div>
          <div class="t12-section-label">Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t12-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t12-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>`;
}
/* ============================================================
   EXPORT PDF
   ============================================================ */
async function exportPDF() {
  if (!validate()) return;

  const loading = document.createElement('div');
  loading.className = 'pdf-loading';
  loading.innerHTML = `<div class="spinner"></div><span>Gerando PDF de alta qualidade...</span>`;
  document.body.appendChild(loading);

  try {
    const cv = document.getElementById('cvPreview');
    // temporarily reset scaling
    const origTransform = cv.style.transform;
    cv.style.transform = 'none';
    cv.style.width = '794px';
    cv.style.height = '1123px';

    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(cv, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 794,
      height: 1123,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: 1123
    });

    cv.style.transform = origTransform;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    const name = state.fullName.trim() || 'curriculo';
    pdf.save(`${name.replace(/\s+/g, '_')}_CV.pdf`);
    showToast('PDF exportado com sucesso!');
  } catch (err) {
    showToast('Erro ao gerar PDF. Tente novamente.', true);
    console.error(err);
  } finally {
    loading.remove();
  }
}

/* ============================================================
   SAVE / LOAD / RESET
   ============================================================ */
function saveData() {
  collectState();
  try {
    const data = {
      ...state,
      expCount,
      langCount,
      formHTML_exp: document.getElementById('experiencesList').innerHTML,
      formHTML_lang: document.getElementById('languagesList').innerHTML,
      formHTML_customSkills: document.getElementById('customSkills').innerHTML,
      formHTML_formacao: document.getElementById('formacaoList').innerHTML,
      formHTML_skillChecks: getCheckedSkills()
    };
    localStorage.setItem('cvBuilderPro', JSON.stringify(data));
    showToast('Dados salvos com sucesso!');
  } catch (e) {
    showToast('Erro ao salvar dados.', true);
  }
}

function getCheckedSkills() {
  const checked = [];
  document.querySelectorAll('#skillsChecklist input[type="checkbox"]').forEach(cb => {
    if (cb.checked) checked.push(cb.value);
  });
  return checked;
}

function loadData() {
  try {
    const raw = localStorage.getItem('cvBuilderPro');
    if (!raw) return;
    const data = JSON.parse(raw);

    // restore state
    Object.assign(state, data);

    // restore form fields
    setVal('fullName', state.fullName);
    setVal('email', state.email);
    setVal('phone', state.phone);
  setVal('reference', state.reference);
    setVal('contact1', state.contact1);
    setVal('contact2', state.contact2);
    setVal('birthDate', state.birthDate);
    setVal('nationality', state.nationality);
    setVal('maritalStatus', state.maritalStatus);
    setVal('address', state.address);
    setVal('interest', state.interest);
    setVal('education', state.education);
    setVal('coverLetter', state.coverLetter);
    setVal('additionalInfo', state.additionalInfo);

    // template
    if (state.template) selectTemplate(state.template);

    // photo
    if (state.photo) {
      const prev = document.getElementById('photoPreview');
      prev.innerHTML = `<img src="${state.photo}" alt="foto" />`;
    }

    // skill checkboxes
    if (data.formHTML_skillChecks) {
      document.querySelectorAll('#skillsChecklist input[type="checkbox"]').forEach(cb => {
        cb.checked = data.formHTML_skillChecks.includes(cb.value);
      });
    }

    // restore HTML for dynamic sections
    if (data.formHTML_exp) {
      document.getElementById('experiencesList').innerHTML = data.formHTML_exp;
      // reattach events
      document.querySelectorAll('[id^="exp-desc-"]').forEach(ta => {
        const id = ta.id.replace('exp-desc-', '');
        ta.addEventListener('input', () => { updateExpChar(id); updatePreview(); });
      });
      document.querySelectorAll('[id^="exp-empresa-"],[id^="exp-cargo-"],[id^="exp-periodo-"]').forEach(el => {
        el.addEventListener('input', updatePreview);
      });
      document.querySelectorAll('#experiencesList select').forEach(el => {
        el.addEventListener('change', updatePreview);
      });
    }
    if (data.formHTML_lang) {
      document.getElementById('languagesList').innerHTML = data.formHTML_lang;
      document.querySelectorAll('#languagesList select').forEach(el => {
        el.addEventListener('change', updatePreview);
      });
    }
    if (data.formHTML_customSkills) {
      document.getElementById('customSkills').innerHTML = data.formHTML_customSkills;
      document.querySelectorAll('#customSkills input').forEach(el => {
        el.addEventListener('input', updatePreview);
      });
    }

    if (data.expCount) expCount = data.expCount;
    if (data.langCount) langCount = data.langCount;
    if (expCount >= 3) document.getElementById('addExpBtn').style.display = 'none';

  } catch (e) {
    console.warn('Load error:', e);
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
}

function resetData() {
  if (!confirm('Tem certeza que deseja apagar todos os dados?')) return;
  localStorage.removeItem('cvBuilderPro');
  location.reload();
}

/* ============================================================
   AUTO SAVE
   ============================================================ */
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    try {
      collectState();
      const data = {
        ...state,
        expCount,
        langCount,
        formHTML_exp: document.getElementById('experiencesList').innerHTML,
        formHTML_lang: document.getElementById('languagesList').innerHTML,
        formHTML_formacao: document.getElementById('formacaoList').innerHTML,
        formHTML_customSkills: document.getElementById('customSkills').innerHTML,
        formHTML_skillChecks: getCheckedSkills()
      };
      localStorage.setItem('cvBuilderPro', JSON.stringify(data));
    } catch(e){}
  }, 1500);
}

/* ============================================================
   VALIDATION
   ============================================================ */
function validate() {
  const name = document.getElementById('fullName')?.value.trim();
  if (!name) {
    showToast('Nome completo é obrigatório!', true);
    document.getElementById('fullName')?.focus();
    return false;
  }
  
  return true;
}

/* ============================================================
   UTILS
   ============================================================ */
function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(d) {
  if (!d) return '';
  try {
    const [y,m,day] = d.split('-');
    return `${day}/${m}/${y}`;
  } catch { return d; }
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}
/* ============================================================
   FORMAÇÃO PROFISSIONAL
   ============================================================ */
let formacaoCount = 0;

function addFormacao() {
  formacaoCount++;
  const id = formacaoCount;
  const div = document.createElement('div');
  div.className = 'exp-card';
  div.id = `formacao-${id}`;
  div.innerHTML = `
    <div class="exp-header">
      <span>Formação ${id}</span>
      <button class="btn-remove" onclick="removeFormacao(${id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group full">
        <label>Curso</label>
        <input type="text" id="form-curso-${id}"
          placeholder="Ex: Técnico em Administração"
          oninput="updatePreview()" />
      </div>
      <div class="form-group">
        <label>Instituição</label>
        <input type="text" id="form-inst-${id}"
          placeholder="Ex: SENAI"
          oninput="updatePreview()" />
      </div>
      <div class="form-group">
        <label>Período</label>
        <input type="text" id="form-periodo-${id}"
          placeholder="Ex: 2023–2025"
          oninput="updatePreview()" />
      </div>
      <div class="form-group full">
        <label>Situação</label>
        <select id="form-situacao-${id}" onchange="updatePreview()">
          <option value="">Selecionar</option>
          <option value="Concluído">Concluído</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Trancado">Trancado</option>
        </select>
      </div>
    </div>`;
  document.getElementById('formacaoList').appendChild(div);
}

function removeFormacao(id) {
  document.getElementById(`formacao-${id}`)?.remove();
  formacaoCount = Math.max(0, formacaoCount - 1);
  updatePreview();
}
/* ============================================================
   FUNÇÃO PARA AJUSTAR ESPAÇAMENTO ENTRE SEÇÕES
   ============================================================ */
function adjustSectionSpacing() {
  const cv = document.getElementById('cvPreview');
  if (!cv) return;
  
  // Vérification des sections principales
  const hasFormacao = state.formations && state.formations.filter(f => f.curso).length > 0;
  const hasExperiencias = state.experiences && state.experiences.filter(e => e.empresa || e.cargo).length > 0;
  const hasSkills = (state.skills.length > 0 || state.customSkills.length > 0);
  const hasCoverLetter = state.coverLetter && state.coverLetter.trim() !== '';
  const hasInterest = state.interest && state.interest.trim() !== '';
  const hasAdditionalInfo = state.additionalInfo && state.additionalInfo.trim() !== '';
  
  // Compte les sections manquantes
  let missingSections = 0;
  if (!hasFormacao) missingSections++;
  if (!hasExperiencias) missingSections++;
  if (!hasSkills) missingSections++;
  if (!hasCoverLetter) missingSections++;
  if (!hasInterest) missingSections++;
  if (!hasAdditionalInfo) missingSections++;
  
  // Calcul de l'espacement vertical supplémentaire
  let extraGap = 0;
  if (missingSections === 1) extraGap = 15;
  else if (missingSections === 2) extraGap = 25;
  else if (missingSections === 3) extraGap = 35;
  else if (missingSections >= 4) extraGap = 50;
  
  // Applique l'espacement selon le template
  const template = state.template;
  let container = null;
  let defaultGap = 12;
  
  switch(template) {
    case 1:
      container = cv.querySelector('.t1-body');
      defaultGap = 12;
      break;
    case 2:
      container = cv.querySelector('.t2-main');
      defaultGap = 12;
      break;
    case 3:
      container = cv.querySelector('.t3-main');
      defaultGap = 12;
      break;
    case 4:
      container = cv.querySelector('.t4-body');
      defaultGap = 13;
      break;
    case 5:
      container = cv.querySelector('.t5-main');
      defaultGap = 14;
      break;
    case 6:
      container = cv.querySelector('.t6-main');
      defaultGap = 13;
      break;
  }
  
  // Applique le nouveau gap
  if (container) {
    const newGap = defaultGap + extraGap;
    container.style.gap = `${newGap}px`;
    
    // Ajoute un padding-bottom supplémentaire si peu de sections
    const activeSectionsCount = 6 - missingSections;
    if (activeSectionsCount <= 3) {
      container.style.paddingBottom = `${30 + (3 - activeSectionsCount) * 15}px`;
    }
  }
}/* ============================================================
   TOGGLE TEMPLATES
   ============================================================ */
function toggleTemplates() {
  const wrapper = document.getElementById('templateGridWrapper');
  const icon = document.querySelector('.template-toggle-btn .toggle-icon');
  
  wrapper.classList.toggle('open');
  icon.classList.toggle('rotated');
}
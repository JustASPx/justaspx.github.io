// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeToggle.querySelector("i").className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// Mobile Menu
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// Typing Effect
const texts = ["Developpeur Web Junior", "Etudiant en DUT Informatique", "Passionne par JavaScript", "A la recherche d un stage"];
let textIndex = 0, charIndex = 0, isDeleting = false;
const typingElement = document.getElementById("typingText");

function type() {
  const current = texts[textIndex];
  if (isDeleting) {
    typingElement.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingElement.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }
  let typeSpeed = isDeleting ? 50 : 100;
  if (!isDeleting && charIndex === current.length) {
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % texts.length;
    typeSpeed = 500;
  }
  setTimeout(type, typeSpeed);
}
if (typingElement) type();

// Active Nav on Scroll + Click
const sections = document.querySelectorAll("section[id]");
const navLinkElements = document.querySelectorAll(".nav-links a[href^=\"#\"]");

function setActiveNav(targetId) {
  navLinkElements.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + targetId) link.classList.add("active");
  });
}

window.addEventListener("scroll", () => {
  let current = "";
  let maxVisible = 0;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visibleHeight > maxVisible && visibleHeight > 100) {
      maxVisible = visibleHeight;
      current = section.getAttribute("id");
    }
  });
  // Fallback: if near bottom of page, force Contact
  if (!current && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
    current = "contact";
  }
  setActiveNav(current);
});

navLinkElements.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href.startsWith("#")) {
      const targetId = href.slice(1);
      setActiveNav(targetId);
    }
  });
});

// Skills Data
const skillsData = {
  tech: [
    { name: "JavaScript", level: 75, icon: "js", abbr: "JS", desc: "ES6+, DOM, Async/Await, Fetch API" },
    { name: "HTML / CSS", level: 85, icon: "web", abbr: "WEB", desc: "Semantique, Flexbox, Grid, Responsive" },
    { name: "Base de Donnees SQL", level: 60, icon: "sql", abbr: "SQL", desc: "MySQL, requetes, modelisation" },
    { name: "Linux", level: 55, icon: "lnx", abbr: "LNX", desc: "Ligne de commande, permissions, bash" },
    { name: "Reseaux Informatiques", level: 50, icon: "net", abbr: "NET", desc: "TCP/IP, modele OSI, configuration" },
    { name: "Structures de Donnees", level: 65, icon: "sd", abbr: "SD", desc: "Tableaux, listes, arbres, graphes" },
    { name: "Intelligence Artificielle", level: 40, icon: "ai", abbr: "AI", desc: "Notions de ML, algorithmes de base" },
    { name: "Langage C", level: 70, icon: "c", abbr: "C", desc: "Pointeurs, structures, gestion memoire" }
  ],
  soft: [
    { name: "Esprit d analyse", level: 85, icon: "soft", abbr: "AN", desc: "Decomposition de problemes complexes" },
    { name: "Travail en equipe", level: 80, icon: "soft", abbr: "TM", desc: "Collaboration, Git, communication" },
    { name: "Adaptabilite", level: 90, icon: "soft", abbr: "AD", desc: "Apprentissage rapide des nouveaux outils" },
    { name: "Gestion du temps", level: 75, icon: "soft", abbr: "GT", desc: "Organisation, respect des deadlines" }
  ],
  lang: [
    { name: "Arabe", level: 100, icon: "soft", abbr: "AR", desc: "Langue maternelle" },
    { name: "Anglais", level: 95, icon: "soft", abbr: "EN", desc: "Courant, documentation technique" },
    { name: "Francais", level: 85, icon: "soft", abbr: "FR", desc: "Courant, technique et professionnel" }
  ]
};

const skillsGrid = document.getElementById("skillsGrid");
const tabBtns = document.querySelectorAll(".tab-btn");

function renderSkills(category) {
  skillsGrid.innerHTML = skillsData[category].map(skill => `
    <div class="skill-card">
      <div class="skill-header">
        <div class="skill-icon ${skill.icon}">${skill.abbr}</div>
        <div><h4>${skill.name}</h4><span>${skill.desc}</span></div>
      </div>
      <div class="skill-bar"><div class="fill" style="width:0%" data-width="${skill.level}%"></div></div>
    </div>
  `).join("");
  setTimeout(() => {
    document.querySelectorAll(".skill-bar .fill").forEach(bar => {
      bar.style.width = bar.getAttribute("data-width");
    });
  }, 100);
}

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderSkills(btn.dataset.tab);
  });
});
renderSkills("tech");

// Projects
const projects = [
  {
    id: 1,
    title: "Portfolio Interactif",
    desc: "Ce site web personnel presentant mon parcours, mes competences et mes projets. Il inclut un mode sombre, des animations au scroll, et une recuperation dynamique des depots GitHub.",
    tags: ["HTML", "CSS", "JavaScript", "API GitHub"],
    icon: "&#128104;&#8205;&#128187;",
    demo: "index.html",
    code: "https://github.com/JustASPx/portfolio_zakaria",
    details: `<p>Ce portfolio a ete concu comme projet final pour le cours de JavaScript Avance. Il met en oeuvre de nombreuses fonctionnalites modernes :</p>
      <h4>Fonctionnalites principales</h4>
      <ul>
        <li>Mode sombre / clair avec persistance localStorage</li>
        <li>Navigation fluide avec mise a jour active au scroll</li>
        <li>Effet de frappe dynamique sur le hero</li>
        <li>Recuperation asynchrone des depots GitHub via Fetch API</li>
        <li>Formulaire de contact avec validation et simulation d envoi</li>
        <li>Animations d apparition au scroll (Intersection Observer)</li>
        <li>Design responsive mobile-first</li>
      </ul>
      <h4>Architecture</h4>
      <p>Le site est structure en modules JavaScript separes : main.js pour le portfolio, todo.js pour l application To-Do, et dashboard.js pour le tableau de bord meteo. Les styles utilisent des variables CSS pour faciliter le changement de theme.</p>`
  },
  {
    id: 2,
    title: "To-Do App Avancee",
    desc: "Une application de gestion de taches complete avec categories, priorites, dates d echeance, filtres, recherche et persistance des donnees dans le localStorage.",
    tags: ["JavaScript", "localStorage", "Drag & Drop", "CRUD"],
    icon: "&#9989;",
    demo: "pages/todo.html",
    code: "https://github.com/JustASPx/portfolio_zakaria",
    details: `<p>Application To-Do developpee pour demontrer la maitrise du DOM, des evenements et de la persistance locale.</p>
      <h4>Fonctionnalites</h4>
      <ul>
        <li>Ajout, modification, suppression de taches (CRUD complet)</li>
        <li>Categorisation (Travail, Personnel, Etudes) avec icones colorees</li>
        <li>Systeme de priorites (Haute, Moyenne, Basse) avec codes couleur</li>
        <li>Dates d echeance avec alertes visuelles pour les taches en retard</li>
        <li>Filtres combines : statut, categorie, priorite, recherche textuelle</li>
        <li>Drag & drop pour reorganiser les taches</li>
        <li>Statistiques en temps reel (taches terminees, en retard, etc.)</li>
        <li>Persistance localStorage + export/import JSON</li>
      </ul>`
  },
  {
    id: 3,
    title: "Dashboard Meteo",
    desc: "Un tableau de bord meteo interactif utilisant l API Open-Meteo pour afficher les conditions actuelles et les previsions sur 7 jours pour n importe quelle ville.",
    tags: ["JavaScript", "Fetch API", "Async/Await", "Canvas"],
    icon: "&#127780;",
    demo: "pages/dashboard.html",
    code: "https://github.com/JustASPx/portfolio_zakaria",
    details: `<p>Mini-dashboard meteo exploitant les donnees gratuites de l API Open-Meteo sans cle d authentification.</p>
      <h4>Fonctionnalites</h4>
      <ul>
        <li>Geolocalisation automatique de l utilisateur</li>
        <li>Recherche de villes avec autocompletion via API Geocoding</li>
        <li>Conditions actuelles : temperature, humidite, vent, pression, UV</li>
        <li>Previsions sur 7 jours avec temperatures min/max</li>
        <li>Graphique en canvas des temperatures horaires</li>
        <li>Historique des recherches dans localStorage</li>
        <li>Gestion des etats de chargement et des erreurs reseau</li>
        <li>Interface adaptee mobile avec cards scrollables</li>
      </ul>`
  }
];

const projectsGrid = document.getElementById("projectsGrid");
projectsGrid.innerHTML = projects.map(p => `
  <div class="project-card" data-id="${p.id}">
    <div class="project-thumb">${p.icon}<span class="badge">Projet</span></div>
    <div class="project-body">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="project-tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
      <div class="project-links">
        <a href="${p.demo}" class="demo" ${p.demo.startsWith("http") ? 'target="_blank"' : ""}>Voir le projet</a>
        <a href="${p.code}" target="_blank" class="code">Code source</a>
      </div>
    </div>
  </div>
`).join("");

// Modal
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const id = parseInt(card.dataset.id);
    const project = projects.find(p => p.id === id);
    if (project) {
      modalTitle.textContent = project.title;
      modalBody.innerHTML = project.details;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });
});

function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// GitHub API
async function fetchGitHubRepos() {
  const container = document.getElementById("githubRepos");
  try {
    const response = await fetch("https://api.github.com/users/JustASPx/repos?sort=updated&per_page=6");
    if (!response.ok) throw new Error("HTTP " + response.status);
    const repos = await response.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      container.innerHTML = "<p style=\"text-align:center;color:var(--text-muted);\">Aucun depot public trouve pour le moment.</p>";
      return;
    }
    container.innerHTML = repos.map(repo => `
      <div class="project-card">
        <div class="project-thumb" style="font-size:2rem;"><i class="fab fa-github"></i></div>
        <div class="project-body">
          <h3>${repo.name}</h3>
          <p>${repo.description || "Pas de description disponible."}</p>
          <div class="project-tags">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
            <span>${repo.language || "N/A"}</span>
          </div>
          <div class="project-links">
            <a href="${repo.html_url}" target="_blank" class="demo">Voir sur GitHub</a>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("GitHub API error:", err);
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:2rem;">
        <p style="color:var(--text-muted);margin-bottom:1rem;"><i class="fas fa-exclamation-triangle" style="color:#f59e0b;"></i> Impossible de charger les depots GitHub.</p>
        <p style="font-size:0.9rem;color:var(--text-muted);">Erreur : ${err.message}. Verifiez votre connexion ou consultez directement <a href="https://github.com/JustASPx" target="_blank" style="color:var(--primary);">mon profil GitHub</a>.</p>
      </div>`;
  }
}
fetchGitHubRepos();

// Contact Form
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  if (!data.name.trim() || !data.email.trim() || !data.subject.trim() || !data.message.trim()) {
    showStatus("Veuillez remplir tous les champs.", "error");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showStatus("Veuillez entrer une adresse email valide.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = "<span class=\"loader\" style=\"width:16px;height:16px;border-width:2px;\"></span> Envoi en cours...";
  showStatus("Envoi de votre message en cours...", "loading");

  try {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    showStatus("Message envoye avec succes ! Je vous repondrai des que possible.", "success");
    contactForm.reset();
  } catch (err) {
    showStatus("Une erreur est survenue. Veuillez reessayer ou me contacter directement par email.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "<i class=\"fas fa-paper-plane\"></i> Envoyer le message";
  }
});

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = "form-status " + type;
}

// Scroll Reveal
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealElements.forEach(el => revealObserver.observe(el));

// Counter Animation
const counters = document.querySelectorAll(".num[data-count]");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.count);
      let current = 0;
      const increment = target / 40;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          entry.target.textContent = target + (target === 8 ? "+" : "");
          clearInterval(timer);
        } else {
          entry.target.textContent = Math.ceil(current);
        }
      }, 40);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

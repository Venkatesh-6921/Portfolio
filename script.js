// Portfolio script for Type_1 template
// This script handles animations, GitHub data fetching, contact form submission,
// and various UI interactions for the portfolio page.

function initTheme() {
  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}


/* -----------------------
   Configuration
   ----------------------- */
// EmailJS settings (replace with your IDs) — optional
const EMAILJS_USER_ID = "sfinBlJHRb6DpI-z5"; // e.g. user_xxx
const EMAILJS_SERVICE_ID = "service_x51fme6"; // e.g. service_xxx
const EMAILJS_TEMPLATE_ID = "template_j22rl5g"; // e.g. template_xxx

// GitHub username to fetch
const GITHUB_USERNAME = "Venkatesh-6921";

/* -----------------------
   Utility helpers
   ----------------------- */
const el = (sel) => document.querySelector(sel);
const elAll = (sel) => Array.from(document.querySelectorAll(sel));

function appendInlineStyle(css) {
  const s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
}

/* -----------------------
   Toasts + Honeypot + Cooldown
   ----------------------- */
function showToast(message, type = "success", timeout = 4000) {
  const containerId = "toast-container";
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.setAttribute("role", "status");
  toast.innerHTML =
    '<div class="toast-message">' +
    message +
    '</div><button class="close" aria-label="Close">&times;</button>';

  const closeBtn = toast.querySelector(".close");
  closeBtn.addEventListener("click", () => dismissToast(toast));

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  const timer = setTimeout(() => dismissToast(toast), timeout);

  function dismissToast(node) {
    clearTimeout(timer);
    node.classList.remove("show");
    node.addEventListener(
      "transitionend",
      () => {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
      { once: true }
    );
  }

  return toast;
}

appendInlineStyle(
  "\n#toast-container{position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none}\n.toast{pointer-events:auto;min-width:220px;max-width:340px;padding:12px 14px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.12);background:#222;color:#fff;font-size:14px;opacity:0;transform:translateY(-10px) scale(0.98);transition:opacity 240ms ease, transform 240ms ease;display:flex;align-items:center;gap:10px}\n.toast.show{opacity:1;transform:translateY(0) scale(1)}\n.toast.success{background:#046c4e}\n.toast.error{background:#8b1e3f}\n.toast.info{background:#1f6feb}\n.toast button.close{margin-left:auto;background:transparent;color:rgba(255,255,255,0.85);border:none;font-size:16px;cursor:pointer}\n.hp-wrap{position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden}\n.sr-only{position:absolute!important;height:1px;width:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}\n"
);

function isHoneypotTriggered(formEl) {
  if (!formEl) return false;
  try {
    const hp = formEl.querySelector("#hp_field");
    if (!hp) return false;
    const v = (hp.value || "").trim();
    return v !== "";
  } catch (e) {
    return false;
  }
}

function startCooldown(button, seconds = 30) {
  if (!button) return;
  if (button.dataset.cooldownActive === "1") return;
  button.dataset.cooldownActive = "1";
  const origText = button.innerHTML;
  button.disabled = true;
  let remaining = seconds;
  button.innerHTML = "Please wait (" + remaining + "s)";
  const timer = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      button.innerHTML = "Please wait (" + remaining + "s)";
    } else {
      clearInterval(timer);
      button.disabled = false;
      button.innerHTML = origText;
      delete button.dataset.cooldownActive;
    }
  }, 1000);
}

/* -----------------------
   /* -----------------------
   EmailJS loader (Updated)
   ----------------------- */
function loadEmailJSSDK() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      try {
        emailjs.init(EMAILJS_USER_ID);
      } catch (e) {}
      return resolve(window.emailjs);
    }
    const s = document.createElement("script");
    // UPDATED URL: Uses the modern NPM CDN
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    s.onload = () => {
      try {
        emailjs.init(EMAILJS_USER_ID);
      } catch (e) {
        console.warn("emailjs init failed", e);
      }
      resolve(window.emailjs);
    };
    s.onerror = (err) => reject(err);
    document.head.appendChild(s);
  });
}
/* -----------------------
   Portfolio script (animations, GitHub fetch, UI)
   ----------------------- */
function initAnimations() {
  createParticles();
  initScrollAnimations();
  initSkillBarAnimations();
  initHoverEffects();
}

function createParticles() {
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "particles";
  document.body.appendChild(particlesContainer);
  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    const size = Math.random() * 6 + 2;
    const posX = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = Math.random() * 10 + 20;
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.left = posX + "%";
    particle.style.animationDelay = delay + "s";
    particle.style.animationDuration = duration + "s";
    particle.style.opacity = (Math.random() * 0.4 + 0.1).toString();
    particlesContainer.appendChild(particle);
  }
}

function initScrollAnimations() {
  const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        if (entry.target.classList.contains("skill-bar")) {
          setTimeout(() => {
            entry.target.classList.add("animated");
          }, 200);
        }
        if (entry.target.classList.contains("card")) {
          const delay =
            Array.from(entry.target.parentNode.children).indexOf(entry.target) *
            100;
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);
        }
      }
    });
  }, observerOptions);
  const animatableElements = elAll(
    ".fade-in, .slide-in-left, .slide-in-right, .scale-in, .skill-bar, .card"
  );
  animatableElements.forEach((elm) => observer.observe(elm));
  window.__portfolioScrollObserver = observer;
}

function initSkillBarAnimations() {
  const skillBars = elAll(".skill-bar");
  skillBars.forEach((bar, index) => {
    bar.style.transitionDelay = index * 200 + "ms";
  });
}

function initHoverEffects() {
  const buttons = elAll(".btn, .link, .social-link");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      const current = this.style.transform || "";
      if (!current.includes("scale(1.05)"))
        this.style.transform = current + " scale(1.05)";
    });
    button.addEventListener("mouseleave", function () {
      this.style.transform = (this.style.transform || "").replace(
        " scale(1.05)",
        ""
      );
    });
  });
}

let navbar = el("#navbar");
let navLinks = el("#navLinks");
let mobileToggle = el("#mobileToggle");
let sections = elAll("section") || [];
let navItems = elAll(".nav-link") || [];

function handleScroll() {
  if (!navbar) navbar = el("#navbar");
  if (!sections || sections.length === 0) sections = elAll("section");
  if (!navbar) return;
  if (window.scrollY > 50) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
  let current = "";
  if (sections && sections.length) {
    sections.forEach((section) => {
      if (!section) return;
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop)
        current = section.getAttribute("id") || current;
    });
  }
  if (!navItems || navItems.length === 0) navItems = elAll(".nav-link");
  navItems.forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("href") === "#" + current)
      item.classList.add("active");
  });
}

window.addEventListener("scroll", handleScroll);

function setupMobileToggle() {
  if (!mobileToggle) mobileToggle = el("#mobileToggle");
  if (!navLinks) navLinks = el("#navLinks");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      if (!navLinks) return;
      navLinks.classList.toggle("active");
      const icon = mobileToggle.querySelector("i");
      if (navLinks.classList.contains("active")) {
        if (icon) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-times");
        }
      } else {
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });
  }
}

function setupNavItemsClose() {
  if (!navItems || navItems.length === 0) navItems = elAll(".nav-link");
  if (!mobileToggle) mobileToggle = el("#mobileToggle");
  if (!navLinks) navLinks = el("#navLinks");
  if (navItems && navItems.length > 0) {
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (navLinks) navLinks.classList.remove("active");
        const icon = mobileToggle ? mobileToggle.querySelector("i") : null;
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      });
    });
  }
}

const themeToggleSelector = "#themeToggle";
function setupThemeToggle() {
  if (!document.documentElement.getAttribute("data-theme")) {
    document.documentElement.setAttribute("data-theme", "light");
    updateThemeIcon("light");
  } else {
    updateThemeIcon(document.documentElement.getAttribute("data-theme"));
  }
  const themeToggle = el(themeToggleSelector);
  if (themeToggle) themeToggle.addEventListener("click", () => toggleTheme());
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    if (theme === 'light') {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }
}

function initSpline() {
  const splineContainer = document.createElement("div");
  splineContainer.className = "spline-container";
  const hero = document.querySelector(".hero");
  if (hero) hero.appendChild(splineContainer);
}

/* -----------------------
   GitHub fetch + render
   ----------------------- */
async function fetchGitHubData() {
  const username = GITHUB_USERNAME;
  const gridEl = el("#projectsGrid");
  const skillsListEl = el("#skillsList");

  function showMessage(container, lines) {
    if (!container) return;
    container.innerHTML =
      '<div style="text-align:center;padding:28px;color:var(--muted);">' +
      lines.map((l) => "<div>" + l + "</div>").join("") +
      "</div>";
  }

  if (gridEl)
    gridEl.innerHTML =
      '<div class="loading"><div class="spinner"></div><p>Loading projects from GitHub...</p></div>';
  if (skillsListEl)
    skillsListEl.innerHTML =
      '<div class="loading"><div class="spinner"></div></div>';

  try {
    const token = (function () {
      try {
        return localStorage.getItem("github_token");
      } catch (e) {
        return null;
      }
    })();
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = "token " + token;
    console.log(
      "[fetchGitHubData] requesting repos for",
      username,
      token ? "(using token)" : "(no token)"
    );
    const url =
      "https://api.github.com/users/" +
      encodeURIComponent(username) +
      "/repos?sort=updated&per_page=100";
    const resp = await fetch(url, { headers });
    console.log("[fetchGitHubData] HTTP", resp.status, resp.statusText);
    try {
      console.log(
        "[fetchGitHubData] X-RateLimit-Limit:",
        resp.headers.get("X-RateLimit-Limit")
      );
      console.log(
        "[fetchGitHubData] X-RateLimit-Remaining:",
        resp.headers.get("X-RateLimit-Remaining")
      );
      console.log(
        "[fetchGitHubData] X-RateLimit-Reset:",
        resp.headers.get("X-RateLimit-Reset")
      );
      console.log(
        "[fetchGitHubData] Content-Type:",
        resp.headers.get("Content-Type")
      );
    } catch (e) {
      console.warn("[fetchGitHubData] could not read response headers", e);
    }

    if (!resp.ok) {
      let bodyText = "";
      try {
        bodyText = await resp.text();
      } catch (e) {
        bodyText = "<no body>";
      }
      console.error("[fetchGitHubData] non-ok response body:", bodyText);
      if (
        resp.status === 403 ||
        resp.headers.get("X-RateLimit-Remaining") === "0"
      ) {
        const reset = resp.headers.get("X-RateLimit-Reset");
        const resetMsg = reset
          ? "Rate limit resets at " +
            new Date(Number(reset) * 1000).toLocaleString()
          : "";
        if (gridEl)
          showMessage(gridEl, [
            "GitHub rate limited (403).",
            resetMsg,
            "Try again later or use an authenticated token.",
          ]);
        if (skillsListEl) showMessage(skillsListEl, ["GitHub rate limited."]);
      } else if (resp.status === 404) {
        if (gridEl)
          showMessage(gridEl, [
            "GitHub user not found (404).",
            "Check username: " + username,
          ]);
        if (skillsListEl) showMessage(skillsListEl, ["GitHub user not found."]);
      } else {
        if (gridEl)
          showMessage(gridEl, [
            "Failed to load projects from GitHub.",
            "HTTP " + resp.status + " - " + resp.statusText,
          ]);
        if (skillsListEl) showMessage(skillsListEl, ["Failed to load skills."]);
      }
      return;
    }

    const repos = await resp.json();
    if (!Array.isArray(repos)) {
      console.error(
        "[fetchGitHubData] unexpected response (not array):",
        repos
      );
      if (gridEl)
        showMessage(gridEl, [
          "Unexpected GitHub response. Check console for details.",
        ]);
      if (skillsListEl)
        showMessage(skillsListEl, ["Unexpected GitHub response."]);
      return;
    }

    console.log("[fetchGitHubData] received", repos.length, "repositories");

    const lowerUsername = username.toLowerCase();
    const projects = repos
      .filter((repo) => {
        if (!repo || !repo.name) return false;
        const lname = repo.name.toLowerCase();
        if (lname === lowerUsername || lname.includes(lowerUsername))
          return false;
        return !repo.fork;
      })
      .map((repo) => {
        const tags = extractTagsFromRepo(repo);
        return {
          id: repo.id,
          title: formatProjectTitle(repo.name || "Untitled"),
          desc:
            repo.description ||
            "A personal project showcasing my coding skills and problem-solving abilities.",
          tags: tags,
          live: repo.homepage || "#",
          repo: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated: repo.updated_at,

          image:
            "https://raw.githubusercontent.com/" +
            username +
            "/" +
            repo.name +
            "/" +
            (repo.default_branch || "main") +
            "/preview.png",
        };
      });

    if (projects.length === 0) {
      console.warn(
        "[fetchGitHubData] no non-fork projects detected — user may only have forked/private repos"
      );
      if (gridEl)
        showMessage(gridEl, ["No non-fork public repositories to display."]);
    }

    if (projects.length > 0 && gridEl) {
      renderProjects(projects);
      renderFilters(projects);
    } else if (gridEl) {
      showMessage(gridEl, [
        "No public projects found on GitHub. Make sure your repositories are public.",
      ]);
    }

    const skills = extractSkillsFromRepos(repos);
    if (skillsListEl) renderSkills(skills);
  } catch (err) {
    console.error("[fetchGitHubData] fetch failed:", err);
    if (el("#projectsGrid")) {
      el("#projectsGrid").innerHTML =
        '<div style="text-align:center;padding:28px;color:var(--muted);"><div>Failed to load projects from GitHub.</div><div>Check network, CORS policies, or API rate limits. See console for details.</div></div>';
    }
    if (el("#skillsList")) {
      el("#skillsList").innerHTML =
        '<div style="text-align:center;padding:20px;color:var(--muted);">Failed to load skills.</div>';
    }
  }
}

function formatProjectTitle(title) {
  return (title || "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractTagsFromRepo(repo) {
  const tags = [];
  const name = (repo.name || "").toLowerCase();
  const description = (repo.description || "").toLowerCase();
  if (repo.language) tags.push(repo.language);
  const techPatterns = {
    python: ["python", "django", "flask", "tkinter", "customtkinter"],
    javascript: ["javascript", "js", "node", "express", "react", "vue"],
    html: ["html", "css", "web", "frontend"],
    gui: ["gui", "tkinter", "customtkinter", "interface", "desktop"],
    automation: ["automation", "script", "bot", "scraper"],
    calculator: ["calculator", "calc", "math"],
    "employee management": ["employee", "hr", "management", "staff"],
    database: ["database", "sql", "mysql", "postgresql", "mongodb"],
    api: ["api", "rest", "graphql", "endpoint"],
  };
  Object.entries(techPatterns).forEach(([tag, keywords]) => {
    if (
      keywords.some(
        (keyword) => name.includes(keyword) || description.includes(keyword)
      )
    ) {
      if (!tags.includes(tag)) tags.push(tag);
    }
  });
  if (repo.topics && repo.topics.length > 0)
    repo.topics.forEach((topic) => {
      if (!tags.includes(topic)) tags.push(topic);
    });
  if (tags.length === 0) tags.push("Development");
  return tags.slice(0, 4);
}

function extractSkillsFromRepos(repos) {
  const skillFrequency = {};
  const skillCategories = {
    languages: [
      "Python",
      "JavaScript",
      "Java",
      "C++",
      "C#",
      "PHP",
      "Ruby",
      "TypeScript",
      "HTML",
      "CSS",
      "SQL",
    ],
    frameworks: [
      "React",
      "Node.js",
      "Vue",
      "Angular",
      "Django",
      "Flask",
      "Express",
      "Spring",
      "Laravel",
    ],
    tools: [
      "Git",
      "Docker",
      "AWS",
      "Azure",
      "Linux",
      "Windows",
      "VS Code",
      "PyCharm",
    ],
    databases: [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "SQLite",
      "Redis",
      "Firebase",
    ],
    technologies: ["REST API", "GraphQL", "JSON", "XML", "WebSocket", "OAuth"],
  };
  repos.forEach((repo) => {
    if (repo.language)
      skillFrequency[repo.language] = (skillFrequency[repo.language] || 0) + 3;
    if (repo.description) {
      const desc = repo.description.toLowerCase();
      Object.values(skillCategories)
        .flat()
        .forEach((skill) => {
          if (desc.includes(skill.toLowerCase()))
            skillFrequency[skill] = (skillFrequency[skill] || 0) + 2;
        });
    }
    if (repo.topics)
      repo.topics.forEach((topic) => {
        Object.values(skillCategories)
          .flat()
          .forEach((skill) => {
            if (topic.toLowerCase().includes(skill.toLowerCase()))
              skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
          });
      });
  });
  let skillsArray = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);
  const defaultSkills = [
    "Python",
    "HTML",
    "CSS",
    "JavaScript",
    "Git",
    "SQL",
    "Problem Solving",
    "GUI Development",
  ];
  defaultSkills.forEach((skill) => {
    if (!skillsArray.includes(skill) && skillsArray.length < 12)
      skillsArray.push(skill);
  });
  return skillsArray.slice(0, 12);
}

function renderSkills(skills) {
  const skillsListEl = el("#skillsList");
  if (!skillsListEl) return;
  if (skills.length === 0) {
    skillsListEl.innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--muted);">No skills detected from repositories.</div>';
    return;
  }
  skillsListEl.innerHTML = "";
  skills.forEach((skill, index) => {
    const skillEl = document.createElement("div");
    skillEl.className = "skill fade-in";
    skillEl.style.animationDelay = index * 100 + "ms";
    skillEl.innerHTML = "<span>" + skill + "</span>";
    skillsListEl.appendChild(skillEl);
    setTimeout(() => {
      skillEl.classList.add("visible");
    }, index * 80);
  });
}

function renderFilters(projects) {
  const filtersElement = el("#filters");
  if (!filtersElement) return;
  window.allProjects = projects;
  const tagSet = new Set();
  projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  const TAGS = ["All", ...Array.from(tagSet).sort()];
  filtersElement.innerHTML = "";
  TAGS.forEach((tag, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "chip scale-in" + (tag === window.activeTag ? " active" : "");
    btn.style.animationDelay = index * 50 + "ms";
    btn.innerHTML = "<span>" + tag + "</span>";
    btn.dataset.tag = tag;
    btn.addEventListener("click", () => {
      if ((window.activeTag || "All") === tag) return;
      window.activeTag = tag;
      renderFilters(projects);
      renderProjects(projects);
    });
    filtersElement.appendChild(btn);
  });
}

function createProjectCard(p) {
  const card = document.createElement("article");
  card.className = "card fade-in";
  card.setAttribute("data-tags", p.tags.join(" "));
  const description =
    p.desc.length > 120 ? p.desc.substring(0, 120) + "..." : p.desc;
  const imgSrc =
    p.image ||
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="%23e6e9ee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999">No Image</text></svg>';
  card.innerHTML =
    '<div class="proj-image-wrap"><img class="proj-image" src="' +
    imgSrc +
    '" alt="' +
    p.title +
    ' image" loading="lazy" /></div>' +
    '<div class="meta"><div class="tag">' +
    (p.tags[0] || "Project") +
    "</div>" +
    (p.stars > 0
      ? '<div class="star-count"><i class="fas fa-star"></i> ' +
        p.stars +
        "</div>"
      : "") +
    "</div>" +
    '<div class="proj-title">' +
    p.title +
    "</div><p>" +
    description +
    '</p><div class="actions">' +
    (p.live !== "#"
      ? '<a class="link" href="' +
        p.live +
        '" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> <span>Live Demo</span></a>'
      : "") +
    '<a class="link" href="' +
    p.repo +
    '" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> <span>View Code</span></a>' +
    "</div>";
  return card;
}

function renderProjects(projects) {
  const gridElement = el("#projectsGrid");
  if (!gridElement) return;
  gridElement.innerHTML = "";
  const activeTag = window.activeTag || "All";
  const selected =
    activeTag === "All"
      ? projects
      : projects.filter((p) => p.tags.includes(activeTag));
  if (selected.length === 0) {
    const msg = document.createElement("div");
    msg.style.padding = "40px";
    msg.style.color = "var(--muted)";
    msg.style.textAlign = "center";
    msg.innerHTML =
      '<p>No projects found with the "' +
      activeTag +
      '" tag.</p><p>Try selecting a different filter.</p>';
    gridElement.appendChild(msg);
    return;
  }
  selected.forEach((p, i) => {
    const card = createProjectCard(p);
    card.style.transitionDelay = i * 100 + "ms";
    gridElement.appendChild(card);
    setTimeout(() => {
      card.classList.add("visible");
      if (window.__portfolioScrollObserver)
        window.__portfolioScrollObserver.observe(card);
    }, i * 80);
  });
}

function setupContactFormWithEmailJS() {
  const contactForm = el("#contactForm");
  if (!contactForm) return;
  let emailJsReady = false;
  loadEmailJSSDK()
    .then(() => {
      emailJsReady = true;
    })
    .catch((err) => console.warn("EmailJS SDK failed to load:", err));
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isHoneypotTriggered(contactForm)) {
      console.warn("Honeypot triggered — likely bot. Submission aborted.");
      showToast("Submission blocked (spam detected).", "error");
      return;
    }
    const name =
      contactForm.name && contactForm.name.value
        ? contactForm.name.value.trim()
        : "";
    const email =
      contactForm.email && contactForm.email.value
        ? contactForm.email.value.trim()
        : "";
    const message =
      contactForm.message && contactForm.message.value
        ? contactForm.message.value.trim()
        : "";
    if (!name || !email || !message) {
      showToast("Please fill all fields.", "error");
      return;
    }
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.dataset.cooldownActive === "1") {
      showToast("Please wait before sending another message.", "info");
      return;
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.orig = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      sent_at: new Date().toLocaleString(),
    };
    try {
      if (!emailJsReady) {
        await loadEmailJSSDK();
        emailJsReady = true;
      }
      if (window.emailjs && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );
        showToast("Message sent — thanks!", "success");

        //    function captures the correct label instead of "Sending..."
        if (submitBtn) {
          submitBtn.innerHTML = submitBtn.dataset.orig || "Send Message";

          startCooldown(submitBtn, 30);
        }
        setTimeout(() => {
          contactForm.reset();
        }, 700);

        return;
      }
      throw new Error("EmailJS not available or IDs not configured");
    } catch (err) {
      console.error("EmailJS send failed, falling back to mailto:", err);
      try {
        const subject = encodeURIComponent("Portfolio contact from " + name);
        const body = encodeURIComponent(
          ["Name: " + name, "Email: " + email, "", message].join("\n")
        );
        const mail =
          "mailto:venkatesh@example.com?subject=" + subject + "&body=" + body;
        window.location.href = mail;
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = submitBtn.dataset.orig || "Send Message";
          submitBtn.disabled = false;
        }
      }
    }
  });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  navbar = el("#navbar");
  navLinks = el("#navLinks");
  mobileToggle = el("#mobileToggle");
  sections = elAll("section") || [];
  navItems = elAll(".nav-link") || [];

  initTheme();
  initAnimations();
  // initSpline(); // uncomment if you have a Spline scene
  setupMobileToggle();
  setupNavItemsClose();
  setupThemeToggle();
  setupContactFormWithEmailJS();
  fetchGitHubData();
  handleScroll();
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    document.documentElement.style.scrollBehavior = "auto";
  }
});

// Add shake animation for form validation
appendInlineStyle(
  "@keyframes shake {0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);}}"
);

// End of script.js

/* ============================================================
   AMAANITVAM FOUNDATION — Learning Management System (LMS)
   lms.js — data + storage + UI logic (drop into ../scripts/lms.js)
   ============================================================ */

/* ---------------- Shared demo media ---------------- */
const VIDEO_EMBED = "https://www.youtube.com/embed/4xbFf25pguo";
const NOTES_PDF = "sample-book.pdf";

/* ---------------- Categories (domains) ---------------- */
const CATEGORIES = [
  { id: "web-dev",     name: "Web Development",         icon: "fa-code",                 type: "technical",     tags: "coding,webdesign,laptop" },
  { id: "app-dev",     name: "App Development",         icon: "fa-mobile-screen-button",  type: "technical",     tags: "mobileapp,coding,phone" },
  { id: "uiux",        name: "UI/UX Design",            icon: "fa-pen-ruler",             type: "technical",     tags: "uidesign,wireframe,figma" },
  { id: "graphic",     name: "Graphic Design",          icon: "fa-palette",               type: "technical",     tags: "graphicdesign,art,creative" },
  { id: "content",     name: "Content Writing",         icon: "fa-feather-pointed",       type: "non-technical", tags: "writing,notebook,blogging" },
  { id: "social",      name: "Social Media Management", icon: "fa-hashtag",               type: "non-technical", tags: "socialmedia,marketing,phone" },
  { id: "hr",          name: "Human Resources (HR)",    icon: "fa-users",                 type: "non-technical", tags: "office,teamwork,interview" },
  { id: "csr",         name: "CSR",                     icon: "fa-hand-holding-heart",    type: "non-technical", tags: "csr,community,volunteer" },
  { id: "pm",          name: "Project Management",      icon: "fa-diagram-project",       type: "non-technical", tags: "projectmanagement,planning,office" },
  { id: "creative",    name: "Creative Team",            icon: "fa-lightbulb",             type: "non-technical", tags: "brainstorm,creative,studio" },
  { id: "softskills",  name: "Soft Skills",             icon: "fa-comments",              type: "non-technical", tags: "communication,people,discussion" },
  { id: "leadership",  name: "Leadership & Management", icon: "fa-chess-king",            type: "non-technical", tags: "leadership,meeting,manager" },
  { id: "interview",   name: "Interview Preparation",   icon: "fa-user-tie",              type: "non-technical", tags: "interview,resume,office" },
  { id: "orientation", name: "NGO Orientation & Training", icon: "fa-compass",            type: "non-technical", tags: "ngo,orientation,training" },
];

function catInfo(id){ return CATEGORIES.find(c=>c.id===id) || {}; }
function catName(id){ return catInfo(id).name || id; }

function hashLock(str){
  let h = 0;
  for (let i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return (h % 900) + 1;
}
function courseThumb(course){
  const tags = catInfo(course.category).tags || "learning,education";
  return `https://loremflickr.com/480/300/${tags}?lock=${hashLock(course.id)}`;
}

/* ---------------- Base course catalog (seed data) ---------------- */
function lec(id, title, duration){ return { id, title, duration, video: VIDEO_EMBED }; }
function note(id, title){ return { id, title, url: NOTES_PDF }; }
function asg(id, title, desc){ return { id, title, desc }; }
function quizOf(qs){ return { questions: qs }; }
function q(text, options, correct){ return { text, options, correct }; }

const BASE_COURSES = [
  {
    id: "graphic-101", title: "Graphic Design for Social Impact", category: "graphic", level: "Beginner",
    duration: "4 weeks", instructor: "Kabir Anand", instructorTitle: "Creative Director",
    description: "Typography, color and composition for NGO campaign creatives — posters, social tiles and certificates.",
    prerequisites: [], rating: 4.7, enrolledBase: 133, createdDate: "2026-02-18",
    lectures: [ lec("l1","Typography Fundamentals","16 min"), lec("l2","Color Theory for Campaigns","19 min"),
      lec("l3","Composing a Social Media Tile","23 min") ],
    notes: [ note("n1","Brand Palette & Type Guide") ],
    assignments: [ asg("a1","Design one campaign poster","Submit a single A4 poster promoting a Foundation event.") ],
    quiz: quizOf([
      q("Which principle groups related elements visually?", ["Contrast","Proximity","Repetition","Alignment"], 1),
      q("A complementary color scheme uses colors that are...", ["Adjacent on the wheel","Opposite on the wheel","All greyscale","Random"], 1),
    ]),
  },
];

/* ---------------- Storage ---------------- */
// Bump this whenever BASE_COURSES changes shape — it forces every browser's
// cached catalog (and any learner data pointing at now-removed course ids)
// to reset to the new seed on next load, instead of sticking with stale data.
const SEED_VERSION = 3;

const LS = {
  get(key, fallback){
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch(e){ return fallback; }
  },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); },
};

const Store = {
  /* working course list — reseeded whenever SEED_VERSION changes, otherwise fully admin-editable */
  getCourses(){
    const storedVersion = LS.get("lms_seed_version", null);
    let list = LS.get("lms_courses", null);
    if (!list || storedVersion !== SEED_VERSION){
      list = BASE_COURSES;
      LS.set("lms_courses", list);
      LS.set("lms_seed_version", SEED_VERSION);
      // Clear learner data that may reference course ids no longer in the catalog.
      ["lms_enrollments", "lms_progress", "lms_quiz", "lms_assignments", "lms_certificates"].forEach(k=> localStorage.removeItem(k));
    }
    return list;
  },
  saveCourses(list){ LS.set("lms_courses", list); },

  learnerName(){ return LS.get("lms_learner_name", "Guest Learner"); },
  setLearnerName(name){ LS.set("lms_learner_name", name || "Guest Learner"); },

  enrollments(){ return LS.get("lms_enrollments", {}); },
  isEnrolled(courseId){ return !!this.enrollments()[courseId]; },
  enroll(courseId){
    const e = this.enrollments();
    if (!e[courseId]) e[courseId] = { enrolledAt: new Date().toISOString() };
    LS.set("lms_enrollments", e);
  },

  progress(){ return LS.get("lms_progress", {}); },
  courseProgress(courseId){
    const p = this.progress();
    return p[courseId] || { completed: [], lastWatched: null };
  },
  markLecture(courseId, lectureId){
    const p = this.progress();
    const cp = p[courseId] || { completed: [], lastWatched: null };
    if (!cp.completed.includes(lectureId)) cp.completed.push(lectureId);
    cp.lastWatched = lectureId;
    p[courseId] = cp;
    LS.set("lms_progress", p);
  },
  setLastWatched(courseId, lectureId){
    const p = this.progress();
    const cp = p[courseId] || { completed: [], lastWatched: null };
    cp.lastWatched = lectureId;
    p[courseId] = cp;
    LS.set("lms_progress", p);
  },

  quizResults(){ return LS.get("lms_quiz", {}); },
  quizResult(courseId){ return this.quizResults()[courseId] || null; },
  saveQuizResult(courseId, score, total){
    const r = this.quizResults();
    r[courseId] = { score, total, passed: score / total >= 0.6, submittedAt: new Date().toISOString() };
    LS.set("lms_quiz", r);
    return r[courseId];
  },

  assignmentSubs(){ return LS.get("lms_assignments", {}); },
  isAssignmentSubmitted(courseId, assignmentId){
    const s = this.assignmentSubs();
    return !!(s[courseId] && s[courseId][assignmentId]);
  },
  submitAssignment(courseId, assignmentId){
    const s = this.assignmentSubs();
    s[courseId] = s[courseId] || {};
    s[courseId][assignmentId] = true;
    LS.set("lms_assignments", s);
  },

  certificates(){ return LS.get("lms_certificates", {}); },
  hasCertificate(courseId){ return !!this.certificates()[courseId]; },
  issueCertificate(courseId){
    const c = this.certificates();
    if (!c[courseId]) c[courseId] = { issuedAt: new Date().toISOString() };
    LS.set("lms_certificates", c);
  },

  // courseStats(course){
  //   const cp = this.courseProgress(course.id);
  //   const lectureTotal = course.lectures.length || 1;
  //   const lecturePct = Math.round((cp.completed.length / lectureTotal) * 80);
  //   const quiz = this.quizResult(course.id);
  //   const quizPct = quiz && quiz.passed ? 20 : 0;
  //   const pct = Math.min(100, lecturePct + quizPct);
  //   const lecturesDone = cp.completed.length === lectureTotal && lectureTotal > 0;
  //   const isComplete = lecturesDone && quiz && quiz.passed;
  //   if (isComplete && !this.hasCertificate(course.id)) this.issueCertificate(course.id);
  //   return { pct, lecturesDone, quizPassed: !!(quiz && quiz.passed), isComplete, completedCount: cp.completed.length, lectureTotal };
  // },

  courseStats(course) {

  const cp = this.courseProgress(course.id);

  const lectureTotal =
    course.lectures?.length || 0;

  const completedLectures =
    (cp.completed || []).filter(
      lectureId =>
        course.lectures.some(
          lecture =>
            lecture.id === lectureId
        )
    );

  const completedCount =
    completedLectures.length;

  const lecturePct =
    lectureTotal > 0
      ? Math.round(
          (completedCount / lectureTotal) * 80
        )
      : 0;

  const quiz =
    this.quizResult(course.id);

  const quizPassed =
    !!(quiz && quiz.passed);

  const quizPct =
    quizPassed ? 20 : 0;

  const pct =
    Math.min(
      100,
      lecturePct + quizPct
    );

  const lecturesDone =
    lectureTotal > 0 &&
    completedCount === lectureTotal;

  const isComplete =
    lecturesDone &&
    quizPassed;

  if (
    isComplete &&
    !this.hasCertificate(course.id)
  ) {
    this.issueCertificate(course.id);
  }

  return {
    pct,
    lecturesDone,
    quizPassed,
    isComplete,
    completedCount,
    lectureTotal
  };
},
  prereqsMet(course, courses){
    return (course.prerequisites || []).every(pid=>{
      return this.hasCertificate(pid) || this.courseStats(courses.find(c=>c.id===pid) || { id: pid, lectures: [] }).isComplete;
    });
  },

  adminMode(){ return LS.get("lms_admin_mode", false); },
  setAdminMode(v){ LS.set("lms_admin_mode", v); },
};

function courseById(id, courses){ return (courses || Store.getCourses()).find(c=>c.id===id); }
function uid(prefix){ return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

/* ---------------- Navbar / shared chrome ---------------- */
function initNavbar(){
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) toggle.addEventListener("click", ()=> links.classList.toggle("open"));
}

/* ---------------- Toast ---------------- */
function showToast(msg){
  let toast = document.getElementById("appToast");
  if (!toast){
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    toast.innerHTML = '<span class="dot"></span><span id="appToastMsg"></span>';
    document.body.appendChild(toast);
  }
  document.getElementById("appToastMsg").textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.classList.remove("show"), 2800);
}

/* ---------------- Generic modal helpers ---------------- */
function openModal(id){ document.getElementById(id).classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(id){ document.getElementById(id).classList.remove("open"); document.body.style.overflow = ""; }
function bindModalClosers(scope){
  (scope || document).querySelectorAll("[data-close]").forEach(btn=>{ btn.onclick = ()=> closeModal(btn.dataset.close); });
  (scope || document).querySelectorAll(".modal-overlay").forEach(ov=>{ ov.onclick = (e)=>{ if (e.target === ov) closeModal(ov.id); }; });
}

/* ============================================================
   Page logic
   ============================================================ */
document.addEventListener("DOMContentLoaded", ()=>{
  initNavbar();

  let courses = Store.getCourses();
  let activeType = "all";          // all | technical | non-technical
  let activeCategory = "all";
  let activeLevel = "all";
  let activeSort = "popular";

  /* ---------------- Header stats ---------------- */
  function refreshHeaderStats(){
    courses = Store.getCourses();
    document.getElementById("statCourses").textContent = courses.length;
    document.getElementById("statLectures").textContent = courses.reduce((s,c)=> s + c.lectures.length, 0);
    document.getElementById("statEnrolled").textContent = Object.keys(Store.enrollments()).length;
    document.getElementById("statCerts").textContent = Object.keys(Store.certificates()).length;
  }

  /* ---------------- Learning Path Rail ---------------- */
  function renderRail(){
    const track = document.getElementById("railTrack");
    track.innerHTML = '<div class="rail-line"></div>' + CATEGORIES.map(cat=>{
      const count = courses.filter(c=>c.category===cat.id).length;
      const active = activeCategory === cat.id;
      return `<button type="button" class="rail-node${active ? ' active' : ''}" data-cat="${cat.id}">
        <span class="rail-node-dot"><i class="fa-solid ${cat.icon}"></i></span>
        <span class="rail-node-tag">${cat.type === 'technical' ? 'TECH' : 'NON-TECH'}</span>
        <span class="rail-node-label">${cat.name}</span>
        <span class="rail-node-count">${count} course${count===1?'':'s'}</span>
      </button>`;
    }).join("");
    track.querySelectorAll("[data-cat]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        activeCategory = btn.dataset.cat;
        setCategoryFilterValue(activeCategory);
        setTab("browse");
        renderRail();
        renderCourses();
        document.getElementById("catalogSection").scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* ---------------- Type toggle ---------------- */
  document.getElementById("typeToggle").addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-type]");
    if (!btn) return;
    activeType = btn.dataset.type;
    document.querySelectorAll("#typeToggle button").forEach(b=> b.classList.toggle("active", b === btn));
    renderCourses();
  });

  /* ---------------- Filter dropdowns ---------------- */
  function buildCategoryFilterMenu(){
    const menu = document.getElementById("categoryFilterMenu");
    const all = [{ id: "all", name: "All Domains" }, ...CATEGORIES];
    menu.innerHTML = all.map(c=>
      `<button type="button" class="filter-dropdown-item${c.id==='all' ? ' selected' : ''}" data-value="${c.id}">
        <i class="fa-solid fa-check"></i><span>${c.name}</span>
      </button>`
    ).join("");
  }
  buildCategoryFilterMenu();

  function setCategoryFilterValue(value){
    activeCategory = value;
    const dropdown = document.getElementById("categoryFilterDropdown");
    const label = document.getElementById("categoryFilterLabel");
    dropdown.dataset.value = value;
    label.textContent = value === "all" ? "All Domains" : catName(value);
    dropdown.querySelectorAll(".filter-dropdown-item").forEach(item=> item.classList.toggle("selected", item.dataset.value === value));
  }
  function setLevelFilterValue(value){
    activeLevel = value;
    const dropdown = document.getElementById("levelFilterDropdown");
    const label = document.getElementById("levelFilterLabel");
    dropdown.dataset.value = value;
    label.textContent = value === "all" ? "Any Level" : value;
    dropdown.querySelectorAll(".filter-dropdown-item").forEach(item=> item.classList.toggle("selected", item.dataset.value === value));
  }
  function setSortValue(value){
    activeSort = value;
    const dropdown = document.getElementById("sortDropdown");
    const label = document.getElementById("sortLabel");
    const labels = { popular: "Most Popular", newest: "Newest", duration: "Shortest Duration", az: "A–Z" };
    dropdown.dataset.value = value;
    label.textContent = labels[value];
    dropdown.querySelectorAll(".filter-dropdown-item").forEach(item=> item.classList.toggle("selected", item.dataset.value === value));
  }
  function wireDropdown(dropdownId, onSelect){
    const dropdown = document.getElementById(dropdownId);
    const btn = dropdown.querySelector(".filter-dropdown-btn");
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      document.querySelectorAll(".filter-dropdown.open").forEach(d=>{ if (d !== dropdown) d.classList.remove("open"); });
      dropdown.classList.toggle("open");
    });
    dropdown.querySelector(".filter-dropdown-menu").addEventListener("click", (e)=>{
      const item = e.target.closest(".filter-dropdown-item");
      if (!item) return;
      onSelect(item.dataset.value);
      dropdown.classList.remove("open");
      renderCourses();
    });
  }
  wireDropdown("categoryFilterDropdown", setCategoryFilterValue);
  wireDropdown("levelFilterDropdown", setLevelFilterValue);
  wireDropdown("sortDropdown", setSortValue);
  document.addEventListener("click", ()=> document.querySelectorAll(".filter-dropdown.open").forEach(d=> d.classList.remove("open")));

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", renderCourses);

  /* ---------------- Course card markup ---------------- */
  function courseCard(c, opts){
    opts = opts || {};
    const stats = Store.courseStats(c);
    const enrolled = Store.isEnrolled(c.id);
    const prereqOk = Store.prereqsMet(c, courses);
    const typeTag = catInfo(c.category).type === "technical" ? "Technical" : "Non-Technical";
    const typeCls = catInfo(c.category).type === "technical" ? "" : "non-tech";

    let badge = '<span class="badge badge-notenrolled">Not Enrolled</span>';
    if (enrolled && stats.isComplete) badge = '<span class="badge badge-complete"><i class="fa-solid fa-circle-check"></i> Completed</span>';
    else if (enrolled) badge = '<span class="badge badge-inprogress">In Progress</span>';

    const progressRow = enrolled ? `
      <div class="course-progress-row">
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${stats.pct}%;"></div></div>
        <span class="progress-bar-pct">${stats.pct}%</span>
      </div>` : "";

    const prereqLine = c.prerequisites && c.prerequisites.length
      ? `<div class="course-prereq${prereqOk ? '' : ' locked'}"><i class="fa-solid ${prereqOk ? 'fa-lock-open' : 'fa-lock'}"></i> Requires: ${c.prerequisites.map(pid=> courseById(pid, courses)?.title || pid).join(", ")}</div>`
      : `<div class="course-prereq"><i class="fa-solid fa-signal"></i> No prerequisites</div>`;
let actionBtn;

if (!prereqOk && !enrolled) {

  actionBtn = `
    <button
      class="btn btn-ghost btn-sm"
      style="flex:1;"
      disabled
    >
      <i class="fa-solid fa-lock"></i>
      Locked
    </button>
  `;

} else if (!enrolled) {

  actionBtn = `
    <button
      class="btn btn-circuit btn-sm"
      style="flex:1;"
      data-enroll="${c.id}"
    >
      Enroll Now
    </button>
  `;

} else {

  // Course completed
  if (stats.isComplete) {

    actionBtn = `
      <button
        class="btn btn-primary btn-sm"
        style="flex:1;"
        data-certificate="${c.id}"
      >
        <i class="fa-solid fa-award"></i>
        View Certificate
      </button>
    `;

  } else {

    // Course enrolled but not completed
    const cp = Store.courseProgress(c.id);

    const hasStarted = !!cp.lastWatched;

    actionBtn = `
      <button
        class="btn btn-primary btn-sm"
        style="flex:1;"
        data-open-course="${c.id}"
      >
        <i class="fa-solid fa-play"></i>
        ${stats.pct > 0 || hasStarted ? "Resume" : "Start Course"}
      </button>
    `;
  }
}

    return `
    <div class="course-card">
      <div class="course-thumb-wrap">
        <img class="course-thumb" src="${courseThumb(c)}" alt="${c.title}" loading="lazy">
        <span class="course-type-tag ${typeCls}">${typeTag}</span>
        <span class="course-level-tag">${c.level}</span>
        <span class="course-code">${c.id.toUpperCase()}</span>
      </div>
      <div class="course-body">
        <div class="course-cat">${catName(c.category)}</div>
        <div class="course-title">${c.title}</div>
        <div class="course-instructor"><i class="fa-solid fa-chalkboard-user"></i> ${c.instructor}</div>
        <div class="course-meta">
          <span><i class="fa-solid fa-clock"></i> ${c.duration}</span>
          <span><i class="fa-solid fa-circle-play"></i> ${c.lectures.length} lectures</span>
          <span><i class="fa-solid fa-star"></i> ${c.rating}</span>
        </div>
        ${prereqLine}
        ${progressRow}
        <div style="display:flex;justify-content:space-between;align-items:center;">${badge}</div>
        <div class="course-actions">
          <button class="btn btn-ghost btn-sm" style="flex:1;" data-preview="${c.id}">Details</button>
          ${actionBtn}
        </div>
      </div>
    </div>`;
  }


  function resumeCourse(courseId) {

  const courses = Store.getCourses();

  const course = courseById(courseId, courses);

  if (!course) {
    console.error("Course not found:", courseId);
    return;
  }

  if (!Store.isEnrolled(courseId)) {
    showToast("Please enroll in this course first.");
    return;
  }

  const progress = Store.courseProgress(courseId);

  const lastWatchedLecture = course.lectures.find(
    lecture => lecture.id === progress.lastWatched
  );

  const lecture =
    lastWatchedLecture ||
    course.lectures[0];

  if (!lecture) {
    showToast("No lectures available.");
    return;
  }

  ensureDetailModal();

  openModal("courseModal");

  renderCourseDetail(courseId, false);

  loadLecture(
    course,
    lecture.id,
    false
  );

  showToast(
    progress.lastWatched
      ? `Resuming: ${lecture.title}`
      : `Starting: ${lecture.title}`
  );
}

  /* ---------------- Browse grid ---------------- */
  function renderCourses(){
    courses = Store.getCourses();
    const q = searchInput.value.trim().toLowerCase();
    let filtered = courses.filter(c=>{
      if (activeType !== "all" && catInfo(c.category).type !== activeType) return false;
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (activeLevel !== "all" && c.level !== activeLevel) return false;
      if (q && !(c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || catName(c.category).toLowerCase().includes(q))) return false;
      return true;
    });

    filtered = filtered.slice().sort((a,b)=>{
      if (activeSort === "az") return a.title.localeCompare(b.title);
      if (activeSort === "newest") return new Date(b.createdDate) - new Date(a.createdDate);
      if (activeSort === "duration") return parseInt(a.duration) - parseInt(b.duration);
      return (b.enrolledBase || 0) - (a.enrolledBase || 0);
    });

    const chipWrap = document.getElementById("activeCategoryChip");
    chipWrap.innerHTML = activeCategory === "all" ? "" :
      `<span class="chip active">${catName(activeCategory)} <a href="#" id="clearCatChip" style="margin-left:.4rem;color:inherit;">✕</a></span>`;
    const clear = document.getElementById("clearCatChip");
    if (clear) clear.addEventListener("click", (e)=>{ e.preventDefault(); setCategoryFilterValue("all"); renderRail(); renderCourses(); });

    document.getElementById("noResults").style.display = filtered.length ? "none" : "block";
    document.getElementById("courseGrid").innerHTML = filtered.map(c=> courseCard(c)).join("");
    document.getElementById("countBrowse").textContent = filtered.length;

    renderMyLearning();
    renderCertificates();
    refreshHeaderStats();
  }

  /* ---------------- My Learning tab ---------------- */
  function renderMyLearning(){
    const ids = Object.keys(Store.enrollments());
    const list = ids.map(id=> courseById(id, courses)).filter(Boolean);
    document.getElementById("myLearningGrid").innerHTML = list.map(c=> courseCard(c)).join("");
    document.getElementById("myLearningEmpty").style.display = list.length ? "none" : "flex";
    document.getElementById("countMyLearning").textContent = list.length;
  }

  /* ---------------- Certificates tab ---------------- */
  function renderCertificates(){
    const certs = Store.certificates();
    const ids = Object.keys(certs);
    const grid = document.getElementById("certGrid");
    grid.innerHTML = ids.map(id=>{
      const c = courseById(id, courses);
      if (!c) return "";
      const date = new Date(certs[id].issuedAt).toLocaleDateString();
      return `<div class="cert-card">
        <div class="cert-icon"><i class="fa-solid fa-award"></i></div>
        <div style="flex:1;min-width:0;">
          <div class="cert-title">${c.title}</div>
          <div class="cert-sub">Issued ${date}</div>
        </div>
        <button class="btn btn-outline-circuit btn-sm" data-view-cert="${c.id}">View</button>
      </div>`;
    }).join("");
    document.getElementById("certEmpty").style.display = ids.length ? "none" : "flex";
    document.getElementById("countCerts").textContent = ids.length;
  }

  /* ---------------- Tabs ---------------- */
  function setTab(name){
    document.querySelectorAll(".tab-btn").forEach(b=> b.classList.toggle("active", b.dataset.tab===name));
    document.getElementById("tabBrowse").classList.toggle("active", name==="browse");
    document.getElementById("tabMyLearning").classList.toggle("active", name==="mylearning");
    document.getElementById("tabCertificates").classList.toggle("active", name==="certificates");
    if (name === "mylearning") renderMyLearning();
    if (name === "certificates") renderCertificates();
  }
  document.querySelectorAll(".tab-btn").forEach(b=> b.addEventListener("click", ()=> setTab(b.dataset.tab)));
  document.getElementById("heroBrowseBtn").addEventListener("click", ()=>{ setTab("browse"); document.getElementById("catalogSection").scrollIntoView({behavior:"smooth"}); });
  document.getElementById("heroMyLearningBtn").addEventListener("click", ()=>{ setTab("mylearning"); document.getElementById("catalogSection").scrollIntoView({behavior:"smooth"}); });

  /* ============================================================
     COURSE DETAIL MODAL
     ============================================================ */
  function ensureDetailModal(){
    if (document.getElementById("courseModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" id="courseModal">
      <div class="modal modal-lg">
        <div class="modal-head">
          <div>
            <div class="course-cat" id="cmCat">CATEGORY</div>
            <h3 id="cmTitle">Course title</h3>
          </div>
          <button class="modal-close" data-close="courseModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="course-detail-grid">
            <div>
              <div class="viewer-frame" id="cmViewer"></div>
              <div class="detail-tabs">
                <button class="detail-tab-btn active" data-dtab="curriculum">Curriculum</button>
                <button class="detail-tab-btn" data-dtab="notes">Notes</button>
                <button class="detail-tab-btn" data-dtab="assignments">Assignments</button>
                <button class="detail-tab-btn" data-dtab="prereq">Prerequisites</button>
                <button class="detail-tab-btn" data-dtab="instructor">Instructor</button>
              </div>
              <div class="detail-tab-panel active" id="dtCurriculum">
                <div class="curriculum-list" id="cmLectures"></div>
                <div class="quiz-card" id="cmQuizCard"></div>
              </div>
              <div class="detail-tab-panel" id="dtNotes"><div id="cmNotes"></div></div>
              <div class="detail-tab-panel" id="dtAssignments"><div id="cmAssignments"></div></div>
              <div class="detail-tab-panel" id="dtPrereq">
                <p class="section-desc" style="margin-bottom:1rem;">This course sits on the learning path shown below — complete each prerequisite's certificate to unlock enrollment.</p>
                <div class="prereq-path" id="cmPrereqPath"></div>
              </div>
              <div class="detail-tab-panel" id="dtInstructor"><div id="cmInstructor"></div></div>
            </div>
            <div>
              <div class="progress-ring-wrap">
                <div class="progress-ring-label">Course Progress</div>
                <div class="progress-ring-pct" id="cmProgressPct">0%</div>
                <div class="progress-bar-track" style="width:100%;"><div class="progress-bar-fill" id="cmProgressFill" style="width:0%;"></div></div>
                <p class="field-hint" id="cmProgressHint" style="text-align:center;">Enroll to start tracking progress.</p>
              </div>
              <div style="margin-top:1rem;display:flex;flex-direction:column;gap:.6rem;">
                <div class="course-meta" style="border-top:none;padding-top:0;flex-direction:column;align-items:flex-start;gap:.5rem;">
                  <span><i class="fa-solid fa-clock"></i> <span id="cmDuration"></span></span>
                  <span><i class="fa-solid fa-signal"></i> <span id="cmLevel"></span></span>
                  <span><i class="fa-solid fa-users"></i> <span id="cmEnrolledCount"></span> enrolled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-close="courseModal">Close</button>
          <button class="btn btn-circuit" id="cmEnrollBtn">Enroll Now</button>
        </div>
      </div>
    </div>`);
    bindModalClosers();
    document.querySelectorAll("#courseModal .detail-tab-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        document.querySelectorAll("#courseModal .detail-tab-btn").forEach(b=> b.classList.toggle("active", b===btn));
        const map = { curriculum: "dtCurriculum", notes: "dtNotes", assignments: "dtAssignments", prereq: "dtPrereq", instructor: "dtInstructor" };
        Object.values(map).forEach(id=> document.getElementById(id).classList.remove("active"));
        document.getElementById(map[btn.dataset.dtab]).classList.add("active");
      });
    });
  }

  let currentCourseId = null;

  function loadLecture(course, lectureId, markComplete){
    const frame = document.getElementById("cmViewer");
    const lecture = course.lectures.find(l=> l.id === lectureId) || course.lectures[0];
    frame.innerHTML = `<iframe src="${lecture.video}" title="${lecture.title}" allowfullscreen></iframe>`;
    if (Store.isEnrolled(course.id)){
      if (markComplete) Store.markLecture(course.id, lecture.id);
      else Store.setLastWatched(course.id, lecture.id);
    }
    renderCourseDetail(course.id, false);
  }

  // function renderCourseDetail(courseId, resetViewer){
  //   courses = Store.getCourses();
  //   const c = courseById(courseId, courses);
  //   if (!c) return;
  //   currentCourseId = courseId;
  //   const enrolled = Store.isEnrolled(c.id);
  //   const stats = Store.courseStats(c);
  //   const cp = Store.courseProgress(c.id);
  //   const prereqOk = Store.prereqsMet(c, courses);

  //   document.getElementById("cmCat").textContent = catName(c.category);
  //   document.getElementById("cmTitle").textContent = c.title;
  //   document.getElementById("cmDuration").textContent = c.duration;
  //   document.getElementById("cmLevel").textContent = c.level;
  //   document.getElementById("cmEnrolledCount").textContent = (c.enrolledBase || 0) + Object.keys(Store.enrollments()).filter(id=>id===c.id).length;

  //   document.getElementById("cmProgressPct").textContent = enrolled ? stats.pct + "%" : "—";
  //   document.getElementById("cmProgressFill").style.width = (enrolled ? stats.pct : 0) + "%";
  //   document.getElementById("cmProgressHint").textContent = !enrolled
  //     ? "Enroll to start tracking progress."
  //     : stats.isComplete ? "Course complete — certificate issued!" : "Watch every lecture, then pass the quiz to finish.";

  //   const enrollBtn = document.getElementById("cmEnrollBtn");
  //   if (stats.isComplete){
  //     enrollBtn.innerHTML = '<i class="fa-solid fa-award"></i> View Certificate';
  //     enrollBtn.disabled = false;
  //     enrollBtn.onclick = ()=> openCertificate(c.id);
  //   } else if (!prereqOk && !enrolled){
  //     enrollBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Locked';
  //     enrollBtn.disabled = true;
  //     enrollBtn.onclick = null;
  //   } else if (!enrolled){
  //     enrollBtn.innerHTML = 'Enroll Now';
  //     enrollBtn.disabled = false;
  //     enrollBtn.onclick = ()=>{ Store.enroll(c.id); showToast("Enrolled in " + c.title); renderCourseDetail(c.id, true); renderCourses(); };
  //   } else {
  //     enrollBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume Lecture';
  //     enrollBtn.disabled = false;
  //     enrollBtn.onclick = ()=>{
  //       const next = cp.lastWatched || c.lectures[0].id;
  //       loadLecture(c, next, false);
  //     };
  //   }

  //   if (resetViewer || !document.getElementById("cmViewer").innerHTML){
  //     const startLecture = cp.lastWatched || c.lectures[0].id;
  //     loadLecture(c, startLecture, false);
  //     return; // loadLecture re-invokes renderCourseDetail
  //   }

  //   /* curriculum */
  //   document.getElementById("cmLectures").innerHTML = c.lectures.map((l, i)=>{
  //     const done = cp.completed.includes(l.id);
  //     const isCurrent = cp.lastWatched === l.id || (!cp.lastWatched && i === 0);
  //     return `<div class="lecture-item${done ? ' done' : ''}${isCurrent ? ' current' : ''}">
  //       <div class="lecture-check"><i class="fa-solid fa-check"></i></div>
  //       <div class="lecture-info">
  //         <div class="lecture-title">${i+1}. ${l.title}</div>
  //         <div class="lecture-meta">${l.duration}${isCurrent ? ' · Last watched' : ''}</div>
  //       </div>
  //       <button class="lecture-play" data-lecture="${l.id}" title="Play & mark complete" ${enrolled ? '' : 'disabled style="opacity:.4;"'}><i class="fa-solid fa-play"></i></button>
  //     </div>`;
  //   }).join("");

  //   const quizResult = Store.quizResult(c.id);
  //   document.getElementById("cmQuizCard").innerHTML = `
  //     <div class="q-icon"><i class="fa-solid fa-circle-question"></i></div>
  //     <div class="q-info">
  //       <div class="q-title">Final Assessment</div>
  //       <div class="q-sub">${c.quiz.questions.length} questions · pass at 60%${cp.completed.length < c.lectures.length ? ' · finish all lectures first' : ''}</div>
  //     </div>
  //     ${quizResult ? `<span class="quiz-score-pill">${quizResult.score}/${quizResult.total} ${quizResult.passed ? '✓' : ''}</span>` : ''}
  //     <button class="btn ${quizResult && quizResult.passed ? 'btn-ghost' : 'btn-circuit'} btn-sm" id="cmTakeQuizBtn" ${enrolled && cp.completed.length >= c.lectures.length ? '' : 'disabled'}>
  //       ${quizResult ? 'Retake Quiz' : 'Take Quiz'}
  //     </button>`;
  //   const quizBtn = document.getElementById("cmTakeQuizBtn");
  //   if (quizBtn) quizBtn.addEventListener("click", ()=> openQuiz(c.id));

  //   /* notes */
  //   document.getElementById("cmNotes").innerHTML = c.notes.map(n=> `
  //     <div class="resource-row">
  //       <div class="r-icon"><i class="fa-solid fa-file-pdf"></i></div>
  //       <div class="r-info"><div class="r-title">${n.title}</div><div class="r-sub">PDF notes</div></div>
  //       <a class="btn btn-ghost btn-sm" href="${n.url}" target="_blank" rel="noopener">View</a>
  //       <a class="btn btn-primary btn-sm" href="${n.url}" download>Download</a>
  //     </div>`).join("") || '<p class="field-hint">No notes uploaded yet.</p>';

  //   /* assignments */
  //   document.getElementById("cmAssignments").innerHTML = c.assignments.map(a=>{
  //     const submitted = Store.isAssignmentSubmitted(c.id, a.id);
  //     return `<div class="assignment-row">
  //       <div class="a-icon"><i class="fa-solid fa-file-pen"></i></div>
  //       <div class="r-info"><div class="r-title">${a.title}</div><div class="r-sub">${a.desc}</div></div>
  //       ${submitted
  //         ? '<span class="assignment-status submitted"><i class="fa-solid fa-check"></i> Submitted</span>'
  //         : `<button class="btn btn-primary btn-sm" data-submit-assignment="${a.id}" ${enrolled ? '' : 'disabled'}>Submit</button>`}
  //     </div>`;
  //   }).join("") || '<p class="field-hint">No assignments for this course.</p>';
  //   document.querySelectorAll("[data-submit-assignment]").forEach(btn=>{
  //     btn.addEventListener("click", ()=>{
  //       Store.submitAssignment(c.id, btn.dataset.submitAssignment);
  //       showToast("Assignment submitted");
  //       renderCourseDetail(c.id, false);
  //     });
  //   });

  //   /* prerequisites / path */
  //   if (!c.prerequisites || !c.prerequisites.length){
  //     document.getElementById("cmPrereqPath").innerHTML = '<span class="prereq-pill met"><i class="fa-solid fa-signal"></i> Open entry point — no prerequisites</span>';
  //   } else {
  //     document.getElementById("cmPrereqPath").innerHTML = c.prerequisites.map((pid, i)=>{
  //       const pc = courseById(pid, courses);
  //       const met = pc ? Store.courseStats(pc).isComplete : false;
  //       return `${i>0 ? '<span class="prereq-arrow">→</span>' : ''}<span class="prereq-pill ${met ? 'met' : 'unmet'}"><i class="fa-solid ${met ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> ${pc ? pc.title : pid}</span>`;
  //     }).join("") + `<span class="prereq-arrow">→</span><span class="prereq-pill met"><i class="fa-solid fa-flag-checkered"></i> ${c.title}</span>`;
  //   }

  //   /* instructor */
  //   document.getElementById("cmInstructor").innerHTML = `
  //     <div class="instructor-card">
  //       <div class="instructor-avatar">${c.instructor.trim().charAt(0)}</div>
  //       <div>
  //         <div class="instructor-name">${c.instructor}</div>
  //         <div class="instructor-title">${c.instructorTitle}</div>
  //       </div>
  //     </div>
  //     <p class="section-desc" style="margin-top:1rem;text-align:left;">${c.description}</p>`;

  //   document.querySelectorAll("[data-lecture]").forEach(btn=>{
  //     btn.addEventListener("click", ()=> loadLecture(c, btn.dataset.lecture, true));
  //   });
  // }

  function renderCourseDetail(courseId, resetViewer) {

  courses = Store.getCourses();

  const c = courseById(courseId, courses);

  if (!c) return;

  currentCourseId = courseId;

  const enrolled = Store.isEnrolled(c.id);
  const stats = Store.courseStats(c);
  const cp = Store.courseProgress(c.id);
  const prereqOk = Store.prereqsMet(c, courses);


  // =========================================================
  // COURSE BASIC DETAILS
  // =========================================================

  document.getElementById("cmCat").textContent =
    catName(c.category);

  document.getElementById("cmTitle").textContent =
    c.title;

  document.getElementById("cmDuration").textContent =
    c.duration;

  document.getElementById("cmLevel").textContent =
    c.level;

  document.getElementById("cmEnrolledCount").textContent =
    (c.enrolledBase || 0) +
    Object.keys(Store.enrollments()).filter(
      id => id === c.id
    ).length;


  // =========================================================
  // COURSE PROGRESS
  // =========================================================

  document.getElementById("cmProgressPct").textContent =
    enrolled
      ? stats.pct + "%"
      : "—";

  document.getElementById("cmProgressFill").style.width =
    (enrolled ? stats.pct : 0) + "%";


  document.getElementById("cmProgressHint").textContent =
    !enrolled
      ? "Enroll to start tracking progress."
      : stats.isComplete
        ? "Course complete — certificate issued!"
        : "Watch every lecture, then pass the quiz to finish.";


  // =========================================================
  // MAIN COURSE BUTTON
  // =========================================================

  const enrollBtn =
    document.getElementById("cmEnrollBtn");


  if (stats.isComplete) {

    // Course completed
    enrollBtn.innerHTML =
      '<i class="fa-solid fa-award"></i> View Certificate';

    enrollBtn.disabled = false;

    enrollBtn.onclick = () => {
      openCertificate(c.id);
    };


  } else if (!prereqOk && !enrolled) {

    // Prerequisite not completed
    enrollBtn.innerHTML =
      '<i class="fa-solid fa-lock"></i> Locked';

    enrollBtn.disabled = true;

    enrollBtn.onclick = null;


  } else if (!enrolled) {

    // Not enrolled
    enrollBtn.innerHTML =
      "Enroll Now";

    enrollBtn.disabled = false;

    enrollBtn.onclick = () => {

      Store.enroll(c.id);

      showToast(
        "Enrolled in " + c.title
      );

      renderCourseDetail(
        c.id,
        true
      );

      renderCourses();

    };


  } else {

    // Enrolled course
    enrollBtn.innerHTML =
      '<i class="fa-solid fa-play"></i> Resume Lecture';

    enrollBtn.disabled = false;

    enrollBtn.onclick = () => {

      const nextLecture =
        c.lectures.find(
          lecture =>
            lecture.id === cp.lastWatched
        ) || c.lectures[0];

      if (!nextLecture) {
        showToast("No lectures available.");
        return;
      }

      loadLecture(
        c,
        nextLecture.id,
        false
      );

    };
  }


  // =========================================================
  // INITIAL VIDEO / LAST WATCHED LECTURE
  // =========================================================

  if (
    resetViewer ||
    !document.getElementById("cmViewer").innerHTML
  ) {

    const startLecture =
      c.lectures.find(
        lecture =>
          lecture.id === cp.lastWatched
      ) || c.lectures[0];

    if (startLecture) {

      loadLecture(
        c,
        startLecture.id,
        false
      );

    }

    return;
  }


  // =========================================================
  // CURRICULUM
  // =========================================================

  document.getElementById("cmLectures").innerHTML =
    c.lectures
      .map((l, i) => {

        const done =
          cp.completed.includes(l.id);

        const isCurrent =
          cp.lastWatched === l.id ||
          (!cp.lastWatched && i === 0);


        return `
          <div
            class="lecture-item
              ${done ? "done" : ""}
              ${isCurrent ? "current" : ""}"
          >

            <div class="lecture-check">
              <i class="fa-solid fa-check"></i>
            </div>


            <div class="lecture-info">

              <div class="lecture-title">
                ${i + 1}. ${l.title}
              </div>

              <div class="lecture-meta">
                ${l.duration}
                ${isCurrent ? " · Last watched" : ""}
              </div>

            </div>


            <button
              class="lecture-play"
              data-lecture="${l.id}"
              title="Play & mark complete"
              ${enrolled
                ? ""
                : 'disabled style="opacity:.4;"'}
            >
              <i class="fa-solid fa-play"></i>
            </button>

          </div>
        `;

      })
      .join("");


  // =========================================================
  // FINAL ASSESSMENT / QUIZ
  // =========================================================

  const quizResult =
    Store.quizResult(c.id);


  /*
     IMPORTANT:

     stats.lecturesDone is better than

     cp.completed.length >= c.lectures.length

     because courseStats() already checks that
     only valid lecture IDs are counted.
  */

  const quizUnlocked =
    enrolled &&
    stats.lecturesDone;


  document.getElementById("cmQuizCard").innerHTML = `

    <div class="q-icon">
      <i class="fa-solid fa-circle-question"></i>
    </div>


    <div class="q-info">

      <div class="q-title">
        Final Assessment
      </div>


      <div class="q-sub">

        ${c.quiz.questions.length}
        questions · pass at 60%

        ${
          !stats.lecturesDone
            ? " · finish all lectures first"
            : ""
        }

      </div>

    </div>


    ${
      quizResult
        ? `
          <span class="quiz-score-pill">
            ${quizResult.score}/${quizResult.total}
            ${quizResult.passed ? "✓" : ""}
          </span>
        `
        : ""
    }


    <button
      class="btn ${
        quizResult && quizResult.passed
          ? "btn-ghost"
          : "btn-circuit"
      } btn-sm"
      id="cmTakeQuizBtn"
      ${quizUnlocked ? "" : "disabled"}
    >

      ${
        quizResult
          ? "Retake Quiz"
          : "Take Quiz"
      }

    </button>

  `;


  // =========================================================
  // QUIZ BUTTON CLICK
  // =========================================================

  const quizBtn =
    document.getElementById("cmTakeQuizBtn");


  if (quizBtn) {

    quizBtn.onclick = () => {

      // Extra safety check
      if (!Store.isEnrolled(c.id)) {

        showToast(
          "Please enroll in this course first."
        );

        return;
      }


      const latestStats =
        Store.courseStats(c);


      if (!latestStats.lecturesDone) {

        showToast(
          "Please complete all lectures first."
        );

        return;
      }


      openQuiz(c.id);

    };

  }


  // =========================================================
  // NOTES
  // =========================================================

  document.getElementById("cmNotes").innerHTML =
    c.notes
      .map(
        n => `
          <div class="resource-row">

            <div class="r-icon">
              <i class="fa-solid fa-file-pdf"></i>
            </div>


            <div class="r-info">

              <div class="r-title">
                ${n.title}
              </div>

              <div class="r-sub">
                PDF notes
              </div>

            </div>


            <a
              class="btn btn-ghost btn-sm"
              href="${n.url}"
              target="_blank"
              rel="noopener"
            >
              View
            </a>


            <a
              class="btn btn-primary btn-sm"
              href="${n.url}"
              download
            >
              Download
            </a>

          </div>
        `
      )
      .join("")
    ||
    '<p class="field-hint">No notes uploaded yet.</p>';


  // =========================================================
  // ASSIGNMENTS
  // =========================================================

  document.getElementById("cmAssignments").innerHTML =
    c.assignments
      .map(a => {

        const submitted =
          Store.isAssignmentSubmitted(
            c.id,
            a.id
          );


        return `
          <div class="assignment-row">

            <div class="a-icon">
              <i class="fa-solid fa-file-pen"></i>
            </div>


            <div class="r-info">

              <div class="r-title">
                ${a.title}
              </div>

              <div class="r-sub">
                ${a.desc}
              </div>

            </div>


            ${
              submitted

                ? `
                  <span class="assignment-status submitted">
                    <i class="fa-solid fa-check"></i>
                    Submitted
                  </span>
                `

                : `
                  <button
                    class="btn btn-primary btn-sm"
                    data-submit-assignment="${a.id}"
                    ${enrolled ? "" : "disabled"}
                  >
                    Submit
                  </button>
                `
            }

          </div>
        `;

      })
      .join("")
    ||
    '<p class="field-hint">No assignments for this course.</p>';


  // =========================================================
  // ASSIGNMENT SUBMIT BUTTONS
  // =========================================================

  document
    .querySelectorAll("[data-submit-assignment]")
    .forEach(btn => {

      btn.onclick = () => {

        Store.submitAssignment(
          c.id,
          btn.dataset.submitAssignment
        );

        showToast(
          "Assignment submitted"
        );

        renderCourseDetail(
          c.id,
          false
        );

      };

    });


  // =========================================================
  // PREREQUISITES / LEARNING PATH
  // =========================================================

  if (
    !c.prerequisites ||
    !c.prerequisites.length
  ) {

    document.getElementById("cmPrereqPath").innerHTML =
      `
        <span class="prereq-pill met">

          <i class="fa-solid fa-signal"></i>

          Open entry point — no prerequisites

        </span>
      `;

  } else {

    document.getElementById("cmPrereqPath").innerHTML =
      c.prerequisites
        .map((pid, i) => {

          const pc =
            courseById(
              pid,
              courses
            );

          const met =
            pc
              ? Store.courseStats(pc).isComplete
              : false;


          return `
            ${
              i > 0
                ? '<span class="prereq-arrow">→</span>'
                : ""
            }

            <span
              class="prereq-pill ${
                met ? "met" : "unmet"
              }"
            >

              <i class="fa-solid ${
                met
                  ? "fa-circle-check"
                  : "fa-circle-xmark"
              }"></i>

              ${pc ? pc.title : pid}

            </span>
          `;

        })
        .join("")
      +
      `
        <span class="prereq-arrow">
          →
        </span>

        <span class="prereq-pill met">

          <i class="fa-solid fa-flag-checkered"></i>

          ${c.title}

        </span>
      `;

  }


  // =========================================================
  // INSTRUCTOR
  // =========================================================

  document.getElementById("cmInstructor").innerHTML = `

    <div class="instructor-card">

      <div class="instructor-avatar">
        ${c.instructor.trim().charAt(0)}
      </div>


      <div>

        <div class="instructor-name">
          ${c.instructor}
        </div>

        <div class="instructor-title">
          ${c.instructorTitle}
        </div>

      </div>

    </div>


    <p
      class="section-desc"
      style="margin-top:1rem;text-align:left;"
    >
      ${c.description}
    </p>

  `;


  // =========================================================
  // LECTURE PLAY BUTTONS
  // =========================================================

  document
    .querySelectorAll("[data-lecture]")
    .forEach(btn => {

      btn.onclick = () => {

        loadLecture(
          c,
          btn.dataset.lecture,
          true
        );

      };

    });


    document.querySelectorAll("[data-certificate]").forEach(btn => {
  btn.addEventListener("click", () => {
    openCertificate(btn.dataset.certificate);
  });
});

}

  function openCourseDetail(courseId){
    ensureDetailModal();
    renderCourseDetail(courseId, true);
    openModal("courseModal");
  }

  document.addEventListener("click", (e)=>{
    const preview = e.target.closest("[data-preview]");
    if (preview) openCourseDetail(preview.dataset.preview);

    const openBtn = e.target.closest("[data-open-course]");
    if (openBtn) openCourseDetail(openBtn.dataset.openCourse);

    const enrollBtn = e.target.closest("[data-enroll]");
    if (enrollBtn){
      const c = courseById(enrollBtn.dataset.enroll, courses);
      if (!Store.prereqsMet(c, courses)){ showToast("Complete the prerequisite course first."); return; }
      Store.enroll(c.id);
      showToast("Enrolled in " + c.title);
      renderCourses();
      openCourseDetail(c.id);
    }

    const viewCert = e.target.closest("[data-view-cert]");
    if (viewCert) openCertificate(viewCert.dataset.viewCert);
  });

  /* ============================================================
     QUIZ MODAL
     ============================================================ */
  function ensureQuizModal(){
    if (document.getElementById("quizModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" id="quizModal">
      <div class="modal">
        <div class="modal-head">
          <h3 id="qzTitle">Final Assessment</h3>
          <button class="modal-close" data-close="quizModal">✕</button>
        </div>
        <div class="modal-body" id="qzBody"></div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-close="quizModal">Cancel</button>
          <button class="btn btn-circuit" id="qzSubmitBtn">Submit Answers</button>
        </div>
      </div>
    </div>`);
    bindModalClosers();
  }

  // function openQuiz(courseId){
  //   ensureQuizModal();
  //   const c = courseById(courseId, courses);
  //   document.getElementById("qzTitle").textContent = c.title + " — Final Assessment";
  //   const body = document.getElementById("qzBody");
  //   body.innerHTML = c.quiz.questions.map((q, qi)=> `
  //     <div class="quiz-question" data-qindex="${qi}">
  //       <div class="q-num">QUESTION ${qi+1} / ${c.quiz.questions.length}</div>
  //       <div class="q-text">${q.text}</div>
  //       <div class="quiz-options">
  //         ${q.options.map((opt, oi)=> `
  //           <label class="quiz-option">
  //             <input type="radio" name="q${qi}" value="${oi}"> <span>${opt}</span>
  //           </label>`).join("")}
  //       </div>
  //     </div>`).join("");

  //   body.querySelectorAll(".quiz-option").forEach(lab=>{
  //     lab.addEventListener("click", ()=>{
  //       const group = lab.closest(".quiz-question").querySelectorAll(".quiz-option");
  //       group.forEach(g=> g.classList.remove("selected"));
  //       lab.classList.add("selected");
  //     });
  //   });

  //   const submitBtn = document.getElementById("qzSubmitBtn");
  //   submitBtn.textContent = "Submit Answers";
  //   submitBtn.disabled = false;
  //   submitBtn.onclick = ()=>{
  //     let score = 0;
  //     c.quiz.questions.forEach((q, qi)=>{
  //       const checked = body.querySelector(`input[name="q${qi}"]:checked`);
  //       const qEl = body.querySelector(`.quiz-question[data-qindex="${qi}"]`);
  //       const opts = qEl.querySelectorAll(".quiz-option");
  //       opts.forEach((opt, oi)=>{
  //         if (oi === q.correct) opt.classList.add("correct");
  //         else if (checked && parseInt(checked.value) === oi) opt.classList.add("incorrect");
  //       });
  //       if (checked && parseInt(checked.value) === q.correct) score++;
  //     });
  //     const result = Store.saveQuizResult(c.id, score, c.quiz.questions.length);
  //     body.insertAdjacentHTML("afterbegin", `
  //       <div class="quiz-result-banner">
  //         <div class="score">${score}/${c.quiz.questions.length}</div>
  //         <div class="verdict">${result.passed ? 'Passed — nice work!' : 'Not quite — review the lectures and retake when ready.'}</div>
  //       </div>`);
  //     submitBtn.textContent = "Close & Continue";
  //     submitBtn.disabled = true;
  //     submitBtn.onclick = ()=>{ closeModal("quizModal"); };
  //     const closeAndRefresh = ()=>{ closeModal("quizModal"); renderCourseDetail(c.id, false); renderCourses(); };
  //     document.getElementById("qzSubmitBtn").onclick = closeAndRefresh;
  //     showToast(result.passed ? "Quiz passed!" : "Quiz submitted");
  //     if (Store.courseStats(c).isComplete) showToast("Certificate earned for " + c.title);
  //   };
  // }
  function openQuiz(courseId) {
  ensureQuizModal();

  const c = courseById(courseId, courses);

  if (!c || !c.quiz || !c.quiz.questions) {
    showToast("Quiz not available.");
    return;
  }

  const stats = Store.courseStats(c);

  if (!stats.lecturesDone) {
    showToast("Please complete all lectures first.");
    return;
  }

  document.getElementById("qzTitle").textContent =
    c.title + " — Final Assessment";

  const body = document.getElementById("qzBody");

  body.innerHTML = c.quiz.questions.map((q, qi) => `
    <div class="quiz-question" data-qindex="${qi}">
      <div class="q-num">
        QUESTION ${qi + 1} / ${c.quiz.questions.length}
      </div>

      <div class="q-text">
        ${q.text}
      </div>

      <div class="quiz-options">
        ${q.options.map((opt, oi) => `
          <label class="quiz-option">
            <input
              type="radio"
              name="q${qi}"
              value="${oi}"
            >
            <span>${opt}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");

  // Option selection
  body.querySelectorAll(".quiz-option").forEach(label => {
    label.addEventListener("click", () => {
      const question = label.closest(".quiz-question");

      question
        .querySelectorAll(".quiz-option")
        .forEach(option => {
          option.classList.remove("selected");
        });

      label.classList.add("selected");
    });
  });

  const submitBtn = document.getElementById("qzSubmitBtn");

  submitBtn.textContent = "Submit Answers";
  submitBtn.disabled = false;

  submitBtn.onclick = () => {

    let score = 0;

    c.quiz.questions.forEach((q, qi) => {

      const checked = body.querySelector(
        `input[name="q${qi}"]:checked`
      );

      const questionEl = body.querySelector(
        `.quiz-question[data-qindex="${qi}"]`
      );

      const options = questionEl.querySelectorAll(".quiz-option");

      options.forEach((option, oi) => {

        if (oi === q.correct) {
          option.classList.add("correct");
        }

        if (
          checked &&
          parseInt(checked.value) === oi &&
          oi !== q.correct
        ) {
          option.classList.add("incorrect");
        }

      });

      if (
        checked &&
        parseInt(checked.value) === q.correct
      ) {
        score++;
      }

    });

    const result = Store.saveQuizResult(
      c.id,
      score,
      c.quiz.questions.length
    );

    body.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="quiz-result-banner">
        <div class="score">
          ${score}/${c.quiz.questions.length}
        </div>

        <div class="verdict">
          ${
            result.passed
              ? "Passed — nice work!"
              : "Not quite — review the lectures and retake when ready."
          }
        </div>
      </div>
      `
    );

    submitBtn.textContent = "Close & Continue";
    submitBtn.disabled = false;

    submitBtn.onclick = () => {
      closeModal("quizModal");

      renderCourseDetail(c.id, false);
      renderCourses();

      if (result.passed) {
        showToast("Quiz passed!");
      } else {
        showToast("Quiz submitted. You can retake it.");
      }
    };

    if (result.passed) {
      showToast("Quiz passed!");
    } else {
      showToast("Quiz submitted");
    }
  };

  // ⭐ THIS WAS MISSING
  openModal("quizModal");
}

  /* ============================================================
     CERTIFICATE MODAL
     ============================================================ */
  function ensureCertModal(){
    if (document.getElementById("certModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" id="certModal">
      <div class="modal modal-sm">
        <div class="modal-head">
          <h3>Certificate</h3>
          <button class="modal-close" data-close="certModal">✕</button>
        </div>
        <div class="modal-body" id="certBody"></div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-close="certModal">Close</button>
          <button class="btn btn-gold" id="certDownloadBtn"><i class="fa-solid fa-download"></i> Download</button>
        </div>
      </div>
    </div>`);
    bindModalClosers();
  }

  function openCertificate(courseId){
    ensureCertModal();
    const c = courseById(courseId, courses);
    const cert = Store.certificates()[courseId];
    if (!c || !cert) { showToast("Certificate not yet earned."); return; }
    const name = Store.learnerName();
    document.getElementById("certBody").innerHTML = `
      <div class="certificate-card" id="printableCert">
        <div class="certificate-seal"><i class="fa-solid fa-award"></i></div>
        <div class="certificate-eyebrow">Certificate of Completion</div>
        <div class="certificate-name">${name}</div>
        <p class="section-desc" style="margin:0;">has successfully completed</p>
        <div class="certificate-course">${c.title}</div>
        <div class="certificate-meta">
          <span>Issued ${new Date(cert.issuedAt).toLocaleDateString()}</span>
          <span>${c.duration}</span>
          <span>Amaanitvam Foundation</span>
        </div>
      </div>`;
    document.getElementById("certDownloadBtn").onclick = ()=>{ showToast("Opening print dialog for your certificate"); window.print(); };
    openModal("certModal");
  }

  /* ---------------- Learner name (for certificates) ---------------- */
  function injectLearnerNameField(){
    const panel = document.getElementById("tabMyLearning");
    if (document.getElementById("learnerNameField")) return;
    const wrap = document.createElement("div");
    wrap.className = "toolbar";
    wrap.id = "learnerNameField";
    wrap.innerHTML = `
      <div class="search-box" style="max-width:360px;">
        <i class="fa-solid fa-signature" style="color:var(--ink-400);"></i>
        <input type="text" id="learnerNameInput" placeholder="Your name for certificates">
      </div>
      <span class="field-hint">Saved automatically — used on any certificate you earn.</span>`;
    panel.prepend(wrap);
    const input = document.getElementById("learnerNameInput");
    input.value = Store.learnerName() === "Guest Learner" ? "" : Store.learnerName();
    input.addEventListener("change", ()=>{ Store.setLearnerName(input.value.trim()); showToast("Certificate name saved"); });
  }

  /* ============================================================
     ADMIN PANEL — add / edit / delete courses
     ============================================================ */
  function ensureAdminModal(){
    if (document.getElementById("adminModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" id="adminModal">
      <div class="modal modal-lg">
        <div class="modal-head">
          <div><span class="admin-badge">ADMIN</span><h3 style="margin-top:.4rem;">Manage Courses</h3></div>
          <button class="modal-close" data-close="adminModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="admin-toolbar">
            <p class="field-hint" style="margin:0;">${courses.length} course(s) in the catalog. Changes save instantly to this browser.</p>
            <button class="btn btn-circuit btn-sm" id="adminAddBtn"><i class="fa-solid fa-plus"></i> Add Course</button>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Course</th><th>Domain</th><th>Level</th><th>Lectures</th><th>Enrolled</th><th></th></tr></thead>
              <tbody id="adminTableBody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-foot"><button class="btn btn-ghost" data-close="adminModal">Close</button></div>
      </div>
    </div>`);
    bindModalClosers();
    document.getElementById("adminAddBtn").addEventListener("click", ()=> openCourseForm(null));
  }

  function renderAdminTable(){
    courses = Store.getCourses();
    document.getElementById("adminTableBody").innerHTML = courses.map(c=> `
      <tr>
        <td><strong>${c.title}</strong><br><span class="field-hint">${c.id}</span></td>
        <td>${catName(c.category)}</td>
        <td>${c.level}</td>
        <td>${c.lectures.length}</td>
        <td>${c.enrolledBase || 0}</td>
        <td>
          <div class="admin-row-actions">
            <button class="icon-btn" data-admin-edit="${c.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-btn danger" data-admin-delete="${c.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join("");
    document.querySelectorAll("[data-admin-edit]").forEach(btn=> btn.addEventListener("click", ()=> openCourseForm(btn.dataset.adminEdit)));
    document.querySelectorAll("[data-admin-delete]").forEach(btn=> btn.addEventListener("click", ()=> confirmDeleteCourse(btn.dataset.adminDelete)));
  }

  function openAdminPanel(){
    ensureAdminModal();
    renderAdminTable();
    openModal("adminModal");
  }

  document.getElementById("adminFab").addEventListener("click", openAdminPanel);

  /* ---------------- Course form (add / edit) ---------------- */
  let lectureRows = [];

  function ensureCourseFormModal(){
    if (document.getElementById("courseFormModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" id="courseFormModal">
      <div class="modal modal-lg">
        <div class="modal-head">
          <h3 id="cfTitle">Add Course</h3>
          <button class="modal-close" data-close="courseFormModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="field-row">
            <div class="field"><label>Course Title</label><input type="text" id="cfCourseTitle"></div>
            <div class="field"><label>Domain</label><select id="cfCategory">${CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Level</label><select id="cfLevel"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
            <div class="field"><label>Duration</label><input type="text" id="cfDuration" placeholder="e.g. 5 weeks"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Instructor Name</label><input type="text" id="cfInstructor"></div>
            <div class="field"><label>Instructor Title</label><input type="text" id="cfInstructorTitle"></div>
          </div>
          <div class="field"><label>Description</label><textarea id="cfDescription"></textarea></div>
          <div class="field">
            <label>Prerequisites</label>
            <div id="cfPrereqList" style="display:flex;flex-wrap:wrap;gap:.5rem;"></div>
            <p class="field-hint">Select any courses a learner must complete first.</p>
          </div>
          <div class="field">
            <label>Video Lectures</label>
            <div id="cfLectureRows"></div>
            <button type="button" class="btn btn-ghost btn-sm add-lecture-btn" id="cfAddLecture"><i class="fa-solid fa-plus"></i> Add Lecture</button>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-close="courseFormModal">Cancel</button>
          <button class="btn btn-circuit" id="cfSaveBtn">Save Course</button>
        </div>
      </div>
    </div>`);
    bindModalClosers();
    document.getElementById("cfAddLecture").addEventListener("click", ()=>{
      lectureRows.push({ id: uid("l"), title: "", duration: "" });
      renderLectureRows();
    });
  }

  function renderLectureRows(){
    const wrap = document.getElementById("cfLectureRows");
    wrap.innerHTML = lectureRows.map((l, i)=> `
      <div class="lecture-builder-row" data-row="${i}">
        <input type="text" placeholder="Lecture title" value="${l.title}" data-lrow-title="${i}">
        <input type="text" placeholder="Duration e.g. 20 min" value="${l.duration}" style="max-width:150px;" data-lrow-duration="${i}">
        <button type="button" class="icon-btn danger" data-lrow-remove="${i}"><i class="fa-solid fa-xmark"></i></button>
      </div>`).join("") || '<p class="field-hint">No lectures yet — add at least one.</p>';
    wrap.querySelectorAll("[data-lrow-title]").forEach(inp=> inp.addEventListener("input", ()=> lectureRows[inp.dataset.lrowTitle].title = inp.value));
    wrap.querySelectorAll("[data-lrow-duration]").forEach(inp=> inp.addEventListener("input", ()=> lectureRows[inp.dataset.lrowDuration].duration = inp.value));
    wrap.querySelectorAll("[data-lrow-remove]").forEach(btn=> btn.addEventListener("click", ()=>{
      lectureRows.splice(parseInt(btn.dataset.lrowRemove), 1);
      renderLectureRows();
    }));
  }

  let editingCourseId = null;

  function openCourseForm(courseId){
    ensureCourseFormModal();
    courses = Store.getCourses();
    editingCourseId = courseId;
    const c = courseId ? courseById(courseId, courses) : null;
    document.getElementById("cfTitle").textContent = c ? "Edit Course" : "Add Course";
    document.getElementById("cfCourseTitle").value = c ? c.title : "";
    document.getElementById("cfCategory").value = c ? c.category : CATEGORIES[0].id;
    document.getElementById("cfLevel").value = c ? c.level : "Beginner";
    document.getElementById("cfDuration").value = c ? c.duration : "";
    document.getElementById("cfInstructor").value = c ? c.instructor : "";
    document.getElementById("cfInstructorTitle").value = c ? c.instructorTitle : "";
    document.getElementById("cfDescription").value = c ? c.description : "";

    const prereqWrap = document.getElementById("cfPrereqList");
    prereqWrap.innerHTML = courses.filter(x=> x.id !== courseId).map(x=> `
      <label class="chip" style="cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;">
        <input type="checkbox" value="${x.id}" ${c && c.prerequisites && c.prerequisites.includes(x.id) ? 'checked' : ''} style="accent-color:var(--circuit-500);"> ${x.title}
      </label>`).join("") || '<p class="field-hint">No other courses yet.</p>';

    lectureRows = c ? c.lectures.map(l=> ({ ...l })) : [{ id: uid("l"), title: "", duration: "" }];
    renderLectureRows();

    document.getElementById("cfSaveBtn").onclick = ()=> saveCourseForm(c);
    openModal("courseFormModal");
  }

  function saveCourseForm(existing){
    const title = document.getElementById("cfCourseTitle").value.trim();
    if (!title){ showToast("Course title is required."); return; }
    const validLectures = lectureRows.filter(l=> l.title.trim());
    if (!validLectures.length){ showToast("Add at least one lecture."); return; }

    const prereqIds = Array.from(document.querySelectorAll("#cfPrereqList input:checked")).map(i=>i.value);

    const payload = {
      id: existing ? existing.id : uid(document.getElementById("cfCategory").value),
      title,
      category: document.getElementById("cfCategory").value,
      level: document.getElementById("cfLevel").value,
      duration: document.getElementById("cfDuration").value.trim() || "4 weeks",
      instructor: document.getElementById("cfInstructor").value.trim() || "Foundation Faculty",
      instructorTitle: document.getElementById("cfInstructorTitle").value.trim() || "Facilitator",
      description: document.getElementById("cfDescription").value.trim() || "Course description coming soon.",
      prerequisites: prereqIds,
      rating: existing ? existing.rating : 4.5,
      enrolledBase: existing ? existing.enrolledBase : 0,
      createdDate: existing ? existing.createdDate : new Date().toISOString().slice(0,10),
      lectures: validLectures.map(l=> ({ id: l.id, title: l.title.trim(), duration: l.duration.trim() || "15 min", video: VIDEO_EMBED })),
      notes: existing ? existing.notes : [note(uid("n"), title + " — Notes PDF")],
      assignments: existing ? existing.assignments : [asg(uid("a"), "Course assignment", "Complete and submit the assigned task.")],
      quiz: existing ? existing.quiz : quizOf([ q("Sample question — edit this in a future update.", ["Option A","Option B","Option C","Option D"], 0) ]),
    };

    let list = Store.getCourses();
    if (existing){
      list = list.map(x=> x.id === existing.id ? payload : x);
      showToast("Course updated: " + title);
    } else {
      list = [...list, payload];
      showToast("Course added: " + title);
    }
    Store.saveCourses(list);
    closeModal("courseFormModal");
    renderAdminTable();
    renderRail();
    buildCategoryFilterMenu();
    renderCourses();
  }

  function ensureConfirmModal(){
    if (document.getElementById("confirmModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" id="confirmModal">
      <div class="modal modal-sm">
        <div class="modal-head"><h3>Delete Course?</h3><button class="modal-close" data-close="confirmModal">✕</button></div>
        <div class="modal-body"><p id="confirmBody">This will permanently remove the course and its learner data from this browser.</p></div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-close="confirmModal">Cancel</button>
          <button class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
        </div>
      </div>
    </div>`);
    bindModalClosers();
  }

  function confirmDeleteCourse(courseId){
    ensureConfirmModal();
    const c = courseById(courseId, Store.getCourses());
    document.getElementById("confirmBody").textContent = `Delete "${c ? c.title : courseId}"? This cannot be undone.`;
    document.getElementById("confirmDeleteBtn").onclick = ()=>{
      const list = Store.getCourses().filter(x=> x.id !== courseId);
      Store.saveCourses(list);
      closeModal("confirmModal");
      showToast("Course deleted");
      renderAdminTable();
      renderRail();
      buildCategoryFilterMenu();
      renderCourses();
    };
    openModal("confirmModal");
  }

  /* ---------------- Init ---------------- */
  renderRail();
  injectLearnerNameField();
  renderCourses();
  refreshHeaderStats();
});
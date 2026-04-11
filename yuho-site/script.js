const typingText = "웹 개발을 배우고 있는 학생으로, 다양한 기술을 익히며 꾸준히 성장하는 프론트엔드 개발자를 목표로 하고 있습니다.";
const typingTarget = document.getElementById("typing");

let index = 0;
let isDeleting = false;

function typingLoop() {
  if (!typingTarget) return;

  if (!isDeleting) {
    typingTarget.textContent = typingText.substring(0, index + 1);
    index++;

    if (index === typingText.length) {
      isDeleting = true;
      setTimeout(typingLoop, 3000);
      return;
    }
  } else {
    typingTarget.textContent = typingText.substring(0, index - 1);
    index--;

    if (index === 0) {
      isDeleting = false;
      setTimeout(typingLoop, 3000);
      return;
    }
  }

  setTimeout(typingLoop, isDeleting ? 50 : 100);
}

typingLoop();

const themebtn = document.getElementById("themebtn");

if (themebtn) {
  themebtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    themebtn.textContent = document.body.classList.contains("dark")
      ? "light모드"
      : "dark모드";
  });
}

const navButtons = document.querySelectorAll(".nav_btn");
const pages = document.querySelectorAll(".page");
let currentPageIndex = 0;
let isChanging = false;

function showPage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= pages.length) return;

  navButtons.forEach((btn) => btn.classList.remove("active"));
  pages.forEach((page) => page.classList.remove("active"));

  currentPageIndex = pageIndex;

  pages[currentPageIndex].classList.add("active");
  navButtons[currentPageIndex].classList.add("active");
}

navButtons.forEach((button, index) => {
  button.addEventListener("click", function () {
    showPage(index);
  });
});

window.addEventListener(
  "wheel",
  function (event) {
    if (isChanging) return;

    if (event.deltaY > 0 && currentPageIndex < pages.length - 1) {
      isChanging = true;
      showPage(currentPageIndex + 1);
      setTimeout(() => {
        isChanging = false;
      }, 700);
    } else if (event.deltaY < 0 && currentPageIndex > 0) {
      isChanging = true;
      showPage(currentPageIndex - 1);
      setTimeout(() => {
        isChanging = false;
      }, 700);
    }
  },
  { passive: true }
);

window.addEventListener("keydown", function (event) {
  if (isChanging) return;

  if ((event.key === "ArrowDown" || event.key === "PageDown") && currentPageIndex < pages.length - 1) {
    isChanging = true;
    showPage(currentPageIndex + 1);
    setTimeout(() => {
      isChanging = false;
    }, 700);
  }

  if ((event.key === "ArrowUp" || event.key === "PageUp") && currentPageIndex > 0) {
    isChanging = true;
    showPage(currentPageIndex - 1);
    setTimeout(() => {
      isChanging = false;
    }, 700);
  }
});

showPage(0);

/* 로그인 기능 */
let authToken = localStorage.getItem("token") || "";
let currentUser = null;

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authStatus = document.getElementById("authStatus");

const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");

const profileNavBtn = document.getElementById("profileNavBtn");
const adminNavBtn = document.getElementById("adminNavBtn");
const adminPanel = document.getElementById("adminPanel");

function updateNavByRole() {
  if (!profileNavBtn || !adminNavBtn) return;

  if (!currentUser) {
    profileNavBtn.textContent = "Login";
    adminNavBtn.classList.add("hidden");
    return;
  }

  if (currentUser.role === "admin") {
    profileNavBtn.textContent = "Admin Profile";
    adminNavBtn.classList.remove("hidden");
  } else {
    profileNavBtn.textContent = "User Profile";
    adminNavBtn.classList.add("hidden");
  }
}

function renderAuthStatus() {
  if (!authStatus) return;

  if (!currentUser) {
    authStatus.textContent = "로그인하지 않았습니다.";
    updateNavByRole();
    return;
  }

  authStatus.innerHTML = `
    로그인되었습니다: <strong>${currentUser.username}</strong> (${currentUser.role})
    <button id="logoutBtn" class="small_btn" style="margin-left:10px;">로그아웃</button>
  `;

  updateNavByRole();

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    authToken = "";
    currentUser = null;
    renderAuthStatus();
    loadAdminPanel();
  });
}

showLoginBtn?.addEventListener("click", () => {
  showLoginBtn.classList.add("active");
  showRegisterBtn.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

showRegisterBtn?.addEventListener("click", () => {
  showRegisterBtn.classList.add("active");
  showLoginBtn.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

async function fetchMe() {
  if (!authToken) {
    currentUser = null;
    renderAuthStatus();
    return;
  }

  const res = await fetch("/api/auth", {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

  if (!res.ok) {
    localStorage.removeItem("token");
    authToken = "";
    currentUser = null;
    renderAuthStatus();
    return;
  }

  const data = await res.json();
  currentUser = data.user;
  renderAuthStatus();
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const res = await fetch("/api/auth?action=login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "로그인 실패");
    return;
  }

  authToken = data.token;
  localStorage.setItem("token", authToken);

  await fetchMe();
  await loadAdminPanel();
  loginForm.reset();
});

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  const res = await fetch("/api/auth?action=register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message || "회원가입 완료");

  if (res.ok) {
    registerForm.reset();

    showLoginBtn?.classList.add("active");
    showRegisterBtn?.classList.remove("active");
    loginForm?.classList.remove("hidden");
    registerForm?.classList.add("hidden");

    authStatus.textContent = "회원가입이 완료되었습니다. 로그인해주세요.";
  }
});

async function loadAdminPanel() {
  if (!adminPanel) return;

  if (!currentUser || currentUser.role !== "admin") {
    adminPanel.innerHTML = "<p>관리자만 볼 수 있습니다.</p>";
    return;
  }

  const res = await fetch("/api/admin?action=dashboard", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    adminPanel.innerHTML = "<p>관리자 정보를 불러오지 못했습니다.</p>";
    return;
  }

  adminPanel.innerHTML = `
    <div class="admin_box">
      <h4>삭제된 글</h4>
      <pre>${JSON.stringify(data.deletedPosts, null, 2)}</pre>
    </div>
    <div class="admin_box">
      <h4>수정 / 삭제 이력</h4>
      <pre>${JSON.stringify(data.auditLogs, null, 2)}</pre>
    </div>
  `;
}

fetchMe().then(() => {
  loadAdminPanel();
});
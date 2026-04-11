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

/* 로그인 / 회원가입 / 관리자 */
let authToken = localStorage.getItem("token") || "";
let currentUser = null;

const profileNavBtn = document.getElementById("profileNavBtn");
const adminNavBtn = document.getElementById("adminNavBtn");
const adminPanel = document.getElementById("adminPanel");

function updateAuthNav() {
  if (!profileNavBtn || !adminNavBtn) return;

  if (!currentUser) {
    profileNavBtn.textContent = "Login";
    adminNavBtn.classList.add("hidden");
    return;
  }

  const displayName = currentUser.name || currentUser.username;

  profileNavBtn.textContent = `${displayName}님`;

  if (currentUser.role === "admin") {
    adminNavBtn.classList.remove("hidden");
  } else {
    adminNavBtn.classList.add("hidden");
  }
}

window.goLogin = function () {
  const idx = [...pages].findIndex((page) => page.id === "login");
  if (idx !== -1) showPage(idx);
};

window.goRegister = function () {
  const idx = [...pages].findIndex((page) => page.id === "signup");
  if (idx !== -1) showPage(idx);
};

async function fetchMe() {
  if (!authToken) {
    currentUser = null;
    updateAuthNav();
    return;
  }

  try {
    const res = await fetch("/api/auth", {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      authToken = "";
      currentUser = null;
      updateAuthNav();
      return;
    }

    const data = await res.json();
    currentUser = data.user;
    updateAuthNav();
  } catch (error) {
    console.error("fetchMe 오류:", error);
    localStorage.removeItem("token");
    authToken = "";
    currentUser = null;
    updateAuthNav();
  }
}

window.handleLogin = async function () {
  const username = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const loginError = document.getElementById("login-error");

  if (loginError) loginError.style.display = "none";

  if (!username || !password) {
    if (loginError) {
      loginError.textContent = "이메일과 비밀번호를 입력해주세요.";
      loginError.style.display = "block";
    }
    return;
  }

  try {
    const res = await fetch("/api/auth?action=login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      if (loginError) {
        loginError.textContent = data.message || "이메일 또는 비밀번호가 일치하지 않습니다.";
        loginError.style.display = "block";
      }
      return;
    }

    authToken = data.token;
    localStorage.setItem("token", authToken);
    currentUser = data.user;

    updateAuthNav();

    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";

    alert("로그인되었습니다.");

    showPage(0);
    await loadPosts();
    await loadAdminPanel();
  } catch (error) {
    console.error("로그인 오류:", error);
    if (loginError) {
      loginError.textContent = "로그인 중 오류가 발생했습니다.";
      loginError.style.display = "block";
    }
  }
};

window.handleSignup = async function () {
  const name = document.getElementById("signup-name").value.trim();
  const username = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirmPassword = document.getElementById("signup-password-confirm").value.trim();
  const signupError = document.getElementById("signup-error");

  if (signupError) signupError.style.display = "none";

  if (!name || !username || !password || !confirmPassword) {
    if (signupError) {
      signupError.textContent = "모든 항목을 입력해주세요.";
      signupError.style.display = "block";
    }
    return;
  }

  if (password !== confirmPassword) {
    if (signupError) {
      signupError.textContent = "비밀번호가 일치하지 않습니다.";
      signupError.style.display = "block";
    }
    return;
  }

  try {
    const res = await fetch("/api/auth?action=register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, username, password })
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      if (signupError) {
        signupError.textContent = data.message || "회원가입에 실패했습니다.";
        signupError.style.display = "block";
      }
      return;
    }

    alert("회원가입이 완료되었습니다.");

    document.getElementById("signup-name").value = "";
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    document.getElementById("signup-password-confirm").value = "";

    goLogin();
  } catch (error) {
    console.error("회원가입 오류:", error);
    if (signupError) {
      signupError.textContent = "회원가입 중 오류가 발생했습니다.";
      signupError.style.display = "block";
    }
  }
};

window.handleLogout = function () {
  localStorage.removeItem("token");
  authToken = "";
  currentUser = null;
  updateAuthNav();
  alert("로그아웃 되었습니다.");
  showPage(0);
};

async function loadAdminPanel() {
  if (!adminPanel) return;

  if (!currentUser || currentUser.role !== "admin") {
    adminPanel.innerHTML = "<p>관리자만 볼 수 있습니다.</p>";
    return;
  }

  try {
    const res = await fetch("/api/admin?action=dashboard", {
      headers: {
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
  } catch (error) {
    console.error("관리자 패널 오류:", error);
    adminPanel.innerHTML = "<p>관리자 정보를 불러오지 못했습니다.</p>";
  }
}

fetchMe().then(() => {
  loadPosts();
  loadAdminPanel();
});
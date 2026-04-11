const DB_USERS = "yuho_users";
const DB_CURRENT_USER = "yuho_current_user";

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

if (!localStorage.getItem(DB_USERS)) {
  localStorage.setItem(
    DB_USERS,
    JSON.stringify([
      { name: "김유호", email: "test@test.com", password: "1234", role: "admin" }
    ])
  );
}
function getCurrentUser() { return JSON.parse(localStorage.getItem(DB_CURRENT_USER)); }
function renderHeaderAuth() {
  const user = getCurrentUser();
  const authArea = document.getElementById('header-auth-area');
  if (user) authArea.innerHTML = `<span>${user.name}님</span> <a onclick="handleLogout()">Logout</a>`;
  else authArea.innerHTML = `<a class="login-btn" onclick="goLogin()">Login</a>`;
}

renderHeaderAuth();

window.goLogin = function () {
  const idx = [...pages].findIndex((page) => page.id === "login");
  if (idx !== -1) showPage(idx);
};

window.goRegister = function () {
  const idx = [...pages].findIndex((page) => page.id === "signup");
  if (idx !== -1) showPage(idx);
};

function fillAuthorName() {
  const user = getCurrentUser();
  const input = document.getElementById("post-author");

  if (user && input) {
    input.value = user.name || user.username;
  }
}

window.goBoardWrite = function () {
  const idx = [...pages].findIndex((page) => page.id === "board-write");
  if (idx !== -1) {
    showPage(idx);
    fillAuthorName();
  }
};

window.handleSignup = function () {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirmPassword = document.getElementById("signup-password-confirm").value.trim();
  const signupError = document.getElementById("signup-error");

  if (signupError) signupError.style.display = "none";

  if (!name || !email || !password || !confirmPassword) {
    signupError.textContent = "모든 항목을 입력해주세요.";
    signupError.style.display = "block";
    return;
  }

  if (password !== confirmPassword) {
    signupError.textContent = "비밀번호가 일치하지 않습니다.";
    signupError.style.display = "block";
    return;
  }

  const users = JSON.parse(localStorage.getItem(DB_USERS)) || [];

  if (users.find(u => u.email === email)) {
    signupError.textContent = "이미 존재하는 이메일입니다.";
    signupError.style.display = "block";
    return;
  }

  users.push({ name, email, password, role: "user" });

  localStorage.setItem(DB_USERS, JSON.stringify(users));

  alert("회원가입이 완료되었습니다.");
  goLogin();
};

window.handleLogin = function () {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const loginError = document.getElementById("login-error");

  if (loginError) loginError.style.display = "none";

  const users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    loginError.textContent = "이메일 또는 비밀번호가 일치하지 않습니다.";
    loginError.style.display = "block";
    return;
  }

  localStorage.setItem(DB_CURRENT_USER, JSON.stringify(user));

  alert("로그인되었습니다.");
  renderHeaderAuth();
  showPage(0);
};

window.handleLogout = function () {
  localStorage.removeItem(DB_CURRENT_USER);
  renderHeaderAuth();
  alert("로그아웃 되었습니다.");
  showPage(0);
};
const DB_POSTS = "posts";
const DB_LOGS = "admin_logs";
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

function showPage(target) {
  let pageToShow = null;

  if (typeof target === "number") {
    pageToShow = pages[target];
  } else if (typeof target === "string") {
    pageToShow = document.getElementById(target);
  }

  if (!pageToShow) return;

  navButtons.forEach((btn) => btn.classList.remove("active"));
  pages.forEach((page) => page.classList.remove("active"));

  pageToShow.classList.add("active");

  const pageId = pageToShow.id;
  const matchedBtn = [...navButtons].find((btn) => btn.dataset.page === pageId);

  if (matchedBtn) {
    matchedBtn.classList.add("active");
    currentPageIndex = [...pages].findIndex((page) => page.id === pageId);
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", function () {
    showPage(button.dataset.page);
  });
});

window.addEventListener(
  "wheel",
  function (event) {
    // ❌ 페이지 이동 막기
    event.stopPropagation();
    return;
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

// ✅ 여기다 넣어라 (이 위치가 정답)
const myName = document.getElementById("myName");
const myInfo = document.getElementById("myInfo");

if (myName && myInfo) {
  myName.addEventListener("click", function () {
    if (myInfo.style.display === "none") {
      myInfo.style.display = "block";
    } else {
      myInfo.style.display = "none";
    }
  });
}

function showPageById(pageId) {
  const pageIndex = [...pages].findIndex((page) => page.id === pageId);
  if (pageIndex !== -1) {
    showPage(pageIndex);
  }
}

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
  const authArea = document.getElementById("header-auth-area");
  const adminNavBtn = document.getElementById("adminNavBtn");

  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `<span>${user.name}님</span> <a onclick="handleLogout()">Logout</a>`;

    if (adminNavBtn) {
      if (user.role === "admin") {
        adminNavBtn.classList.remove("hidden");
      } else {
        adminNavBtn.classList.add("hidden");
      }
    }
  } else {
    authArea.innerHTML = `<a class="login-btn" onclick="goLogin()">Login</a>`;

    if (adminNavBtn) {
      adminNavBtn.classList.add("hidden");
    }
  }
}

renderHeaderAuth();

window.goLogin = function () {
  showPage("login");
};

window.goRegister = function () {
  showPage("signup");
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

  renderHeaderAuth();
  loadPosts();
  loadAdminPanel();
  alert("로그인되었습니다.");
  showPage(0);
};

window.handleLogout = function () {
  localStorage.removeItem(DB_CURRENT_USER);
  renderHeaderAuth();
  loadPosts();
  loadAdminPanel();
  alert("로그아웃 되었습니다.");
  showPage(0);
};

const postForm = document.getElementById("postForm");
const postList = document.getElementById("postList");

function getPosts() {
  return JSON.parse(localStorage.getItem(DB_POSTS)) || [];
}

function savePosts(posts) {
  localStorage.setItem(DB_POSTS, JSON.stringify(posts));
}

function getAdminLogs() {
  return JSON.parse(localStorage.getItem(DB_LOGS)) || [];
}

function saveAdminLogs(logs) {
  localStorage.setItem(DB_LOGS, JSON.stringify(logs));
}

function addAdminLog(action, detail) {
  const currentUser = getCurrentUser();
  const logs = getAdminLogs();

  logs.unshift({
    id: Date.now(),
    action,
    actor: currentUser ? currentUser.name : "알 수 없음",
    actorEmail: currentUser ? currentUser.email : "",
    detail,
    createdAt: new Date().toLocaleString("ko-KR")
  });

  saveAdminLogs(logs);
}

function loadPosts() {
  if (!postList) return;

  const posts = getPosts()
    .slice()
    .sort((a, b) => {
      if ((b.isPinned ? 1 : 0) !== (a.isPinned ? 1 : 0)) {
        return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      }
      if ((b.isNotice ? 1 : 0) !== (a.isNotice ? 1 : 0)) {
        return (b.isNotice ? 1 : 0) - (a.isNotice ? 1 : 0);
      }
      return b.id - a.id;
    });

  postList.innerHTML = "";

  if (posts.length === 0) {
    postList.innerHTML = "<p>아직 게시글이 없습니다.</p>";
    return;
  }

  const currentUser = getCurrentUser();

  posts.forEach((post) => {
    const canView =
      !post.isSecret ||
      (currentUser &&
        (
          currentUser.role === "admin" ||
          currentUser.email === post.email ||
          currentUser.name === post.author
        ));

    const canManage =
      currentUser &&
      (
        currentUser.role === "admin" ||
        currentUser.email === post.email ||
        currentUser.name === post.author
      );

    const div = document.createElement("div");
    div.className = `post_item ${post.isNotice ? "notice" : ""}`;

    div.innerHTML = `
      <h4>${post.isPinned ? "📌 " : ""}${canView ? post.title : "비밀글입니다."}</h4>
      <p>${canView ? post.content : "작성자와 관리자만 볼 수 있습니다."}</p>
      <div class="post_meta">
        작성자: ${post.author} · ${post.date}
        ${post.isSecret ? " · 비밀글" : ""}
        ${post.isNotice ? " · 공지" : ""}
      </div>
      ${canManage
        ? `
        <div class="post_actions">
          <button class="small_btn" onclick="editPost(${post.id})">수정</button>
          <button class="small_btn" onclick="deletePost(${post.id})">삭제</button>
        </div>
      `
        : ""
      }
    `;

    postList.appendChild(div);
  });
}

postForm?.addEventListener("submit", function (e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    alert("로그인이 필요합니다.");
    goLogin();
    return;
  }

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const isSecret = document.getElementById("isSecret").checked;

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  const posts = getPosts();

  posts.push({
    id: Date.now(),
    title,
    content,
    author: user.name,
    email: user.email,
    role: user.role,
    isSecret,
    isNotice: false,
    isPinned: false,
    date: new Date().toLocaleDateString("ko-KR")
  });

  savePosts(posts);
  addAdminLog("게시글 등록", `${user.name} / 제목: ${title}`);
  postForm.reset();
  loadPosts();
  loadAdminPanel();
  alert("게시글이 등록되었습니다.");
});

const noticeForm = document.getElementById("noticeForm");

noticeForm?.addEventListener("submit", function (e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    alert("로그인이 필요합니다.");
    goLogin();
    return;
  }

  if (user.role !== "admin") {
    alert("관리자만 공지를 등록할 수 있습니다.");
    return;
  }

  const title = document.getElementById("noticeTitle").value.trim();
  const content = document.getElementById("noticeContent").value.trim();
  const isPinned = document.getElementById("noticePinned").checked;

  if (!title || !content) {
    alert("공지 제목과 내용을 입력해주세요.");
    return;
  }

  const posts = getPosts();

  posts.push({
    id: Date.now(),
    title,
    content,
    author: user.name,
    email: user.email,
    role: user.role,
    isSecret: false,
    isNotice: true,
    isPinned: isPinned,
    date: new Date().toLocaleDateString("ko-KR")
  });

  savePosts(posts);
  addAdminLog("공지 등록", `${user.name} / 제목: ${title}`);
  noticeForm.reset();
  loadPosts();
  loadAdminPanel();

  alert("공지사항이 등록되었습니다.");
});

window.editPost = function (postId) {
  const currentUser = getCurrentUser();
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    alert("게시글을 찾을 수 없습니다.");
    return;
  }

  if (!currentUser || (currentUser.role !== "admin" && currentUser.email !== post.email)) {
    alert("수정 권한이 없습니다.");
    return;
  }

  const newTitle = prompt("수정할 제목을 입력하세요.", post.title);
  if (newTitle === null) return;

  const newContent = prompt("수정할 내용을 입력하세요.", post.content);
  if (newContent === null) return;

  const title = newTitle.trim();
  const content = newContent.trim();

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  post.title = title;
  post.content = content;

  // 관리자는 공지의 고정 여부도 수정 가능
  if (currentUser.role === "admin" && post.isNotice) {
    const changePinned = confirm("확인을 누르면 상단 고정, 취소를 누르면 고정 해제됩니다.");
    post.isPinned = changePinned;
  }

  savePosts(posts);
  addAdminLog("게시글 수정", `${currentUser.name} / 제목: ${post.title}`);
  loadPosts();
  loadAdminPanel();
  alert("게시글이 수정되었습니다.");
};

window.deletePost = function (postId) {
  const currentUser = getCurrentUser();
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    alert("게시글을 찾을 수 없습니다.");
    return;
  }

  if (!currentUser || (currentUser.role !== "admin" && currentUser.email !== post.email)) {
    alert("삭제 권한이 없습니다.");
    return;
  }

  const ok = confirm(
    post.isNotice ? "공지사항을 삭제하시겠습니까?" : "게시글을 삭제하시겠습니까?"
  );
  if (!ok) return;

  const filtered = posts.filter((p) => p.id !== postId);
  savePosts(filtered);
  addAdminLog(
    post.isNotice ? "공지 삭제" : "게시글 삭제",
    `${currentUser.name} / 제목: ${post.title}`
  );
  loadPosts();
  loadAdminPanel();
  alert(post.isNotice ? "공지사항이 삭제되었습니다." : "게시글이 삭제되었습니다.");
};

const adminPanel = document.getElementById("adminPanel");

function loadAdminPanel() {
  if (!adminPanel) return;

  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    adminPanel.innerHTML = "<p>관리자만 볼 수 있습니다.</p>";
    return;
  }

  const users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
  const logs = getAdminLogs();

  const userCards = users.map((user, index) => {
    const isAdmin = user.role === "admin";

    return `
      <div class="admin_box">
        <h4>계정 ${index + 1} ${user.role === "admin" ? "👑" : "👤"} </h4>
        <div class="admin_user_row"><strong>이름:</strong> ${user.name}</div>
        <div class="admin_user_row"><strong>이메일:</strong> ${user.email}</div>
        <div class="admin_user_row">
          <strong>권한:</strong>
          <span class="role_badge ${user.role === "admin" ? "admin_badge" : "user_badge"}">
            ${user.role === "admin" ? "관리자" : "일반 사용자"}
          </span>
        </div>
        <div class="post_actions">
          <button class="small_btn" onclick="adminEditUser('${user.email}')">계정 수정</button>
          ${isAdmin
        ? `<button class="small_btn" onclick="adminRemoveAdmin('${user.email}')">관리자 해제</button>`
        : `<button class="small_btn" onclick="adminMakeAdmin('${user.email}')">관리자 지정</button>`
      }
          ${isAdmin
        ? ""
        : `<button class="small_btn" onclick="adminDeleteUser('${user.email}')">계정 삭제</button>`
      }
        </div>
      </div>
    `;
  }).join("");

  const logCards = logs.length
    ? logs.map((log) => `
        <div class="admin_box">
          <h4>${log.action}</h4>
          <div class="admin_user_row"><strong>처리자:</strong> ${log.actor}</div>
          <div class="admin_user_row"><strong>내용:</strong> ${log.detail}</div>
          <div class="admin_user_row"><strong>시간:</strong> ${log.createdAt}</div>
        </div>
      `).join("")
    : `<div class="admin_box"><h4>기록 없음</h4><div class="admin_user_row">아직 기록이 없습니다.</div></div>`;

  adminPanel.innerHTML = `
    <div class="admin_section_title">회원가입된 계정</div>
    ${userCards}

    <div class="admin_section_title">관리자 기록</div>
    ${logCards}
  `;
}

window.adminEditUser = function (email) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    alert("관리자만 가능합니다.");
    return;
  }

  const users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
  const target = users.find((u) => u.email === email);

  if (!target) {
    alert("계정을 찾을 수 없습니다.");
    return;
  }

  // ✅ 이름 수정 추가
  const newName = prompt("새 이름을 입력하세요.", target.name);
  if (newName === null) return;

  const trimmedName = newName.trim();
  if (!trimmedName) {
    alert("이름을 입력해주세요.");
    return;
  }

  const newEmail = prompt("새 이메일(아이디)을 입력하세요.", target.email);
  if (newEmail === null) return;

  const trimmedEmail = newEmail.trim();
  if (!trimmedEmail) {
    alert("이메일을 입력해주세요.");
    return;
  }

  const duplicated = users.find((u) => u.email === trimmedEmail && u.email !== target.email);
  if (duplicated) {
    alert("이미 존재하는 이메일입니다.");
    return;
  }

  const newPassword = prompt("새 비밀번호를 입력하세요.", target.password);
  if (newPassword === null) return;

  const trimmedPassword = newPassword.trim();
  if (!trimmedPassword) {
    alert("비밀번호를 입력해주세요.");
    return;
  }

  const oldEmail = target.email;

  // ✅ 적용
  target.name = trimmedName;
  target.email = trimmedEmail;
  target.password = trimmedPassword;

  localStorage.setItem(DB_USERS, JSON.stringify(users));

  // ✅ 현재 로그인 유저도 업데이트
  const current = getCurrentUser();
  if (current && current.email === oldEmail) {
    current.name = trimmedName;
    current.email = trimmedEmail;
    current.password = trimmedPassword;

    localStorage.setItem(DB_CURRENT_USER, JSON.stringify(current));
    renderHeaderAuth();
    loadPosts();
  }

  addAdminLog(
    "계정 수정",
    `${currentUser.name} / ${oldEmail} → ${trimmedEmail} (이름: ${trimmedName})`
  );

  loadAdminPanel();
  alert("계정 정보가 수정되었습니다.");
};

window.adminDeleteUser = function (email) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    alert("관리자만 가능합니다.");
    return;
  }

  const users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
  const target = users.find((u) => u.email === email);

  if (!target) {
    alert("계정을 찾을 수 없습니다.");
    return;
  }

  if ((target.role || "user") === "admin") {
    alert("관리자 계정은 삭제할 수 없습니다.");
    return;
  }

  const ok = confirm(`${target.email} 계정을 삭제하시겠습니까?`);
  if (!ok) return;

  const filteredUsers = users.filter((u) => u.email !== email);
  localStorage.setItem(DB_USERS, JSON.stringify(filteredUsers));

  addAdminLog("계정 삭제", `${currentUser.name} / 삭제된 계정: ${email}`);
  loadAdminPanel();
  alert("계정이 삭제되었습니다.");
};

window.adminMakeAdmin = function (email) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    alert("관리자만 가능합니다.");
    return;
  }

  const users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
  const target = users.find((u) => u.email === email);

  if (!target) {
    alert("계정을 찾을 수 없습니다.");
    return;
  }

  if ((target.role || "user") === "admin") {
    alert("이미 관리자 계정입니다.");
    return;
  }

  const ok = confirm(`${target.email} 계정을 관리자로 지정하시겠습니까?`);
  if (!ok) return;

  target.role = "admin";
  localStorage.setItem(DB_USERS, JSON.stringify(users));

  addAdminLog("관리자 지정", `${currentUser.name} / ${target.email} 계정을 관리자로 승격`);
  loadAdminPanel();
  loadPosts();
  alert("관리자 권한이 부여되었습니다.");
};

window.adminRemoveAdmin = function (email) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    alert("관리자만 가능합니다.");
    return;
  }

  const users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
  const target = users.find((u) => u.email === email);

  if (!target) {
    alert("계정을 찾을 수 없습니다.");
    return;
  }

  if ((target.role || "user") !== "admin") {
    alert("관리자 계정이 아닙니다.");
    return;
  }

  // 자기 자신은 관리자 해제 못 하게 막기
  if (target.email === currentUser.email) {
    alert("현재 로그인한 본인 계정은 관리자 해제할 수 없습니다.");
    return;
  }

  const ok = confirm(`${target.email} 계정의 관리자 권한을 해제하시겠습니까?`);
  if (!ok) return;

  target.role = "user";
  localStorage.setItem(DB_USERS, JSON.stringify(users));

  addAdminLog("관리자 해제", `${currentUser.name} / ${target.email} 계정을 일반 사용자로 변경`);
  loadAdminPanel();
  loadPosts();
  alert("관리자 권한이 해제되었습니다.");
};



loadPosts();
loadAdminPanel();


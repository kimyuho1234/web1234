// 타이핑 효과
const typingText = "웹 개발을 배우고 있는 학생으로, 꾸준히 성장하는 프론트엔드 개발자를 목표로 합니다.";
const typingTarget = document.getElementById("typing");
let index = 0, isDeleting = false;

function typingLoop() {
    if (!typingTarget) return;
    const currentText = isDeleting ? typingText.substring(0, index--) : typingText.substring(0, index++);
    typingTarget.textContent = currentText;
    if (!isDeleting && index > typingText.length) { isDeleting = true; setTimeout(typingLoop, 2000); return; }
    if (isDeleting && index === 0) isDeleting = false;
    setTimeout(typingLoop, isDeleting ? 50 : 100);
}
typingLoop();

// 테마 및 페이지 전환
document.getElementById("themebtn")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.getElementById("themebtn").textContent = document.body.classList.contains("dark") ? "light모드" : "dark모드";
});

const navButtons = document.querySelectorAll(".nav_btn");
const pages = document.querySelectorAll(".page");
let currentPageIndex = 0;

function showPage(target) {
    const targetId = typeof target === "string" ? target : pages[target].id;
    pages.forEach((p, i) => {
        const isActive = p.id === targetId;
        p.classList.toggle("active", isActive);
        if (isActive) currentPageIndex = i;
    });
    navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.page === targetId));
}

navButtons.forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page)));

// 이름 클릭 정보 토글
document.getElementById("myName")?.addEventListener("click", () => {
    const info = document.getElementById("myInfo");
    info.style.display = info.style.display === "none" ? "block" : "none";
});

// 게시판 통신 로직
const postForm = document.getElementById("postForm");
const postList = document.getElementById("postList");
const boardEmptyState = document.getElementById("boardEmptyState");
const boardListWrap = document.getElementById("boardListWrap");
const boardWriteWrap = document.getElementById("boardWriteWrap");

function toggleWriteMode(show) {
    boardWriteWrap.classList.toggle("hidden", !show);
    boardListWrap.classList.toggle("hidden", show);
}

document.getElementById("openWriteBtn")?.addEventListener("click", () => toggleWriteMode(true));
document.getElementById("closeWriteBtn")?.addEventListener("click", () => toggleWriteMode(false));

async function loadPosts() {
    try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        if (posts.length > 0) {
            boardEmptyState.classList.add("hidden");
            boardListWrap.classList.remove("hidden");
            postList.innerHTML = posts.map(p => `
        <div class="post_item">
          <h4>${p.title}</h4>
          <p>${p.content}</p>
          <div class="post_meta">${p.author} · ${p.date}</div>
        </div>`).join('');
        } else {
            boardEmptyState.classList.remove("hidden");
            boardListWrap.classList.add("hidden");
        }
    } catch (e) { console.error(e); }
}

postForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    });
    postForm.reset();
    toggleWriteMode(false);
    loadPosts();
});

loadPosts();
showPage(0);

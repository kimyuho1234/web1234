// 타이핑 효과
const typingText = "웹 개발을 배우고 있는 학생으로, 다양한 기술을 익히며 꾸준히 성장하는 프론트엔드 개발자를 목표로 하고 있습니다.";
const typingTarget = document.getElementById("typing");
let index = 0, isDeleting = false;

function typingLoop() {
    if (!typingTarget) return;
    const currentText = isDeleting ? typingText.substring(0, --index) : typingText.substring(0, index++);
    typingTarget.textContent = currentText;
    if (!isDeleting && index > typingText.length) { isDeleting = true; setTimeout(typingLoop, 3000); return; }
    if (isDeleting && index === 0) {isDeleting = false; setTimeout(typingLoop, 3000); return;};
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
    boardWriteWrap?.classList.toggle("hidden", !show);
    boardListWrap?.classList.toggle("hidden", show);

    if (show) {
        boardEmptyState?.classList.add("hidden");
    } else {
        const hasPosts = postList && postList.children.length > 0;
        boardEmptyState?.classList.toggle("hidden", hasPosts);
        boardListWrap?.classList.toggle("hidden", !hasPosts);
    }
}

document.getElementById("openWriteBtn")?.addEventListener("click", () => toggleWriteMode(true));

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

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !content) {
        alert("제목과 내용을 입력해주세요.");
        return;
    }

    try {
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "등록에 실패했습니다.");
            return;
        }

        postForm.reset();
        toggleWriteMode(false);
        await loadPosts();
        alert("게시글이 등록되었습니다.");
    } catch (error) {
        console.error(error);
        alert("서버 연결에 실패했습니다. Live Server 말고 Vercel dev로 실행해보세요.");
    }
});

loadPosts();
showPage(0);

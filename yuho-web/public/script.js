// 1. 타이핑 효과
const typingText = "웹 개발을 배우고 있는 학생으로, 다양한 기술을 익히며 꾸준히 성장하는 프론트엔드 개발자를 목표로 하고 있습니다.";
const typingTarget = document.getElementById("typing");
let index = 0, isDeleting = false;

function typingLoop() {
    if (!typingTarget) return;
    const currentText = isDeleting ? typingText.substring(0, --index) : typingText.substring(0, index++);
    typingTarget.textContent = currentText;
    if (!isDeleting && index > typingText.length) { isDeleting = true; setTimeout(typingLoop, 3000); return; }
    if (isDeleting && index === 0) { isDeleting = false; setTimeout(typingLoop, 3000); return; };
    setTimeout(typingLoop, isDeleting ? 50 : 100);
}
typingLoop();

// 2. 테마 변경
document.getElementById("themebtn")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.getElementById("themebtn").textContent = document.body.classList.contains("dark") ? "light모드" : "dark모드";
});

// 3. 페이지 전환 로직
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

// 4. 이름 클릭 정보 토글
document.getElementById("myName")?.addEventListener("click", () => {
    const info = document.getElementById("myInfo");
    info.style.display = info.style.display === "none" ? "block" : "none";
});

// 5. 게시판 로직
const postForm = document.getElementById("postForm");
const postList = document.getElementById("postList");
const boardEmptyState = document.getElementById("boardEmptyState");
const boardListWrap = document.getElementById("boardListWrap");
const boardWriteWrap = document.getElementById("boardWriteWrap");
const authorInput = document.getElementById("author");
const anonCheckbox = document.getElementById("isAnonymous");

// 익명 체크박스 제어
anonCheckbox?.addEventListener("change", (e) => {
    if (e.target.checked) {
        authorInput.value = "익명";
        authorInput.disabled = true;
    } else {
        authorInput.value = "";
        authorInput.disabled = false;
    }
});

// 작성 모드 토글 (닫기 기능 포함)
function toggleWriteMode(show) {
    boardWriteWrap?.classList.toggle("hidden", !show);
    boardListWrap?.classList.toggle("hidden", show);

    if (!show) {
        postForm.reset();
        authorInput.disabled = false;
        const hasPosts = postList && postList.children.length > 0;
        boardEmptyState?.classList.toggle("hidden", hasPosts);
    } else {
        boardEmptyState?.classList.add("hidden");
    }
}

document.getElementById("openWriteBtn")?.addEventListener("click", () => toggleWriteMode(true));
document.getElementById("closeWriteBtn")?.addEventListener("click", () => toggleWriteMode(false));

// 게시글 목록 불러오기
async function loadPosts() {
    try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        
        if (posts && posts.length > 0) {
            boardEmptyState.classList.add("hidden");
            boardListWrap.classList.remove("hidden");
            postList.innerHTML = posts.map(p => `
                <div class="post_item card">
                    <h4>${p.title}</h4>
                    <p>${p.content}</p>
                    <div class="post_meta">
                        <span>👤 ${p.author} · 📅 ${p.date}</span>
                        <div class="post_btns">
                            <button onclick="editPost('${p.id}', '${p.title}', '${p.content}', '${p.author}')">수정</button>
                            <button onclick="deletePost('${p.id}')" style="color:red;">삭제</button>
                        </div>
                    </div>
                </div>`).join('');
        } else {
            boardEmptyState.classList.remove("hidden");
            boardListWrap.classList.add("hidden");
        }
    } catch (e) { console.error(e); }
}

// 게시글 등록
postForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const author = authorInput.value.trim() || "익명";

    try {
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, author })
        });
        if (res.ok) {
            toggleWriteMode(false);
            await loadPosts();
        }
    } catch (error) { console.error(error); }
});

// 게시글 삭제
async function deletePost(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
        const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
        if (res.ok) await loadPosts();
    } catch (e) { console.error(e); }
}

// 게시글 수정
async function editPost(id, oldTitle, oldContent, oldAuthor) {
    const newTitle = prompt("수정할 제목을 입력하세요", oldTitle);
    const newContent = prompt("수정할 내용을 입력하세요", oldContent);
    if (!newTitle || !newContent) return;

    try {
        const res = await fetch(`/api/posts?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, content: newContent, author: oldAuthor })
        });
        if (res.ok) await loadPosts();
    } catch (e) { console.error(e); }
}

// 초기 로딩
loadPosts();
showPage(0);
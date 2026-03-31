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

function typingEffect() {
  if (!typingTarget) return;

  if (index < typingText.length) {
    typingTarget.textContent += typingText.charAt(index);
    index++;
    setTimeout(typingEffect, 100);
  }
}

typingEffect();

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

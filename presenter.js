import { db } from "./firebase-config.js";
import { getRoomFromQuery, buildMobileLink, escapeHtml, loadLocal, saveLocal } from "./app-common.js";
import {
  ref,
  query,
  limitToLast,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const room = getRoomFromQuery();

const roomBadge = document.getElementById("roomBadge");
const mobileLinkText = document.getElementById("mobileLinkText");
const copyMobileLinkBtn = document.getElementById("copyMobileLinkBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

const slideImage = document.getElementById("slideImage");
const slideFallback = document.getElementById("slideFallback");
const slideIndicator = document.getElementById("slideIndicator");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const memoInput = document.getElementById("memoInput");
const chatList = document.getElementById("chatList");

roomBadge.textContent = room;
const mobileLink = buildMobileLink(room);
mobileLinkText.textContent = mobileLink;

copyMobileLinkBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(mobileLink);
  alert("참여자 모바일 링크가 복사되었습니다.");
});

clearChatBtn.addEventListener("click", async () => {
  const ok = confirm("현재 Room의 채팅을 전체 삭제할까요?");
  if (!ok) return;
  await remove(ref(db, `rooms/${room}/messages`));
});

const memoKey = `presenter-memo-${room}`;
memoInput.value = loadLocal(memoKey, "");
memoInput.addEventListener("input", () => {
  saveLocal(memoKey, memoInput.value);
});

let slides = [];
let currentSlideIndex = 0;

async function loadSlides() {
  try {
    const res = await fetch("./slides/slides.json", { cache: "no-store" });
    const data = await res.json();

    if (Array.isArray(data)) {
      slides = data;
    } else if (Array.isArray(data.slides)) {
      slides = data.slides;
    } else {
      slides = [];
    }

    if (!slides.length) {
      showSlideFallback();
      return;
    }

    renderSlide();
  } catch (e) {
    showSlideFallback();
  }
}

function showSlideFallback() {
  slideImage.classList.add("hidden");
  slideFallback.classList.remove("hidden");
  slideIndicator.textContent = "0 / 0";
  progressFill.style.width = "0%";
  progressText.textContent = "0%";
}

function renderSlide() {
  if (!slides.length) {
    showSlideFallback();
    return;
  }

  const fileName = slides[currentSlideIndex];
  slideImage.src = `./slides/${fileName}`;
  slideImage.classList.remove("hidden");
  slideFallback.classList.add("hidden");

  slideIndicator.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
  const percent = Math.round(((currentSlideIndex + 1) / slides.length) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
}

prevBtn.addEventListener("click", () => {
  if (!slides.length) return;
  currentSlideIndex = Math.max(0, currentSlideIndex - 1);
  renderSlide();
});

nextBtn.addEventListener("click", () => {
  if (!slides.length) return;
  currentSlideIndex = Math.min(slides.length - 1, currentSlideIndex + 1);
  renderSlide();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "ArrowRight") nextBtn.click();
});

function renderMessages(messages) {
  if (!messages.length) {
    chatList.innerHTML = `
      <div class="empty-state">
        아직 채팅이 없습니다.<br />
        참여자가 모바일 링크로 접속해 메시지를 보내면 여기 실시간으로 표시됩니다.
      </div>
    `;
    return;
  }

  chatList.innerHTML = messages.map((msg) => {
    const nickname = escapeHtml(msg.nickname || "익명");
    const text = escapeHtml(msg.text || "");
    const time = escapeHtml(msg.timeLabel || "");

    return `
      <div class="message-item">
        <div class="message-meta">
          <div class="message-nickname">${nickname}</div>
          <div class="message-time">${time}</div>
        </div>
        <div class="message-text">${text}</div>
      </div>
    `;
  }).join("");

  chatList.scrollTop = chatList.scrollHeight;
}

const messagesQuery = query(ref(db, `rooms/${room}/messages`), limitToLast(200));
onValue(messagesQuery, (snapshot) => {
  const value = snapshot.val() || {};
  const messages = Object.entries(value).map(([id, item]) => ({
    id,
    ...item
  })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  renderMessages(messages);
});

loadSlides();

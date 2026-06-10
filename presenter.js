import { db } from "./firebase-config.js";
import { getRoomFromQuery, buildMobileLink, escapeHtml, loadLocal, saveLocal } from "./app-common.js";
import {
  ref,
  query,
  limitToLast,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {
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

  console.log("✅ presenter.js 실행됨");

  // =========================
  // 기본 정보 표시
  // =========================
  if (roomBadge) {
    roomBadge.textContent = room;
  }

  const mobileLink = buildMobileLink(room);
  if (mobileLinkText) {
    mobileLinkText.textContent = mobileLink;
  }

  copyMobileLinkBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mobileLink);
      alert("모바일 참여 링크가 복사되었습니다.");
    } catch (e) {
      console.error("❌ 링크 복사 실패:", e);
      alert("링크 복사에 실패했습니다.");
    }
  });

  clearChatBtn?.addEventListener("click", async () => {
    const ok = confirm("현재 Room의 채팅을 전체 삭제할까요?");
    if (!ok) return;

    try {
      await remove(ref(db, `rooms/${room}/messages`));
      console.log("✅ 채팅 전체 삭제 완료");
    } catch (e) {
      console.error("❌ 채팅 삭제 실패:", e);
      alert("채팅 삭제에 실패했습니다.");
    }
  });

  // =========================
  // 발표자 메모
  // =========================
  const memoKey = `presenter-memo-${room}`;
  if (memoInput) {
    memoInput.value = loadLocal(memoKey, "");
    memoInput.addEventListener("input", () => {
      saveLocal(memoKey, memoInput.value);
    });
  }

  // =========================
  // 슬라이드 처리
  // =========================
  let slides = [];
  let currentSlideIndex = 0;

  async function loadSlides() {
    try {
      const res = await fetch("./slides/slides.json", { cache: "no-store" });
      const data = await res.json();

      slides = Array.isArray(data) ? data : (data.slides || []);

      if (!slides.length) {
        showSlideFallback();
        return;
      }

      renderSlide();
    } catch (e) {
      console.error("❌ slides.json 로드 실패:", e);
      showSlideFallback();
    }
  }

  function showSlideFallback() {
    if (slideImage) slideImage.classList.add("hidden");
    if (slideFallback) slideFallback.classList.remove("hidden");
    if (slideIndicator) slideIndicator.textContent = "0 / 0";
    if (progressFill) progressFill.style.width = "0%";
    if (progressText) progressText.textContent = "0%";
  }

  function renderSlide() {
    if (!slides.length) {
      showSlideFallback();
      return;
    }

    const fileName = slides[currentSlideIndex];

    if (slideImage) {
      slideImage.src = `./slides/${fileName}`;
      slideImage.classList.remove("hidden");
    }
    if (slideFallback) slideFallback.classList.add("hidden");

    if (slideIndicator) {
      slideIndicator.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    }

    const percent = Math.round(((currentSlideIndex + 1) / slides.length) * 100);
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}%`;
  }

  prevBtn?.addEventListener("click", () => {
    if (!slides.length) return;
    currentSlideIndex = Math.max(0, currentSlideIndex - 1);
    renderSlide();
  });

  nextBtn?.addEventListener("click", () => {
    if (!slides.length) return;
    currentSlideIndex = Math.min(slides.length - 1, currentSlideIndex + 1);
    renderSlide();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevBtn?.click();
    if (e.key === "ArrowRight") nextBtn?.click();
  });

  // =========================
  // 채팅 렌더링
  // =========================
  function renderEmptyState() {
    if (!chatList) return;

    chatList.innerHTML = `
      <div class="empty-state">
        아직 채팅이 없습니다.<br />
        참여자가 메시지를 보내면 표시됩니다.
      </div>
    `;
  }

  function renderMessages(messages) {
    if (!chatList) return;

    if (!messages || !messages.length) {
      renderEmptyState();
      return;
    }

    let html = "";

    messages.forEach((msg) => {
      const nickname = escapeHtml(msg.nickname || "익명");
      const text = escapeHtml(msg.text || "");
      const time = escapeHtml(msg.timeLabel || "");

      html += `
        <div class="message-item">
          <div class="message-meta">
            <div class="message-nickname">${nickname}</div>
            <div class="message-time">${time}</div>
          </div>
          <div class="message-text">${text}</div>
        </div>
      `;
    });

    chatList.innerHTML = html;
    chatList.scrollTop = chatList.scrollHeight;
  }

  // =========================
  // Firebase 채팅 구독
  // =========================
  let unsubscribeMessages = null;

  function subscribeMessages() {
    const messagesRef = query(
      ref(db, `rooms/${room}/messages`),
      limitToLast(200)
    );

    console.log("✅ 채팅 구독 시작:", room);

    unsubscribeMessages = onValue(
      messagesRef,
      (snapshot) => {
        const value = snapshot.val() || {};

        const messages = Object.entries(value)
          .map(([id, item]) => ({
            id,
            ...item
          }))
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        console.log("✅ 채팅 업데이트:", messages.length, messages);

        renderMessages(messages);
      },
      (error) => {
        console.error("❌ 채팅 구독 실패:", error);
      }
    );
  }

  // 초기 상태
  renderEmptyState();
  subscribeMessages();
  loadSlides();
});

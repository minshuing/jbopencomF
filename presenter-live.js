import { db } from "./firebase-config.js";
import { getRoomFromQuery, buildMobileLink, loadLocal, saveLocal } from "./app-common.js";
import {
  ref,
  query,
  limitToLast,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
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

  console.log("✅ presenter-live.js 실행됨");

  if (roomBadge) roomBadge.textContent = room;

  const mobileLink = buildMobileLink(room);
  if (mobileLinkText) mobileLinkText.textContent = mobileLink;

  copyMobileLinkBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mobileLink);
      alert("참여자 모바일 링크가 복사되었습니다.");
    } catch (e) {
      console.error("❌ 링크 복사 실패", e);
      alert("링크 복사 실패");
    }
  });

  clearChatBtn?.addEventListener("click", async () => {
    const ok = confirm("현재 Room의 채팅 전체를 삭제할까요?");
    if (!ok) return;

    try {
      await remove(ref(db, `rooms/${room}/messages`));
      console.log("✅ 채팅 전체 삭제 완료");
    } catch (e) {
      console.error("❌ 채팅 삭제 실패", e);
      alert("채팅 삭제 실패");
    }
  });

  // ===== 메모 =====
  const memoKey = `presenter-memo-${room}`;
  if (memoInput) {
    memoInput.value = loadLocal(memoKey, "");
    memoInput.addEventListener("input", () => {
      saveLocal(memoKey, memoInput.value);
    });
  }

  // ===== 슬라이드 =====
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
      console.error("❌ slides.json 로드 실패", e);
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

  // ===== 채팅 =====
  function renderEmptyState() {
    if (!chatList) return;
    chatList.replaceChildren();

    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `아직 채팅이 없습니다.<br />참여자가 메시지를 보내면 표시됩니다.`;
    chatList.appendChild(empty);
  }

  function createMessageNode(msg) {
    const wrapper = document.createElement("div");
    wrapper.className = "message-item";

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const nickname = document.createElement("div");
    nickname.className = "message-nickname";
    nickname.textContent = msg.nickname || "익명";

    const time = document.createElement("div");
    time.className = "message-time";
    time.textContent = msg.timeLabel || "";

    meta.appendChild(nickname);
    meta.appendChild(time);

    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = msg.text || "";

    wrapper.appendChild(meta);
    wrapper.appendChild(text);

    return wrapper;
  }

  function renderMessages(messages) {
    if (!chatList) return;

    console.log("🟡 renderMessages 호출됨:", messages.length);

    chatList.replaceChildren();

    if (!messages.length) {
      renderEmptyState();
      return;
    }

    const frag = document.createDocumentFragment();

    messages.forEach((msg) => {
      frag.appendChild(createMessageNode(msg));
    });

    chatList.appendChild(frag);
    chatList.scrollTop = chatList.scrollHeight;

    console.log("✅ chatList DOM 반영 완료. child count:", chatList.children.length);
  }

  function subscribeMessages() {
    const messagesRef = query(
      ref(db, `rooms/${room}/messages`),
      limitToLast(200)
    );

    console.log("✅ 채팅 구독 시작:", room);

    onValue(
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

  renderEmptyState();
  subscribeMessages();
  loadSlides();
});

import { db } from "./firebase-config.js";
import { getRoomFromQuery, buildMobileLink } from "./app-common.js";

import {
  ref,
  query,
  limitToLast,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {

  const room = getRoomFromQuery();

  const chatList = document.getElementById("chatList");
  const roomBadge = document.getElementById("roomBadge");
  const mobileLinkText = document.getElementById("mobileLinkText");

  if (roomBadge) roomBadge.textContent = room;

  const mobileLink = buildMobileLink(room);
  if (mobileLinkText) mobileLinkText.textContent = mobileLink;

  console.log("✅ presenter LIVE 실행:", room);

  let hasInitialData = false;

  function renderMessages(messages) {

    if (!chatList) return;

    console.log("🟡 renderMessages:", messages.length);

    // ✅ 최초 empty 처리
    if (!messages.length && !hasInitialData) {
      chatList.innerHTML = `
        <div class="empty-state">
          아직 채팅이 없습니다
        </div>
      `;
      return;
    }

    if (messages.length) {
      hasInitialData = true;
    }

    // ✅ empty snapshot 무시 (중요)
    if (!messages.length) {
      console.log("⚠️ empty snapshot 무시");
      return;
    }

    // ✅ 현재 하단 여부 체크
    const isAtBottom =
      chatList.scrollHeight - chatList.scrollTop - chatList.clientHeight < 50;

    const frag = document.createDocumentFragment();

    messages.forEach(msg => {

      const item = document.createElement("div");
      item.className = "message-item";

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

      item.appendChild(meta);
      item.appendChild(text);

      frag.appendChild(item);
    });

    chatList.innerHTML = "";
    chatList.appendChild(frag);

    // ✅ 자동 스크롤 (조건부)
    if (isAtBottom) {
      chatList.scrollTop = chatList.scrollHeight;
    }

    console.log("✅ DOM 반영 완료:", messages.length);
  }

  const q = query(
    ref(db, `rooms/${room}/messages`),
    limitToLast(200)
  );

  onValue(q, (snapshot) => {

    const data = snapshot.val();

    console.log("🔥 raw data:", data);

    if (!data) {
      renderMessages([]);
      return;
    }

    const messages = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    renderMessages(messages);

  });

// ==========================================
  // 📸 슬라이드 제어 기능 추가 (여기를 붙여넣으세요)
  // ==========================================
  const slideImage = document.getElementById("slideImage");
  const slideFallback = document.getElementById("slideFallback");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const slideIndicator = document.getElementById("slideIndicator");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  let slideList = [];
  let currentIdx = 0;

  // 1. JSON 파일 불러오기 (상대 경로 지정)
  fetch("./slides/slides.json")
    .then(response => {
      if (!response.ok) throw new Error("JSON 파일을 찾을 수 없습니다.");
      return response.json();
    })
    .then(data => {
      if (data && data.slides && data.slides.length > 0) {
        slideList = data.slides;
        updateSlide(); // 첫 번째 슬라이드 표시
      } else {
        showFallback();
      }
    })
    .catch(error => {
      console.error("❌ 슬라이드 로드 실패:", error);
      showFallback();
    });

  // 2. 화면에 슬라이드 업데이트하는 함수
  function updateSlide() {
    if (slideList.length === 0) return;

    // 이미지 경로 설정 (상대 경로)
    slideImage.src = `./slides/${slideList[currentIdx]}`;
    slideImage.classList.remove("hidden");
    slideFallback.classList.add("hidden");

    // 인디케이터 표시 (예: 1 / 41)
    if (slideIndicator) {
      slideIndicator.textContent = `${currentIdx + 1} / ${slideList.length}`;
    }

    // 프로그레스 바 업데이트
    const progressPercent = Math.round(((currentIdx + 1) / slideList.length) * 100);
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (progressText) progressText.textContent = `${progressPercent}%`;
  }

  // 3. 실패 시 대체 문구 띄우는 함수
  function showFallback() {
    if (slideImage) slideImage.classList.add("hidden");
    if (slideFallback) slideFallback.classList.remove("hidden");
  }

  // 4. 이전 / 다음 버튼 이벤트 리스너
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIdx > 0) {
        currentIdx--;
        updateSlide();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIdx < slideList.length - 1) {
        currentIdx++;
        updateSlide();
      }
    });
  }
  
});
``

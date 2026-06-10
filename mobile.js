import { db } from "./firebase-config.js";
import { getRoomFromQuery, escapeHtml, formatTime, loadLocal, saveLocal } from "./app-common.js";
import {
  ref,
  push,
  query,
  limitToLast,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {
  const setupModal = document.getElementById("setupModal");
  const roomInput = document.getElementById("roomInput");
  const nicknameInput = document.getElementById("nicknameInput");
  const startChatBtn = document.getElementById("startChatBtn");

  const roomBadge = document.getElementById("roomBadge");
  const nicknameBadge = document.getElementById("nicknameBadge");
  const mobileChatList = document.getElementById("mobileChatList");
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");

  let room = getRoomFromQuery();
  let nickname = "";
  let unsubscribeListener = null;
  let currentSubscribedRoom = "";

  console.log("✅ mobile.js 실행됨");

  // 초기 room 표시
  if (roomInput) roomInput.value = room;
  if (roomBadge) roomBadge.textContent = room;

  // 현재 room 기준으로 저장된 닉네임 불러오기
  let savedNickname = loadLocal(`nickname-${room}`, "");
  if (savedNickname && nicknameInput) {
    nicknameInput.value = savedNickname;
  }

  function openSetup() {
    if (setupModal) setupModal.classList.remove("hidden");
  }

  function closeSetup() {
    if (setupModal) setupModal.classList.add("hidden");
  }

  function setIdentityUI() {
    if (roomBadge) roomBadge.textContent = room || "-";
    if (nicknameBadge) nicknameBadge.textContent = nickname || "-";
  }

  function renderEmptyState() {
    if (!mobileChatList) return;
    mobileChatList.innerHTML = `
      <div class="empty-state">
        아직 메시지가 없습니다.<br />
        첫 메시지를 보내보세요.
      </div>
    `;
  }

  function renderMessages(messages) {
    if (!mobileChatList) return;

    if (!messages.length) {
      renderEmptyState();
      return;
    }

    mobileChatList.innerHTML = messages.map((msg) => {
      const isMine = msg.nickname === nickname;
      const nicknameHtml = escapeHtml(msg.nickname || "익명");
      const textHtml = escapeHtml(msg.text || "");
      const timeHtml = escapeHtml(msg.timeLabel || "");

      return `
        <div class="mobile-message ${isMine ? "mine" : ""}">
          <div class="message-meta">
            <div class="message-nickname">${nicknameHtml}</div>
            <div class="message-time">${timeHtml}</div>
          </div>
          <div class="message-text">${textHtml}</div>
        </div>
      `;
    }).join("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  }

  function subscribeMessages(targetRoom) {
    if (!targetRoom) return;

    // 이미 같은 room 구독 중이면 다시 안 붙임
    if (currentSubscribedRoom === targetRoom) return;

    currentSubscribedRoom = targetRoom;

    const messagesQuery = query(
      ref(db, `rooms/${targetRoom}/messages`),
      limitToLast(200)
    );

    console.log("✅ 메시지 구독 시작:", targetRoom);

    onValue(messagesQuery, (snapshot) => {
      const value = snapshot.val() || {};

      const messages = Object.entries(value)
        .map(([id, item]) => ({
          id,
          ...item
        }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

      console.log("✅ 메시지 수신:", messages.length);
      renderMessages(messages);
    }, (error) => {
      console.error("❌ 메시지 구독 실패:", error);
    });
  }

  function applyIdentity() {
    const enteredRoom = (roomInput?.value || "").trim();
    const enteredNickname = (nicknameInput?.value || "").trim();

    if (!enteredRoom) {
      alert("Room 코드를 입력해 주세요.");
      return;
    }

    if (!enteredNickname) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    room = enteredRoom;
    nickname = enteredNickname;

    saveLocal(`nickname-${room}`, nickname);
    setIdentityUI();
    closeSetup();
    subscribeMessages(room);

    console.log("✅ 채팅 시작 성공:", room, nickname);
  }

  if (startChatBtn) {
    startChatBtn.addEventListener("click", applyIdentity);
  }

  if (nicknameInput) {
    nicknameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyIdentity();
      }
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      console.log("✅ 전송 버튼 클릭");

      if (!nickname || !room) {
        openSetup();
        return;
      }

      const text = (messageInput?.value || "").trim();
      if (!text) return;

      const now = Date.now();

      console.log("✅ Firebase 전송 시작:", { room, nickname, text });

      try {
        await push(ref(db, `rooms/${room}/messages`), {
          nickname,
          text,
          createdAt: now,
          timeLabel: formatTime(now)
        });

        if (messageInput) {
          messageInput.value = "";
          messageInput.focus();
        }

        console.log("✅ Firebase 전송 완료");
      } catch (error) {
        console.error("❌ Firebase 전송 실패:", error);
        alert("메시지 전송에 실패했습니다. Firebase 설정 또는 Rules를 확인해 주세요.");
      }
    });
  }

  // 초기 진입 처리
  if (savedNickname) {
    nickname = savedNickname;
    setIdentityUI();
    closeSetup();
    subscribeMessages(room);
  } else {
    setIdentityUI();
    openSetup();
    renderEmptyState();
  }
});

import { db } from "./firebase-config.js";
import { getRoomFromQuery, escapeHtml, formatTime, loadLocal, saveLocal } from "./app-common.js";
import {
  ref,
  push,
  query,
  limitToLast,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

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

roomInput.value = room;
const savedNickname = loadLocal(`nickname-${room}`, "");
if (savedNickname) {
  nicknameInput.value = savedNickname;
}

function openSetup() {
  setupModal.classList.remove("hidden");
}

function closeSetup() {
  if (setupModal) {
    setupModal.classList.add("hidden");
  }
}

function applyIdentity() {
  room = (roomInput.value || room).trim();
  nickname = (nicknameInput.value || "").trim();

  if (!room) {
    alert("Room 코드를 입력해 주세요.");
    return false;
  }

  if (!nickname) {
    alert("닉네임을 입력해 주세요.");
    return false;
  }

  saveLocal(`nickname-${room}`, nickname);
  roomBadge.textContent = room;
  nicknameBadge.textContent = nickname;
  closeSetup();
  subscribeMessages();
  return true;
}

startChatBtn.addEventListener("click", applyIdentity);

let subscribed = false;

function subscribeMessages() {
  if (subscribed) return;
  subscribed = true;

  const messagesQuery = query(ref(db, `rooms/${room}/messages`), limitToLast(200));
  onValue(messagesQuery, (snapshot) => {
    const value = snapshot.val() || {};
    const messages = Object.entries(value).map(([id, item]) => ({
      id,
      ...item
    })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    renderMessages(messages);
  });
}

function renderMessages(messages) {
  if (!messages.length) {
    mobileChatList.innerHTML = `
      <div class="empty-state">
        아직 메시지가 없습니다.<br />
        첫 메시지를 보내보세요.
      </div>
    `;
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

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!nickname || !room) {
    openSetup();
    return;
  }

  const text = messageInput.value.trim();
  if (!text) return;

  const now = Date.now();
  await push(ref(db, `rooms/${room}/messages`), {
    nickname,
    text,
    createdAt: now,
    timeLabel: formatTime(now)
  });

  messageInput.value = "";
  messageInput.focus();
});

if (savedNickname) {
  nickname = savedNickname;
  roomBadge.textContent = room;
  nicknameBadge.textContent = nickname;
  closeSetup();
  subscribeMessages();
} else {
  roomBadge.textContent = room;
  openSetup();
}

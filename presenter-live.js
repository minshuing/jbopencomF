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

});
``

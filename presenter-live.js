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

  let hasInitialData = false; // ✅ 핵심 상태값 추가

  function renderMessages(messages) {

    console.log("🟡 renderMessages:", messages.length);

    if (!messages.length && !hasInitialData) {
      // ✅ 최초 로딩에서만 empty 표시
      chatList.innerHTML = `
        <div class="empty-state">
          아직 채팅이 없습니다
        </div>
      `;
      return;
    }

    if (messages.length) {
      hasInitialData = true; // ✅ 데이터 들어오면 true
    }

    if (!messages.length) {
      // ✅ 이후 empty 데이터는 무시 (덮어쓰기 방지)
      console.log("⚠️ empty snapshot 무시");
      return;
    }

    const frag = document.createDocumentFragment();

    messages.forEach(msg => {

      const item = document.createElement("div");
      item.className = "message-item";

      const nickname = document.createElement("div");
      nickname.className = "message-nickname";
      nickname.textContent = msg.nickname || "익명";

      const text = document.createElement("div");
      text.className = "message-text";
      text.textContent = msg.text || "";

      const time = document.createElement("div");
      time.className = "message-time";
      time.textContent = msg.timeLabel || "";

      item.appendChild(nickname);
      item.appendChild(text);
      item.appendChild(time);

      frag.appendChild(item);
    });

    chatList.innerHTML = "";
    chatList.appendChild(frag);

    chatList.scrollTop = chatList.scrollHeight;

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

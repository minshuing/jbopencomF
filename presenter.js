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

  const chatList = document.getElementById("chatList");

  console.log("✅ presenter.js 실행됨");

  if (roomBadge) roomBadge.textContent = room;

  const mobileLink = buildMobileLink(room);
  if (mobileLinkText) mobileLinkText.textContent = mobileLink;

  copyMobileLinkBtn?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(mobileLink);
    alert("모바일 링크 복사 완료");
  });

  clearChatBtn?.addEventListener("click", async () => {
    const ok = confirm("채팅 삭제하시겠습니까?");
    if (!ok) return;
    await remove(ref(db, `rooms/${room}/messages`));
  });

  function renderEmpty() {
    chatList.innerHTML = `
      <div class="empty-state">
        아직 채팅이 없습니다.<br/>
        참여자가 메시지를 보내면 표시됩니다.
      </div>
    `;
  }

  function renderMessages(messages) {

    if (!messages.length) {
      renderEmpty();
      return;
    }

    let html = "";

    messages.forEach(msg => {
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

  const messagesQuery = query(
    ref(db, `rooms/${room}/messages`),
    limitToLast(200)
  );

  onValue(messagesQuery, (snapshot) => {

    console.log("✅ 채팅 업데이트 감지");

    const value = snapshot.val() || {};

    const messages = Object.entries(value)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    console.log("✅ 메시지 개수:", messages.length);

    renderMessages(messages);

  });

  renderEmpty();

});
``

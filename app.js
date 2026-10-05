/**
 * 10天・6個量測挑戰 - 核心邏輯
 * 挑戰期間：2026年10月6日 ～ 2026年10月15日 (10天)
 * 目標：完成 6 個「身體組成量測」
 */

(function () {
  'use strict';

  // 常數配置
  const STORAGE_KEY = 'TEN_DAYS_CHALLENGE_2026_DATA';
  const START_DATE_STR = '2026-10-06';
  const END_DATE_STR = '2026-10-15';
  const TARGET_COUNT = 6;

  // 10 句專屬每日成熟暖心金句
  const DAILY_QUOTES = [
    "不用一次做到很多，今天完成一個就好。",
    "機會不是等來的，是走出去遇見的。",
    "今天多一個行動，離目標就近一點。",
    "不要看還差多少，先完成下一個。",
    "10天很短，所以今天很重要。",
    "完成，比完美重要。",
    "每一次量測，都是一次認識新需求的機會。",
    "今天不要空白。",
    "只剩最後幾天，把自己答應的事情完成。",
    "不是靠運氣完成6個，是靠每天往前一步。"
  ];

  // 應用狀態
  let state = {
    records: [],
    simulatedDate: null, // null 代表跟隨真實日期，若有字串代表模擬測試日期 (例如 '2026-10-06')
    quoteIndex: 0,
    notificationEnabled: false
  };

  // 暫存正在編輯的紀錄 ID
  let editingRecordId = null;

  /* ============================
   * 1. 本地儲存與狀態管理
   * ============================ */
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state.records = Array.isArray(parsed.records) ? parsed.records : [];
        state.simulatedDate = parsed.simulatedDate || null;
      }
    } catch (e) {
      console.error('載入儲存資料失敗:', e);
      state.records = [];
    }
  }

  function saveData() {
    try {
      const dataToSave = {
        records: state.records,
        simulatedDate: state.simulatedDate,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('儲存資料失敗:', e);
    }
  }

  /* ============================
   * 2. 日期與進度運算
   * ============================ */
  function getCurrentDateObj() {
    if (state.simulatedDate) {
      const parts = state.simulatedDate.split('-');
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    }
    return new Date();
  }

  function formatDateIso(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getChallengeDaysInfo() {
    const current = getCurrentDateObj();
    const currIso = formatDateIso(current);

    const startObj = new Date(2026, 9, 6); // 2026-10-06
    const endObj = new Date(2026, 9, 15);   // 2026-10-15

    const msPerDay = 86400000;
    const diffDaysFromStart = Math.floor((new Date(current.getFullYear(), current.getMonth(), current.getDate()) - startObj) / msPerDay);

    let dayNumber = diffDaysFromStart + 1; // 10/6 is Day 1
    let statusPhase = 'active'; // 'before', 'active', 'ended'
    let daysRemaining = 0;

    if (dayNumber < 1) {
      statusPhase = 'before';
      dayNumber = 0;
      daysRemaining = 10;
    } else if (dayNumber > 10) {
      statusPhase = 'ended';
      dayNumber = 10;
      daysRemaining = 0;
    } else {
      statusPhase = 'active';
      // 根據題目需求：Day 3 / 10 距離挑戰結束還有 7 天 (10 - 3 = 7)
      daysRemaining = 10 - dayNumber;
    }

    return {
      currIso,
      dayNumber,
      statusPhase,
      daysRemaining,
      // 包含今天在內的剩餘天數 (供計算衝刺速度使用)
      remainingDaysInclusive: Math.max(1, 10 - dayNumber + 1)
    };
  }

  /* ============================
   * 3. 智慧進度評估
   * ============================ */
  function evaluateProgress(completedCount, daysInfo) {
    const remainingCount = Math.max(0, TARGET_COUNT - completedCount);
    const { dayNumber, statusPhase, remainingDaysInclusive, daysRemaining } = daysInfo;

    // 情況 1：已完成 6 個或以上
    if (completedCount >= TARGET_COUNT) {
      return {
        level: 'green',
        badge: '🟢 目標達成',
        mainText: '🎉 挑戰完成！「10天，6個量測，我做到了！」',
        subText: '你已經超越了最初的承諾，太棒了！',
        isComplete: true
      };
    }

    // 挑戰尚未開始
    if (statusPhase === 'before') {
      return {
        level: 'green',
        badge: '🟢 蓄勢待發',
        mainText: '挑戰即將於 10/6 正式開跑！',
        subText: '放鬆心情，準備好迎接這 10 天的行動節奏。',
        isComplete: false
      };
    }

    // 挑戰已經結束但未滿 6 個
    if (statusPhase === 'ended') {
      return {
        level: 'red',
        badge: '🔴 挑戰結束',
        mainText: `共完成 ${completedCount} 個量測，每一次行動都算數！`,
        subText: '不論數字如何，這都是一次寶貴的行動累積。',
        isComplete: false
      };
    }

    // 進行中評估
    // 規格案例：
    // 如果剩下 2 天還差 3 個：🔴 進入衝刺「最後2天！現在不是等機會，是主動創造機會。」
    if (remainingDaysInclusive <= 2 && remainingCount >= 2) {
      return {
        level: 'red',
        badge: '🔴 進入衝刺',
        mainText: '最後2天！現在不是等機會，是主動創造機會。',
        subText: '現在開始行動，還來得及。',
        isComplete: false
      };
    }

    // 如果剩下 4 天卻還差 4 個：🔴 進入衝刺「接下來平均每天要完成1個，今天不要空白。」
    if (remainingDaysInclusive <= 4 && remainingCount >= remainingDaysInclusive) {
      return {
        level: 'red',
        badge: '🔴 進入衝刺',
        mainText: '接下來平均每天要完成1個，今天不要空白。',
        subText: '現在開始行動，還來得及。今天完成一個，立刻翻轉節奏。',
        isComplete: false
      };
    }

    // 落後情況（例如量測數落後進度節奏）
    // 理論基準：每天應有 0.6 個完成度
    const expectedProgress = dayNumber * 0.6;
    if (completedCount < expectedProgress - 0.5) {
      return {
        level: 'yellow',
        badge: '🟡 需要加快',
        mainText: '今天完成1個，後面就輕鬆很多。',
        subText: '跨出一小步，節奏就回來了。今天鎖定一位對象！',
        isComplete: false
      };
    }

    // 正常情況
    return {
      level: 'green',
      badge: '🟢 進度正常',
      mainText: '很好，照這個節奏走，6個一定完成。',
      subText: '不用急，專注在當下，一個一個完成就好。',
      isComplete: false
    };
  }

  /* ============================
   * 4. 每日金句與時段提醒邏輯
   * ============================ */
  function getDailyQuote(dayNumber) {
    if (dayNumber >= 1 && dayNumber <= 10) {
      return DAILY_QUOTES[dayNumber - 1];
    }
    return DAILY_QUOTES[0];
  }

  function getSlotReminderText(completedCount, todayRecordsCount) {
    const now = getCurrentDateObj();
    const hour = now.getHours();

    // 10:00 提醒
    const morningMsg = `今天的6個量測挑戰開始囉，目前完成 ${completedCount}/${TARGET_COUNT}。`;

    // 16:00 提醒
    let afternoonMsg = '';
    if (todayRecordsCount === 0) {
      afternoonMsg = '今天還有時間，完成一個，就離目標更近一步。';
    } else {
      afternoonMsg = '今天已經有行動了 ✓ 很棒，繼續保持。';
    }

    return {
      hour,
      morningMsg,
      afternoonMsg
    };
  }

  /* ============================
   * 5. 渲染頁面 DOM
   * ============================ */
  function renderApp() {
    const daysInfo = getChallengeDaysInfo();
    const completedCount = state.records.length;
    const remainingCount = Math.max(0, TARGET_COUNT - completedCount);
    const progressRate = Math.min(100, Math.round((completedCount / TARGET_COUNT) * 100));

    // 今日紀錄數
    const todayRecords = state.records.filter(r => r.date === daysInfo.currIso);
    const todayCount = todayRecords.length;

    // 1. 頂部天數與倒數資訊
    const dayCurrEl = document.getElementById('day-curr-num');
    const countdownTxtEl = document.getElementById('countdown-text');
    const challengeDateTag = document.getElementById('challenge-dates-tag');

    if (daysInfo.statusPhase === 'before') {
      dayCurrEl.textContent = 'Day 0';
      countdownTxtEl.innerHTML = `挑戰將於明天正式開始！還有 <span class="accent-txt">10 天</span>`;
      challengeDateTag.textContent = '10/6 → 10/15 (倒數 1 天)';
    } else if (daysInfo.statusPhase === 'ended') {
      dayCurrEl.textContent = 'Day 10';
      countdownTxtEl.innerHTML = `挑戰已圓滿結束！`;
      challengeDateTag.textContent = '10/6 → 10/15 (挑戰完結)';
    } else {
      dayCurrEl.textContent = `Day ${daysInfo.dayNumber}`;
      countdownTxtEl.innerHTML = `距離挑戰結束還有 <span class="accent-txt">${daysInfo.daysRemaining} 天</span>`;
      challengeDateTag.textContent = '10/6 → 10/15';
    }

    // 2. 三大核心數字卡片 (3秒直覺看懂)
    const metricDaysLeftEl = document.getElementById('metric-days-left');
    const metricDaysSubEl = document.getElementById('metric-days-sub');
    const metricCompletedEl = document.getElementById('metric-completed');
    const metricCompletedSubEl = document.getElementById('metric-completed-sub');
    const metricRemainingEl = document.getElementById('metric-remaining');
    const metricRemainingSubEl = document.getElementById('metric-remaining-sub');

    if (daysInfo.statusPhase === 'before') {
      metricDaysLeftEl.textContent = '10 天';
      metricDaysSubEl.textContent = '即將開始';
    } else if (daysInfo.statusPhase === 'ended') {
      metricDaysLeftEl.textContent = '0 天';
      metricDaysSubEl.textContent = '已結束';
    } else {
      metricDaysLeftEl.textContent = `${daysInfo.daysRemaining} 天`;
      metricDaysSubEl.textContent = `進度 ${daysInfo.dayNumber}/10 天`;
    }

    metricCompletedEl.textContent = `${completedCount} / ${TARGET_COUNT}`;
    metricCompletedSubEl.textContent = `達成率 ${progressRate}%`;

    if (remainingCount === 0) {
      metricRemainingEl.textContent = '0 個';
      metricRemainingSubEl.textContent = '已全數達成！🎉';
    } else {
      metricRemainingEl.textContent = `${remainingCount} 個`;
      metricRemainingSubEl.textContent = '持續穩步累積';
    }

    // 3. 六個量測視覺圖示 (○ -> ●)
    const circlesRow = document.getElementById('six-circles-row');
    circlesRow.innerHTML = '';
    for (let i = 1; i <= TARGET_COUNT; i++) {
      const isDone = i <= completedCount;
      const node = document.createElement('div');
      node.className = `circle-node ${isDone ? 'completed' : ''}`;
      node.title = `量測 #${i}`;
      if (isDone) {
        node.innerHTML = `<span class="node-check">✓</span><span class="node-idx">#${i}</span>`;
      } else {
        node.innerHTML = `<span class="node-idx">${i}</span>`;
      }
      circlesRow.appendChild(node);
    }

    // 進度條
    const progressBar = document.getElementById('progress-bar-fill');
    progressBar.style.width = `${progressRate}%`;

    const progressStatText = document.getElementById('progress-stat-text');
    if (completedCount >= TARGET_COUNT) {
      progressStatText.textContent = `已全滿 6/6 (100%)`;
    } else {
      progressStatText.textContent = `已完成 ${completedCount} / 6，還差 ${remainingCount} 個！`;
    }

    // 4. 智慧進度評估卡片
    const evalResult = evaluateProgress(completedCount, daysInfo);
    const statusBadge = document.getElementById('status-indicator-badge');
    const statusDot = statusBadge.querySelector('.status-dot');
    const statusBadgeTxt = document.getElementById('status-badge-text');
    const smartMainTxt = document.getElementById('smart-message-main');
    const smartSubTxt = document.getElementById('smart-message-sub');

    statusBadge.className = `status-indicator-badge ${evalResult.level}`;
    statusBadgeTxt.textContent = evalResult.badge;
    smartMainTxt.textContent = evalResult.mainText;
    smartSubTxt.textContent = evalResult.subText;

    // 若達到 6 個且尚未在本次展示過，觸發大慶祝模態框
    if (completedCount >= TARGET_COUNT && !sessionStorage.getItem('CELEBRATION_SHOWN_SESSION')) {
      sessionStorage.setItem('CELEBRATION_SHOWN_SESSION', 'true');
      openCelebrationModal(daysInfo);
    }

    // 5. 每日成熟金句
    const quoteTxt = document.getElementById('daily-quote-text');
    const quoteCurrent = state.quoteIndex > 0 ? DAILY_QUOTES[state.quoteIndex % DAILY_QUOTES.length] : getDailyQuote(daysInfo.dayNumber);
    quoteTxt.textContent = `「${quoteCurrent}」`;

    // 6. 10 天行動日曆 (10/6 ~ 10/15)
    renderTenDaysGrid(daysInfo);

    // 7. 提醒時段卡片
    renderNotificationSection(completedCount, todayCount);

    // 8. 已記錄歷史清單
    renderRecordsList(daysInfo);

    // 9. 更新模擬日期按鈕狀態
    updateSimButtons(daysInfo.currIso);
  }

  /* 渲染 10 天行動日曆 */
  function renderTenDaysGrid(daysInfo) {
    const grid = document.getElementById('ten-days-grid');
    grid.innerHTML = '';

    const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];

    for (let day = 1; day <= 10; day++) {
      const dayDate = new Date(2026, 9, 5 + day); // 10/6 is day=1
      const isoStr = formatDateIso(dayDate);
      const isToday = isoStr === daysInfo.currIso;

      // 檢查此日完成紀錄
      const dayRecords = state.records.filter(r => r.date === isoStr);
      const hasAction = dayRecords.length > 0;

      const card = document.createElement('div');
      card.className = `day-card ${isToday ? 'is-today' : ''} ${hasAction ? 'has-action' : ''}`;

      let actionStatusHtml = '—';
      if (hasAction) {
        actionStatusHtml = `<span class="check-sym">✓</span> ${dayRecords.length}個`;
      }

      card.innerHTML = `
        ${isToday ? '<span class="today-badge">今日</span>' : ''}
        <div class="day-date-str">10/${5 + day}</div>
        <div class="day-weekday-str">週${weekdayNames[dayDate.getDay()]}</div>
        <div class="day-action-status">${actionStatusHtml}</div>
      `;

      card.addEventListener('click', () => {
        openRecordModal(isoStr);
      });

      grid.appendChild(card);
    }
  }

  /* 渲染時段提醒狀態 */
  function renderNotificationSection(completedCount, todayCount) {
    const reminderInfo = getSlotReminderText(completedCount, todayCount);
    const morningSlot = document.getElementById('slot-morning');
    const afternoonSlot = document.getElementById('slot-afternoon');
    const morningDesc = document.getElementById('slot-morning-desc');
    const afternoonDesc = document.getElementById('slot-afternoon-desc');

    morningDesc.textContent = reminderInfo.morningMsg;
    afternoonDesc.textContent = reminderInfo.afternoonMsg;

    // 標註目前當前活躍時段
    if (reminderInfo.hour >= 10 && reminderInfo.hour < 16) {
      morningSlot.classList.add('active-slot');
      afternoonSlot.classList.remove('active-slot');
    } else if (reminderInfo.hour >= 16) {
      morningSlot.classList.remove('active-slot');
      afternoonSlot.classList.add('active-slot');
    } else {
      morningSlot.classList.remove('active-slot');
      afternoonSlot.classList.remove('active-slot');
    }

    // 檢查瀏覽器推播權限狀態
    const notifStatusTxt = document.getElementById('notif-permission-status');
    const notifActionBtn = document.getElementById('btn-notif-action');

    if (!('Notification' in window)) {
      notifStatusTxt.textContent = '此裝置瀏覽器不支援推播，已啟用站內自動提醒。';
      notifActionBtn.style.display = 'none';
    } else {
      if (Notification.permission === 'granted') {
        notifStatusTxt.textContent = '已開啟每日 10:00 & 16:00 智慧提醒通知';
        notifActionBtn.textContent = '測試通知';
        notifActionBtn.onclick = () => sendTestNotification();
      } else if (Notification.permission === 'denied') {
        notifStatusTxt.textContent = '提醒已被瀏覽器封鎖，若需通知請至設定允許';
        notifActionBtn.textContent = '如何開啟？';
        notifActionBtn.onclick = () => alert('請在瀏覽器網址列左側點擊「鎖頭/網站設定」，將「通知」權限設為「允許」，即可每日定時收到提醒。');
      } else {
        notifStatusTxt.textContent = '尚未啟用手機/瀏覽器推播通知';
        notifActionBtn.textContent = '開啟提醒';
        notifActionBtn.onclick = () => requestNotificationPermission();
      }
    }
  }

  /* 渲染歷史紀錄清單 */
  function renderRecordsList(daysInfo) {
    const listContainer = document.getElementById('records-list-container');
    const countBadge = document.getElementById('records-total-badge');

    countBadge.textContent = `${state.records.length} / ${TARGET_COUNT}`;

    if (state.records.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-records-state">
          <div class="empty-icon">📋</div>
          <div class="empty-txt">尚未有量測紀錄</div>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">點擊下方按鈕，記錄你的第一個量測！</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    // 按時間降序排序（最新在最前）
    const sortedRecords = [...state.records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedRecords.forEach((item, index) => {
      const orderNum = state.records.length - index;
      const el = document.createElement('div');
      el.className = 'record-item';

      const parts = item.date.split('-');
      const dateStr = parts.length === 3 ? `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}` : item.date;
      const personText = item.person ? item.person : '本人 / 未具名';
      const noteText = item.note ? item.note : '無備註';

      el.innerHTML = `
        <div class="record-left">
          <div class="record-num-badge">#${orderNum}</div>
          <div class="record-info-col">
            <div class="record-title-row">
              <span class="record-name">${escapeHtml(personText)}</span>
              <span class="record-date-tag">${dateStr}</span>
            </div>
            <div class="record-note">${escapeHtml(noteText)}</div>
          </div>
        </div>
        <div class="record-actions">
          <button class="btn-icon-subtle edit" title="編輯紀錄" data-id="${item.id}">✏️</button>
          <button class="btn-icon-subtle delete" title="刪除紀錄" data-id="${item.id}">🗑️</button>
        </div>
      `;

      // 綁定編輯
      el.querySelector('.edit').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditRecordModal(item.id);
      });

      // 綁定刪除
      el.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteRecord(item.id);
      });

      listContainer.appendChild(el);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }

  /* ============================
   * 6. 模態框與表單操作
   * ============================ */
  const recordModalOverlay = document.getElementById('record-modal-overlay');
  const recordDateInput = document.getElementById('record-date-input');
  const recordPersonInput = document.getElementById('record-person-input');
  const recordNoteInput = document.getElementById('record-note-input');
  const recordModalTitle = document.getElementById('record-modal-title');
  const recordSubmitBtn = document.getElementById('record-submit-btn');

  function openRecordModal(defaultDate = null) {
    editingRecordId = null;
    recordModalTitle.textContent = '記錄一次身體組成量測';
    recordSubmitBtn.innerHTML = '完成！算我一個 🎉';

    const daysInfo = getChallengeDaysInfo();
    recordDateInput.value = defaultDate || daysInfo.currIso;
    recordPersonInput.value = '';
    recordNoteInput.value = '';

    recordModalOverlay.classList.add('active');
  }

  function openEditRecordModal(id) {
    const item = state.records.find(r => r.id === id);
    if (!item) return;

    editingRecordId = id;
    recordModalTitle.textContent = '修改量測紀錄';
    recordSubmitBtn.innerHTML = '儲存修改 ✓';

    recordDateInput.value = item.date;
    recordPersonInput.value = item.person || '';
    recordNoteInput.value = item.note || '';

    recordModalOverlay.classList.add('active');
  }

  function closeRecordModal() {
    recordModalOverlay.classList.remove('active');
    editingRecordId = null;
  }

  // 表單送出
  document.getElementById('record-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const dateVal = recordDateInput.value;
    const personVal = recordPersonInput.value.trim();
    const noteVal = recordNoteInput.value.trim();

    if (!dateVal) {
      alert('請選擇量測完成日期');
      return;
    }

    if (editingRecordId) {
      // 編輯既有紀錄
      const index = state.records.findIndex(r => r.id === editingRecordId);
      if (index !== -1) {
        state.records[index].date = dateVal;
        state.records[index].person = personVal;
        state.records[index].note = noteVal;
        saveData();
        showToast('紀錄已成功更新！');
      }
    } else {
      // 新增紀錄
      const newRecord = {
        id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date: dateVal,
        person: personVal,
        note: noteVal,
        createdAt: new Date().toISOString()
      };
      state.records.push(newRecord);
      saveData();

      // 慶祝反饋！
      triggerConfetti();
      playChimeSound();
      vibrateDevice();

      const newTotal = state.records.length;
      showToast(`太棒了！已累計完成第 ${newTotal} 個量測 🎉`);
    }

    closeRecordModal();
    renderApp();
  });

  /* 刪除紀錄 */
  function confirmDeleteRecord(id) {
    const target = state.records.find(r => r.id === id);
    if (!target) return;

    const personName = target.person ? `「${target.person}」` : '此筆';
    const ok = confirm(`確定要刪除 ${personName} 的量測紀錄嗎？\n總完成數將減少 1。`);
    if (ok) {
      state.records = state.records.filter(r => r.id !== id);
      saveData();
      showToast('已刪除該筆量測紀錄');
      renderApp();
    }
  }

  /* 重新開始挑戰（二次安全確認） */
  function resetChallengeWithProtection() {
    const step1 = confirm('⚠️ 確定要重新開始挑戰嗎？\n\n這將會清除這 10 天內記錄的所有量測紀錄與進度。');
    if (!step1) return;

    const step2 = confirm('請再次確認：\n\n所有已完成的數據將無法復原，您確定要清空並重新從 0 開始嗎？');
    if (!step2) return;

    state.records = [];
    sessionStorage.removeItem('CELEBRATION_SHOWN_SESSION');
    saveData();
    showToast('挑戰已重新開始，目標：6個量測！');
    renderApp();
  }

  /* ============================
   * 7. 6個量測達成：全螢幕榮譽慶祝卡
   * ============================ */
  const celebrationModalOverlay = document.getElementById('celebration-modal-overlay');

  function openCelebrationModal(daysInfo) {
    triggerConfetti(true);
    playCelebrationFanfare();

    const celebDate = document.getElementById('celeb-date');
    const celebDays = document.getElementById('celeb-days-used');
    const celebRecords = document.getElementById('celeb-records-summary');

    celebDate.textContent = daysInfo.currIso;
    celebDays.textContent = daysInfo.dayNumber > 0 ? `第 ${daysInfo.dayNumber} 天達成` : '提早達成！';
    celebRecords.textContent = `${state.records.length} 個 (達成率 100%+)`;

    celebrationModalOverlay.classList.add('active');
  }

  function closeCelebrationModal() {
    celebrationModalOverlay.classList.remove('active');
  }

  /* ============================
   * 8. 體驗特效：音效、彩帶、震動
   * ============================ */
  // Web Audio API 合成溫潤悅耳和弦音效（免加載外部 mp3 檔案）
  function playChimeSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 和弦音階 (C5, E5, G5, C6)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
      });
    } catch (e) {
      console.warn('音效播放失敗:', e);
    }
  }

  function playCelebrationFanfare() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const melody = [
        { f: 523.25, t: 0.0 },
        { f: 659.25, t: 0.12 },
        { f: 783.99, t: 0.24 },
        { f: 1046.50, t: 0.36 },
        { f: 1318.51, t: 0.52 }
      ];

      melody.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, ctx.currentTime + item.t);

        gain.gain.setValueAtTime(0, ctx.currentTime + item.t);
        gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + item.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.t + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + item.t);
        osc.stop(ctx.currentTime + item.t + 0.75);
      });
    } catch (e) {
      console.warn('慶祝音效失敗:', e);
    }
  }

  // 手機震動
  function vibrateDevice() {
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 80]);
    }
  }

  // 輕量自研 Canvas Confetti 粒子彩帶特效
  function triggerConfetti(massive = false) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = massive ? 120 : 60;
    const particles = [];
    const colors = ['#C89E5B', '#163E32', '#E05D34', '#FFE180', '#6C8B7D', '#FF7F50'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        opacity: 1
      });
    }

    let animationFrame;
    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0 && p.y < canvas.height) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationFrame = requestAnimationFrame(update);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    update();
  }

  /* 輕量 Toast 提示 */
  function showToast(msg) {
    const toast = document.getElementById('toast-notice');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ============================
   * 9. 推播通知處理 (Notification API)
   * ============================ */
  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('您的瀏覽器不支援通知功能。');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('已成功開啟通知權限！');
        sendTestNotification();
      } else {
        showToast('通知權限未開啟');
      }
      renderApp();
    });
  }

  function sendTestNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      alert('請先在瀏覽器允許通知權限');
      return;
    }

    const daysInfo = getChallengeDaysInfo();
    const completedCount = state.records.length;
    const todayRecords = state.records.filter(r => r.date === daysInfo.currIso);

    const slot = getSlotReminderText(completedCount, todayRecords.length);
    const bodyText = slot.hour < 14 ? slot.morningMsg : slot.afternoonMsg;

    new Notification('10天・6個量測挑戰 提醒', {
      body: bodyText,
      icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23163E32"/><text x="50" y="60" font-size="40" text-anchor="middle" fill="%23C89E5B">🎯</text></svg>'
    });

    showToast('已發送測試推播通知！');
  }

  /* ============================
   * 10. 模擬日期切換器 (Time Machine)
   * 方便使用者隨時切換 10/5(今天)、10/6(Day 1)、10/8(Day 3)、10/12(Day 7)、10/15(Day 10)
   * ============================ */
  function updateSimButtons(activeIso) {
    const simBtns = document.querySelectorAll('.sim-btn');
    simBtns.forEach(btn => {
      const targetDate = btn.getAttribute('data-date');
      if (targetDate === 'real' && state.simulatedDate === null) {
        btn.classList.add('active');
      } else if (targetDate === state.simulatedDate) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function setSimulatedDate(dateStr) {
    if (dateStr === 'real') {
      state.simulatedDate = null;
      showToast('已切換為系統真實時間');
    } else {
      state.simulatedDate = dateStr;
      showToast(`已切換預覽日期至 ${dateStr}`);
    }
    saveData();
    renderApp();
  }

  /* ============================
   * 11. 初始化與事件監聽
   * ============================ */
  function init() {
    loadData();

    // 核心主按鈕：「＋ 今天完成1個量測」
    document.getElementById('giant-add-btn').addEventListener('click', () => {
      openRecordModal();
    });

    // 關閉紀錄彈窗
    document.getElementById('modal-close-btn').addEventListener('click', closeRecordModal);
    recordModalOverlay.addEventListener('click', (e) => {
      if (e.target === recordModalOverlay) closeRecordModal();
    });

    // 關閉大慶祝彈窗
    document.getElementById('celeb-close-btn').addEventListener('click', closeCelebrationModal);
    celebrationModalOverlay.addEventListener('click', (e) => {
      if (e.target === celebrationModalOverlay) closeCelebrationModal();
    });

    // 每日金句切換按鈕
    document.getElementById('quote-cycle-btn').addEventListener('click', () => {
      state.quoteIndex = (state.quoteIndex + 1) % DAILY_QUOTES.length;
      const quoteTxt = document.getElementById('daily-quote-text');
      quoteTxt.textContent = `「${DAILY_QUOTES[state.quoteIndex]}」`;
    });

    // 重設挑戰按鈕
    document.getElementById('btn-reset-challenge').addEventListener('click', resetChallengeWithProtection);

    // 匯出備份資料按鈕
    document.getElementById('btn-export-data').addEventListener('click', () => {
      const dataStr = JSON.stringify(state.records, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `10天量測挑戰紀錄備份_${formatDateIso(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('紀錄已匯出下載！');
    });

    // 模擬日期按鈕監聽
    document.querySelectorAll('.sim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-date');
        setSimulatedDate(d);
      });
    });

    // 註冊 Service Worker 支援離線 PWA
    if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('ServiceWorker 註冊略過:', err);
      });
    }

    // 初次渲染
    renderApp();
  }

  // 啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

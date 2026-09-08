import { parseUtterance, supportsSpeechRecognition, buildDraftInput } from './input.js';

const $ = (id) => document.getElementById(id);
let workspace,
  bootstrap,
  selected = null,
  change = 0,
  savedChange = 0,
  saving = null,
  saveTimer,
  blocked = false;
let epoch = 0,
  recognition = null,
  captureSource = 'typed',
  toastTimer,
  goldView = null,
  flat = false;
let dayTransition = false,
  dayRequest = 0,
  pendingFiles = 0,
  finishVoice = null;
let authLost = false,
  loggingOut = false;
const roles = {
  analyst: {
    n: '01',
    tag: 'THE THESIS',
    title: 'Research Analyst',
    body: 'One thought. A clear idea to test.',
    action: 'Bring a thought',
  },
  quant: {
    n: '02',
    tag: 'THE EVIDENCE',
    title: 'Quant Agent',
    body: 'Keep the numbers close. Keep them honest.',
    action: 'Open evidence',
  },
  coach: {
    n: '03',
    tag: 'THE REVIEW',
    title: 'Journal Coach',
    body: 'What did you notice? What stays with you?',
    action: 'Review a lot',
  },
};
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const thoughtPosition = (index) => {
  const slot = index % 80;
  return [
    [-80, 150, -310][slot % 3],
    [25, -145, 195][Math.floor(slot / 3) % 3],
    110 + Math.floor(slot / 9) * 20,
  ];
};
function syncCaptureControls() {
  const locked = authLost || loggingOut || !workspace || dayTransition || Boolean(recognition);
  $('capture').disabled = locked;
  $('add').disabled = locked;
  $('attach').disabled = locked || pendingFiles > 0;
  $('talk').disabled = authLost || loggingOut || !workspace || dayTransition || pendingFiles > 0;
  $('choose-day').disabled = locked || pendingFiles > 0;
  $('day-picker').disabled = locked || pendingFiles > 0;
  for (const id of ['reset-view', 'flat-view', 'saved', 'close-panel'])
    $(id).disabled = authLost || loggingOut || !workspace || dayTransition;
  $('refresh').disabled = authLost || loggingOut || dayTransition;
  $('recovery').disabled = authLost || !workspace;
  $('logout').disabled = authLost || loggingOut;
  $('stage').inert = authLost || loggingOut || dayTransition;
  $('inspector').inert = authLost || loggingOut || dayTransition;
}
const element = (tag, className, text) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
};
const proposalFor = (raw) =>
  raw.trim()
    ? parseUtterance(raw, workspace.day)
    : {
        raw,
        title: 'An empty thought',
        symbols: [],
        direction: null,
        entry_zone: null,
        invalidation: null,
        warnings: ['Add a thought before preparing a draft.'],
      };
function toast(text) {
  $('toast').textContent = text;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('toast').hidden = true), 5500);
}
function recoverySnapshot() {
  if (!workspace) return null;
  const lines = [
    'XIV private desk — text recovery',
    'Workspace date: ' + workspace.day,
    'Unconfirmed drafts only. This file does not confirm a trade, source or order.',
    '',
    'UNSENT CAPTURE (may include interim voice text)',
    $('capture').value || workspace.state.capture || '',
    '',
  ];
  workspace.state.cards.forEach((card, index) =>
    lines.push('THOUGHT ' + (index + 1), card.raw, ''),
  );
  return { filename: 'xiv-desk-' + workspace.day + '-recovery.txt', text: lines.join('\n') };
}
function downloadRecovery(snapshot = recoverySnapshot()) {
  if (!snapshot) return;
  const url = URL.createObjectURL(new Blob([snapshot.text], { type: 'text/plain;charset=utf-8' }));
  const link = element('a');
  link.href = url;
  link.download = snapshot.filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function parentMessage(type, detail = {}) {
  if (window.parent !== window) window.parent.postMessage({ type, ...detail }, location.origin);
}
function loseAuthentication(status) {
  if (authLost) return;
  const recovery = recoverySnapshot();
  authLost = true;
  blocked = true;
  epoch++;
  dayRequest++;
  clearTimeout(saveTimer);
  clearTimeout(toastTimer);
  if (recognition) {
    const session = recognition;
    recognition = null;
    finishVoice = null;
    try {
      session.abort();
    } catch (error) {}
  }
  workspace = null;
  goldView = null;
  bootstrap = null;
  selected = null;
  $('capture').value = '';
  $('nodes').replaceChildren();
  $('panel-content').replaceChildren();
  $('inspector').hidden = true;
  $('toast').hidden = true;
  if ($('voice-dialog').open) $('voice-dialog').close();
  syncCaptureControls();
  $('save-status').textContent = 'Sign in required';
  const cover = element('section', 'auth-cover');
  cover.append(
    element('h2', '', 'Your private desk is closed.'),
    element(
      'p',
      '',
      status === 403
        ? 'This account does not have owner access.'
        : 'Your session ended. Sign in again to continue.',
    ),
  );
  if (recovery) {
    const button = element('button', 'primary', 'Download text recovery');
    button.onclick = () => downloadRecovery(recovery);
    cover.append(button);
  }
  const link = element('a', '', 'Return to sign in');
  link.href = '/desk';
  link.target = '_top';
  cover.append(link);
  document.body.append(cover);
  parentMessage('xiv-desk-authlost', { status, recovery });
}
async function api(path, body) {
  if (authLost) throw new Error('Sign in again to use the private desk.');
  const url = '/api/desk/' + path.replace(/^\/api\//, '');
  const response = await fetch(url, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    redirect: 'error',
    headers: {
      'X-XIV-Desk': '1',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (authLost) throw new Error('The private session is closed.');
  if (response.status === 401 || response.status === 403) {
    loseAuthentication(response.status);
    throw new Error('Your session ended or owner access is unavailable.');
  }
  let value;
  try {
    value = await response.json();
  } catch (error) {
    throw new Error(
      'The online desk returned an unreadable response. Your current text is preserved.',
    );
  }
  if (authLost) throw new Error('The private session is closed.');
  if (!response.ok) {
    const error = new Error(
      response.status === 409
        ? 'A newer version is saved online. Download recovery before refreshing.'
        : response.status === 503
          ? 'The private online connection is unavailable. Your current text is preserved.'
          : value.error || 'The desk could not complete that action.',
    );
    error.status = response.status;
    throw error;
  }
  return value;
}
function dirty() {
  change++;
  $('save-status').textContent = 'Saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => flush().catch(showError), 450);
}
function showError(error) {
  if (authLost) return;
  $('save-status').textContent = 'Not saved';
  $('save-status').title = error.message;
  $('recovery').classList.add('needs-recovery');
  toast(error.message + ' Use Recovery to download your current text.');
}
async function flush() {
  if (authLost) throw new Error('Sign in again to use the private desk.');
  if (blocked)
    throw new Error('Saving is paused. Download Recovery before loading the saved online version.');
  if (saving) return saving;
  const owner = workspace;
  saving = (async () => {
    while (savedChange < change) {
      const current = change;
      const state = structuredClone(owner.state);
      try {
        const result = await api('/api/save', { day: owner.day, revision: owner.revision, state });
        if (authLost || workspace !== owner) throw new Error('The private workspace changed.');
        owner.revision = result.revision;
        savedChange = current;
      } catch (error) {
        blocked = true;
        throw error;
      }
    }
    $('save-status').textContent = 'Saved online';
    $('recovery').classList.remove('needs-recovery');
  })().finally(() => (saving = null));
  return saving;
}
const responsiveScale = () =>
  Math.min(1, Math.max(0.32, innerWidth / 1150), Math.max(0.32, (innerHeight - 240) / 560));
function applyCamera() {
  const c = workspace.state.camera;
  $('scene').style.transform =
    `rotateX(${flat ? 0 : c.rx}deg) rotateY(${flat ? 0 : c.ry}deg) scale(${c.zoom * responsiveScale()})`;
}
function cardPosition(id) {
  return roles[id]
    ? workspace.state.layout[id]
    : workspace.state.cards.find((c) => c.id === id)?.position;
}
function moveNode(node, id) {
  const p = cardPosition(id);
  node.style.transform = `translate3d(${p[0]}px,${p[1]}px,${p[2]}px)`;
  node.dataset.position = p.join(',');
}
function renderNodes() {
  $('nodes').replaceChildren();
  for (const [id, role] of Object.entries(roles)) {
    const node = element('article', 'node ' + id);
    node.dataset.node = id;
    node.tabIndex = 0;
    node.setAttribute('aria-label', role.title + ' movable card');
    const top = element('div', 'top');
    top.append(element('span', 'number', role.n + ' / ' + role.tag), element('span', 'orb'));
    node.append(top, element('h2', '', role.title), element('p', '', role.body));
    const button = element('button', '', role.action);
    button.onclick = () => (id === 'analyst' ? focusCapture() : openHistory(id));
    node.append(button);
    installNode(node, id);
    $('nodes').append(node);
  }
  for (const card of workspace.state.cards) {
    const proposal = proposalFor(card.raw);
    const node = element('article', 'node thought' + (selected === card.id ? ' selected' : ''));
    node.dataset.node = card.id;
    node.tabIndex = 0;
    node.setAttribute('aria-label', 'Thought: ' + proposal.title);
    const top = element('div', 'top');
    top.append(
      element('span', 'draft-tag', 'DRAFT'),
      element(
        'span',
        '',
        card.source === 'voice' ? 'VOICE' : card.source === 'drop' ? 'DROPPED' : 'CAPTURED',
      ),
    );
    node.append(
      top,
      element('h2', '', proposal.title),
      element('p', '', (proposal.symbols.join(' · ') || 'Unsorted thought') + '  ↗'),
    );
    installNode(node, card.id);
    $('nodes').append(node);
  }
  $('thought-count').textContent =
    workspace.state.cards.length + ' thought' + (workspace.state.cards.length === 1 ? '' : 's');
  applyCamera();
}
function installNode(node, id) {
  moveNode(node, id);
  let drag = null;
  node.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button') || event.button !== 0) return;
    event.stopPropagation();
    drag = { x: event.clientX, y: event.clientY, position: [...cardPosition(id)], moved: false };
    node.setPointerCapture(event.pointerId);
  });
  node.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const factor = workspace.state.camera.zoom * responsiveScale();
    const dx = (event.clientX - drag.x) / factor,
      dy = (event.clientY - drag.y) / factor;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    const p = cardPosition(id);
    p[0] = clamp(drag.position[0] + dx, -1400, 1400);
    p[1] = clamp(drag.position[1] + dy, -1000, 1000);
    moveNode(node, id);
  });
  node.addEventListener('pointerup', () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (moved) dirty();
    else if (!roles[id]) openThought(id);
  });
  node.addEventListener('pointercancel', () => {
    if (drag) {
      drag = null;
      dirty();
    }
  });
  node.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const p = cardPosition(id);
      p[2] = clamp(p[2] - event.deltaY * 0.35, -400, 350);
      moveNode(node, id);
      dirty();
    },
    { passive: false },
  );
  node.addEventListener('keydown', (event) => {
    if (event.target !== node) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      roles[id] ? (id === 'analyst' ? focusCapture() : openHistory(id)) : openThought(id);
      return;
    }
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const p = cardPosition(id);
    const axis = event.altKey
      ? 2
      : event.key.includes('Left') || event.key.includes('Right')
        ? 0
        : 1;
    const delta = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -20 : 20;
    p[axis] = clamp(p[axis] + delta, axis === 2 ? -400 : -1200, axis === 2 ? 350 : 1200);
    moveNode(node, id);
    dirty();
  });
}
let orbit = null;
$('stage').addEventListener('pointerdown', (event) => {
  if (event.target.closest('.node,button') || event.button !== 0 || !workspace) return;
  orbit = {
    x: event.clientX,
    y: event.clientY,
    rx: workspace.state.camera.rx,
    ry: workspace.state.camera.ry,
  };
  $('stage').setPointerCapture(event.pointerId);
});
$('stage').addEventListener('pointermove', (event) => {
  if (!orbit) return;
  workspace.state.camera.rx = clamp(orbit.rx - (event.clientY - orbit.y) * 0.12, -30, 30);
  workspace.state.camera.ry = clamp(orbit.ry + (event.clientX - orbit.x) * 0.12, -30, 30);
  flat = false;
  applyCamera();
});
$('stage').addEventListener('pointerup', () => {
  if (orbit) {
    orbit = null;
    dirty();
  }
});
$('stage').addEventListener('pointercancel', () => {
  if (orbit) {
    orbit = null;
    dirty();
  }
});
$('reset-view').onclick = () => {
  if (!workspace || dayTransition) return;
  workspace.state.camera = { rx: -6, ry: -9, zoom: 1 };
  workspace.state.layout = structuredClone({
    analyst: [-370, 25, 20],
    quant: [330, -65, -80],
    coach: [210, 160, 40],
  });
  workspace.state.cards.forEach((c, i) => (c.position = thoughtPosition(i)));
  flat = false;
  renderNodes();
  dirty();
};
document.querySelector('.wordmark').onclick = (event) => {
  event.preventDefault();
  $('reset-view').click();
};
$('flat-view').onclick = () => {
  flat = !flat;
  $('flat-view').setAttribute('aria-pressed', String(flat));
  applyCamera();
};
addEventListener('resize', () => workspace && applyCamera());
function focusCapture() {
  $('capture').focus();
}
function panel(label) {
  epoch++;
  $('panel-label').textContent = label;
  $('panel-content').replaceChildren();
  $('inspector').hidden = false;
  return { content: $('panel-content'), generation: epoch };
}
$('close-panel').onclick = () => {
  epoch++;
  selected = null;
  $('inspector').hidden = true;
  renderNodes();
};
function openThought(id) {
  const card = workspace.state.cards.find((c) => c.id === id);
  if (!card) return;
  selected = id;
  renderNodes();
  const { content } = panel('YOUR THOUGHT · DRAFT');
  let proposal = proposalFor(card.raw);
  content.append(element('h2', '', 'What XIV heard.'));
  const area = element('textarea');
  area.value = card.raw;
  area.maxLength = 20000;
  area.setAttribute('aria-label', 'Edit captured thought');
  content.append(area);
  const chips = element('div', 'chips');
  const warnings = element('p', 'warning');
  const note = element(
    'p',
    'quiet',
    'Thoughts save to your private online workspace. This parser makes suggestions; it does not research companies.',
  );
  content.append(chips, warnings, note);
  function details() {
    proposal = proposalFor(card.raw);
    chips.replaceChildren();
    for (const item of [
      ...proposal.symbols,
      proposal.direction,
      proposal.entry_zone && 'Entry ' + proposal.entry_zone,
      proposal.invalidation && 'Invalidation ' + proposal.invalidation,
    ].filter(Boolean))
      chips.append(element('span', 'chip', item));
    warnings.textContent = proposal.warnings.join(' ');
  }
  details();
  area.oninput = () => {
    card.raw = area.value;
    epoch++;
    details();
    dirty();
    const node = [...document.querySelectorAll('.thought')].find((n) => n.dataset.node === id);
    if (node) {
      node.querySelector('h2').textContent = proposal.title;
      node.setAttribute('aria-label', 'Thought: ' + proposal.title);
    }
  };
  const button = element('button', 'primary wide', 'Confirm & draft');
  content.append(button);
  content.append(
    element('p', 'quiet', 'Confirms this preparation draft only. Never a trade or an order.'),
  );
  button.onclick = async () => {
    if (dayTransition) return;
    button.disabled = true;
    const requestEpoch = epoch,
      owner = workspace,
      raw = card.raw;
    try {
      if (!raw.trim()) throw new Error('Keep a thought in this card.');
      await flush();
      if (workspace !== owner || dayTransition || epoch !== requestEpoch || card.raw !== raw) {
        toast('The thought or day changed. Confirm the current draft when ready.');
        return;
      }
      const input = buildDraftInput({
        ...parseUtterance(raw, owner.day),
        needs_confirmation: false,
      });
      const result = await api('/api/draft', {
        day: owner.day,
        revision: owner.revision,
        card: id,
        confirmed: true,
        input,
      });
      if (epoch === requestEpoch && workspace === owner && !dayTransition) showReport(result);
      else toast('The earlier draft was saved separately. Your current thought stays here.');
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
    }
  };
}
function showReport(result) {
  if (authLost) return;
  const { content } = panel('SAVED · ONLINE REPORT');
  content.append(element('h2', '', 'A clearer thought.'), element('pre', 'report', result.display));
  $('save-status').textContent = 'Report saved online';
}
function addThought(raw, source = 'typed', filename = null, { clearCapture = false } = {}) {
  if (authLost || loggingOut || !workspace || dayTransition || recognition) return false;
  raw = String(raw);
  if (!raw.trim()) return false;
  if (raw.length > 20000 || workspace.state.cards.length >= 80) {
    toast('Keep each thought under 20,000 characters; up to 80 per day.');
    return false;
  }
  const index = workspace.state.cards.length;
  const card = { id: crypto.randomUUID(), raw, source, filename, position: thoughtPosition(index) };
  workspace.state.cards.push(card);
  if (clearCapture) {
    workspace.state.capture = '';
    $('capture').value = '';
    captureSource = 'typed';
  }
  selected = card.id;
  renderNodes();
  dirty();
  toast('Thought captured · still a draft.');
  return true;
}
$('add').onclick = () => {
  addThought($('capture').value, captureSource, null, { clearCapture: true });
};
$('capture').maxLength = 20000;
$('capture').addEventListener('input', () => {
  if (!workspace || dayTransition || recognition) return;
  if ($('capture').value.length > 20000) {
    $('capture').value = workspace.state.capture;
    toast('Keep the capture under 20,000 characters.');
    return;
  }
  workspace.state.capture = $('capture').value;
  captureSource = 'typed';
  dirty();
});
$('capture').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    $('add').click();
  }
});
addEventListener('beforeunload', (event) => {
  if (savedChange < change || recognition || pendingFiles || dayTransition) {
    event.preventDefault();
    event.returnValue = '';
  }
});

function openVoice() {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      finishVoice?.(true);
      toast('Voice stopped. The text you had before recording is preserved.');
    }
    return;
  }
  if (!workspace || dayTransition || pendingFiles) return;
  const available = supportsSpeechRecognition(window);
  $('voice-info').textContent = available
    ? 'Your browser may send audio to its speech service. XIV saves only the transcript. Recording starts after you choose Start and allow the microphone.'
    : 'This browser has no speech recognizer. Focus the thought box and press Windows + H to use Windows voice typing. XIV will receive the text you dictate.';
  $('voice-start').textContent = available ? 'Start voice input' : 'Focus thought box';
  $('voice-dialog').showModal();
}
$('talk').onclick = openVoice;
$('voice-cancel').onclick = () => $('voice-dialog').close();
$('voice-start').onclick = () => {
  $('voice-dialog').close();
  if (!workspace || dayTransition || recognition || pendingFiles) return;
  if (!supportsSpeechRecognition(window)) {
    focusCapture();
    toast('Press Windows + H, then speak.');
    return;
  }
  const owner = workspace,
    before = $('capture').value,
    beforeSource = captureSource;
  let session,
    finalText = '';
  const append = (text) => before + (before && !/\s$/.test(before) ? ' ' : '') + text;
  const finish = (discard = false) => {
    if (recognition !== session) return;
    recognition = null;
    finishVoice = null;
    $('talk').classList.remove('listening');
    $('talk-label').textContent = 'Talk';
    $('capture-hint').textContent = 'Review the words, then add your thought.';
    if (workspace === owner && !dayTransition) {
      const text = !discard && finalText.trim() ? append(finalText.trim()) : before;
      $('capture').value = text;
      captureSource = text === before ? beforeSource : 'voice';
      if (owner.state.capture !== text) {
        owner.state.capture = text;
        dirty();
      }
    }
    syncCaptureControls();
  };
  try {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    session = new Recognition();
    recognition = session;
    finishVoice = finish;
    session.lang = 'en-US';
    session.interimResults = true;
    session.continuous = false;
    syncCaptureControls();
    $('capture-hint').textContent = 'Starting voice input…';
    session.onstart = () => {
      if (recognition !== session) return;
      $('talk').classList.add('listening');
      $('talk-label').textContent = 'Stop';
      $('capture-hint').textContent = 'Listening…';
    };
    session.onresult = (event) => {
      if (recognition !== session || workspace !== owner || dayTransition) return;
      const finals = [],
        interims = [];
      for (let i = 0; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        (event.results[i].isFinal ? finals : interims).push(segment);
      }
      const candidate = append([...finals, ...interims].join(' ').trim());
      if (candidate.length > 20000) {
        finish(true);
        try {
          session.abort();
        } catch (error) {}
        toast(
          'Voice capture exceeded 20,000 characters. Your earlier text is preserved; try a shorter thought.',
        );
        return;
      }
      finalText = finals.join(' ');
      $('capture').value = candidate;
    };
    session.onerror = (event) => {
      if (recognition !== session) return;
      finish(true);
      try {
        session.abort();
      } catch (error) {}
      toast(
        'Voice unavailable: ' +
          event.error +
          '. Your earlier text is preserved. You can use Windows + H.',
      );
    };
    session.onend = () => finish();
    session.start();
  } catch (error) {
    if (recognition === session) finish(true);
    else syncCaptureControls();
    toast(
      'Voice could not start. Your earlier text is preserved. Use Windows + H in the thought box.',
    );
  }
};
let dragDepth = 0;
addEventListener('dragenter', (event) => {
  if (event.dataTransfer?.types.includes('Files')) {
    event.preventDefault();
    dragDepth++;
    $('stage').classList.add('drag-file');
  }
});
addEventListener('dragover', (event) => {
  if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
});
addEventListener('dragleave', () => {
  if (--dragDepth <= 0) {
    dragDepth = 0;
    $('stage').classList.remove('drag-file');
  }
});
async function readNotes(files) {
  if (!workspace || dayTransition || recognition) {
    toast('Finish voice input or the day change before importing notes.');
    return;
  }
  const owner = workspace,
    request = dayRequest;
  pendingFiles++;
  syncCaptureControls();
  try {
    for (const file of files) {
      if (!/\.(txt|md|json)$/i.test(file.name) || file.size > 20000) {
        toast(
          'Drop a text, Markdown or JSON note under 20 KB. Image understanding is not connected.',
        );
        continue;
      }
      let raw;
      try {
        raw = await file.text();
      } catch (error) {
        toast('That note could not be read. Your current capture is preserved.');
        continue;
      }
      if (workspace !== owner || dayTransition || dayRequest !== request) {
        toast(
          'The day changed; the pending file was not added. Drop it again on the intended day.',
        );
        return;
      }
      addThought(raw, 'drop', file.name);
    }
  } finally {
    pendingFiles--;
    syncCaptureControls();
  }
}
addEventListener('drop', async (event) => {
  event.preventDefault();
  dragDepth = 0;
  $('stage').classList.remove('drag-file');
  await readNotes([...event.dataTransfer.files]);
});
$('attach').onclick = () => {
  if (!dayTransition && !recognition && !pendingFiles) $('note-file').click();
};
$('note-file').onchange = async () => {
  try {
    await readNotes([...$('note-file').files]);
  } finally {
    $('note-file').value = '';
  }
};

function openHistory(role) {
  if (authLost) return;
  const { content } = panel(role === 'coach' ? 'JOURNAL COACH' : 'QUANT AGENT');
  content.append(
    element('h2', '', 'Historical evidence is not online.'),
    element(
      'p',
      '',
      'Gold history and per-lot review are not connected to this website. Your desktop files are not fetched or uploaded here.',
    ),
    element(
      'p',
      'warning',
      'No performance, comparable setups or historical trade labels are inferred. You can still capture a thought and prepare a separate draft.',
    ),
  );
  goldView = null;
}
$('saved').onclick = async () => {
  const { content, generation } = panel('SAVED REPORTS');
  content.append(element('h2', '', 'Your working record.'));
  try {
    const reports = await api('/api/reports');
    if (epoch !== generation) return;
    if (!reports.length)
      content.append(
        element('p', '', 'No confirmed reports yet. Your thought cards save automatically.'),
      );
    for (const report of reports) {
      const button = element(
        'button',
        'saved-choice',
        report.role + ' · ' + new Date(report.at).toLocaleString(),
      );
      button.onclick = async () => {
        const p = panel('SAVED SNAPSHOT');
        try {
          const result = await api('/api/report/' + report.id);
          if (epoch === p.generation) p.content.append(element('pre', 'report', result.display));
        } catch (error) {
          toast(error.message);
        }
      };
      content.append(button);
    }
  } catch (error) {
    toast(error.message);
  }
};
$('choose-day').onclick = () => {
  $('day-picker').hidden = !$('day-picker').hidden;
  if (!$('day-picker').hidden) $('day-picker').focus();
};
$('day-picker').onchange = async () => {
  try {
    await openDay($('day-picker').value);
  } catch (error) {
    showError(error);
    if (workspace) $('day-picker').value = workspace.day;
  }
};
async function openDay(day, { discardUnsaved = false } = {}) {
  if (authLost || loggingOut) throw new Error('Sign in again to use the private desk.');
  if (recognition || pendingFiles || dayTransition)
    throw new Error('Finish voice input, file import or the current day change first.');
  dayTransition = true;
  dayRequest++;
  epoch++;
  orbit = null;
  syncCaptureControls();
  try {
    if (workspace && !discardUnsaved) await flush();
    else if (saving) await saving.catch(() => {});
    const value = await api('/api/state?day=' + encodeURIComponent(day));
    if (authLost) return;
    workspace = value;
    change = savedChange = 0;
    blocked = false;
    selected = null;
    epoch++;
    $('inspector').hidden = true;
    $('capture').value = value.state.capture;
    captureSource = 'typed';
    $('day-picker').value = day;
    const when = new Date(day + 'T12:00:00-04:00');
    $('day-title').replaceChildren(
      document.createTextNode(
        'Trading ' +
          when.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' }),
      ),
      element('span', '', '.'),
    );
    $('day-date').textContent = when.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    });
    $('save-status').textContent = value.revision ? 'Saved online' : 'Ready online';
    $('recovery').classList.remove('needs-recovery');
    renderNodes();
  } finally {
    dayTransition = false;
    syncCaptureControls();
  }
}
async function start() {
  try {
    bootstrap = await api('/api/bootstrap');
    await openDay(bootstrap.today);
  } catch (error) {
    if (authLost) return;
    $('save-status').textContent = 'Connection unavailable';
    $('capture').disabled = true;
    $('add').disabled = true;
    $('talk').disabled = true;
    toast(error.message);
  }
}
$('recovery').onclick = () => downloadRecovery();
$('refresh').onclick = async () => {
  if (authLost) return;
  if (recognition || pendingFiles || dayTransition) {
    toast('Finish voice input, file import or the day change first.');
    return;
  }
  if (!workspace) {
    await start();
    return;
  }
  const discardUnsaved = blocked;
  if (
    discardUnsaved &&
    !window.confirm(
      'Saving is paused. Cancel to download Recovery first, or OK to discard this window’s edits and load the saved online version of this same day.',
    )
  )
    return;
  try {
    await openDay(workspace.day, { discardUnsaved });
    toast('Reloaded the saved online version of this day.');
  } catch (error) {
    showError(error);
  }
};
$('logout').onclick = async () => {
  if (authLost || loggingOut) return;
  if (recognition || pendingFiles || dayTransition) {
    toast('Finish voice input, file import or the day change before logging out.');
    return;
  }
  loggingOut = true;
  syncCaptureControls();
  let recovery = null;
  try {
    if (workspace) await flush();
  } catch (error) {
    if (authLost) return;
    recovery = recoverySnapshot();
    if (
      !window.confirm(
        'Some text could not be saved online. Log out and keep a text-recovery download on the sign-in screen?',
      )
    ) {
      loggingOut = false;
      syncCaptureControls();
      return;
    }
  }
  parentMessage('xiv-desk-logout', { recovery });
  if (window.parent === window) {
    try {
      await api('/api/logout', {});
    } catch (error) {
      if (!authLost) {
        loggingOut = false;
        syncCaptureControls();
        showError(error);
      }
      return;
    }
    location.replace('/desk');
  }
};
syncCaptureControls();
start();

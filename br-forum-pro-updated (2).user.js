// ==UserScript==
// @name         BR Forum — панель куратора (Pro)
// @match        https://forum.blackrussia.online/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* ================= КОНФИГ ================= */

  const SECTIONS = [
    { name: 'Жалобы на игроков', icon: '⚖', color: '#e74c3c', match: /жалоб/i },
    { name: 'РП биографии',      icon: '📖', color: '#8e44ad', match: /биограф/i },
    { name: 'РП ситуации',       icon: '🎭', color: '#e67e22', match: /ситуац/i },
  ];

  const SERVER_CODES = [
    'RED', 'GREEN', 'BLUE', 'YELLOW', 'ORANGE', 'PURPLE', 'LIME', 'PINK',
    'CHERRY', 'BLACK', 'INDIGO', 'WHITE', 'MAGENTA', 'CRIMSON', 'GOLD',
    'AZURE', 'PLATINUM', 'AQUA', 'GRAY', 'ICE', 'CHILLI', 'CHOCO',
    'MOSCOW', 'SPB', 'UFA', 'SOCHI', 'KAZAN', 'SAMARA', 'ROSTOV', 'ANAPA',
    'EKB', 'KRASNODAR', 'ARZAMAS', 'NOVOSIBIRSK', 'GROZNY', 'SARATOV',
    'OMSK', 'IRKUTSK', 'VOLGOGRAD', 'VORONEZH', 'BELGOROD', 'MAKHACHKALA',
    'VLADIKAVKAZ', 'VLADIVOSTOK', 'KALININGRAD', 'CHELYABINSK', 'KRASNOYARSK',
    'CHEBOKSARY', 'KHABAROVSK', 'PERM', 'TULA', 'RYAZAN', 'MURMANSK',
    'PENZA', 'KURSK', 'ARKHANGELSK', 'ORENBURG', 'KIROV', 'KEMEROVO', 'TYUMEN',
    'TOLYATTI', 'IVANOVO', 'STAVROPOL', 'SMOLENSK', 'PSKOV', 'BRYANSK',
    'OREL', 'YAROSLAVL', 'BARNAUL', 'LIPETSK', 'ULYANOVSK', 'YAKUTSK',
    'TAMBOV', 'BRATSK', 'ASTRAKHAN', 'CHITA', 'KOSTROMA', 'VLADIMIR',
    'KALUGA', 'N.NOVGOROD', 'TAGANROG', 'VOLOGDA', 'TVER', 'TOMSK',
    'IZHEVSK', 'SURGUT', 'PODOLSK', 'MAGADAN', 'CHEREPOVETS', 'NORILSK',
    'ASTANA', 'TASHKENT',
  ];

  const SERVER_URLS = {
    RED:     'https://forum.blackrussia.online/forums/Сервер-№1-red.18/',
    GREEN:   'https://forum.blackrussia.online/forums/Сервер-№2-green.19/',
    BLUE:    'https://forum.blackrussia.online/forums/Сервер-№3-blue.133/',
    MOSCOW:  'https://forum.blackrussia.online/forums/Сервер-№23-moscow.1055/',
    IRKUTSK: 'https://forum.blackrussia.online/forums/Сервер-№38-irkutsk.1713/',
    MAKHACHKALA: 'https://forum.blackrussia.online/forums/Сервер-№42-makhachkala.1885/',
  };

  const SERVERS = SERVER_CODES.map((code, i) => ({
    name: `Сервер №${i + 1} | ${code}`,
    code,
    url: SERVER_URLS[code] || '###',
  }));

  /* Пункты правил — заготовка, сверьте с актуальными правилами проекта */
  const RULES = [
    { code: '2.1', title: 'Нон РП',      desc: 'Запрещено поведение, нарушающее нормы Role Play процессов | Jail 30 минут' },
    { code: '2.2', title: 'Уход от РП',           desc: 'Запрещено целенаправленно уходить от RP (Role Play) процесса все различными способами | Jail 30 минут / Warn' },
    { code: '2.3', title: 'Нрп Драйв',             desc: 'Запрещён NonRP Drive — вождение любого транспортного средства в невозможных для него условиях, а также вождение в неправдоподобной манере | Jail 30 минут' },
    { code: '2.4', title: 'Помеха Игр. Проц',         desc: 'Запрещены действия, создающие существенные помехи для других игроков или препятствующие игровому процессу | Ban 3 дня' },
    { code: '2.5', title: 'Обман',           desc: 'Запрещены любые OOC-обманы и их попытки, а также любые IC-обманы с нарушением Role Play правил и логики | 15–30 дней ' },
    { code: '2.9', title: 'Слив склада',          desc: 'Запрещено сливать склад фракции / семьи путем взятия большого количества ресурсов или превышая допустимый лимит, установленный лидером | Ban 15 - 30 дней / PermBan' },
    { code: '2.13', title: 'ДБ/DB',         desc: 'Запрещен DB (DriveBy) — намеренное убийство / нанесение урона без веской IC причины на любом виде транспорта | Jail 60 минут' },
    { code: '2.19', title: 'ДМ/DM', desc: 'Запрещён DM (DeathMatch) — убийство или нанесение урона без веской IC-причины | Jail 90 минут' },
    { code: '2.22', title: 'Читы',           desc: 'Запрещено хранить / использовать / распространять стороннее программное обеспечение или иные средства, позволяющие получить преимущество над другими игроками, включая макросы (в том числе с эмуляторов) | Ban 15–30 дней / PermBan' },
    { code: '2.31', title: 'Реклама',      desc: 'Запрещено рекламировать на серверах любые проекты, серверы, сайты, сторонние Discord-серверы, YouTube-каналы и тому подобное | Ban 7 дней / PermBan' },
    { code: '2.38', title: 'Рас. лич. инфы',      desc: 'Запрещено распространять личную информацию игроков и их родственников | Ban 15 - 30 дней / PermBan + ЧС проекта' },
    { code: '2.40', title: 'Оск проекта',      desc: 'Запрещены совершенно любые деструктивные действия по отношению к проекту: неконструктивная критика, призывы покинуть проект, попытки нарушить развитие проекта или любые другие действия, способные привести к помехам в игровом процессе | Mute 300 минут / Ban 30 дней' },
    { code: '2.50', title: 'Арест в инте',      desc: ' Запрещены задержания, аресты, а также любые действия со стороны игроков, состоящих во фракциях, в интерьере аукциона, казино, а также во время системных мероприятий | Warn / Ban 10 дней' },
    { code: '2.53', title: 'Оск название',      desc: 'Запрещено устанавливать названия для внутриигровых ценностей (семей, бизнесов, компаний и др.) с использованием нецензурной лексики, оскорблений, слов политической или религиозной направленности | Принудительная смена названия семьи / Ban 1 день / При повторном нарушении – обнуление бизнеса' },
    { code: '2.55', title: 'Багоюз',      desc: 'Запрещается багоюз, связанный с анимацией в любых проявлениях | Jail 120 минут' },
    { code: '2.57', title: 'Долг',      desc: 'Запрещается брать в долг игровые ценности и не возвращать их | Ban 30 дней / permban' },
    { code: '3.02', title: 'Капс',      desc: 'Запрещено использование верхнего регистра (Caps Lock) при написании любого текста в любом чате | Mute 30 минут' },
    { code: '3.04', title: 'Оск род/Упом',      desc: 'Запрещено оскорбление или косвенное упоминание родных вне зависимости от чата (IC или OOC) | Mute 300 минут / Ban 7 дней' },
    { code: '3.08', title: 'Слив чата',      desc: 'Запрещены любые формы «слива» посредством использования глобальных чатов | PermBan' },
    { code: '3.14', title: 'Музыка',      desc: 'Запрещено включать музыку в Voice Chat | Mute 60 минут' },
  ];

  const VERDICT_SETS = {
    complaints: [
      { id: 'approved', label: 'Одобрено',       prefix: 'Одобрено',        close: true,  color: '#27c269', icon: '✓', needsRule: true },
      { id: 'denied',   label: 'Отказано',        prefix: 'Отказано',        close: true,  color: '#e74c3c', icon: '✕', needsRule: false },
      { id: 'waiting',  label: 'На рассмотрение', prefix: 'На рассмотрение', close: false, color: '#e6a700', icon: '⏳', needsRule: false },
      { id: 'tech',  label: 'Тех. специалисту', prefix: 'Тех. специалисту', close: false, color: '#3b82c4', icon: '🛠', needsRule: false },
      { id: 'admin',  label: 'Главному администратору', prefix: 'Главному администратору', close: false, color: '#e67e22', icon: '👑', needsRule: false },
    ],
    bios: [
      { id: 'approved', label: 'Одобрено',     prefix: 'Одобрено',        close: true,  color: '#27c269', icon: '✓', needsRule: false },
      { id: 'denied',   label: 'Отказано',      prefix: 'Отказано',        close: true,  color: '#e74c3c', icon: '✕', needsRule: false, needsComment: true },
      { id: 'rework',   label: 'На доработку',  prefix: 'На рассмотрение', close: false, color: '#e6a700', icon: '🛠', needsRule: false, needsComment: true },
      { id: 'plagiar',  label: 'Плагиат',       prefix: 'Отказано',        close: true,  color: '#e74c3c', icon: '🚫', needsRule: false },
      { id: 'notform',  label: 'Не по форме',   prefix: 'Отказано',        close: true,  color: '#e74c3c', icon: '📝', needsRule: false },
    ],
  };

  function buildVerdictText(kind, v, rule, comment) {
    const c = (comment || '').trim();
    const cBlock = c ? c + '\n\n' : '';
    if (kind === 'bios') {
      switch (v.id) {
        case 'approved': return `Здравствуйте!\n\nВаша биография рассмотрена и одобрена. Приятной игры на проекте!\n\n${cBlock}Тема закрыта.`;
        case 'denied':   return `Здравствуйте!\n\nБиография рассмотрена и отклонена.\n\nПричина: ${c}\n\nИсправьте недочёты и подайте биографию повторно. Тема закрыта.`;
        case 'rework':   return `Здравствуйте!\n\nБиография принята на доработку.\n\nЧто исправить: ${c}\n\nТему оставляем открытой — дождитесь повторной проверки.`;
        case 'plagiar':  return `Здравствуйте!\n\nВ биографии обнаружено заимствование чужой работы. Биография отклонена.\n\n${cBlock}Повторная подача — только с оригинальным текстом. Тема закрыта.`;
        case 'notform':  return `Здравствуйте!\n\nБиография оформлена не по форме раздела. Используйте шаблон из закреплённой темы.\n\n${cBlock}Тема закрыта до перезалива.`;
      }
      return '';
    }
    if (v.id === 'approved') return `Здравствуйте!\n\nЖалоба рассмотрена и одобрена.\n\nВиновному игроку выдано наказание по пункту ${rule.code} правил сервера — «${rule.title}».\n\n${cBlock}Благодарим за обращение — тема закрыта.`;
    if (v.id === 'denied')   return `Здравствуйте!\n\nЖалоба рассмотрена.\n\nНарушение не зафиксировано: действия игрока не противоречат правилам сервера.\n\n${cBlock}Тема закрыта.`;
    if (v.id === 'waiting')  return `Здравствуйте!\n\nЖалоба принята на рассмотрение. Срок рассмотрения — до 48 часов с момента подачи.\n\nПросьба не создавать дубликаты темы и не «апать» её.\n\n${cBlock}`;
    return '';
  }

  const WAITING_PATTERN = /ожидан|рассмотрени/i;
  const WARN_HOURS = 72;
  const STORE_KEY = 'br-server';

  const ROW_SELECTOR    = '.structItem--thread, .discussionListItem';
  const PREFIX_SELECTOR = '.labelPrefix, .label--prefix, .label';

  /* ================= ТЕМЫ САЙТА ================= */
  const THEMES = {
    midnight: {
      name: 'Midnight',
      desc: 'Глубокая сине-фиолетовая, спокойная',
      swatch: 'linear-gradient(135deg, #10131f, #4f46e5, #10b981)',
      css: `
        html, body {
          background: linear-gradient(180deg, #10131f 0%, #0c0e18 40%, #0a0b13 100%) !important;
          color: #e6e9f0 !important;
          -webkit-font-smoothing: antialiased;
        }
        .p-pageWrapper { background: transparent !important; }
        .p-body-inner::before {
          content: ''; position: absolute; top: -120px; left: 50%;
          width: 720px; height: 320px; transform: translateX(-50%);
          pointer-events: none; z-index: 0;
          background: radial-gradient(closest-side, rgba(99,102,241,.14), transparent);
          filter: blur(30px);
        }
        .p-body-inner, .p-content, .p-body { position: relative; z-index: 1; }
        h1, h2, h3, .p-title-value { color: #f2f4fa !important; font-weight: 700; }
        .p-header, .p-nav, .p-staffBar {
          background: linear-gradient(180deg, #141827, #10131e) !important;
          border-bottom: 1px solid rgba(129,140,248,.14) !important;
          box-shadow: 0 8px 24px -12px rgba(0,0,0,.6) !important;
        }
        .p-navEl a, .p-navEl-link {
          color: #aab2c5 !important;
          border-radius: 9px !important;
          font-weight: 600;
          transition: color .15s, background .15s;
        }
        .p-navEl a:hover { color: #fff !important; background: rgba(129,140,248,.12) !important; }
        .p-navEl.is-selected a {
          color: #fff !important;
          background: rgba(129,140,248,.22) !important;
          box-shadow: inset 0 0 0 1px rgba(129,140,248,.35);
        }
        .block-container {
          background: #141826 !important;
          border: 1px solid rgba(148,163,184,.09) !important;
          border-radius: 14px !important;
          box-shadow: 0 1px 0 rgba(255,255,255,.04) inset, 0 12px 32px -12px rgba(0,0,0,.55) !important;
          overflow: hidden;
        }
        .block-header, .block-minorHeader {
          background: rgba(129,140,248,.07) !important;
          color: #eef1f8 !important;
          border-bottom: 1px solid rgba(148,163,184,.09) !important;
          padding: 12px 16px !important;
          font-weight: 700;
        }
        .block-header a, .block-minorHeader a { color: #c7d2fe !important; }
        .structItem, .discussionListItem {
          background: transparent !important;
          border-bottom: 1px solid rgba(148,163,184,.06) !important;
          transition: background .14s;
        }
        .structItem:hover, .discussionListItem:hover { background: rgba(129,140,248,.07) !important; }
        .structItem-title, .structItem-title a { color: #edf0f7 !important; font-weight: 600; }
        .structItem-title a:hover { color: #c7d2fe !important; }
        .structItem-minor, .itemDetail, .structItemCell--meta { color: #8b93a7 !important; }
        .labelPrefix, .label { border-radius: 6px !important; font-weight: 700 !important; }
        .message--post, .message--primary {
          background: #141826 !important;
          border: 1px solid rgba(148,163,184,.08) !important;
          border-radius: 12px !important;
          margin-bottom: 10px;
          box-shadow: 0 8px 24px -12px rgba(0,0,0,.5) !important;
        }
        .message-cell--user {
          background: rgba(129,140,248,.05) !important;
          border-right: 1px solid rgba(148,163,184,.07) !important;
        }
        .username, .username a { color: #a5b4fc !important; font-weight: 700; }
        .message-userTitle {
          color: #c7d2fe !important;
          background: rgba(129,140,248,.13) !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 1px 8px;
          font-size: 11px;
        }
        .bbCodeBlock {
          background: #0e1120 !important;
          border: 1px solid rgba(148,163,184,.09) !important;
          border-left: 3px solid #6366f1 !important;
          border-radius: 10px !important;
        }
        .bbCodeBlock-title { color: #c7d2fe !important; background: rgba(129,140,248,.09) !important; }
        code, pre { background: #0e1120 !important; color: #dbeafe !important; border-radius: 8px; }
        .button {
          background: #4f46e5 !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 10px !important;
          color: #fff !important;
          font-weight: 700;
          box-shadow: 0 4px 14px -4px rgba(79,70,229,.5) !important;
          transition: background .15s, transform .12s, box-shadow .15s !important;
        }
        .button:hover {
          background: #6366f1 !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -4px rgba(99,102,241,.55) !important;
        }
        .button--primary, .button--cta {
          background: linear-gradient(180deg, #10b981, #059669) !important;
          box-shadow: 0 4px 14px -4px rgba(16,185,129,.5) !important;
        }
        .button--primary:hover, .button--cta:hover { background: linear-gradient(180deg, #34d399, #10b981) !important; }
        .button--link, .button--plain { background: rgba(148,163,184,.1) !important; box-shadow: none !important; }
        .input, input[type="text"], input[type="search"], input[type="password"],
        input[type="email"], input[type="number"], select, textarea {
          background: #0f1220 !important;
          border: 1px solid rgba(148,163,184,.14) !important;
          border-radius: 10px !important;
          color: #f1f3f9 !important;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus, textarea:focus, select:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.18) !important;
          outline: none !important;
        }
        .input::placeholder, textarea::placeholder { color: #565e73 !important; }
        .fr-element { color: #e6e9f0 !important; }
        .fr-box { border: 1px solid rgba(148,163,184,.12) !important; border-radius: 12px !important; overflow: hidden; }
        .fr-toolbar { background: #171b2b !important; border-color: rgba(148,163,184,.09) !important; }
        .fr-wrapper { background: #10131f !important; }
        .p-footer { background: #0c0e18 !important; border-top: 1px solid rgba(148,163,184,.08) !important; }
        .p-footer a { color: #8b93a7; }
        .p-footer a:hover { color: #c7d2fe; }
        .menu, .menu-content {
          background: #171b2b !important;
          border: 1px solid rgba(148,163,184,.12) !important;
          border-radius: 12px !important;
          box-shadow: 0 16px 40px -8px rgba(0,0,0,.65) !important;
          overflow: hidden;
        }
        .menu-linkRow { color: #dfe3ec !important; border-radius: 8px !important; margin: 2px 4px; }
        .menu-linkRow:hover { background: rgba(129,140,248,.14) !important; }
        .pageNav-page, .pageNav-jump {
          background: rgba(148,163,184,.08) !important;
          border: 1px solid rgba(148,163,184,.12) !important;
          border-radius: 8px !important;
          color: #dfe3ec !important;
        }
        .pageNav-page--current { background: #4f46e5 !important; border-color: transparent !important; color: #fff !important; }
        .avatar { border-radius: 10px !important; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,.22); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,.36); background-clip: padding-box; }
        ::selection { background: rgba(99,102,241,.4); color: #fff; }
      `,
    },
    aurora: {
      name: 'Aurora Glass',
      desc: 'Живой фон и стеклянные панели',
      swatch: 'linear-gradient(135deg, #07080d, #3b82c4, #a855f7, #27c28a)',
      css: `
        html, body {
          background: #07080d !important;
          color: #e8ebf2 !important;
        }
        .p-pageWrapper { background: transparent !important; }
        body::before {
          content: ''; position: fixed; inset: -20%; z-index: 0; pointer-events: none;
          background:
            radial-gradient(42vw 30vw at 18% 12%, rgba(59,130,196,.16), transparent 65%),
            radial-gradient(36vw 28vw at 85% 8%, rgba(168,85,247,.13), transparent 65%),
            radial-gradient(46vw 34vw at 70% 95%, rgba(39,194,150,.09), transparent 65%),
            radial-gradient(30vw 26vw at 8% 88%, rgba(217,70,239,.09), transparent 65%);
          filter: blur(18px);
          animation: br-aurora 26s ease-in-out infinite alternate;
        }
        @keyframes br-aurora {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(2%,-2%,0) scale(1.06); }
          100% { transform: translate3d(-2%,2%,0) scale(1); }
        }
        .p-body-inner, .p-content, .p-body { position: relative; z-index: 1; }
        h1, h2, h3, .block-header, .p-title-value {
          background: linear-gradient(92deg, #fff 20%, #9ecbff 70%, #d9b8ff 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .p-header, .p-nav {
          background: rgba(13,15,23,.72) !important;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border-bottom: 1px solid rgba(255,255,255,.07) !important;
        }
        .p-navEl a { color: #b9c2d4 !important; border-radius: 11px !important; font-weight: 600 !important; }
        .p-navEl a:hover { color: #fff !important; background: rgba(255,255,255,.09) !important; }
        .p-navEl.is-selected a {
          color: #fff !important;
          background: linear-gradient(135deg, rgba(59,130,196,.32), rgba(168,85,247,.22)) !important;
        }
        .block-container {
          background: linear-gradient(168deg, rgba(28,32,46,.78), rgba(17,19,28,.86)) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,.085) !important;
          border-radius: 18px !important;
          box-shadow: 0 16px 44px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.09) !important;
          overflow: hidden;
        }
        .block-header {
          background: linear-gradient(90deg, rgba(59,130,196,.18), rgba(168,85,247,.08) 70%, transparent) !important;
          color: #fff !important;
          border-bottom: 1px solid rgba(255,255,255,.07) !important;
        }
        .structItem:hover, .discussionListItem:hover { background: rgba(255,255,255,.045) !important; }
        .structItem-title, .structItem-title a { color: #edf0f6 !important; }
        .structItem-title a:hover { color: #8fc1f5 !important; }
        .message--post, .message--primary {
          background: linear-gradient(170deg, rgba(28,32,46,.72), rgba(18,20,30,.8)) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 16px !important;
          margin-bottom: 12px;
        }
        .username, .username a { color: #8fc1f5 !important; font-weight: 700; }
        .bbCodeBlock {
          background: rgba(6,8,13,.55) !important;
          border-left: 3px solid #3b82c4 !important;
          border-radius: 12px !important;
        }
        code, pre { background: rgba(0,0,0,.4) !important; color: #cfe3ff !important; }
        .button {
          background: linear-gradient(135deg, rgba(59,130,196,.95), rgba(99,102,241,.85)) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,.16) !important;
          border-radius: 12px !important;
          font-weight: 700;
        }
        .button:hover { filter: brightness(1.16); transform: translateY(-2px); }
        .button--primary, .button--cta { background: linear-gradient(135deg, #17994f, #2dd06d) !important; }
        .input, input[type="text"], input[type="password"], select, textarea {
          background: rgba(255,255,255,.055) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,.13) !important;
          border-radius: 11px !important;
        }
        .input:focus, textarea:focus, select:focus { border-color: #3b82c4 !important; box-shadow: 0 0 0 3px rgba(59,130,196,.2) !important; outline: none !important; }
        .fr-element { color: #e8ebf2 !important; }
        .fr-box { border: 1px solid rgba(255,255,255,.12) !important; border-radius: 14px !important; overflow: hidden; }
        .fr-toolbar { background: rgba(30,34,48,.96) !important; }
        .fr-wrapper { background: rgba(16,18,26,.92) !important; }
        .p-footer { background: rgba(9,11,17,.88) !important; }
        .menu, .menu-content { background: rgba(24,27,40,.96) !important; border-radius: 16px !important; }
        .pageNav-page--current {
          background: linear-gradient(135deg, rgba(59,130,196,.5), rgba(168,85,247,.35)) !important;
          color: #fff !important;
        }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.1)); border-radius: 8px; background-clip: padding-box; }
        ::selection { background: rgba(59,130,196,.5); color: #fff; }
      `,
    },
    paper: {
      name: 'Paper',
      desc: 'Светлая, чистая, дневная',
      swatch: 'linear-gradient(135deg, #f6f7fb, #e5e9f2, #6366f1)',
      css: `
        html, body {
          background: linear-gradient(180deg, #f7f8fb 0%, #f2f4f9 100%) !important;
          color: #23283a !important;
        }
        .p-pageWrapper { background: transparent !important; }
        h1, h2, h3, .p-title-value { color: #171b2b !important; }
        .p-header, .p-nav, .p-staffBar {
          background: rgba(255,255,255,.92) !important;
          border-bottom: 1px solid rgba(35,40,58,.08) !important;
          box-shadow: 0 4px 18px -8px rgba(35,40,58,.12) !important;
        }
        .p-navEl a, .p-navEl-link { color: #4a5165 !important; border-radius: 9px !important; }
        .p-navEl a:hover { color: #171b2b !important; background: rgba(99,102,241,.09) !important; }
        .p-navEl.is-selected a { color: #4f46e5 !important; background: rgba(99,102,241,.12) !important; }
        .block-container {
          background: #fff !important;
          border: 1px solid rgba(35,40,58,.08) !important;
          border-radius: 14px !important;
          box-shadow: 0 10px 28px -14px rgba(35,40,58,.18) !important;
          overflow: hidden;
        }
        .block-header, .block-minorHeader {
          background: rgba(99,102,241,.06) !important;
          color: #2a3044 !important;
          border-bottom: 1px solid rgba(35,40,58,.07) !important;
        }
        .structItem, .discussionListItem { border-bottom: 1px solid rgba(35,40,58,.06) !important; }
        .structItem:hover, .discussionListItem:hover { background: rgba(99,102,241,.05) !important; }
        .structItem-title a { color: #1e2334 !important; }
        .structItem-title a:hover { color: #4f46e5 !important; }
        .structItem-minor, .itemDetail { color: #6b7286 !important; }
        .message--post, .message--primary {
          background: #fff !important;
          border: 1px solid rgba(35,40,58,.07) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 22px -12px rgba(35,40,58,.15) !important;
        }
        .message-cell--user { background: rgba(99,102,241,.04) !important; }
        .username, .username a { color: #4f46e5 !important; }
        .bbCodeBlock { background: #f4f6fb !important; border-left: 3px solid #6366f1 !important; border-radius: 10px !important; }
        code, pre { background: #eef1f8 !important; color: #2a3550 !important; }
        .button {
          background: #4f46e5 !important;
          color: #fff !important;
          border: none !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 12px -4px rgba(79,70,229,.4) !important;
        }
        .button:hover { background: #6366f1 !important; transform: translateY(-1px); }
        .button--primary, .button--cta { background: #059669 !important; }
        .input, input[type="text"], input[type="password"], select, textarea {
          background: #fff !important;
          color: #23283a !important;
          border: 1px solid rgba(35,40,58,.14) !important;
          border-radius: 10px !important;
        }
        .input:focus, textarea:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.15) !important; outline: none !important; }
        .fr-element { color: #23283a !important; }
        .fr-toolbar { background: #fafbfe !important; }
        .fr-wrapper { background: #fff !important; }
        .p-footer { background: #fff !important; border-top: 1px solid rgba(35,40,58,.07) !important; }
        .menu, .menu-content {
          background: #fff !important;
          border-radius: 12px !important;
          box-shadow: 0 16px 40px -8px rgba(35,40,58,.25) !important;
        }
        .pageNav-page--current { background: #4f46e5 !important; color: #fff !important; }
        ::-webkit-scrollbar-thumb { background: rgba(35,40,58,.2); border-radius: 8px; background-clip: padding-box; }
        ::selection { background: rgba(99,102,241,.25); color: #171b2b; }
      `,
    },
  };

  const THEME_KEY = 'br-theme';
  const DEFAULT_THEME = 'midnight';

  function getThemeId() {
    try { return localStorage.getItem(THEME_KEY) || DEFAULT_THEME; }
    catch (e) { return DEFAULT_THEME; }
  }

  function setTheme(id) {
    try { localStorage.setItem(THEME_KEY, id); } catch (e) {}
    applyTheme();
    const t = THEMES[getThemeId()];
    toast('🎨 Тема: ' + (t ? t.name : 'стандартная'), 'info');
  }

  function applyTheme() {
    document.getElementById('br-theme-css')?.remove();
    const t = THEMES[getThemeId()];
    if (!t) return; /* 'off' — стандартный вид сайта */
    const style = document.createElement('style');
    style.id = 'br-theme-css';
    style.textContent = t.css;
    document.head.appendChild(style);
  }

  /* Меню выбора темы — открывается влево от вкладки */
  function openThemeMenu(anchorItem) {
    const existed = document.getElementById('br-theme-menu');
    if (existed) { existed.remove(); return; }

    const menu = document.createElement('div');
    menu.id = 'br-theme-menu';
    menu.classList.add('br-ui');

    const title = document.createElement('div');
    title.className = 'br-tm-title';
    title.textContent = '🎨 Тема сайта';

    const list = document.createElement('div');
    list.className = 'br-tm-list';

    const noneBtn = document.createElement('button');
    noneBtn.className = 'br-tm-item';
    noneBtn.innerHTML = `<span class="br-tm-swatch" style="background:linear-gradient(135deg,#2b3346,#141826)"></span>
      <span class="br-tm-info"><span class="br-tm-name">Стандартная</span>
      <span class="br-tm-desc">Вид сайта без изменений</span></span>`;
    if (getThemeId() === 'off') noneBtn.classList.add('br-tm--cur');
    noneBtn.onclick = () => { setTheme('off'); menu.remove(); };
    list.appendChild(noneBtn);

    Object.entries(THEMES).forEach(([id, t]) => {
      const b = document.createElement('button');
      b.className = 'br-tm-item';
      b.innerHTML = `<span class="br-tm-swatch" style="background:${t.swatch}"></span>
        <span class="br-tm-info"><span class="br-tm-name">${t.name}</span>
        <span class="br-tm-desc">${t.desc}</span></span>`;
      if (getThemeId() === id) b.classList.add('br-tm--cur');
      b.onclick = () => { setTheme(id); menu.remove(); };
      list.appendChild(b);
    });

    menu.append(title, list);
    document.body.appendChild(menu);

    /* Позиция: слева от вкладки «Тема» */
    if (anchorItem) {
      const tr = anchorItem.getBoundingClientRect();
      const mr = menu.getBoundingClientRect();
      const left = Math.max(10, tr.left - mr.width - 12);
      let top = tr.top + tr.height / 2 - mr.height / 2;
      top = Math.max(10, Math.min(top, window.innerHeight - mr.height - 10));
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
    } else {
      menu.style.right = '70px';
      menu.style.top = '120px';
    }

    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { menu.remove(); document.removeEventListener('keydown', esc); }
    });
    setTimeout(() => {
      document.addEventListener('click', function outside(e) {
        const tab = document.getElementById('br-theme-tab');
        if (!menu.contains(e.target) && !(tab && tab.contains(e.target))) {
          menu.remove();
          document.removeEventListener('click', outside);
        }
      });
    }, 0);
  }

  /* ================= СТИЛИ ИНТЕРФЕЙСА ================= */
  const css = `
    .br-ui { font-family: 'Segoe UI', Roboto, sans-serif; }

    /* ---------- Вкладка «Вердикт»: правый край ---------- */
    #br-vb-tab, #br-theme-tab {
      position: fixed; right: 0;
      z-index: 10005;
      display: flex; align-items: center; gap: 9px;
      padding: 13px 12px 13px 14px;
      border: 1px solid rgba(255,255,255,.16); border-right: none;
      border-radius: 16px 0 0 16px;
      color: #fff; cursor: pointer; font-family: inherit;
      backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      box-shadow: -4px 6px 24px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.18);
      transition: padding .22s cubic-bezier(.34,1.3,.64,1), box-shadow .22s, filter .2s;
    }
    #br-vb-tab { top: 50%; transform: translateY(-50%);
      background: linear-gradient(135deg, rgba(39,194,105,.28), rgba(20,24,34,.94));
    }
    /* Тема — ниже вердикта, отдельный «язычок» */
    #br-theme-tab { top: calc(50% + 64px); transform: translateY(-50%);
      background: linear-gradient(135deg, rgba(168,85,247,.3), rgba(20,24,34,.94));
    }
    #br-vb-tab:hover, #br-theme-tab:hover {
      padding-right: 20px;
      filter: brightness(1.14);
    }
    #br-vb-tab:hover { box-shadow: -6px 8px 30px rgba(0,0,0,.65), 0 0 22px rgba(39,194,105,.35), inset 0 1px 0 rgba(255,255,255,.2); }
    #br-theme-tab:hover { box-shadow: -6px 8px 30px rgba(0,0,0,.65), 0 0 22px rgba(168,85,247,.4), inset 0 1px 0 rgba(255,255,255,.2); }
    #br-vb-tab:active, #br-theme-tab:active { filter: brightness(.95); }
    #br-vb-tab-ico, #br-theme-tab-ico { font-size: 17px; line-height: 1; }
    #br-vb-tab-label, #br-theme-tab-label {
      writing-mode: vertical-rl; transform: rotate(180deg);
      font-size: 11px; font-weight: 800; letter-spacing: 2.2px;
      text-transform: uppercase; white-space: nowrap;
      opacity: 0; max-width: 0; overflow: hidden;
      transition: opacity .2s ease .08s, max-width .26s ease .05s;
    }
    #br-vb-tab:hover #br-vb-tab-label { opacity: 1; max-width: 80px; }
    #br-theme-tab:hover #br-theme-tab-label { opacity: 1; max-width: 80px; }
    #br-vb-tab::before, #br-theme-tab::before {
      content: ''; position: absolute; left: 8px; top: 16%; bottom: 16%;
      width: 3px; border-radius: 2px;
      opacity: .7; transition: opacity .2s;
    }
    #br-vb-tab::before {
      background: #27c269; box-shadow: 0 0 10px rgba(39,194,105,.8);
    }
    #br-theme-tab::before {
      background: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,.8);
    }
    #br-vb-tab:hover::before, #br-theme-tab:hover::before { opacity: 1; }

    /* ---------- Меню выбора темы ---------- */
    #br-theme-menu {
      position: fixed; z-index: 10002;
      width: 264px;
      background: linear-gradient(165deg, rgba(23,27,43,.97), rgba(16,19,30,.99));
      backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(148,163,184,.13);
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,.7);
      padding: 12px;
      animation: br-drop .22s cubic-bezier(.34,1.4,.64,1);
    }
    .br-tm-title {
      color: #fff; font-size: 12px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 1.2px;
      margin: 0 4px 10px;
    }
    .br-tm-list { display: flex; flex-direction: column; gap: 5px; }
    .br-tm-item {
      display: flex; align-items: center; gap: 11px;
      width: 100%; padding: 8px;
      background: transparent; border: 1.5px solid transparent; border-radius: 12px;
      color: #e8eaee; font-family: inherit; text-align: left; cursor: pointer;
      transition: background .14s, border-color .14s;
    }
    .br-tm-item:hover { background: rgba(255,255,255,.07); }
    .br-tm--cur { border-color: rgba(129,140,248,.5); background: rgba(129,140,248,.1); }
    .br-tm-swatch {
      flex: 0 0 38px; height: 38px; border-radius: 10px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 2px 8px rgba(0,0,0,.4);
    }
    .br-tm-info { display: flex; flex-direction: column; min-width: 0; }
    .br-tm-name { font-size: 13px; font-weight: 700; }
    .br-tm-desc { color: #8b93a7; font-size: 11px; margin-top: 1px; }

    /* ---------- Строитель вердикта: окно ---------- */
    #br-vb-overlay {
      position: fixed; inset: 0; z-index: 10010;
      display: flex; align-items: center; justify-content: center;
      background: rgba(8,10,16,.6);
      backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
      opacity: 0; pointer-events: none;
      transition: opacity .2s ease;
    }
    #br-vb-overlay.br-vb-overlay--open { opacity: 1 !important; pointer-events: auto !important; }

    #br-vb-modal {
      width: min(480px, 92vw); max-height: 86vh;
      display: flex; flex-direction: column; overflow: hidden;
      background: linear-gradient(170deg, #1d2130 0%, #14161f 100%);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 20px;
      box-shadow: 0 28px 70px rgba(0,0,0,.75);
      transform: translateY(14px) scale(.97);
      transition: transform .22s cubic-bezier(.34,1.4,.64,1);
    }
    #br-vb-overlay.br-vb-overlay--open #br-vb-modal { transform: none; }

    #br-vb-head {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 18px 13px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      background: linear-gradient(90deg, rgba(99,102,241,.18), transparent 60%, rgba(129,140,248,.12));
    }
    #br-vb-head-ico { font-size: 19px; }
    #br-vb-head-title { color: #fff; font-size: 15px; font-weight: 700; }
    #br-vb-head-sub { color: #8a8f9a; font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.4px; }
    #br-vb-close {
      background: none; border: none; color: #8a8f9a; font-size: 19px;
      cursor: pointer; padding: 4px 9px; border-radius: 9px; line-height: 1;
      transition: color .15s, background .15s;
    }
    #br-vb-close:hover { color: #fff; background: rgba(255,255,255,.1); }

    #br-vb-body { padding: 14px 18px 6px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
    #br-vb-body::-webkit-scrollbar { width: 6px; }
    #br-vb-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }

    .br-vb-stage { display: flex; flex-direction: column; gap: 8px; }
    .br-vb-stage-title {
      color: #8a8f9a; font-size: 10.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.4px;
    }
    .br-vb-stage-title b { color: #818cf8; }

    .br-vb-verdicts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .br-vb-verdict {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      padding: 12px 6px 10px;
      background: rgba(255,255,255,.045);
      border: 1.5px solid rgba(255,255,255,.1);
      border-radius: 13px;
      color: #e8eaee; font-family: inherit; font-size: 12px; font-weight: 600;
      cursor: pointer; text-align: center;
      transition: transform .15s, border-color .15s, background .15s, box-shadow .15s;
    }
    .br-vb-verdict:hover { transform: translateY(-2px); background: rgba(255,255,255,.08); }
    .br-vb-verdict-ico { font-size: 17px; }
    .br-vb-verdict--sel {
      border-color: var(--vc, #6366f1);
      background: color-mix(in srgb, var(--vc, #6366f1) 16%, transparent);
      box-shadow: 0 0 0 1px var(--vc, #6366f1), 0 6px 18px rgba(0,0,0,.35);
    }

    .br-vb-rules { display: flex; flex-direction: column; gap: 6px; max-height: 210px; overflow-y: auto; padding-right: 4px; }
    .br-vb-rules::-webkit-scrollbar { width: 5px; }
    .br-vb-rules::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }
    .br-vb-rule {
      display: flex; align-items: flex-start; gap: 10px;
      width: 100%; padding: 9px 11px;
      background: rgba(255,255,255,.035);
      border: 1.5px solid rgba(255,255,255,.09);
      border-radius: 11px;
      color: #e8eaee; font-family: inherit; text-align: left; cursor: pointer;
      transition: border-color .14s, background .14s;
    }
    .br-vb-rule:hover { background: rgba(255,255,255,.08); }
    .br-vb-rule--sel {
      border-color: var(--vc, #6366f1);
      background: color-mix(in srgb, var(--vc, #6366f1) 14%, transparent);
    }
    .br-vb-rule-code {
      flex: 0 0 auto; padding: 2px 8px; border-radius: 8px;
      background: var(--vc, #6366f1); color: #fff;
      font-size: 11px; font-weight: 800;
    }
    .br-vb-rule-name { font-size: 12.5px; font-weight: 700; }
    .br-vb-rule-desc { color: #9aa0ab; font-size: 11px; line-height: 1.45; margin-top: 1px; }
    .br-vb-rule-search {
      padding: 8px 12px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12); border-radius: 10px;
      color: #fff; font-size: 12.5px; outline: none; font-family: inherit;
    }
    .br-vb-rule-search:focus { border-color: #6366f1; }
    .br-vb-rule-search::placeholder { color: #6b7280; }

    .br-vb-comment {
      width: 100%; min-height: 62px; resize: vertical;
      padding: 9px 12px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.12); border-radius: 11px;
      color: #fff; font-size: 12.5px; line-height: 1.5; outline: none; font-family: inherit;
    }
    .br-vb-comment:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.16); }
    .br-vb-comment::placeholder { color: #6b7280; }

    #br-vb-preview {
      padding: 11px 13px;
      background: rgba(0,0,0,.28);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 11px;
      color: #c8ccd4; font-size: 12px; line-height: 1.55;
      white-space: pre-wrap; max-height: 150px; overflow-y: auto;
    }
    #br-vb-preview::-webkit-scrollbar { width: 5px; }
    #br-vb-preview::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }

    #br-vb-foot {
      display: flex; gap: 8px; padding: 12px 18px 16px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    .br-vb-act {
      flex: 1; padding: 10px 12px; border: none; border-radius: 11px;
      font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
      color: #fff; transition: filter .14s, transform .14s;
    }
    .br-vb-act:hover { filter: brightness(1.14); transform: translateY(-1px); }
    .br-vb-act:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    #br-vb-send { background: linear-gradient(135deg, #1f9d55, #27c269); }
    #br-vb-insert { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16); }

    /* ---------- Боковой док-рейл ---------- */
    #br-rail {
      position: fixed; left: 14px; top: 50%; transform: translateY(-50%);
      z-index: 10000;
      width: 58px;
      padding: 10px 8px;
      display: flex; flex-direction: column; gap: 4px;
      border-radius: 20px;
      background: linear-gradient(175deg, rgba(23,27,43,.94), rgba(16,19,30,.96));
      backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(148,163,184,.1);
      box-shadow: 0 14px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08);
      overflow: hidden;
      transition: width .28s cubic-bezier(.34,1.3,.64,1), box-shadow .28s;
    }
    #br-rail:hover {
      width: 212px;
      box-shadow: 0 18px 50px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.1);
    }

    #br-rail-logo {
      position: relative;
      display: flex; align-items: center; justify-content: center;
      height: 40px; margin-bottom: 2px; flex: 0 0 auto;
    }
    #br-rail-logo-ico { font-size: 20px; filter: drop-shadow(0 2px 6px rgba(0,0,0,.5)); }
    #br-rail-logo-name {
      white-space: nowrap; color: #fff; font-size: 12px; font-weight: 800;
      letter-spacing: 1.6px; text-transform: uppercase;
      margin-left: 10px;
      opacity: 0; max-width: 0; overflow: hidden;
      transition: opacity .2s ease .1s, max-width .25s ease .05s;
    }
    #br-rail:hover #br-rail-logo-name { opacity: 1; max-width: 140px; }
    #br-rail-logo-dot {
      position: absolute; top: 3px; right: 5px;
      width: 9px; height: 9px; border-radius: 50%;
      background: #6b7280; border: 2px solid #10131e;
      transition: background .25s, box-shadow .25s;
    }
    #br-rail-logo::after {
      content: ''; position: absolute; bottom: -4px; left: 14%; right: 14%;
      height: 10px; border-radius: 50%;
      background: var(--railc, #6366f1); filter: blur(10px); opacity: .45;
      transition: opacity .25s;
    }
    #br-rail:hover #br-rail-logo::after { opacity: .8; }

    .br-rail-sep {
      height: 1px; margin: 5px 6px; flex: 0 0 auto;
      background: linear-gradient(90deg, rgba(255,255,255,.14), rgba(255,255,255,.03));
    }

    .br-rail-item {
      position: relative;
      display: flex; align-items: center; gap: 11px;
      width: 100%; padding: 7px 6px;
      background: transparent; border: none; border-radius: 13px;
      color: #e8eaee; cursor: pointer; text-align: left;
      font-family: inherit; font-size: 13px; font-weight: 600;
      transition: background .15s, transform .15s;
      flex: 0 0 auto;
    }
    .br-rail-item:hover { background: rgba(255,255,255,.08); transform: translateX(2px); }
    .br-rail-ico {
      flex: 0 0 36px; height: 36px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: #fff;
      background: linear-gradient(140deg, var(--c, #3a3f4b), var(--c2, #23262e));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 3px 8px rgba(0,0,0,.4);
      transition: transform .18s;
    }
    .br-rail-item:hover .br-rail-ico { transform: scale(1.08); }
    .br-rail-label {
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      opacity: 0; max-width: 0;
      transition: opacity .2s ease .08s, max-width .28s ease .05s;
    }
    #br-rail:hover .br-rail-label { opacity: 1; max-width: 140px; }
    .br-rail-item--active::before {
      content: ''; position: absolute; left: -3px; top: 9px; bottom: 9px;
      width: 3px; border-radius: 0 3px 3px 0;
      background: var(--c, #fff);
      box-shadow: 0 0 8px var(--c, #fff);
    }
    .br-rail-item--off { opacity: .38; cursor: default; }
    .br-rail-item--off:hover { background: transparent; transform: none; }

    .br-rail-wait-num {
      position: absolute; top: 1px; right: 1px;
      min-width: 15px; height: 15px; border-radius: 8px;
      background: #e6a700; color: #14161e;
      font-size: 10px; font-weight: 800; line-height: 15px; text-align: center;
      padding: 0 3px; border: 2px solid #10131e;
      display: none;
    }
    .br-rail-wait-num--on { display: block; }

    #br-hint {
      white-space: nowrap; color: #9aa0ab; font-size: 11px;
      opacity: 0; max-width: 0; overflow: hidden;
      transition: opacity .2s ease .12s, max-width .28s ease .08s;
      padding: 4px 2px;
    }
    #br-rail:hover #br-hint { opacity: 1; max-width: 170px; }

    /* ---------- Список серверов ---------- */
    #br-server-drop {
      position: fixed; z-index: 10002;
      width: 252px; max-height: 400px;
      display: flex; flex-direction: column; overflow: hidden;
      background: linear-gradient(165deg, rgba(23,27,43,.96), rgba(16,19,30,.98));
      backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(148,163,184,.12);
      border-radius: 18px;
      box-shadow: 0 20px 50px rgba(0,0,0,.7);
      animation: br-drop .22s cubic-bezier(.34,1.4,.64,1);
    }
    @keyframes br-drop { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
    #br-server-search {
      margin: 12px 12px 8px; padding: 9px 12px;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.12); border-radius: 11px;
      color: #fff; font-size: 13px; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    #br-server-search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.18); }
    #br-server-search::placeholder { color: #6b7280; }
    #br-server-list { overflow-y: auto; padding: 0 10px 12px; }
    #br-server-list::-webkit-scrollbar { width: 6px; }
    #br-server-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }
    .br-srv {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 8px 10px; margin-bottom: 2px;
      background: transparent; border: none; border-radius: 10px;
      color: #dfe2e8; font-size: 13px; font-weight: 600; text-align: left;
      cursor: pointer; transition: background .12s, transform .12s;
    }
    .br-srv:hover { background: rgba(255,255,255,.1); transform: translateX(3px); }
    .br-srv--off { opacity: .38; cursor: default; }
    .br-srv--off:hover { background: transparent; transform: none; }
    .br-srv--current { background: rgba(39,194,105,.14); }
    .br-srv--current::after { content: '●'; margin-left: auto; color: #27c269; font-size: 11px; }
    .br-srv-dot {
      flex: 0 0 12px; height: 12px; border-radius: 50%;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.35);
    }
    .br-srv-empty { color: #6b7280; font-size: 12px; text-align: center; padding: 14px 0; }

    .br-toast {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #1f9d55; color: #fff; padding: 8px 18px; border-radius: 20px;
      font-size: 13px; z-index: 10003; box-shadow: 0 4px 14px rgba(0,0,0,.4);
      animation: br-fade 1.6s forwards;
    }
    .br-toast--warn { background: #c0392b; }
    .br-toast--info { background: #4f46e5; }
    @keyframes br-fade { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
    .br-age { display: inline-block; margin-left: 6px; padding: 1px 7px;
      border-radius: 10px; font-size: 11px; font-weight: 600; color: #fff; }
    .br-age--fresh { background: #1f9d55; }
    .br-age--mid   { background: #b7791f; }
    .br-age--old   { background: #c0392b; }
    .br-age--fail  { background: #7a1f16; }

    /* ---------- Быстрая проверка (РП биографии) ---------- */
    .br-qc {
      display: flex; flex-direction: column; gap: 8px;
      padding: 10px 12px 12px;
      border: 1px dashed rgba(129,140,248,.38);
      border-radius: 14px;
      background: rgba(99,102,241,.06);
    }
    .br-qc-title { color: #a5b4fc; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
    .br-qc-stats { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; color: #c3c9d6; font-size: 12px; }
    .br-qc-stats b { color: #fff; }
    .br-qc-dot { flex: 0 0 8px; width: 8px; height: 8px; border-radius: 50%; }
    .br-qc-dot--ok   { background: #27c269; box-shadow: 0 0 8px rgba(39,194,105,.8); }
    .br-qc-dot--warn { background: #e6a700; box-shadow: 0 0 8px rgba(230,167,0,.8); }
    .br-qc-dot--bad  { background: #e74c3c; box-shadow: 0 0 8px rgba(231,76,60,.8); }
    .br-qc-row { display: flex; gap: 7px; flex-wrap: wrap; }
    .br-qc-btn {
      flex: 1 1 auto; padding: 8px 10px; border-radius: 10px; cursor: pointer;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: #e8eaee; font: 600 12px 'Segoe UI', Roboto, sans-serif;
      transition: background .14s, transform .12s;
    }
    .br-qc-btn:hover:not(:disabled) { background: rgba(129,140,248,.18); transform: translateY(-1px); }
    .br-qc-btn:disabled { opacity: .55; cursor: progress; }
    .br-qc-out {
      background: rgba(0,0,0,.28);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 11px;
      padding: 10px 12px;
      font-size: 12px; line-height: 1.55; color: #d7dce6;
      max-height: 230px; overflow-y: auto;
    }
    .br-qc-badge { display: inline-block; padding: 2px 9px; border-radius: 8px; font-weight: 800; font-size: 11px; }
    .br-qc-badge--ok   { background: rgba(39,194,105,.18);  color: #5be49b; }
    .br-qc-badge--warn { background: rgba(230,167,0,.18);   color: #ffd35e; }
    .br-qc-badge--bad  { background: rgba(231,76,60,.2);    color: #ff8a7d; }
    .br-qc-item { padding: 6px 0; border-top: 1px solid rgba(255,255,255,.06); }
    .br-qc-item:first-child { border-top: none; padding-top: 0; }
    .br-qc-item a { color: #8fc1f5; text-decoration: none; }
    .br-qc-item a:hover { text-decoration: underline; }
    .br-qc-note { color: #8a8f9a; font-size: 11px; }
    .br-qc-ins {
      margin-top: 9px; padding: 7px 12px; border-radius: 9px; cursor: pointer;
      background: rgba(39,194,105,.16); border: 1px solid rgba(39,194,105,.4);
      color: #7ce8a8; font: 700 12px 'Segoe UI', Roboto, sans-serif;
      transition: background .14s;
    }
    .br-qc-ins:hover { background: rgba(39,194,105,.26); }
  `;

  function injectStyles() {
    if (document.getElementById('br-curator-css')) return;
    const style = document.createElement('style');
    style.id = 'br-curator-css';
    style.textContent = css;
    document.head.appendChild(style);
    applyTheme();
  }

  /* ================= УТИЛИТЫ ================= */
  function getThreadId() {
    const m = location.href.match(/threads\/[^.]+\.(\d+)/);
    if (m) return m[1];
    const input = document.querySelector('input[name="thread_id"]');
    return input ? input.value : null;
  }

  function toast(text, type) {
    const el = document.createElement('div');
    el.className = 'br-toast' + (type ? ' br-toast--' + type : '');
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  function getSavedServer() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function saveServer(srv) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(srv)); } catch (e) {}
  }

  function sectionsKey(code) { return STORE_KEY + '-sections-' + code; }
  function getSectionsCache(code) {
    try { return JSON.parse(localStorage.getItem(sectionsKey(code)) || '{}'); }
    catch (e) { return {}; }
  }
  function saveSectionsCache(code, map) {
    try { localStorage.setItem(sectionsKey(code), JSON.stringify(map)); } catch (e) {}
  }

  /* Автопоиск подразделов на странице сервера */
  async function resolveSections(srv) {
    const cached = getSectionsCache(srv.code);
    const missing = SECTIONS.some((s) => !cached[s.name]);
    if (!missing) return cached;

    try {
      const res = await fetch(srv.url, { credentials: 'same-origin' });
      if (!res.ok) return cached;
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const links = [...doc.querySelectorAll('a[href*="/forums/"]')];

      const map = {};
      SECTIONS.forEach((s) => {
        const found = links.find((a) => s.match.test((a.textContent || '').trim()));
        if (found) {
          try {
            map[s.name] = new URL(found.getAttribute('href'), location.origin).href;
          } catch (e) {}
        }
      });

      if (Object.keys(map).length) {
        saveSectionsCache(srv.code, map);
        return { ...cached, ...map };
      }
    } catch (e) {}

    return cached;
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function serverColor(code) {
    return `hsl(${hashCode(code) % 360}, 65%, 52%)`;
  }
  function colorLighten(hsl, l) {
    const m = hsl.match(/hsl$(\d+),\s*(\d+)%,\s*(\d+)%$/);
    if (!m) return hsl;
    return `hsl(${m[1]}, ${m[2]}%, ${l}%)`;
  }

  function textToHtml(text) {
    return '<p>' + text
      .split(/\n\n+/)
      .map((p) => p.replace(/\n/g, '<br>'))
      .join('</p><p>') + '</p>';
  }

  async function submitReply(editor, text) {
    const form = editor.closest('form');
    if (!form || !form.action) return { ok: false, reason: 'form' };

    try {
      const fd = new FormData(form);
      fd.set('message_html', textToHtml(text));
      fd.set('message', text);

      const token = form.querySelector('input[name="_xfToken"]');
      if (token) fd.set('_xfToken', token.value);

      const res = await fetch(form.action, {
        method: 'POST',
        body: fd,
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) return { ok: false, reason: 'HTTP ' + res.status };
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  }

  async function applyVerdict(prefixName, shouldClose) {
    const threadId = getThreadId();
    if (!threadId) { toast('⚠ Не найден ID темы', 'warn'); return false; }

    try {
      const res = await fetch(`/threads/${threadId}/edit`, { credentials: 'same-origin' });
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const form = doc.querySelector('form[action*="edit"]');
      if (!form) throw new Error('форма редактирования не найдена');

      const fd = new FormData();
      form.querySelectorAll('input, select, textarea').forEach((el) => {
        if (!el.name) return;
        if (el.type === 'checkbox' && !el.checked) return;
        fd.append(el.name, el.value);
      });

      const select = form.querySelector('select[name="prefix_id"]');
      if (select) {
        const opt = [...select.options].find(
          (o) => o.textContent.trim().toLowerCase() === prefixName.toLowerCase()
        );
        if (!opt) { toast(`⚠ Префикс «${prefixName}» не найден`, 'warn'); return false; }
        fd.set('prefix_id', opt.value);
      } else {
        toast('⚠ Префиксы недоступны — проверьте права', 'warn');
        return false;
      }

      if (shouldClose) fd.delete('discussion_open');

      const save = await fetch(form.action, { method: 'POST', body: fd, credentials: 'same-origin' });
      if (!save.ok) throw new Error('HTTP ' + save.status);
      return true;
    } catch (e) {
      toast('⚠ Ошибка: ' + e.message, 'warn');
      return false;
    }
  }


  /* ================= 1a. Быстрая проверка (РП биографии) ================= */

  const QC_MIN_WORDS = 150; /* минимальный объём биографии в словах */

  const QC_STOPWORDS = new Set(('и в на с по что как а но или да не же бы ли из за до от у о об для при ' +
    'это этот эта эти они оно мы вы он она я ты свой свои был была было были быть есть его её их весь все всё ' +
    'когда чтобы если то так уже ещё только очень потом там тут здесь теперь затем ведь значит однако хотя ' +
    'потому поэтому также тоже даже наш мой моя мои твой ваш себе собой таким такая такие более менее где ' +
    'кто чем которая которое которые который которых свой свой своё своя').split(/\s+/));

  const QC_LAT_OK = /^(rp|ic|ooc|mg|pg|rk|tk|db|dm|cef|vip|id|br|gta|crmp|samp|nrg|nick|name|age|story|appearance|character|gps|afk|tp|vk|tg|yt|discord|steam|online|offline|fps|hp|dmg|ks|sk|ko|tz|pc|mac|os|gpu|mm|dd|yyyy)$/i;

  const QC_TYPOS = [
    { bad: 'здела',    good: 'сдела',      prefix: true },
    { bad: 'жыл',      good: 'жил',        prefix: true, note: 'жи-/ши- пишется через И' },
    { bad: 'жыли',     good: 'жили' },
    { bad: 'жызнь',    good: 'жизнь' },
    { bad: 'шырок',    good: 'широк',      prefix: true, note: 'жи-/ши- пишется через И' },
    { bad: 'цыфр',     good: 'цифр',       prefix: true, note: 'цы- пишется через И' },
    { bad: 'сдесь',    good: 'здесь' },
    { bad: 'щас',      good: 'сейчас',     note: 'разговорная форма' },
    { bad: 'щитаю',    good: 'считаю' },
    { bad: 'преобрести', good: 'приобрести' },
    { bad: 'ихние',    good: 'их' },
    { bad: 'егойный',  good: 'его' },
    { bad: 'вообщем',  good: 'в общем' },
    { bad: 'впринципе', good: 'в принципе' },
    { bad: 'вопщем',   good: 'в общем' },
    { bad: 'координально', good: 'кардинально' },
    { bad: 'инциндент', good: 'инцидент' },
    { bad: 'инциатива', good: 'инициатива' },
    { bad: 'компроментировать', good: 'компрометировать' },
    { bad: 'колличество', good: 'количество' },
    { bad: 'агреси',   good: 'агресси',    prefix: true, note: 'агрессия — через две С' },
    { bad: 'извенаюсь', good: 'извиняюсь' },
    { bad: 'звини',    good: 'извини' },
    { bad: 'обезательно', good: 'обязательно' },
    { bad: 'поликлинника', good: 'поликлиника' },
    { bad: 'полклиника', good: 'поликлиника' },
    { bad: 'завтро',   good: 'завтра' },
    { bad: 'севодня',  good: 'сегодня' },
    { bad: 'лутше',    good: 'лучше' },
    { bad: 'лучьше',   good: 'лучше' },
    { bad: 'длого',    good: 'долго' },
    { bad: 'будующий', good: 'будущий' },
    { bad: 'девчёнк',  good: 'девчонк',    prefix: true, note: 'чо́нки — через О' },
    { bad: 'чюдо',     good: 'чудо',       note: 'чу- пишется через У' },
    { bad: 'чюжой',    good: 'чужой' },
    { bad: 'чюдовище', good: 'чудовище' },
    { bad: 'придти',   good: 'прийти' },
    { bad: 'пайти',    good: 'пойти' },
    { bad: 'опаздал',  good: 'опоздал' },
    { bad: 'опздал',   good: 'опоздал' },
    { bad: 'непоянтно', good: 'непонятно' },
    { bad: 'атестат',  good: 'аттестат',   note: 'две Т' },
    { bad: 'сесия',    good: 'сессия',     note: 'две С' },
    { bad: 'канешно',  good: 'конечно' },
    { bad: 'ваще',     good: 'вообще',     note: 'разговорная форма' },
    { bad: 'из за',    good: 'из-за',      whole: true, note: 'через дефис' },
    { bad: 'из под',   good: 'из-под',     whole: true, note: 'через дефис' },
    { bad: 'не смотря на', good: 'несмотря на', whole: true, note: 'слитно, если это предлог' },
    { bad: 'тоже самое', good: 'то же самое', whole: true },
  ];

  /* Маркеры генеративного текста: [вес, регулярка, подпись] */
  const QC_AI_MARKERS = [
    [1.7, /по мере взросления/gi, '«по мере взросления»'],
    [1.7, /сформировал\w* (?:его|её|меня) как личность/gi, '«сформировал … как личность»'],
    [1.5, /сформировал\w* (?:моё|его|её) (?:мировоззрение|мировосприятие)/gi, '«сформировал мировоззрение»'],
    [1.6, /несмотря на (?:все|всё) трудности/gi, '«несмотря на все трудности»'],
    [1.5, /новая глава/gi, '«новая глава»'],
    [1.4, /перевернул\w* (?:страницу|лист)/gi, '«перевернул страницу»'],
    [1.5, /это научило меня/gi, '«это научило меня»'],
    [1.2, /с тех пор я/gi, '«с тех пор я»'],
    [1.4, /с раннего детства/gi, '«с раннего детства»'],
    [1.2, /с самого детства/gi, '«с самого детства»'],
    [1.4, /мечтал\w* стать/gi, '«мечтал стать»'],
    [1.6, /глаза (?:наполнились|засветились|заблестели)/gi, '«глаза наполнились»'],
    [1.6, /сердце (?:билось|замирало|колотилось)/gi, '«сердце замирало»'],
    [1.6, /страх (?:охватил|объял|пронизал)/gi, '«страх охватил»'],
    [1.3, /наполни\w* (?:мою |его |её )?жизнь/gi, '«наполнил жизнь»'],
    [1.5, /жизненный путь/gi, '«жизненный путь»'],
    [1.5, /путь был (?:нелёгок|долог|непрост)/gi, '«путь был нелёгок»'],
    [1.4, /именно (?:тогда|здесь) я/gi, '«именно тогда я»'],
    [1.2, /с каждым днём/gi, '«с каждым днём»'],
    [1.2, /постепенно я/gi, '«постепенно я»'],
    [1.4, /чувство (?:долга|справедливости)/gi, '«чувство долга/справедливости»'],
    [1.3, /стремление к/gi, '«стремление к»'],
    [1.5, /жажда (?:знаний|приключений|мести|свободы)/gi, '«жажда …»'],
    [1.4, /судьба (?:распорядилась|свела|привела)/gi, '«судьба распорядилась»'],
    [1.6, /шрамы? (?:на душе|в сердце|в душе)/gi, '«шрамы на душе»'],
    [1.5, /отныне/gi, '«отныне»'],
    [1.5, /впереди (?:ждал|ожидал|ждала|ждали)/gi, '«впереди ждало»'],
    [1.3, /образ (?:жизни|мышления)/gi, '«образ жизни/мышления»'],
    [1.2, /смысл жизни/gi, '«смысл жизни»'],
    [1.2, /верным другом/gi, '«верным другом»'],
    [1.1, /с гордостью/gi, '«с гордостью»'],
    [1.2, /своими силами/gi, '«своими силами»'],
    [1.1, /впоследствии/gi, '«впоследствии»'],
    [1.0, /(?:к счастью|к сожалению)/gi, '«к счастью / к сожалению»'],
    [1.0, /в итоге/gi, '«в итоге»'],
    [1.4, /таким образом/gi, '«таким образом»'],
    [1.4, /подводя итог/gi, '«подводя итог»'],
    [1.4, /в заключение/gi, '«в заключение»'],
    [1.4, /хочу (?:отметить|подчеркнуть)/gi, '«хочу отметить»'],
    [1.4, /стоит отметить/gi, '«стоит отметить»'],
    [1.3, /не могу не отметить/gi, '«не могу не отметить»'],
    [1.2, /эта история/gi, '«эта история»'],
    [0.7, /испытани[йяе]/gi, '«испытания»'],
    [1.5, /превозмогая/gi, '«превозмогая»'],
    [1.3, /воодушевл\w+/gi, '«воодушевлённый»'],
    [1.4, /руководствуясь/gi, '«руководствуясь»'],
    [1.5, /решимость (?:только )?окрепл\w*/gi, '«решимость окрепла»'],
    [1.5, /закали\w* характер/gi, '«закалил характер»'],
    [1.6, /оставил\w* след в (?:моей |его |её )?(?:душе|памяти|сердце)/gi, '«оставил след в душе»'],
    [1.6, /(?:у него|у неё) было (?:тяжёлое|трудное|непростое) детство/gi, '«тяжёлое детство»'],
    [1.5, /в поисках себя/gi, '«в поисках себя»'],
    [1.4, /началась новая жизнь/gi, '«началась новая жизнь»'],
    [1.3, /взгляд на мир/gi, '«взгляд на мир»'],
    [1.3, /своё призвание/gi, '«своё призвание»'],
    [1.2, /по настоящее время/gi, '«по настоящее время»'],
    [1.2, /на сегодняшний день/gi, '«на сегодняшний день»'],
    [1.2, /в наши дни/gi, '«в наши дни»'],
  ];

  function qcWordPattern(word, whole) {
    const escd = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let re = '(?<![\\p{L}])' + escd;
    if (whole) re += '(?![\\p{L}])';
    return new RegExp(re, 'giu');
  }

  function qcContext(text, index, len) {
    const a = Math.max(0, index - 22);
    const b = Math.min(text.length, index + len + 22);
    return text.slice(a, b).replace(/\s+/g, ' ').trim();
  }

  /* --- Счётчик слов --- */
  function qcWordStats(text) {
    const words = (text.match(/\S+/g) || []).length;
    const chars = text.replace(/\s+/g, ' ').trim().length;
    const sents = text.split(/[.!?…]+(?:\s+|$)/).filter((s) => s.trim().length > 1).length;
    const tone = words >= QC_MIN_WORDS ? 'ok' : words >= 100 ? 'warn' : 'bad';
    return { words, chars, sents, tone };
  }

  /* --- Проверка орфографии --- */
  function qcSpellCheck(text) {
    const fixes = [];
    const warns = [];
    const push = (arr, msg) => {
      if (arr.length >= 10) return;
      const key = msg.split(' — ')[0].replace(/\s*\([^)]*\)\s*$/, '');
      if (arr.some((x) => x.split(' — ')[0] === key)) return;
      arr.push(msg);
    };

    QC_TYPOS.forEach((t) => {
      const re = qcWordPattern(t.bad, !t.prefix);
      let m;
      while ((m = re.exec(text)) && fixes.length < 10) {
        let full = m[0];
        if (t.prefix) {
          let end = m.index + full.length;
          while (end < text.length && /\p{L}/u.test(text[end])) { full += text[end]; end++; }
        }
        let repl = t.prefix ? t.good + full.slice(t.bad.length) : t.good;
        if (/^[А-ЯЁ]/.test(full)) repl = repl.charAt(0).toUpperCase() + repl.slice(1);
        if (full.length > 1 && full === full.toUpperCase() && /[\p{Lu}]/u.test(full)) repl = repl.toUpperCase();
        push(fixes, '«' + full + '» → «' + repl + '»' + (t.note ? ' (' + t.note + ')' : '') +
          ' — …' + qcContext(text, m.index, full.length) + '…');
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    });

    let m;
    const reRep = /(?<![\p{L}\p{N}])([\p{L}]{3,})(?:[ \u00a0]+)\1(?![\p{L}])/giu;
    while ((m = reRep.exec(text)) && warns.length < 12) {
      push(warns, 'Повтор слова «' + m[1] + '» подряд — …' + qcContext(text, m.index, m[0].length) + '…');
      if (reRep.lastIndex === m.index) reRep.lastIndex++;
    }

    const reComma = /[,;](?=[\p{L}\p{P}«"(])/gu;
    while ((m = reComma.exec(text)) && warns.length < 12) {
      const before = text.slice(Math.max(0, m.index - 8), m.index);
      const next = text[m.index + 1] || '';
      if (m.index > 0 && next === '/') continue; /* URL вида https://… */
      if (before.endsWith(':') || before.endsWith('/')) continue;
      push(warns, 'Нет пробела после «' + m[0] + '» — …' + qcContext(text, m.index, 2) + '…');
      reComma.lastIndex = m.index + 1;
    }

    const dbl = text.match(/[^\S\n]{2,}/g);
    if (dbl && dbl.length) push(warns, 'Двойные пробелы: ' + dbl.length + ' шт.');

    let yaCount = 0, firstYa = null;
    const reYa = /(?<![\p{L}])я(?![\p{L}])/g;
    while ((m = reYa.exec(text))) {
      yaCount++;
      if (!firstYa) firstYa = qcContext(text, m.index, 1);
    }
    if (yaCount) push(warns, '«я» со строчной буквы (' + yaCount + ' раз, должно быть «Я») — …' + (firstYa || '') + '…');

    const reSent = /([.!?…])(\s+)([а-яёa-z])/gu;
    let sentHits = 0, sentCtx = null;
    while ((m = reSent.exec(text)) && sentHits < 4) {
      sentHits++;
      if (!sentCtx) sentCtx = qcContext(text, m.index, m[0].length);
    }
    if (sentHits) push(warns, 'Предложение начинается со строчной буквы (' + sentHits + ' раз) — …' + (sentCtx || '') + '…');

    const tya = {};
    const reTya = /(?<![\p{L}])([а-яё]{3,}?)(тся|ться)(?![\p{L}])/giu;
    while ((m = reTya.exec(text))) {
      const stem = m[1].toLowerCase();
      (tya[stem] = tya[stem] || []).push({ form: m[2].toLowerCase(), ctx: qcContext(text, m.index, m[0].length) });
    }
    Object.keys(tya).forEach((stem) => {
      if (warns.length >= 12) return;
      const forms = tya[stem];
      if (forms.some((f) => f.form === 'тся') && forms.some((f) => f.form === 'ться')) {
        push(warns, 'Проверьте корень «' + stem + '» — встречаются и «' + stem + 'тся», и «' + stem + 'ться»: …' + forms[0].ctx + '…');
      }
    });

    const lat = [];
    const reLat = /(?<![\p{L}])[A-Za-z]{2,}(?![\p{L}])/gu;
    while ((m = reLat.exec(text))) if (!QC_LAT_OK.test(m[0])) lat.push(m[0]);
    if (lat.length) push(warns, 'Латиница в русском тексте: ' + Array.from(new Set(lat)).slice(0, 5).join(', '));

    const caps = [];
    const reCap = /(?<![\p{L}])[\p{Lu}]{5,}(?![\p{L}])/gu;
    while ((m = reCap.exec(text))) caps.push(m[0]);
    if (caps.length) push(warns, 'КАПС: ' + Array.from(new Set(caps)).slice(0, 5).join(', '));

    return { fixes, warns };
  }

  /* --- Анализ на ИИ --- */
  function qcAiCheck(text) {
    const found = [];
    let score = 0;
    QC_AI_MARKERS.forEach((mk) => {
      const re = mk[1];
      if (re.test(text)) { found.push(mk[2]); score += mk[0]; }
      re.lastIndex = 0;
    });

    let bonus = 0;
    const wc = (text.match(/[а-яёa-z]+/gi) || []).length;
    if (wc >= 1100 && wc <= 3400) bonus += 5;
    const dashes = (text.match(/[—–]/g) || []).length;
    if (dashes >= 12) bonus += 6;
    const sents = text.split(/[.!?…]+(?:\s+|$)/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 4);
    if (sents.length >= 10) {
      const lens = sents.map((s) => s.split(/\s+/).length);
      const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
      const sd = Math.sqrt(lens.reduce((a, b) => a + (b - avg) * (b - avg), 0) / lens.length);
      if (avg >= 13 && sd <= 6) bonus += 8;
      else if (avg >= 15) bonus += 4;
    }

    const percent = Math.min(95, Math.round(8 + score * 6 + bonus));
    return { percent, found, stats: { wc, dashes, sents: sents.length } };
  }

  /* --- Выбор уникальных фраз для поиска копий --- */
  function qcPickPhrases(text) {
    const sents = text.split(/(?:[.!?…]+|\n)+\s*/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 6);
    const freq = {};
    const all = text.toLowerCase().match(/[а-яё]{3,}/g) || [];
    all.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
    const total = all.length || 1;

    const cands = [];
    sents.slice(0, 60).forEach((s) => {
      const w = s.toLowerCase().split(/\s+/).map((x) => x.replace(/[^\p{L}\p{N}-]/gu, ''));
      for (let i = 0; i + 4 <= w.length; i++) {
        const gram = w.slice(i, i + 4);
        if (gram.some((x) => x.length < 3 || QC_STOPWORDS.has(x))) continue;
        const score = gram.reduce((a, x) => a + (1 - Math.min(1, (freq[x] || 1) / total)), 0);
        cands.push({ phrase: gram.join(' '), score });
      }
    });

    cands.sort((a, b) => b.score - a.score);
    const chosen = [];
    for (const c of cands) {
      if (chosen.length >= 3) break;
      if (chosen.some((x) => x.phrase.includes(c.phrase) || c.phrase.includes(x.phrase))) continue;
      chosen.push(c);
    }
    return chosen.map((c) => c.phrase);
  }

  /* --- Сверка по 4-словным шинглам --- */
  function qcNormWords(t) {
    return (t.toLowerCase().match(/[а-яё]+/g) || []);
  }
  function qcShingleOverlap(a, b, n) {
    n = n || 4;
    const wa = qcNormWords(a), wb = qcNormWords(b);
    if (wa.length < n || wb.length < n) return 0;
    const setA = new Set();
    for (let i = 0; i + n <= wa.length; i++) setA.add(wa.slice(i, i + n).join(' '));
    let hit = 0;
    const seen = new Set();
    for (let i = 0; i + n <= wb.length; i++) {
      const s = wb.slice(i, i + n).join(' ');
      if (setA.has(s) && !seen.has(s)) { seen.add(s); hit++; }
    }
    return Math.round(100 * hit / setA.size);
  }

  /* --- Сетевые helpers --- */
  function qcExtractBioText() {
    const post = document.querySelector('.message--primary .fr-view, .message--post .fr-view, article.message .fr-view');
    return post ? post.textContent.replace(/\u00a0/g, ' ').trim() : null;
  }

  async function qcSearchForum(phrase, excludeId) {
    const res = await fetch('/search/search?q=' + encodeURIComponent('"' + phrase + '"'), { credentials: 'same-origin' });
    if (!res.ok) return [];
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const out = [];
    doc.querySelectorAll('a[href*="/threads/"]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const mm = href.match(/\.(\d+)(?:\/|$)/);
      const id = mm ? mm[1] : null;
      if (!id || id === String(excludeId)) return;
      const title = (a.textContent || '').trim();
      if (!title || out.some((x) => x.id === id)) return;
      const row = a.closest('.block-row, .structItem');
      const sn = row ? row.querySelector('.contentRow-snippet, .structItem-minor') : null;
      out.push({ id: id, url: href.startsWith('http') ? href : location.origin + href, title: title, snippet: sn ? sn.textContent.trim() : '' });
    });
    return out;
  }

  async function qcFetchThreadText(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) return '';
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const p = doc.querySelector('.message--primary .fr-view, .message--post .fr-view, article.message .fr-view');
    return p ? p.textContent : '';
  }

  function qcHtmlEsc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* --- Панель быстрой проверки --- */
  function buildQcPanel(comment, updatePreview) {
    const panel = document.createElement('div');
    panel.className = 'br-qc';

    const bioText = qcExtractBioText();

    const title = document.createElement('div');
    title.className = 'br-qc-title';
    title.textContent = '🔎 Быстрая проверка';

    const stats = document.createElement('div');
    stats.className = 'br-qc-stats';
    if (bioText) {
      const st = qcWordStats(bioText);
      stats.innerHTML = '<span class="br-qc-dot br-qc-dot--' + st.tone + '"></span>' +
        '<span><b>' + st.words + '</b> слов · <b>' + st.chars + '</b> символов · ' + st.sents + ' предл.' +
        ' <span class="br-qc-note">(норма от ' + QC_MIN_WORDS + ' слов)</span></span>';
    } else {
      stats.innerHTML = '<span class="br-qc-dot br-qc-dot--warn"></span><span>Не удалось прочитать первый пост темы</span>';
    }

    const row = document.createElement('div');
    row.className = 'br-qc-row';
    const bCopy = document.createElement('button');
    bCopy.className = 'br-qc-btn';
    bCopy.textContent = '🧬 Анализ на копии';
    const bAi = document.createElement('button');
    bAi.className = 'br-qc-btn';
    bAi.textContent = '🤖 Анализ на ИИ';
    const bSpell = document.createElement('button');
    bSpell.className = 'br-qc-btn';
    bSpell.textContent = '🔤 Ошибки';
    row.append(bCopy, bAi, bSpell);

    const out = document.createElement('div');
    out.className = 'br-qc-out';
    out.hidden = true;

    let lastReport = '';
    function showReport(badge, tone, html, report) {
      lastReport = report || '';
      out.hidden = false;
      out.innerHTML = '<div><span class="br-qc-badge br-qc-badge--' + tone + '">' + badge + '</span></div>' +
        html +
        (lastReport ? '<button class="br-qc-ins">➕ вставить вывод в комментарий</button>' : '');
      const ins = out.querySelector('.br-qc-ins');
      if (ins) ins.onclick = () => {
        comment.value = (comment.value.trim() ? comment.value.trimEnd() + '\n\n' : '') + lastReport;
        updatePreview();
        toast('📋 Вывод добавлен в комментарий', 'info');
      };
    }
    function itemsHtml(list) {
      return list.map((x) => '<div class="br-qc-item">' + qcHtmlEsc(x) + '</div>').join('');
    }

    bCopy.onclick = async () => {
      if (!bioText) { showReport('⚠ Нет текста', 'warn', '<div class="br-qc-note">Не удалось прочитать биографию со страницы.</div>', ''); return; }
      bCopy.disabled = true;
      const old = bCopy.textContent;
      bCopy.textContent = '⏳ Ищу…';
      try {
        const phrases = qcPickPhrases(bioText);
        if (!phrases.length) throw new Error('не удалось выбрать фразы для поиска');
        const excl = getThreadId();
        const map = new Map();
        for (const ph of phrases) {
          (await qcSearchForum(ph, excl)).forEach((f) => { if (!map.has(f.id)) map.set(f.id, f); });
        }
        const cands = Array.from(map.values()).slice(0, 3);
        const results = [];
        for (const c of cands) {
          const other = await qcFetchThreadText(c.url);
          const pct = qcShingleOverlap(bioText, other);
          if (pct > 0) results.push({ pct: pct, title: c.title, url: c.url });
        }
        results.sort((a, b) => b.pct - a.pct);
        if (!results.length) {
          showReport('🧬 Совпадений не найдено', 'ok',
            '<div class="br-qc-note">Похожих биографий поиск форума не нашёл. Похоже, текст оригинальный (либо поиск недоступен для аккаунта).</div>',
            '🧬 Проверка на копии: совпадений не найдено.');
          return;
        }
        const top = results[0].pct;
        const tone = top >= 60 ? 'bad' : top >= 25 ? 'warn' : 'ok';
        const label = top >= 60 ? 'похоже на копию' : top >= 25 ? 'есть пересечения' : 'совпадения минимальны';
        const html = results.map((r) =>
          '<div class="br-qc-item">Совпадение <b>' + r.pct + '%</b> — <a href="' + r.url + '" target="_blank">' + qcHtmlEsc(r.title) + '</a></div>'
        ).join('');
        showReport('🧬 ' + label + ' (' + top + '%)', tone, html,
          '🧬 Проверка на копии: ' + label + ' (' + top + '%). Совпадения: ' +
          results.map((r) => r.title + ' — ' + r.pct + '%').join('; '));
      } catch (e) {
        showReport('🧬 Ошибка', 'warn', '<div class="br-qc-note">Не удалось выполнить поиск: ' + qcHtmlEsc(e.message || e) + '</div>', '');
      } finally {
        bCopy.disabled = false;
        bCopy.textContent = old;
      }
    };

    bAi.onclick = () => {
      if (!bioText) { showReport('⚠ Нет текста', 'warn', '<div class="br-qc-note">Не удалось прочитать биографию со страницы.</div>', ''); return; }
      const r = qcAiCheck(bioText);
      const tone = r.percent >= 65 ? 'bad' : r.percent >= 35 ? 'warn' : 'ok';
      const label = r.percent >= 65 ? 'высокая вероятность ИИ' : r.percent >= 35 ? 'есть признаки ИИ' : 'вероятность ИИ низкая';
      const html = (r.found.length
        ? '<div class="br-qc-item">Сработавшие маркеры: ' + qcHtmlEsc(r.found.join('; ')) + '</div>'
        : '<div class="br-qc-note">Шаблонных фраз не найдено.</div>') +
        '<div class="br-qc-note">Оценка эвристическая — финальное решение за проверяющим.</div>';
      showReport('🤖 ' + label + ' (~' + r.percent + '%)', tone, html,
        '🤖 Анализ на ИИ: ' + label + ' (~' + r.percent + '%)' +
        (r.found.length ? '. Признаки: ' + r.found.slice(0, 8).join(', ') : '. Шаблонных фраз не найдено'));
    };

    bSpell.onclick = () => {
      if (!bioText) { showReport('⚠ Нет текста', 'warn', '<div class="br-qc-note">Не удалось прочитать биографию со страницы.</div>', ''); return; }
      const r = qcSpellCheck(bioText);
      const tone = r.fixes.length ? 'bad' : r.warns.length ? 'warn' : 'ok';
      const badge = r.fixes.length
        ? '🔤 Ошибок: ' + r.fixes.length + (r.warns.length ? ' + замечаний: ' + r.warns.length : '')
        : r.warns.length ? '🔤 Замечаний: ' + r.warns.length : '🔤 Ошибок не найдено';
      const html = itemsHtml(r.fixes) + itemsHtml(r.warns) ||
        '<div class="br-qc-note">Частых опечаток и подозрительных мест не найдено.</div>';
      const report = r.fixes.length || r.warns.length
        ? '🔤 Проверка орфографии:\n' + r.fixes.concat(r.warns).slice(0, 8).map((x) => '- ' + x).join('\n')
        : '🔤 Проверка орфографии: ошибок не найдено.';
      showReport(badge, tone, html, report);
    };

    panel.append(title, stats, row, out);
    return panel;
  }

  /* ================= 1. Строитель вердикта ================= */
  function detectSectionKind() {
    const path = decodeURIComponent(location.pathname).toLowerCase();
    if (path.includes('биограф') || path.includes('bio')) return 'bios';
    return 'complaints';
  }

  function closeVerdictBuilder() {
    document.getElementById('br-vb-overlay')?.remove();
  }

  function openVerdictBuilder() {
    closeVerdictBuilder();
    const editor = document.querySelector('.fr-element, .js-quickReply .fr-view');
    if (!editor) {
      toast('⚠ Редактор не найден — нажмите «Ответить» и повторите', 'warn');
      return;
    }

    const kind = detectSectionKind();
    const set = VERDICT_SETS[kind] || VERDICT_SETS.complaints;

    const overlay = document.createElement('div');
    overlay.id = 'br-vb-overlay';
    overlay.classList.add('br-ui');

    const modal = document.createElement('div');
    modal.id = 'br-vb-modal';

    const head = document.createElement('div');
    head.id = 'br-vb-head';
    head.innerHTML = `
      <span id="br-vb-head-ico">⚖</span>
      <div style="flex:1; min-width:0">
        <div id="br-vb-head-title">Вердикт по теме</div>
        <div id="br-vb-head-sub">${kind === 'bios' ? 'РП биографии' : 'Жалобы на игроков'}</div>
      </div>
      <button id="br-vb-close" title="Закрыть">✕</button>`;

    const body = document.createElement('div');
    body.id = 'br-vb-body';

    const state = { verdict: null, rule: null };

    /* Шаг 1: вердикт */
    const stageV = document.createElement('div');
    stageV.className = 'br-vb-stage';
    stageV.innerHTML = '<div class="br-vb-stage-title"><b>1</b> · Вердикт</div>';
    const vRow = document.createElement('div');
    vRow.className = 'br-vb-verdicts';
    const vBtns = [];
    set.forEach((v) => {
      const b = document.createElement('button');
      b.className = 'br-vb-verdict';
      b.style.setProperty('--vc', v.color);
      b.innerHTML = `<span class="br-vb-verdict-ico">${v.icon}</span><span>${v.label}</span>`;
      b.onclick = () => {
        state.verdict = v;
        state.rule = null;
        vBtns.forEach((x) => x.classList.remove('br-vb-verdict--sel'));
        b.classList.add('br-vb-verdict--sel');
        renderStages();
        updatePreview();
      };
      vBtns.push(b);
      vRow.appendChild(b);
    });
    stageV.appendChild(vRow);
    body.appendChild(stageV);

    /* Шаг 2: пункт правил (только для «Одобрено» в жалобах) */
    let stageR = null, rulesBox = null, ruleSearch = null;
    if (kind === 'complaints') {
      stageR = document.createElement('div');
      stageR.className = 'br-vb-stage';
      stageR.innerHTML = '<div class="br-vb-stage-title"><b>2</b> · Пункт правил</div>';

      ruleSearch = document.createElement('input');
      ruleSearch.className = 'br-vb-rule-search';
      ruleSearch.placeholder = '🔍 Поиск по пунктам…';
      stageR.appendChild(ruleSearch);

      rulesBox = document.createElement('div');
      rulesBox.className = 'br-vb-rules';
      stageR.appendChild(rulesBox);
      body.appendChild(stageR);
    }

    function renderRules() {
      if (!rulesBox) return;
      rulesBox.innerHTML = '';
      const f = (ruleSearch.value || '').toLowerCase().trim();
      RULES.filter((r) => !f || r.code.includes(f) || r.title.toLowerCase().includes(f))
        .forEach((r) => {
          const b = document.createElement('button');
          b.className = 'br-vb-rule';
          const vc = state.verdict ? state.verdict.color : '#6366f1';
          b.style.setProperty('--vc', vc);
          b.innerHTML = `<span class="br-vb-rule-code">${r.code}</span>
            <span><span class="br-vb-rule-name">${r.title}</span>
            <div class="br-vb-rule-desc">${r.desc}</div></span>`;
          if (state.rule === r) b.classList.add('br-vb-rule--sel');
          b.onclick = () => {
            state.rule = state.rule === r ? null : r;
            rulesBox.querySelectorAll('.br-vb-rule').forEach((x) => x.classList.remove('br-vb-rule--sel'));
            if (state.rule) b.classList.add('br-vb-rule--sel');
            updatePreview();
          };
          rulesBox.appendChild(b);
        });
      if (!rulesBox.children.length) {
        rulesBox.innerHTML = '<div class="br-srv-empty">Пункт не найден</div>';
      }
    }
    if (ruleSearch) ruleSearch.oninput = renderRules;

    /* Шаг 3: комментарий */
    const stageC = document.createElement('div');
    stageC.className = 'br-vb-stage';
    const stageCTitle = document.createElement('div');
    stageCTitle.className = 'br-vb-stage-title';
    stageC.appendChild(stageCTitle);
    const comment = document.createElement('textarea');
    comment.className = 'br-vb-comment';
    comment.placeholder = kind === 'bios'
      ? 'Например: не расписан внешний вид персонажа…'
      : 'Например: доказательства обрезаны, срок подачи истёк…';
    comment.oninput = updatePreview;
    stageC.appendChild(comment);
    body.appendChild(stageC);

    /* Предпросмотр */
    const stageP = document.createElement('div');
    stageP.className = 'br-vb-stage';
    const stagePTitle = document.createElement('div');
    stagePTitle.className = 'br-vb-stage-title';
    stageP.appendChild(stagePTitle);
    const preview = document.createElement('div');
    preview.id = 'br-vb-preview';
    preview.textContent = 'Выберите вердикт — здесь появится готовый текст ответа.';
    stageP.appendChild(preview);
    body.appendChild(stageP);

    /* 🔎 Быстрая проверка — только для РП биографий */
    if (kind === 'bios') {
      body.children[0].after(buildQcPanel(comment, updatePreview));
    }

    function updatePreview() {
      if (!state.verdict) return;
      if (state.verdict.needsRule && !state.rule) {
        preview.textContent = 'Выберите пункт правил — он попадёт в текст ответа.';
        return;
      }
      preview.textContent = buildVerdictText(kind, state.verdict, state.rule, comment.value) || '—';
    }

    function renderStages() {
      const needRule = state.verdict && state.verdict.needsRule;
      if (stageR) {
        stageR.style.display = needRule ? '' : 'none';
        const vc = state.verdict ? state.verdict.color : '#6366f1';
        rulesBox.style.setProperty('--vc', vc);
        if (needRule) renderRules();
      }

      if (needRule) {
        stageCTitle.innerHTML = '<b>3</b> · Комментарий <span style="color:#8a8f9a">(необязательно)</span>';
        stagePTitle.innerHTML = '<b>4</b> · Предпросмотр';
      } else {
        stageCTitle.innerHTML = `<b>2</b> · Комментарий ${
          state.verdict && state.verdict.needsComment
            ? '<span style="color:#e74c3c">(обязателен)</span>'
            : '<span style="color:#8a8f9a">(необязательно)</span>'}`;
        stagePTitle.innerHTML = '<b>3</b> · Предпросмотр';
      }
    }
    renderStages();

    /* Подвал */
    const foot = document.createElement('div');
    foot.id = 'br-vb-foot';
    const insertBtn = document.createElement('button');
    insertBtn.id = 'br-vb-insert';
    insertBtn.className = 'br-vb-act';
    insertBtn.textContent = '📋 Вставить в редактор';
    const sendBtn = document.createElement('button');
    sendBtn.id = 'br-vb-send';
    sendBtn.className = 'br-vb-act';
    sendBtn.textContent = '🚀 Отправить';
    foot.append(insertBtn, sendBtn);

    function validate() {
      if (!state.verdict) { toast('⚠ Выберите вердикт', 'warn'); return false; }
      if (state.verdict.needsRule && !state.rule) { toast('⚠ Выберите пункт правил', 'warn'); return false; }
      if (state.verdict.needsComment && !comment.value.trim()) { toast('⚠ Для этого вердикта нужен комментарий', 'warn'); return false; }
      return true;
    }

    async function doSubmit() {
      if (!validate()) return;
      const text = buildVerdictText(kind, state.verdict, state.rule, comment.value);
      sendBtn.disabled = insertBtn.disabled = true;
      toast('⏳ Отправляю ответ…', 'info');
      const sent = await submitReply(editor, text);
      if (!sent.ok) {
        editor.focus();
        document.execCommand('insertText', false, text);
        toast('⚠ Ответ не отправлен (' + sent.reason + '). Текст вставлен — нажмите «Ответить» вручную.', 'warn');
      }
      toast(state.verdict.close
        ? '⏳ Ставлю префикс и закрываю тему…' : '⏳ Ставлю префикс…', 'info');
      const ok = await applyVerdict(state.verdict.prefix, state.verdict.close);
      if (ok) {
        closeVerdictBuilder();
        toast('✓ Готово: вердикт «' + state.verdict.label + '»');
        setTimeout(() => location.reload(), 900);
      } else {
        sendBtn.disabled = insertBtn.disabled = false;
      }
    }
    sendBtn.onclick = doSubmit;
    insertBtn.onclick = () => {
      if (!validate()) return;
      const text = buildVerdictText(kind, state.verdict, state.rule, comment.value);
      editor.focus();
      document.execCommand('insertText', false, text);
      closeVerdictBuilder();
      toast('📋 Текст вставлен в редактор', 'info');
    };

    modal.append(head, body, foot);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('br-vb-overlay--open'));

    overlay.onclick = (e) => { if (e.target === overlay) closeVerdictBuilder(); };
    head.querySelector('#br-vb-close').onclick = closeVerdictBuilder;
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { closeVerdictBuilder(); document.removeEventListener('keydown', esc); }
    });
  }

  /* ---------- Вкладки на правом крае: «Вердикт» и «Тема» ---------- */
  function shouldShowVerdict() {
    return decodeURIComponent(location.pathname).toLowerCase().includes('/threads/');
  }

  function syncVerdictTab() {
    const need = shouldShowVerdict();
    let tab = document.getElementById('br-vb-tab');

    if (need && !tab) {
      tab = document.createElement('button');
      tab.id = 'br-vb-tab';
      tab.classList.add('br-ui');
      tab.innerHTML = '<span id="br-vb-tab-ico">⚖</span><span id="br-vb-tab-label">Вердикт</span>';
      tab.title = 'Открыть строитель вердикта';
      tab.onclick = () => openVerdictBuilder();
      document.body.appendChild(tab);
    } else if (!need && tab) {
      tab.remove();
    }
  }

  /* Вкладка «Тема»: видна на всех страницах, ниже «Вердикта».
     Когда вердикта нет — тему подтягиваем на его место, чтобы не висел разрыв. */
  function syncThemeTab() {
    const hasVerdict = !!document.getElementById('br-vb-tab');
    let tab = document.getElementById('br-theme-tab');

    if (!tab) {
      tab = document.createElement('button');
      tab.id = 'br-theme-tab';
      tab.classList.add('br-ui');
      tab.innerHTML = '<span id="br-theme-tab-ico">🎨</span><span id="br-theme-tab-label">Тема</span>';
      tab.title = 'Выбрать тему сайта';
      tab.onclick = () => openThemeMenu(tab);
      document.body.appendChild(tab);
    }

    /* Подтягиваем вкладку к вердикту или прижимаем ниже */
    tab.style.top = hasVerdict ? 'calc(50% + 64px)' : '50%';
  }

  /* ================= 2. Фильтр «Ожидание» ================= */
  let filterOn = false;

  function rowIsWaiting(row) {
    const labels = row.querySelectorAll(PREFIX_SELECTOR);
    for (const l of labels) {
      if (WAITING_PATTERN.test(l.textContent)) return true;
    }
    return false;
  }

  function applyFilter() {
    const rows = document.querySelectorAll(ROW_SELECTOR);
    let shown = 0;

    rows.forEach((row) => {
      const isWaiting = rowIsWaiting(row);
      if (filterOn) {
        row.style.display = isWaiting ? '' : 'none';
        row.style.outline = isWaiting ? '2px solid #e6a700' : '';
        if (isWaiting) shown++;
      } else {
        row.style.display = '';
        row.style.outline = '';
      }
    });

    return { shown, total: rows.length };
  }

  /* ================= 3. Боковой док-рейл ================= */
  function closeServerDrop() {
    document.getElementById('br-server-drop')?.remove();
  }

  function openServerDrop(anchorItem) {
    closeServerDrop();

    const drop = document.createElement('div');
    drop.id = 'br-server-drop';
    drop.classList.add('br-ui');

    const search = document.createElement('input');
    search.id = 'br-server-search';
    search.type = 'text';
    search.placeholder = '🔍 Поиск сервера…';

    const list = document.createElement('div');
    list.id = 'br-server-list';

    const saved = getSavedServer();

    function render(filterText) {
      list.innerHTML = '';
      const f = (filterText || '').toLowerCase().trim();

      const items = SERVERS.filter((s) =>
        !f || s.name.toLowerCase().includes(f) || s.code.toLowerCase().includes(f)
      );

      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'br-srv-empty';
        empty.textContent = 'Ничего не найдено';
        list.appendChild(empty);
        return;
      }

      items.forEach((s) => {
        const row = document.createElement('button');
        row.className = 'br-srv';

        const dot = document.createElement('span');
        dot.className = 'br-srv-dot';
        dot.style.background = serverColor(s.code);

        const label = document.createElement('span');
        label.textContent = s.name;

        row.append(dot, label);

        if (saved && saved.code === s.code) row.classList.add('br-srv--current');

        if (s.url === '###') {
          row.classList.add('br-srv--off');
          row.title = 'Ссылка не настроена — впишите url в конфиге SERVER_URLS';
        } else {
          row.onclick = () => {
            saveServer(s);
            toast('⏳ Открываю сервер ' + s.code + '…', 'info');
            location.href = s.url;
          };
        }

        list.appendChild(row);
      });
    }

    search.oninput = () => render(search.value);

    drop.append(search, list);
    document.body.appendChild(drop);

    const rail = document.getElementById('br-rail');
    if (rail && anchorItem) {
      const rr = rail.getBoundingClientRect();
      const ir = anchorItem.getBoundingClientRect();
      const left = Math.min(rr.right + 14, window.innerWidth - 262);
      let top = ir.top;
      top = Math.max(10, Math.min(top, window.innerHeight - drop.offsetHeight - 10));
      drop.style.left = left + 'px';
      drop.style.top = top + 'px';
    } else {
      drop.style.left = '84px';
      drop.style.top = '120px';
    }

    render('');

    search.focus();
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') {
        closeServerDrop();
        document.removeEventListener('keydown', esc);
      }
    });
    setTimeout(() => {
      document.addEventListener('click', function outside(e) {
        const r = document.getElementById('br-rail');
        if (!drop.contains(e.target) && !(r && r.contains(e.target))) {
          closeServerDrop();
          document.removeEventListener('click', outside);
        }
      });
    }, 0);
  }

  function buildRailItem({ icon, color, label, url, kind }) {
    const btn = document.createElement('button');
    btn.className = 'br-rail-item';
    btn.style.setProperty('--c', color);
    btn.style.setProperty('--c2', colorLighten(color, 70));

    const ico = document.createElement('span');
    ico.className = 'br-rail-ico';
    ico.textContent = icon;

    const text = document.createElement('span');
    text.className = 'br-rail-label';
    text.textContent = label;

    btn.append(ico, text);

    if (kind === 'filter') {
      const num = document.createElement('span');
      num.className = 'br-rail-wait-num';
      num.id = 'br-rail-wait-num';
      btn.appendChild(num);

      btn.onclick = () => {
        filterOn = !filterOn;
        const { shown, total } = applyFilter();
        text.textContent = filterOn
          ? (shown ? `Ожидание: ${shown}` : `Не найдено (${total})`)
          : 'Ожидание';
        updateWaitNum();
      };
      btn.title = 'Показать только темы «на рассмотрении»';
    } else if (!url) {
      btn.classList.add('br-rail-item--off');
      btn.title = 'Подраздел не найден. Зайдите в него вручную — и повторно выберите сервер.';
    } else {
      const current = decodeURIComponent(location.pathname).toLowerCase();
      let target = url;
      try { target = new URL(url).pathname.toLowerCase(); } catch (e) {}
      if (current.includes(target.slice(0, 16))) btn.classList.add('br-rail-item--active');
      btn.onclick = () => (location.href = url);
    }

    return btn;
  }

  function updateWaitNum() {
    const num = document.getElementById('br-rail-wait-num');
    if (!num) return;
    const rows = document.querySelectorAll(ROW_SELECTOR);
    let waiting = 0;
    rows.forEach((row) => { if (rowIsWaiting(row)) waiting++; });
    if (waiting) {
      num.textContent = waiting > 99 ? '99+' : waiting;
      num.classList.add('br-rail-wait-num--on');
    } else {
      num.classList.remove('br-rail-wait-num--on');
    }
  }

  function renderRailBody() {
    const rail = document.getElementById('br-rail');
    if (!rail) return;

    rail.querySelectorAll('[data-rail-dyn]').forEach((el) => el.remove());
    const sep = rail.querySelector('#br-rail-sep-main');
    if (!sep) return;

    const saved = getSavedServer();
    const map = saved ? getSectionsCache(saved.code) : {};

    SECTIONS.forEach((s) => {
      const item = buildRailItem({
        icon: s.icon, color: s.color, label: s.name, url: map[s.name],
      });
      item.setAttribute('data-rail-dyn', '');
      rail.insertBefore(item, sep);
    });

    if (!saved) {
      const hint = document.createElement('div');
      hint.id = 'br-hint';
      hint.setAttribute('data-rail-dyn', '');
      hint.textContent = 'Выберите сервер 👇';
      rail.insertBefore(hint, sep);
    }

    const filterItem = buildRailItem({
      icon: '⏳', color: '#2b6cb0', label: 'Ожидание', kind: 'filter',
    });
    filterItem.setAttribute('data-rail-dyn', '');
    rail.insertBefore(filterItem, sep);

    updateWaitNum();
  }

  function renderRail() {
    if (document.getElementById('br-rail')) return;

    const rail = document.createElement('div');
    rail.id = 'br-rail';
    rail.classList.add('br-ui');
    rail.dataset.path = location.pathname;

    /* Логотип */
    const logo = document.createElement('div');
    logo.id = 'br-rail-logo';
    const logoIco = document.createElement('span');
    logoIco.id = 'br-rail-logo-ico';
    logoIco.textContent = '🧭';
    const logoName = document.createElement('span');
    logoName.id = 'br-rail-logo-name';
    logoName.textContent = 'Curator';
    const logoDot = document.createElement('span');
    logoDot.id = 'br-rail-logo-dot';
    logo.append(logoIco, logoName, logoDot);
    rail.appendChild(logo);

    /* Кнопка сервера */
    const srvItem = document.createElement('button');
    srvItem.className = 'br-rail-item';
    srvItem.id = 'br-rail-srv';

    const srvIco = document.createElement('span');
    srvIco.className = 'br-rail-ico';
    srvIco.style.setProperty('--c', '#7c3aed');
    srvIco.style.setProperty('--c2', '#c4b5fd');
    srvIco.textContent = '🎮';

    const srvDot = document.createElement('span');
    srvDot.className = 'br-srv-dot';
    srvDot.id = 'br-rail-srv-dot';
    srvDot.style.flex = '0 0 8px';
    srvDot.style.height = '8px';

    const srvLabel = document.createElement('span');
    srvLabel.className = 'br-rail-label';
    srvLabel.id = 'br-rail-srv-label';

    srvItem.append(srvIco, srvLabel, srvDot);
    srvItem.onclick = () => openServerDrop(srvItem);
    rail.appendChild(srvItem);

    const sep = document.createElement('div');
    sep.className = 'br-rail-sep';
    sep.id = 'br-rail-sep-main';
    rail.appendChild(sep);

    document.body.appendChild(rail);

    function refreshRail() {
      const s = getSavedServer();
      if (s) {
        const c = serverColor(s.code);
        logoDot.style.background = c;
        logoDot.style.boxShadow = `0 0 8px ${c}`;
        logo.style.setProperty('--railc', c);
        srvDot.style.background = c;
        srvDot.style.boxShadow = `0 0 6px ${c}`;
        srvLabel.textContent = 'Сервер: ' + s.code;
        srvItem.title = 'Смена сервера — ' + s.name;
      } else {
        logoDot.style.background = '#6b7280';
        logoDot.style.boxShadow = 'none';
        logo.style.setProperty('--railc', '#6366f1');
        srvDot.style.background = '#6b7280';
        srvDot.style.boxShadow = 'none';
        srvLabel.textContent = 'Выбрать сервер';
        srvItem.title = 'Выбрать сервер';
      }
      renderRailBody();
    }
    window.__brRefreshRail = refreshRail;
    refreshRail();

    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') closeServerDrop();
    });
    setTimeout(() => {
      document.addEventListener('click', function outside(e) {
        const d = document.getElementById('br-server-drop');
        if (!d) return;
        if (!d.contains(e.target) && !rail.contains(e.target)) closeServerDrop();
      });
    }, 0);
  }

  function refreshNavUI() {
    window.__brRefreshRail?.();
  }

  /* ================= 4. Таймер возраста (только «Ожидание») ================= */
  function parseRowDate(row) {
    const t = row.querySelector('time[datetime]');
    if (t) {
      const d = new Date(t.getAttribute('datetime'));
      if (!isNaN(d)) return d;
    }
    const el = row.querySelector('[data-timestamp], [data-date], [data-time]');
    if (el) {
      const ts = el.getAttribute('data-timestamp') || el.getAttribute('data-date');
      const sec = parseInt(ts, 10);
      if (!isNaN(sec) && sec > 1000000000) return new Date(sec * 1000);
    }
    const titled = row.querySelector('time[title], .datePermalink time, .itemDatePick');
    if (titled) {
      const m = (titled.getAttribute('title') || '').match(/(\d{2})\.(\d{2})\.(\d{4})\D+(\d{2}):(\d{2})/);
      if (m) return new Date(+m[3], m[2] - 1, +m[1], +m[4], +m[5]);
    }
    return null;
  }

  function formatAge(ms) {
    const min = Math.floor(ms / 60000);
    if (min < 1) return 'только что';
    if (min < 60) return min + ' мин';
    const h = Math.floor(min / 60);
    if (h < 24) return h + ' ч ' + (min % 60) + ' мин';
    const d = Math.floor(h / 24);
    return d + ' дн ' + (h % 24) + ' ч';
  }

  function addAgeBadges() {
    document.querySelectorAll(ROW_SELECTOR).forEach((row) => {
      const waiting = rowIsWaiting(row);

      if (!waiting) {
        const stale = row.querySelector('.br-age');
        if (stale) stale.remove();
        return;
      }

      if (row.querySelector('.br-age')) return;

      const created = parseRowDate(row);
      if (!created) return;

      const ageMs = Date.now() - created.getTime();
      const ageH = ageMs / 3600000;

      let cls = 'br-age--fresh';
      if (ageH >= WARN_HOURS) cls = 'br-age--fail';
      else if (ageH >= WARN_HOURS - 4) cls = 'br-age--old';
      else if (ageH >= 6) cls = 'br-age--mid';

      const badge = document.createElement('span');
      badge.className = 'br-age ' + cls;
      badge.title = 'Создана: ' + created.toLocaleString('ru-RU');
      badge.textContent = '⏱ ' + formatAge(ageMs) + (ageH >= WARN_HOURS ? ' — срок вышел' : '');

      const anchor = row.querySelector('.structItem-cell--latest, .lastPost') || row;
      (anchor.querySelector('.structItem-minor, .itemDetail') || anchor).appendChild(badge);
    });
  }
  /* ================= 5. Запуск с безопасным наблюдателем ================= */
  let running = false;
  let scheduled = false;

  function init() {
    if (running) return;
    running = true;
    try {
      injectStyles();
      syncVerdictTab();
      syncThemeTab();
      renderRail();
      addAgeBadges();
    } finally {
      running = false;
    }
  }

  const observer = new MutationObserver(() => {
    if (running || scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      const rail = document.getElementById('br-rail');
      if (rail && rail.dataset.path !== location.pathname) {
        rail.dataset.path = location.pathname;
        renderRailBody();
      }
      syncVerdictTab();
      syncThemeTab();
      init();
      updateWaitNum();
    }, 300);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      observer.observe(document.body, { childList: true, subtree: true });

      const saved = getSavedServer();
      if (saved && saved.url !== '###') {
        resolveSections(saved).then(() => refreshNavUI());
      }
    });
  } else {
    init();
    observer.observe(document.body, { childList: true, subtree: true });

    const saved = getSavedServer();
    if (saved && saved.url !== '###') {
      resolveSections(saved).then(() => refreshNavUI());
    }
  }
})();

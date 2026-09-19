/* ==========================================================================
   TEAM Public Talks — конфигурация проекта.
   Единственный файл, который нужно править перед деплоем.
   ========================================================================== */
(function (window) {
  "use strict";

  /* ------------------------------------------------------------------ i18n */
  var SUPPORTED_LANGUAGES = ["uz", "ru", "en"];
  var DEFAULT_LANGUAGE = "uz";
  var LANGUAGE_STORAGE_KEY = "tpt-lang";
  var DETECT_BROWSER_LANGUAGE = false; /* true — при первом заходе на страницу язык берётся из браузера,
                                         false — язык по умолчанию DEFAULT_LANGUAGE */

  /* ------------------------------------------------------------- Bitrix24 */

  /* Входящий вебхук портала с правом crm.
     Пример: "https://teamuni.bitrix24.ru/rest/12/xxxxxxxxxxxxxxxx/crm.lead.add.json"
     Пока строка пустая — форма работает в демо-режиме и лид не создаётся. */
  var BITRIX24_WEBHOOK_URL =
    "https://teamuni.bitrix24.ru/rest/129/7o3qxas6wu7bvxsr/crm.lead.add.json";

  /* Источник лида в CRM: WEB / ADVERTISING / CALL / собственный код справочника. */
  var BITRIX_SOURCE_ID = "34";

  /* Пользовательские поля лида. Пока в константе есть 'XXXX',
     поле не отправляется — как в лендинге вступительных экзаменов. */
  var UF_ORGANIZATION = "UF_CRM_YOURORGANISAT";
  var UF_ATTENDEE_TYPE = "UF_CRM_DOLZHNOST";
  var UF_QUESTION = "UF_CRM_1779434984532";

  /* Единые английские подписи для значений select — в CRM не должны
     попадать сырые коды вроде "entrepreneur". */
  var ATTENDEE_TYPE_LABELS = {
    student: "Student",
    entrepreneur: "Entrepreneur",
    professional: "Professional / manager",
    other: "Other",
  };

  /* Префикс заголовка лида: "TEAM Public Talks - <имя> (<кто>)" */
  var LEAD_TITLE_PREFIX = "TEAM Public Talks 28.09";

  /* -------------------------------------------------------------- событие */
  var EVENT = {
    /* Для ссылки «Добавить в календарь» (Google Calendar).
       Формат UTC: 28.09.2026, 17:30–21:00 по Ташкенту (UTC+5). */
    calendarStartUtc: "20260928T123000Z",
    calendarEndUtc: "20260928T160000Z",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=TEAM+University+Tashkent",
  };

  /* ------------------------------------------------------------- программа
     Время и длительность — общие для всех языков, тексты лежат в
     locales/<lang>.json в объекте "agenda" под теми же id.
     duration в минутах; 0 — блок без фиксированного окончания. */
  var AGENDA = [
    { id: "registration", time: "17:30", duration: 30 },
    { id: "opening", time: "18:00", duration: 10 },
    { id: "lecture", time: "18:10", duration: 60 },
    { id: "coffee", time: "19:10", duration: 15 },
    { id: "qa", time: "19:25", duration: 60 },
    { id: "networking", time: "20:25", duration: 0 },
  ];

  window.TPT_CONFIG = {
    SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE: DEFAULT_LANGUAGE,
    LANGUAGE_STORAGE_KEY: LANGUAGE_STORAGE_KEY,
    DETECT_BROWSER_LANGUAGE: DETECT_BROWSER_LANGUAGE,

    BITRIX24_WEBHOOK_URL: BITRIX24_WEBHOOK_URL,
    BITRIX_SOURCE_ID: BITRIX_SOURCE_ID,
    UF_ORGANIZATION: UF_ORGANIZATION,
    UF_ATTENDEE_TYPE: UF_ATTENDEE_TYPE,
    UF_QUESTION: UF_QUESTION,

    ATTENDEE_TYPE_LABELS: ATTENDEE_TYPE_LABELS,
    LEAD_TITLE_PREFIX: LEAD_TITLE_PREFIX,

    EVENT: EVENT,
    AGENDA: AGENDA,
  };
})(window);

/* ==========================================================================
   TEAM Public Talks — интеграция с Bitrix24.
   Создаёт лид через crm.lead.add. Fire-and-forget: работает в фоне,
   не блокирует и не ломает интерфейс. Ошибки Битрикса и ID созданного
   лида пишутся только в консоль.
   ========================================================================== */
(function (window) {
  "use strict";

  var config = window.TPT_CONFIG;

  function log() {
    if (window.console && console.log) {
      console.log.apply(console, arguments);
    }
  }

  function logError() {
    if (window.console && console.error) {
      console.error.apply(console, arguments);
    }
  }

  /* Создаёт лид в Bitrix24 из данных формы. */
  function createBitrixLead(formPayload, onSuccess) {
    try {
      /* Полное имя делим на NAME / LAST_NAME — отдельные поля лида. */
      var nameParts = (formPayload.fullName || "").trim().split(/\s+/);
      var firstName = nameParts.shift() || "";
      var lastName = nameParts.join(" ");

      var attendeeTypeLabel =
        config.ATTENDEE_TYPE_LABELS[formPayload.attendeeType] ||
        formPayload.attendeeType ||
        "";

      var fields = {
        TITLE:
          config.LEAD_TITLE_PREFIX +
          " - " +
          formPayload.fullName +
          (attendeeTypeLabel ? " (" + attendeeTypeLabel + ")" : ""),
        NAME: firstName,
        LAST_NAME: lastName,
        PHONE: [{ VALUE: formPayload.phone, VALUE_TYPE: "WORK" }],
        EMAIL: [{ VALUE: formPayload.email, VALUE_TYPE: "WORK" }],
        COMMENTS: formPayload.question || "—",
        SOURCE_ID: config.BITRIX_SOURCE_ID,
        SOURCE_DESCRIPTION: window.location.href
      };

      /* Пользовательские поля: уходят, только когда плейсхолдер заменён
         на реальный UF ID (в константе больше нет 'XXXX'). */
      function setUf(ufKey, value) {
        if (value && ufKey && ufKey.indexOf("XXXX") === -1) {
          fields[ufKey] = value;
        }
      }
      setUf(config.UF_ORGANIZATION, formPayload.organization);
      setUf(config.UF_ATTENDEE_TYPE, attendeeTypeLabel);
      setUf(config.UF_QUESTION, formPayload.question);
      setUf(config.UF_PAGE_LANGUAGE, formPayload.pageLanguage);

      var body = JSON.stringify({
        fields: fields,
        params: { REGISTER_SONET_EVENT: "Y" }
      });

      return fetch(config.BITRIX24_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("HTTP " + res.status);
          }
          return res.json();
        })
        .then(function (data) {
          if (data && data.error) {
            logError(
              "[team-public-talks] Bitrix24 error:",
              data.error,
              data.error_description || ""
            );
          } else {
            log(
              "[team-public-talks] Bitrix24 lead created, ID:",
              data ? data.result : "(unknown)"
            );
          }
          if (typeof onSuccess === "function") {
            onSuccess(data);
          }
        })
        .catch(function (err) {
          logError("[team-public-talks] Failed to create Bitrix24 lead:", err);
        });
    } catch (err) {
      logError("[team-public-talks] Failed to prepare Bitrix24 lead:", err);
      return null;
    }
  }

  window.Bitrix = { createLead: createBitrixLead };
})(window);

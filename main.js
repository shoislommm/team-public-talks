/* ==========================================================================
   TEAM Public Talks — логика страницы: переключатель языка, программа
   вечера, ссылка на календарь, форма регистрации.
   ========================================================================== */
(function (window, document) {
  "use strict";

  var config = window.TPT_CONFIG;
  var i18n = window.I18n;

  var agendaContainer = document.getElementById("agenda");
  var langSwitcher = document.getElementById("langSwitcher");
  var calendarLink = document.getElementById("calendarLink");
  var mapLink = document.getElementById("mapLink");
  var form = document.getElementById("registrationForm");
  var formMessage = document.getElementById("formMessage");
  var submitButton = document.getElementById("submitButton");

  /* --------------------------------------------------------------- утилиты */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showMessage(kind, key) {
    formMessage.className = "form-msg " + kind;
    formMessage.textContent = i18n.t(key);
  }

  function clearMessage() {
    formMessage.className = "form-msg";
    formMessage.textContent = "";
  }

  /* ------------------------------------------------------ программа вечера */
  function renderAgenda() {
    var minutesLabel = i18n.t("program.minutes", "мин");

    agendaContainer.innerHTML = config.AGENDA.map(function (item) {
      var title = i18n.t("agenda." + item.id + ".title");
      var note = i18n.t("agenda." + item.id + ".note");
      var duration = item.duration ? item.duration + " " + minutesLabel : "";

      return (
        '<div class="row">' +
          '<div class="row-time">' + escapeHtml(item.time) + "</div>" +
          '<div class="row-main">' +
            '<div class="row-title">' + escapeHtml(title) + "</div>" +
            '<div class="row-note">' + escapeHtml(note) + "</div>" +
          "</div>" +
          '<div class="row-dur">' + escapeHtml(duration) + "</div>" +
        "</div>"
      );
    }).join("");
  }

  /* ------------------------------------------------ ссылки: карта, календарь */
  function updateLinks() {
    if (mapLink) {
      mapLink.href = config.EVENT.mapUrl;
    }

    if (calendarLink) {
      var params = new URLSearchParams({
        action: "TEMPLATE",
        text: i18n.t("calendar.title"),
        dates: config.EVENT.calendarStartUtc + "/" + config.EVENT.calendarEndUtc,
        details: i18n.t("calendar.details"),
        location: i18n.t("calendar.location")
      });
      calendarLink.href =
        "https://calendar.google.com/calendar/render?" + params.toString();
    }
  }

  /* -------------------------------------------------- переключение языка */
  function markActiveLanguage(language) {
    langSwitcher.querySelectorAll("button").forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-lang") === language)
      );
    });
  }

  langSwitcher.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-lang]");
    if (button) {
      i18n.setLanguage(button.getAttribute("data-lang"));
    }
  });

  i18n.onChange(function (language) {
    markActiveLanguage(language);
    renderAgenda();
    updateLinks();
    clearMessage();
  });

  /* ------------------------------------------------------ форма регистрации */
  function collectPayload() {
    var data = Object.fromEntries(new FormData(form).entries());
    return {
      fullName: (data.fullName || "").trim(),
      phone: (data.phone || "").trim(),
      email: (data.email || "").trim(),
      organization: (data.organization || "").trim(),
      attendeeType: data.attendeeType || "",
      question: (data.question || "").trim(),
      pageLanguage: i18n.getLanguage()
    };
  }

  function validate(payload) {
    if (!payload.fullName || !payload.phone || !payload.email) {
      return "form.errors.required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return "form.errors.email";
    }
    if (payload.phone.replace(/\D/g, "").length < 9) {
      return "form.errors.phone";
    }
    return null;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var payload = collectPayload();
    var errorKey = validate(payload);

    if (errorKey) {
      showMessage("err", errorKey);
      return;
    }

    /* Вебхук не заполнен — показываем демо-состояние, лид не создаём. */
    if (!config.BITRIX24_WEBHOOK_URL) {
      showMessage("ok", "form.messages.demo");
      if (window.console && console.log) {
        console.log("[team-public-talks] Demo mode, payload:", payload);
      }
      return;
    }

    /* Лид уходит в фоне: пользователю сразу показываем успех,
       ошибки Битрикса остаются в консоли. */
    submitButton.disabled = true;
    submitButton.textContent = i18n.t("form.messages.sending");

    window.Bitrix.createLead(payload);

    form.reset();
    showMessage("ok", "form.messages.success");
    submitButton.disabled = false;
    submitButton.textContent = i18n.t("form.submit");
  });

  /* ------------------------------------------------------------- запуск */
  i18n.setLanguage(i18n.detectLanguage());
})(window, document);

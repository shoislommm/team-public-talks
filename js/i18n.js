/* ==========================================================================
   TEAM Public Talks — локализация.
   Словари лежат в locales/ru.json, locales/uz.json, locales/en.json
   и подгружаются по требованию. В разметке — атрибут data-i18n="ключ.путь".
   ========================================================================== */
(function (window, document) {
  "use strict";

  var config = window.TPT_CONFIG;
  var cache = {};
  var currentLanguage = config.DEFAULT_LANGUAGE;
  var currentDictionary = {};
  var listeners = [];

  /* Достаёт значение по точечному пути: t("speaker.topic"). */
  function translate(key, fallback) {
    var parts = String(key).split(".");
    var node = currentDictionary;

    for (var i = 0; i < parts.length; i++) {
      if (node === null || typeof node !== "object" || !(parts[i] in node)) {
        return fallback !== undefined ? fallback : "";
      }
      node = node[parts[i]];
    }
    return typeof node === "string"
      ? node
      : fallback !== undefined
        ? fallback
        : "";
  }

  function loadDictionary(language) {
    if (cache[language]) {
      return Promise.resolve(cache[language]);
    }

    /* В однофайловой сборке (dist/index.html) словари уже встроены. */
    if (window.TPT_BUNDLED_LOCALES && window.TPT_BUNDLED_LOCALES[language]) {
      cache[language] = window.TPT_BUNDLED_LOCALES[language];
      return Promise.resolve(cache[language]);
    }

    return fetch("locales/" + language + ".json", { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then(function (dictionary) {
        cache[language] = dictionary;
        return dictionary;
      });
  }

  /* Проставляет переводы во все элементы с data-i18n.
     Текстовые узлы — через textContent, атрибуты — через data-i18n-placeholder
     и data-i18n-aria-label. */
  function applyToDom() {
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var value = translate(element.getAttribute("data-i18n"));
      if (value) {
        element.textContent = value;
      }
    });

    document
      .querySelectorAll("[data-i18n-placeholder]")
      .forEach(function (element) {
        var value = translate(element.getAttribute("data-i18n-placeholder"));
        if (value) {
          element.setAttribute("placeholder", value);
        }
      });

    document
      .querySelectorAll("[data-i18n-aria-label]")
      .forEach(function (element) {
        var value = translate(element.getAttribute("data-i18n-aria-label"));
        if (value) {
          element.setAttribute("aria-label", value);
        }
      });

    document.documentElement.lang = translate("meta.htmlLang", currentLanguage);

    var title = translate("meta.title");
    if (title) {
      document.title = title;
    }
  }

  function setLanguage(language) {
    if (config.SUPPORTED_LANGUAGES.indexOf(language) === -1) {
      language = config.DEFAULT_LANGUAGE;
    }

    return loadDictionary(language)
      .then(function (dictionary) {
        currentLanguage = language;
        currentDictionary = dictionary;
        applyToDom();

        try {
          localStorage.setItem(config.LANGUAGE_STORAGE_KEY, language);
        } catch (error) {
          /* приватный режим — просто не запоминаем выбор */
        }

        listeners.forEach(function (listener) {
          listener(language, dictionary);
        });
        return dictionary;
      })
      .catch(function (error) {
        if (window.console && console.error) {
          console.error(
            "[team-public-talks] Не удалось загрузить словарь:",
            language,
            error,
          );
        }
      });
  }

  /* Язык при первом заходе: сохранённый выбор → язык браузера → русский. */
  function detectLanguage() {
    var saved = null;
    try {
      saved = localStorage.getItem(config.LANGUAGE_STORAGE_KEY);
    } catch (error) {
      saved = null;
    }
    if (saved && config.SUPPORTED_LANGUAGES.indexOf(saved) !== -1) {
      return saved;
    }

    if (config.DETECT_BROWSER_LANGUAGE) {
      var browser = (navigator.language || "").slice(0, 2).toLowerCase();
      if (config.SUPPORTED_LANGUAGES.indexOf(browser) !== -1) {
        return browser;
      }
    }

    return config.DEFAULT_LANGUAGE;
  }
  window.I18n = {
    t: translate,
    setLanguage: setLanguage,
    detectLanguage: detectLanguage,
    getLanguage: function () {
      return currentLanguage;
    },
    getDictionary: function () {
      return currentDictionary;
    },
    onChange: function (listener) {
      listeners.push(listener);
    },
  };
})(window, document);

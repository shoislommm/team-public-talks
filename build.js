/* ==========================================================================
   Сборка одного самодостаточного файла: dist/index.html
   CSS, JS и все словари inline — файл можно открыть с диска (file://)
   или вставить в Tilda как HTML-блок, без локального сервера.

   Запуск:  node build.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const LANGUAGES = ["ru", "uz", "en"];

let html = read("index.html");

/* --- 1. Инлайним стили ---------------------------------------------------- */
html = html.replace(
  '<link rel="stylesheet" href="css/styles.css">',
  "<style>\n" + read("css/styles.css") + "\n</style>"
);

/* --- 2. Встраиваем словари, чтобы i18n.js не ходил в fetch ---------------- */
const bundledLocales = {};
LANGUAGES.forEach((lang) => {
  bundledLocales[lang] = JSON.parse(read(`locales/${lang}.json`));
});

const localesScript =
  "<script>window.TPT_BUNDLED_LOCALES = " +
  JSON.stringify(bundledLocales) +
  ";</script>";

/* --- 3. Инлайним скрипты в том же порядке, что и в index.html ------------- */
const scripts = ["js/config.js", "js/i18n.js", "js/bitrix.js", "js/main.js"];
const inlineScripts = scripts
  .map((file) => "<script>\n" + read(file) + "\n</script>")
  .join("\n");

const scriptTags = scripts
  .map((file) => `<script src="${file}"></script>`)
  .join("\n");

html = html.replace(scriptTags, localesScript + "\n" + inlineScripts);

/* --- 4. Записываем результат --------------------------------------------- */
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/index.html"), html, "utf8");

console.log(
  "dist/index.html собран —",
  (Buffer.byteLength(html, "utf8") / 1024).toFixed(1),
  "КБ"
);

/**
 * Inline script run before React hydrates. Reads the saved theme from
 * localStorage (or system preference as fallback) and applies the `.dark`
 * class to <html> so there's no flash of unstyled content on first paint.
 *
 * Keep this self-contained — it runs in the browser pre-hydration with no
 * access to React or any module-level imports.
 */
export function ThemeScript() {
  const code = `
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    root.style.colorScheme = theme;
  } catch (_) {}
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

// Runs before paint to set data-theme and avoid a flash. Ported verbatim
// from the reference <head> script (vero-theme key).
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('vero-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

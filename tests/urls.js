// Preserve the repository subdirectory when testing the GitHub Pages build.
export function appUrl(path) {
  const base = (process.env.FRONTEND_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
  return base + '/#' + path;
}

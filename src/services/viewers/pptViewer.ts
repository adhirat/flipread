
export function pptViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title} — Viewer</title>
    <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f0f0;color:#333}</style>
</head>
<body>
    <div style="text-align:center">
        <h1>Presentation Viewer</h1>
        <p>Support for presentations is coming soon.</p>
    </div>
</body>
</html>`;
}

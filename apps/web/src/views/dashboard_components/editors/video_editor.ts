
export const videoView = `
<div id="composer-video" class="composer-pane card" style="display:none;margin-top:24px;padding:0;overflow:hidden;border:1px solid var(--border)">
    <!-- Visual Toolbar for Video Editor -->
    <div class="editor-toolbar" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:2">
        <h3 style="margin:0;font-size:16px"><i class="fas fa-film text-secondary"></i> Professional Video Editor (Webcut)</h3>
        <div style="flex:1"></div>
        <button class="btn" style="padding:6px 12px;font-size:12px;" onclick="initWebcut()"><i class="fas fa-play-circle"></i> Init Video Engine</button>
    </div>

    <!-- Main Video Editor Canvas Area -->
    <div style="background:var(--bg-secondary);height:700px;display:flex;flex-direction:column;position:relative">
         <div id="webcut-container" style="width:100%; height:700px; background:#000; overflow:hidden"></div>
         <div id="webcut-placeholder" style="position:absolute; inset:0; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; background:#fff">
           <i class="fas fa-video" style="font-size:48px;color:var(--border)"></i>
           <p class="text-secondary" style="font-size:14px">Visual video editing with transitions, timelines, and effects.</p>
           <button class="btn" onclick="initWebcut()">Load Pro Video Engine</button>
        </div>
    </div>
</div>
`;

export const videoScript = `
let webcutInitialized = false;

async function initWebcut() {
    if (webcutInitialized) return;
    
    // Check for webcut library
    if (!window.Webcut) {
        alert('Video editor library (Webcut) is loading. Please try again.');
        return;
    }

    document.getElementById('webcut-placeholder').style.display = 'none';
    const container = document.getElementById('webcut-container');
    
    try {
        const editor = new window.Webcut({
            container: container,
            width: '100%',
            height: '100%',
        });
        
        // Add a sample clip if possible
        // editor.addSource('https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4');
        
        webcutInitialized = true;
        showToast('Video editor initialized successfully');
    } catch (err) {
        console.error('Webcut initialization failed:', err);
        alert('Failed to initialize advanced video editor.');
    }
}
`;

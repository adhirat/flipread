
export const getSidebarStyles = (accent: string) => `
    #chat-w { position: fixed; right: -100vw; top: 0; bottom: 0; width: 100vw; background: rgba(255,255,255,0.99); backdrop-filter: blur(25px); z-index: 2500; border-left: 1px solid rgba(0,0,0,0.15); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: none; transform: none !important; }
    @media (min-width: 640px) { #chat-w { width: 420px; right: -450px; } }
    #chat-w.o { right: 0; box-shadow: -25px 0 60px rgba(0,0,0,0.15); }
    .chat-h { padding: 18px 20px; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; background: #fff; color: #000; z-index: 10; font-weight: 800; }
    .chat-tabs { display: flex; border-bottom: 1px solid rgba(0,0,0,0.08); background: rgba(0,0,0,0.03); }
    .chat-tab { flex: 1; padding: 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: center; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; transition: 0.2s; color: #000; letter-spacing: 0.5px; }
    .chat-tab.active { opacity: 1; border-color: ${accent}; background: white; }
    .chat-b { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 14px; background: white; }
    .chat-tab-c { display: none; width: 100%; flex-direction: column; gap: 14px; }
    .chat-tab-c.active { display: flex; }
    .chat-item { background: white; padding: 14px; border-radius: 10px; font-size: 14px; border: 1px solid rgba(0,0,0,0.08); position: relative; color: #1a1a1a; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02); line-height: 1.5; text-align: left; }
    .chat-del, .chat-edit { opacity: 0.7; cursor: pointer; transition: 0.2s; padding: 6px; border: none; background: transparent; }
    @media (min-width: 1024px) { .chat-del, .chat-edit { opacity: 0; } }
    .chat-del { color: #ef4444; }
    .chat-edit { color: ${accent}; }
    .chat-item:hover .chat-del, .chat-item:hover .chat-edit { opacity: 1; }
    .chat-f { padding: 18px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; gap: 10px; background: #fcfcfc; }
    .chat-i { flex: 1; background: white; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; padding: 12px; outline: none; font-size: 14px; resize: none; min-height: 48px; max-height: 150px; font-family: inherit; color: #000; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
    .chat-s { width: 48px; border-radius: 10px; background: ${accent}; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 16px; transition: all 0.2s; }
    .chat-s:hover { opacity: 0.9; transform: scale(1.05); }
    .chat-s:active { transform: scale(0.95); }
`;

export const getSidebarHtml = (showHighlights: boolean) => `
    <div id="chat-w">
        <div class="chat-h">
            <span class="text-[11px] font-black uppercase tracking-[0.1em] opacity-90">Personal Desk</span>
            <button onclick="window.toggleChat()" class="opacity-60 hover:opacity-100 transition-opacity p-2 -mr-2"><i class="fas fa-times"></i></button>
        </div>
        <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <span class="text-[10px] font-bold text-gray-400 tracking-wider">SYNCED LOCALLY</span>
            <button onclick="window.exportData()" class="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-all active:scale-95 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                <i class="fas fa-file-export text-[11px]"></i> EXPORT ALL
            </button>
        </div>
        ${showHighlights ? `
        <div class="chat-tabs">
            <div class="chat-tab active" data-tab="chat-notes" onclick="window.switchSidebarTab(this)">Notes</div>
            <div class="chat-tab" data-tab="chat-highlights" onclick="window.switchSidebarTab(this)">Highlights</div>
        </div>
        ` : ''}
        <div class="chat-b">
            <div id="chat-notes" class="chat-tab-c active"></div>
            ${showHighlights ? `
            <div id="chat-highlights" class="chat-tab-c">
                <p class="text-xs text-center opacity-40 py-10 leading-relaxed font-medium">Select text in the content to<br>capture a highlight.</p>
                <div id="hi-list" class="flex flex-col"></div>
            </div>
            ` : ''}
        </div>
        <div class="chat-f" id="chat-footer">
            <textarea id="note-input" placeholder="Type your realization here..." class="chat-i" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window.sendNote()}"></textarea>
            <button onclick="window.sendNote()" class="chat-s" id="send-note-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>
`;

export const getSidebarScripts = (fileUrl: string, showHighlights: boolean) => `
    const SB_FU = '${fileUrl.split('?')[0]}';
    window.editingNoteIndex = -1;
    
    window.toggleChat = () => {
        const w = document.getElementById('chat-w');
        if(!w) return;
        w.classList.toggle('o');
        if(w.classList.contains('o')) {
            window.renderNotes();
            if(${showHighlights}) window.renderHighlights?.();
        }
    };

    // Auto-bind classic buttons if they exist
    const _nb = document.getElementById('notes-btn'); if(_nb) _nb.onclick = window.toggleChat;
    const _nbm = document.getElementById('notes-btn-mob'); if(_nbm) _nbm.onclick = window.toggleChat;

    window.switchSidebarTab = (el) => {
        const tabId = el.getAttribute('data-tab');
        document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.chat-tab-c').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        document.getElementById('chat-footer').style.display = tabId === 'chat-highlights' ? 'none' : 'flex';
    };

    window.sendNote = () => {
        const i = document.getElementById('note-input'), v = i.value.trim();
        if(!v) return;
        let notes = [];
        try { notes = JSON.parse(localStorage.getItem('fr_nt_'+SB_FU)) || []; } catch(e) {}
        
        if(window.editingNoteIndex > -1) {
            notes[window.editingNoteIndex].text = v;
            window.editingNoteIndex = -1;
            document.querySelector('#chat-footer .chat-s i').className = 'fas fa-paper-plane';
        } else {
            notes.push({text: v, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})});
        }
        localStorage.setItem('fr_nt_'+SB_FU, JSON.stringify(notes));
        i.value = '';
        window.renderNotes();
    };

    window.renderNotes = () => {
        const b = document.getElementById('chat-notes');
        if(!b) return;
        let notes = [];
        try { notes = JSON.parse(localStorage.getItem('fr_nt_'+SB_FU)) || []; } catch(e) {}
        b.innerHTML = notes.map((n, i) => \`
            <div class="chat-item">
                <p class="whitespace-pre-wrap text-sm">\${n.text}</p>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-[10px] opacity-40">\${n.time}</span>
                    <div class="flex gap-2">
                        <button class="chat-edit text-xs" onclick="window.editNote(\${i})"><i class="fas fa-edit"></i></button>
                        <button class="chat-del text-xs" onclick="window.deleteNote(\${i})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        \`).join('');
        b.scrollTop = b.scrollHeight;
    };

    window.editNote = (i) => {
        let notes = [];
        try { notes = JSON.parse(localStorage.getItem('fr_nt_'+SB_FU)) || []; } catch(e) {}
        if(!notes[i]) return;
        const input = document.getElementById('note-input');
        input.value = notes[i].text;
        input.focus();
        window.editingNoteIndex = i;
        document.querySelector('#chat-footer .chat-s i').className = 'fas fa-check';
    };

    window.deleteNote = (i) => {
        if(!confirm('Delete this note?')) return;
        let notes = [];
        try { notes = JSON.parse(localStorage.getItem('fr_nt_'+SB_FU)) || []; } catch(e) {}
        notes.splice(i, 1);
        localStorage.setItem('fr_nt_'+SB_FU, JSON.stringify(notes));
        window.renderNotes();
    };

    window.exportData = () => {
        let notes = [], highlights = [];
        try { 
            notes = JSON.parse(localStorage.getItem('fr_nt_'+SB_FU)) || []; 
            highlights = JSON.parse(localStorage.getItem('fr_hi_'+SB_FU)) || [];
        } catch(e) {}
        
        let content = "--- " + document.title.toUpperCase() + " ---\\n";
        content += "Exported from FlipRead\\n";
        content += "Date: " + new Date().toLocaleString() + "\\n";
        content += "------------------------------------------\\n\\n";
        
        if(highlights.length > 0) {
            content += "=== HIGHLIGHTS (" + highlights.length + ") ===\\n";
            highlights.forEach((h, i) => {
                content += "[" + (i+1) + "]: \\"" + (h.text || h.t || "[Loading...]") + "\\"\\n";
            });
            content += "\\n";
        }
        
        if(notes.length > 0) {
            content += "=== PERSONAL NOTES (" + notes.length + ") ===\\n";
            notes.forEach((n, i) => {
                content += "[" + n.time + "]: " + n.text + "\\n";
            });
        }
        
        if(notes.length === 0 && highlights.length === 0) {
            alert("No notes or highlights found to export.");
            return;
        }
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "FlipRead-Export-" + document.title.replace(/[^a-z0-9]/gi, '_') + ".txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
`;

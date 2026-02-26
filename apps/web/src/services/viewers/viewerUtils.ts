
export function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export const AMBIENT_SOUND_URLS = {
    rain: 'https://cdn.pixabay.com/audio/2022/03/10/audio_51307b0f69.mp3',
    fire: 'https://cdn.pixabay.com/audio/2021/08/09/audio_65b750170a.mp3',
    library: 'https://cdn.pixabay.com/audio/2023/10/24/audio_985b8c9d0d.mp3'
};

export const COMMON_READER_SCRIPTS = `
    const AMBIENT_URLS = ${JSON.stringify(AMBIENT_SOUND_URLS)};
    let ambAudio = null;

    window.playAmbient = (type) => {
        if(ambAudio) ambAudio.pause();
        if(!type || type === 'none') return;
        const url = AMBIENT_URLS[type];
        if(!url) return;
        ambAudio = new Audio(url);
        ambAudio.loop = true;
        ambAudio.play().catch(e => console.error("Ambient audio play failed:", e));
    };

    window.getReaderSetting = (key, def) => {
        const val = localStorage.getItem('fr_r_' + key);
        return val !== null ? val : def;
    };

    window.setReaderSetting = (key, val) => {
        localStorage.setItem('fr_r_' + key, val);
    };
`;

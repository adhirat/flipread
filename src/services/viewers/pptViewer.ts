import { getViewerBase } from './viewerBase';
import { escapeHtml } from './viewerUtils';

export function pptViewerHTML(title: string, fileUrl: string, coverUrl: string, settings: Record<string, unknown>, showBranding: boolean, logoUrl: string = '', storeUrl: string = '/', storeName: string = 'FlipRead'): string {
    const accent = (settings.accent_color as string) || '#4f46e5';
    const safeTitle = escapeHtml(title);
  
    const extraStyles = `
          #ppt-v { width: 100%; height: 100%; overflow: auto; display: flex; justify-content: center; align-items: flex-start; padding: 60px 20px; -webkit-overflow-scrolling: touch; }
          #ppt-c { width: 100%; max-width: 1000px; transform-origin: top center; transition: transform 0.1s ease-out; margin-bottom: 100px; }
          
          /* Override PPTXJS styles slightly to fit */
          .pptx-div { margin: 0 auto !important; margin-bottom: 20px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
          
          .side-nav {
              position: fixed;
              top: 50.5%;
              transform: translateY(-50%);
              z-index: 1000;
              width: 44px;
              height: 44px;
              background: rgba(255,255,255,0.05);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              opacity: 0.3;
          }
          .side-nav:hover {
              opacity: 1;
              background: rgba(255,255,255,0.15);
              transform: translateY(-50%) scale(1.1);
          }
          #side-prev { left: 24px; }
          #side-next { right: 24px; }

          @media(max-width:768px) {
              #ppt-v { padding: 40px 15px; }
              #ppt-c { width: 92%; margin: 0 auto; }
              .pptx-div { box-shadow: none !important; }
              .side-nav { display: none; }
          }
          
          link[href*="pptxjs.css"] { display: block; }
    `;

    const extraHtml = `
      <div id="ld-ppt" class="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center text-white gap-6">
          <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-t-${accent} rounded-full animate-spin"></div>
          </div>
          <p class="uppercase tracking-[0.2em] text-[10px] font-bold opacity-60">Loading Presentation...</p>
      </div>

      <button id="side-prev" class="side-nav" onclick="prevSlide()"><i class="fas fa-chevron-left text-xs"></i></button>
      <button id="side-next" class="side-nav" onclick="nextSlide()"><i class="fas fa-chevron-right text-xs"></i></button>
  
      <div id="ppt-v">
          <div id="ppt-c"></div>
      </div>
      
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.css">
    `;

    const extraScripts = `
          async function initPpt() {
              const isOdp = FILE_URL.match(/\\.odp$/i) || TITLE.match(/\\.odp$/i);
              try {
                  $("#ppt-c").pptxToHtml({
                      pptxFileUrl: FILE_URL,
                      slidesScale: "50%", 
                      slideMode: false,
                      keyBoardShortCut: false
                  });
                 
                  let check = setInterval(() => {
                      if($("#ppt-c").children().length > 0) {
                          clearInterval(check);
                          const ld = document.getElementById('ld-ppt');
                          if(ld) {
                            ld.style.opacity='0';
                            setTimeout(()=>ld.style.display='none', 500);
                          }
                      }
                  }, 500);
                  
                  setTimeout(() => { 
                    clearInterval(check); 
                    const ld = document.getElementById('ld-ppt');
                    if(ld && ld.style.display !== 'none') {
                        if (isOdp) ld.innerHTML = '<i class="fas fa-exclamation-triangle text-amber-500 text-3xl"></i><p class="mt-4">ODP Viewing Limited</p>';
                        else ld.style.display = 'none';
                    }
                  }, 10000);
                  
              } catch(e) {
                  const ld = document.getElementById('ld-ppt');
                  if(ld) ld.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i><p class="mt-4">' + (isOdp ? 'ODP Rendering Error' : 'Error Loading Presentation') + '</p>';
              }
          }
          
          function prevSlide(){
              const container = document.getElementById('ppt-v');
              const slides = container.querySelectorAll('.pptx-div');
              if(slides.length > 0) {
                  let current = 0;
                  const sTop = container.scrollTop;
                  slides.forEach((s, i) => { if(s.offsetTop - 100 <= sTop) current = i; });
                  if(current > 0) slides[current-1].scrollIntoView({behavior: 'smooth'});
              }
          }
          function nextSlide(){
              const container = document.getElementById('ppt-v');
              const slides = container.querySelectorAll('.pptx-div');
              if(slides.length > 0) {
                  let current = 0;
                  const sTop = container.scrollTop;
                  slides.forEach((s, i) => { if(s.offsetTop - 100 <= sTop) current = i; });
                  if(current < slides.length - 1) slides[current+1].scrollIntoView({behavior: 'smooth'});
              }
          }

          // Override applyZoom to handle PPT scaling
          const baseApplyZoom = window.applyZoom;
          window.applyZoom = () => {
              if(typeof baseApplyZoom === 'function') baseApplyZoom();
              const c = document.getElementById('ppt-c');
              if(c) c.style.transform = 'scale(' + (window.zoom || 1) + ')';
          };
          
          // Touch Swiping
          let ts=0, ty=0;
          document.addEventListener('touchstart', e => { ts = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive: true});
          document.addEventListener('touchend', e => {
              if(!ts || (window.zoom || 1) > 1) return;
              const te = e.changedTouches[0].clientX;
              const tye = e.changedTouches[0].clientY;
              const dx = ts - te;
              const dy = ty - tye;
              
              if(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
                  const el = e.target.closest('#chat-w') || e.target.closest('.modal-c');
                  if(!el) {
                      if(dx > 0) nextSlide();
                      else if(dx < 0) prevSlide();
                  }
              }
              ts = 0; ty = 0;
          }, {passive: true});

          initPpt();
    `;

    return getViewerBase({
        title,
        fileUrl,
        coverUrl,
        settings,
        showBranding,
        logoUrl,
        storeUrl, storeName,
        showTTS: true,
        showZoom: true,
        showWebViewLink: true,
        showFullMode: true,
        showNightShift: true,
        extraStyles,
        extraHtml,
        extraScripts,
        dependencies: [
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js',
            'https://cdn.jsdelivr.net/npm/pptxjs@1.21.1/dist/pptxjs.js'
        ]
    });
}

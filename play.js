// Playground pages: reveal on scroll, full-size viewer, draggable photo strips, picture switches.
(function(){
  document.documentElement.classList.add('js');
  var still=matchMedia('(prefers-reduced-motion:reduce)').matches;

  // things rise into place once, the first time they scroll in
  var rise=[].slice.call(document.querySelectorAll('.rise'));
  if('IntersectionObserver' in window && !still){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px'});
    rise.forEach(function(el){ io.observe(el); });
  } else rise.forEach(function(el){ el.classList.add('in'); });

  // click a picture to see it full size
  var dlg=document.querySelector('.viewer');
  if(dlg){
    var cap=dlg.querySelector('p'), big=document.createElement('img');
    dlg.insertBefore(big,cap);
    document.addEventListener('click',function(e){
      var b=e.target.closest('button.zoom'); if(!b||!dlg.showModal) return;
      var img=b.querySelector('img'); big.src=b.dataset.full||img.currentSrc||img.src; big.alt=img.alt; cap.textContent=img.alt; dlg.showModal();
    });
    dlg.addEventListener('click',function(e){ if(e.target!==big) dlg.close(); });
  }

  // photo strips: drag sideways with the mouse (touch scrolls natively)
  [].forEach.call(document.querySelectorAll('.strip'),function(s){
    var down=false,x0=0,s0=0,moved=false;
    s.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse') return; down=true; moved=false; x0=e.clientX; s0=s.scrollLeft; });
    window.addEventListener('pointermove',function(e){ if(!down) return; var dx=e.clientX-x0; if(Math.abs(dx)>4){ moved=true; s.classList.add('dragging'); } s.scrollLeft=s0-dx; });
    window.addEventListener('pointerup',function(){ if(!down) return; down=false; s.classList.remove('dragging'); });
    s.addEventListener('click',function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } },true);
  });

  // switches: each button shows its own picture and caption
  [].forEach.call(document.querySelectorAll('[data-switch]'),function(sw){
    var target=document.getElementById(sw.dataset.switch), img=target.querySelector('img'), cap=target.querySelector('[data-cap]');
    var btns=[].slice.call(sw.querySelectorAll('button'));
    btns.forEach(function(b){ new Image().src=b.dataset.src; b.addEventListener('click',function(){
      btns.forEach(function(o){ o.setAttribute('aria-pressed',o===b); });
      var go=function(){ img.src=b.dataset.src; img.alt=b.dataset.alt; if(cap) cap.textContent=b.dataset.cap||''; };
      if(still||!img.animate){ go(); return; }
      img.animate([{opacity:1,transform:'none'},{opacity:0,transform:'rotateY(80deg)'}],{duration:180,easing:'ease-in'}).onfinish=function(){
        go(); img.animate([{opacity:0,transform:'rotateY(-80deg)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.34,1.56,.64,1)'});
      };
    }); });
  });
})();

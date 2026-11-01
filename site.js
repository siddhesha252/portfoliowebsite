// Shared by the project pages: palette switcher, custom cursor, sticky section index.
(function(){
  var still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

  // custom cursor: "You" by default, "View project" on next-project links
  if(fine){
    var el=document.querySelector('.cursor'), tag=el.querySelector('.tag');
    var labels={me:"It's me",project:'View project'}, x=-100,y=-100,cx=x,cy=y,state='',raf=0;
    document.documentElement.classList.add('has-cursor');
    var set=function(next){
      if(next===state) return; state=next;
      el.classList.toggle('me',next==='me'); tag.textContent=labels[next]||'You';
      tag.classList.remove('pop'); void tag.offsetWidth; tag.classList.add('pop');
    };
    var tick=function(){
      var k=still?1:.35; cx+=(x-cx)*k; cy+=(y-cy)*k;
      el.style.transform='translate('+(cx-2)+'px,'+(cy-1)+'px)';
      raf=(Math.abs(x-cx)>.1||Math.abs(y-cy)>.1)?requestAnimationFrame(tick):0;
    };
    document.addEventListener('pointermove',function(e){
      x=e.clientX; y=e.clientY;
      if(!el.classList.contains('live')){cx=x;cy=y;el.classList.add('live')}
      var t=e.target.closest&&e.target.closest('[data-cursor]');
      set(t?t.dataset.cursor:'');
      if(!raf) raf=requestAnimationFrame(tick);
    });
    document.documentElement.addEventListener('pointerleave',function(){el.classList.remove('live')});
  }

  // section index: sticky, clickable, and follows the section being read
  var side=document.querySelector('[data-name="Sidebar"]'), list=document.querySelector('[data-name="Sections"]');
  if(side&&list){
    var wrap=document.createElement('div'); wrap.className='sticky-index';
    while(side.firstChild) wrap.appendChild(side.firstChild);
    side.appendChild(wrap);
    var back=wrap.querySelector('[data-name="Go back"]');
    if(back){ var a=document.createElement('a'); a.href='./#work'; a.setAttribute('aria-label','Go back to work'); back.parentNode.insertBefore(a,back); a.appendChild(back); }
    var secs=[].slice.call(list.children);
    var names=secs.map(function(s){return s.dataset.name});
    // index rows share their name with the section they point at; sub-lists and the marker are skipped
    var rows=secs.map(function(s){return wrap.querySelector('[data-name="Section index"] > [data-name="'+s.dataset.name+'"]')});
    var marker=wrap.querySelector('[data-name="Active marker"]');
    if(marker){ marker.parentNode.removeChild(marker); wrap.querySelector('[data-name="Section index"]').style.position='relative'; wrap.querySelector('[data-name="Section index"]').appendChild(marker); }
    var setActive=function(i){
      rows.forEach(function(r,k){
        if(!r) return;
        r.classList.toggle('idx-on',k===i);
        var ps=r.querySelectorAll('p'); if(ps[0]) ps[0].style.color=k===i?'':'#c4c3bd'; if(ps[1]) ps[1].style.color=k===i?'':'#62625e';
      });
      if(marker&&rows[i]){ marker.style.left='-16px'; marker.style.top='0'; marker.style.transform='translateY('+(rows[i].offsetTop-1)+'px)'; }
    };
    rows.forEach(function(r,i){
      if(!r) return;
      r.setAttribute('role','link'); r.tabIndex=0;
      var go=function(){ current=i; setActive(i); if(secs[i]) secs[i].scrollIntoView({behavior:still?'auto':'smooth',block:'start'}); };
      r.addEventListener('click',go); r.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();go();} });
    });
    var current=0; setActive(0);
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){ var i=secs.indexOf(en.target); if(i>-1&&i!==current){current=i;setActive(i);} } });
    },{rootMargin:'-35% 0px -60% 0px'});
    secs.forEach(function(s){ io.observe(s); });
  }

  // sticky header: a 1px marker at the very top tells us when the page has scrolled away from it
  var head=document.querySelector('.head');
  if(head){
    var mark=document.createElement('div'); mark.setAttribute('aria-hidden','true');
    mark.style.cssText='position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    document.body.prepend(mark);
    new IntersectionObserver(function(es){ head.classList.toggle('stuck',!es[0].isIntersecting); }).observe(mark);
  }

  // phones and tablets: anything still wider than the screen (covers, phone mockups, diagrams) is scaled down to fit
  var small=matchMedia('(max-width:1023px)'), fitted=[];
  var fitWide=function(){
    fitted.forEach(function(f){ f.el.style.zoom=''; f.el.style.width=f.w; f.el.style.flexWrap=f.fw; }); fitted=[];
    if(!small.matches) return;
    var all=[].slice.call(document.querySelectorAll('.site [data-name]')), over=[];
    // read pass: find boxes that overflow their parent (or hold an absolutely placed artwork wider than themselves)
    all.forEach(function(el){
      var cs=getComputedStyle(el); if(cs.position==='absolute'||cs.display==='none') return;
      // pieces inside a positioned artwork (cover, diagram) scale with the artwork, not on their own
      for(var a=el.parentElement;a&&!a.classList.contains('site');a=a.parentElement){ if(getComputedStyle(a).position==='absolute') return; }
      var par=el.parentElement, ps=getComputedStyle(par);
      var avail=par.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight);
      var absW=0; [].forEach.call(el.children,function(c){ if(getComputedStyle(c).position==='absolute') absW=Math.max(absW,c.offsetWidth); });
      var w=Math.max(el.offsetWidth,el.scrollWidth,absW>el.offsetWidth+2?absW:0);
      if(w>avail+2) over.push({el:el,w:w,avail:avail,frame:absW>el.offsetWidth+2?absW:0});
    });
    // keep only the innermost overflowing boxes, so text around them stays full size
    var set=over.map(function(o){return o.el});
    over=over.filter(function(o){ return !set.some(function(e){ return e!==o.el&&o.el.contains(e); }); });
    // write pass
    over.forEach(function(o){
      var el=o.el, rec={el:el,w:el.style.width,fw:el.style.flexWrap}; fitted.push(rec);
      var kids=[].slice.call(el.children), cs=getComputedStyle(el);
      var chips=cs.display.indexOf('flex')>-1&&cs.flexDirection==='row'&&kids.length>1&&kids.every(function(k){return k.offsetWidth<170&&!k.querySelector('img')});
      if(chips){ el.style.flexWrap='wrap'; return; }
      if(o.frame) el.style.width=o.frame+'px';
      el.style.zoom=(o.avail/o.w).toFixed(4);
    });
  };
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(fitWide,150); });
  if(document.readyState==='complete') fitWide(); else window.addEventListener('load',fitWide);
})();

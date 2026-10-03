const categoryMeta = {"math": ["คณิตศาสตร์พื้นฐาน", "ตัวแปร ฟังก์ชัน และการคิดด้วยสมการ", "Mathematics", "math"], "calculus": ["Calculus", "เข้าใจอัตราการเปลี่ยนแปลงและการสะสม", "Mathematics", "math"], "discrete": ["Discrete Mathematics", "ตรรกะ เซต การพิสูจน์ และการนับ", "Mathematics", "math"], "symbols": ["สัญลักษณ์คณิตศาสตร์", "อ่านสูตรให้เข้าใจ จากเครื่องหมายสู่ความหมาย", "Mathematics", "math"], "algorithms": ["Algorithms", "ค้นหา เรียงลำดับ และคำนวณทีละขั้น", "Computer Engineering", "computing"], "ds": ["Data Structures", "เลือกวิธีจัดเก็บข้อมูลให้เหมาะกับงาน", "Computer Engineering", "computing"], "memory": ["Programming & Memory", "เข้าใจ pointer และอายุของข้อมูล", "Computer Engineering", "computing"], "digital": ["Digital Logic", "จากเลขฐานสองสู่กติกาของวงจร", "Computer Engineering", "computing"], "architecture": ["Computer Architecture", "สำรวจ CPU, cache และประสิทธิภาพ", "Computer Engineering", "computing"], "os": ["Operating Systems", "process, thread และการแบ่งทรัพยากร", "Computer Engineering", "computing"], "networks": ["Networks", "ข้อมูลเดินทางระหว่างเครื่องอย่างไร", "Computer Engineering", "computing"], "embedded": ["Circuits & Embedded", "เชื่อมโปรแกรมกับสัญญาณและอุปกรณ์จริง", "Computer Engineering", "computing"], "database": ["Databases", "ค้นข้อมูลด้วย SQL และรักษาความถูกต้อง", "Computer Engineering", "computing"], "software": ["Software Engineering", "เขียน ตรวจ และพัฒนาโปรแกรมร่วมกัน", "Computer Engineering", "computing"], "security": ["Security", "เข้าใจตัวตน สิทธิ์ และการปกป้องข้อมูล", "Computer Engineering", "computing"], "model": ["Mathematical Models", "อธิบายระบบจริงด้วยแบบจำลอง", "Models & Data", "models"], "process": ["Modelling Process", "ตั้งคำถาม สร้างโมเดล และตรวจผล", "Models & Data", "models"], "ml": ["Machine Learning", "เรียนรู้รูปแบบจากข้อมูลและวัดผล", "Models & Data", "models"], "examples": ["ตัวอย่างแบบจำลอง", "เชื่อมสมการกับปัญหาที่จับต้องได้", "Models & Data", "models"]};
'use strict';
if(window.lucide)lucide.createIcons({attrs:{'aria-hidden':'true','focusable':'false'}});
const cards=[...document.querySelectorAll('.kw-card')];
const categories=[...document.querySelectorAll('.category')];
const library=document.getElementById('libraryView'),reader=document.getElementById('readerView');
const search=document.getElementById('searchBox'),select=document.getElementById('categorySelect');
const searchIndex=new Map(cards.map(card=>[card,([...card.querySelectorAll('.kw-header,.kw-meaning,.kw-professor,.math-example,.remember,.algo-io,.algo-step,.algo-quiz,.algo-code')].map(el=>el.textContent).join(' ')+' '+card.dataset.keywords).toLowerCase()]));
let activeCategory='all';
categories.forEach(c=>c.querySelector('.category-count').textContent=c.querySelectorAll('.kw-card').length);
function syncNavigation(value){
 select.value=value;
 document.querySelectorAll('.filter-tab').forEach(t=>{const active=t.dataset.category===value;t.classList.toggle('active',active);t.setAttribute('aria-pressed',String(active));});
 document.querySelectorAll('[data-library]').forEach(t=>t.classList.toggle('active',value==='library'));
 document.querySelectorAll('.top-link').forEach(t=>t.classList.toggle('current',t.hasAttribute('data-library')?value==='library':value==='all'));
}
function applyFilters(){
 const q=search.value.trim().toLowerCase();let count=0;
 categories.forEach(category=>{let visible=0;category.querySelectorAll('.kw-card').forEach(card=>{
  const show=(activeCategory==='all'||activeCategory===category.dataset.cat)&&(!q||searchIndex.get(card).includes(q));
  card.hidden=!show;if(show){count++;visible++;}
 });category.hidden=visible===0;});
 document.getElementById('resultCount').textContent=count?`${count} หัวข้อ${q?'ที่ตรงกับคำค้น':''} จากทั้งหมด 155`:'ไม่พบหัวข้อที่ตรงกับคำค้น';
 document.getElementById('emptyState').hidden=count>0;
}
function openReader(cat,scroll=true){
 activeCategory=cat;library.hidden=true;reader.hidden=false;syncNavigation(cat);
 const meta=categoryMeta[cat];reader.classList.toggle('single-category',!!meta);
 document.getElementById('readerTitle').textContent=meta?meta[0]:'ทุกหัวข้อ';
 document.getElementById('readerDescription').textContent=meta?meta[1]:'สำรวจทั้ง 155 แนวคิด หรือค้นหาเรื่องที่อยากทบทวน';
 document.getElementById('readerGroup').textContent=meta?meta[2].toUpperCase():'YOUR STUDY NOTES';
 applyFilters();if(scroll){window.scrollTo({top:0,behavior:'instant'});const heading=document.getElementById('readerTitle');heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
function openLibrary(scroll=true){
 search.value='';library.hidden=false;reader.hidden=true;syncNavigation('library');
 if(scroll){window.scrollTo({top:0,behavior:'instant'});const heading=library.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
function navigate(route,clear=true){
 if(clear)search.value='';
 if(location.hash!==`#${route}`)history.pushState(null,'',`#${route}`);
 if(route==='library')openLibrary();else openReader(route);
}
function routeFromHash(){
 const route=decodeURIComponent(location.hash.slice(1)||'library');
 if(route==='library')openLibrary(false);
 else if(route==='all'||categoryMeta[route])openReader(route,false);
 else{
  const target=document.getElementById(route);
  if(target?.classList.contains('kw-card')){
   openReader(target.closest('.category').dataset.cat,false);
   Promise.resolve(window.MathJax?.startup?.promise).then(()=>target.scrollIntoView({block:'start'}));
  }else openLibrary(false);
 }
}
document.querySelectorAll('[data-library]').forEach(button=>button.addEventListener('click',()=>navigate('library')));
document.querySelectorAll('[data-all]').forEach(button=>button.addEventListener('click',()=>navigate('all')));
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.open)));
document.querySelectorAll('.filter-tab').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.category,false)));
select.addEventListener('change',()=>navigate(select.value,false));
search.addEventListener('input',()=>{if(reader.hidden){history.pushState(null,'','#all');openReader('all',false);}else applyFilters();});
document.getElementById('clearSearch').addEventListener('click',()=>{search.value='';applyFilters();search.focus();});
window.addEventListener('hashchange',routeFromHash);
document.querySelectorAll('[data-group-filter]').forEach(button=>button.addEventListener('click',()=>{
 const group=button.dataset.groupFilter;
 document.querySelectorAll('[data-group-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 document.querySelectorAll('.course-card').forEach(card=>card.hidden=group!=='all'&&card.dataset.group!==group);
}));
document.querySelectorAll('.algo-trace').forEach(trace=>{
 let step=0;const steps=[...trace.querySelectorAll('.algo-step')];
 trace.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{
  step=Math.max(0,Math.min(steps.length-1,step+Number(button.dataset.step)));
  steps.forEach((el,i)=>el.hidden=i!==step);trace.querySelector('.algo-steps').start=step+1;
  trace.querySelector('.trace-progress').textContent=`${step+1} / ${steps.length}`;
  trace.querySelector('[data-step="-1"]').disabled=step===0;trace.querySelector('[data-step="1"]').disabled=step===steps.length-1;
 }));
});
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');let globallyPaused=reduceMotion.matches;
const images=[...document.querySelectorAll('img[data-gif]')];
function syncImage(img){
 const playing=!globallyPaused&&!img.dataset.paused&&img.dataset.visible==='true';
 const src=playing?img.dataset.gif:img.dataset.still;if(img.getAttribute('src')!==src)img.src=src;
 const button=img.closest('figure').querySelector('.motion-toggle');button.textContent=playing?'หยุด GIF':'เล่น GIF';button.setAttribute('aria-pressed',String(playing));
}
function syncAll(){images.forEach(syncImage);const button=document.getElementById('globalMotion');button.textContent=globallyPaused?'เล่นภาพเคลื่อนไหว':'หยุดภาพเคลื่อนไหว';button.setAttribute('aria-pressed',String(!globallyPaused));}
const observer=new IntersectionObserver(entries=>{for(const e of entries){e.target.dataset.visible=String(e.isIntersecting);syncImage(e.target);}},{threshold:.05});
images.forEach(img=>{observer.observe(img);img.closest('figure').querySelector('.motion-toggle').addEventListener('click',()=>{
 const playing=img.getAttribute('src')===img.dataset.gif;
 if(!playing){globallyPaused=false;delete img.dataset.paused;img.dataset.visible='true';}else img.dataset.paused='true';syncAll();
});});
document.getElementById('globalMotion').addEventListener('click',()=>{globallyPaused=!globallyPaused;if(!globallyPaused)images.forEach(img=>delete img.dataset.paused);syncAll();});
reduceMotion.addEventListener('change',e=>{globallyPaused=e.matches;syncAll();});syncAll();routeFromHash();

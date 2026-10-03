'use strict';
// Keep single-finger scrolling, but prevent pinch zoom where the browser permits it.
for(const type of ['gesturestart','gesturechange'])document.addEventListener(type,event=>event.preventDefault(),{passive:false});
document.addEventListener('touchmove',event=>{if(event.touches.length>1)event.preventDefault();},{passive:false});
const installButton=document.getElementById('installApp'),offlineButton=document.getElementById('saveOffline'),updateButton=document.getElementById('updateApp'),offlineStatus=document.getElementById('offlineStatus');
const help=document.getElementById('installHelp');let installPrompt=null,registration=null,updateRequested=false,refreshing=false;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
installButton.hidden=standalone();
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true;});
installButton.addEventListener('click',async()=>{
 if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;return;}
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 document.getElementById('installInstructions').textContent=ios?'บน iPhone หรือ iPad เปิดเว็บนี้ด้วย Safari แล้วแตะปุ่มแชร์ เลือก “เพิ่มไปยังหน้าจอโฮม” และกด “เพิ่ม” จากนั้นเปิด Foundations จากไอคอนบนหน้าจอโฮม':'เปิดเมนูของเบราว์เซอร์ แล้วเลือก “ติดตั้งแอป” หรือ “เพิ่มไปยังหน้าจอโฮม” หากเบราว์เซอร์รองรับ คุณยังอ่านเว็บนี้ได้ตามปกติโดยไม่ต้องติดตั้ง';
 help.showModal();
});
document.getElementById('closeInstallHelp').addEventListener('click',()=>help.close());
function workerMessage(type,onProgress){return new Promise((resolve,reject)=>{
 const worker=navigator.serviceWorker.controller||registration?.active;
 if(!worker){reject(new Error('ยังไม่พร้อม'));return;}
 const channel=new MessageChannel();let timeout;
 const resetTimeout=()=>{clearTimeout(timeout);timeout=setTimeout(()=>{channel.port1.close();reject(new Error('หมดเวลา'));},60000);};resetTimeout();
 channel.port1.onmessage=event=>{resetTimeout();const data=event.data;if(data.type==='PROGRESS'){onProgress?.(data);return;}clearTimeout(timeout);channel.port1.close();if(data.type==='ERROR')reject(new Error(data.message));else resolve(data);};
 worker.postMessage({type},[channel.port2]);
});}
function showReady(){offlineStatus.textContent='พร้อมอ่านออฟไลน์: เนื้อหา สูตร และภาพ GIF ครบทั้งชุด';offlineButton.textContent='ออฟไลน์พร้อมแล้ว';offlineButton.disabled=true;}
offlineButton.disabled=true;
if('serviceWorker' in navigator&&['https:','http:'].includes(location.protocol)){
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async reg=>{
  registration=reg;
  const showUpdate=()=>{if(reg.waiting&&navigator.serviceWorker.controller)updateButton.hidden=false;};showUpdate();
  reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')showUpdate();});});
  await navigator.serviceWorker.ready;offlineButton.disabled=false;
  const status=await workerMessage('STATUS');
  if(status.complete)showReady();else offlineButton.textContent=`เก็บไว้อ่านออฟไลน์ (${status.megabytes} MB)`;
 }).catch(()=>{offlineStatus.textContent='ยังเตรียมออฟไลน์ไม่สำเร็จ ลองรีเฟรชขณะเชื่อมต่ออินเทอร์เน็ต';offlineButton.disabled=true;});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updateRequested&&!refreshing){refreshing=true;location.reload();}});
}else{
 offlineStatus.textContent='เปิดเว็บผ่าน HTTPS เพื่อใช้งาน PWA; ชุดไฟล์ในเครื่องยังเปิดอ่านได้ตามปกติ';
}
offlineButton.addEventListener('click',async()=>{
 offlineButton.disabled=true;offlineStatus.textContent='กำลังเก็บบทเรียนและภาพในเครื่อง…';
 try{await workerMessage('DOWNLOAD',progress=>{offlineStatus.textContent=`กำลังเก็บไว้ในเครื่อง ${progress.done} / ${progress.total} ไฟล์ (${Math.round(progress.done/progress.total*100)}%)`;});showReady();}
 catch{offlineStatus.textContent='เก็บบางไฟล์ยังไม่ครบ เชื่อมต่ออินเทอร์เน็ตแล้วกดอีกครั้งเพื่อทำต่อ';offlineButton.disabled=false;offlineButton.textContent='ดาวน์โหลดต่อ';}
});
updateButton.addEventListener('click',()=>{if(registration?.waiting){updateRequested=true;registration.waiting.postMessage({type:'SKIP_WAITING'});}});

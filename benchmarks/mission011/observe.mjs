// Executed inside Chrome. Declarative task scope limits what can be asserted automatically.
export function observePage(){
 const width=document.documentElement.clientWidth;
 const activeDialog=[...document.querySelectorAll('dialog[open]')].at(-1);
 const ordinaryOverflowNodes=[...document.querySelectorAll('main>*,[data-ordinary]')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>width+1&&!e.closest('.table-scroll,[data-scroll-kind]');}).map(e=>e.id||e.className||e.tagName);
 const actions=[...document.querySelectorAll('[data-edit],#retry,#empty-clear')].filter(e=>!activeDialog||activeDialog.contains(e)).map(e=>{const r=e.getBoundingClientRect();return{id:e.dataset.edit||e.id,essential:true,visibleRepresentation:!!e.getClientRects().length,horizontalTravel:Math.max(0,r.right-width,-r.left)};});
 const contents=[...document.querySelectorAll('[data-critical]')].map(e=>({id:e.id,critical:true,clipped:e.scrollWidth>e.clientWidth+1,fullContentAccess:!!document.querySelector(`[aria-controls="${e.dataset.detail}"]`)}));
 const regions=[...document.querySelectorAll('.table-scroll,[data-scroll-kind],.dialog-body,#active')].filter(e=>e.getClientRects().length).map((e,i)=>{
 const horizontal=e.scrollWidth>e.clientWidth+1,vertical=e.scrollHeight>e.clientHeight+1;
 const css=getComputedStyle(e);const kind=e.dataset.scrollKind||(e.matches('.table-scroll')?'table':e.matches('.dialog-body')?'dialog':'filters');
 const cueElement=e.matches('.table-scroll')?document.querySelector('.scroll-hint'):document.getElementById(e.dataset.cue);
 const cue=!!cueElement?.getClientRects().length;
 const alternativeControls=!!e.dataset.alternative&&document.querySelectorAll(`[data-for="${e.id}"]`).length>=2;
 let sameAxisNested=false;for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const s=getComputedStyle(p);if(horizontal&&p.scrollWidth>p.clientWidth+1&&/auto|scroll/.test(s.overflowX)||vertical&&p.scrollHeight>p.clientHeight+1&&/auto|scroll/.test(s.overflowY))sameAxisNested=true;}
 return{id:e.id||kind+i,kind,overflows:horizontal||vertical,axis:horizontal?'horizontal':'vertical',scrollbar:css.scrollbarWidth==='none'?'hidden':'auto',cue,alternativeControls,keyboardVerified:false,sameAxisNested,overflowX:css.overflowX,overflowY:css.overflowY};
 });
 return{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,pageOverflow:Math.max(0,document.documentElement.scrollWidth-width),ordinaryOverflowNodes,actions,contents,regions,priorityColumnsHidden:false,bodyFocusStop:false,dialogOpen:!!activeDialog,title:document.title};
}

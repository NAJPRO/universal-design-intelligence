/** Benchmark-only evidence classifier, not a general runtime scanner or WCAG audit. */
export function assess(o){
 const findings=[];const add=(id,certainty,detail)=>findings.push({id,certainty,detail});
 if(o.pageOverflow>1)add('page-overflow',o.ordinaryOverflowNodes?.length?'failure':'warning',{pixels:o.pageOverflow,nodes:o.ordinaryOverflowNodes??[]});
 for(const a of o.actions??[])if(a.essential&&a.visibleRepresentation&&a.horizontalTravel>1)add('essential-action-travel','failure',{id:a.id,pixels:a.horizontalTravel});
 for(const c of o.contents??[])if(c.critical&&c.clipped&&!c.fullContentAccess)add('critical-truncation','failure',{id:c.id});
 for(const d of o.dialogActions??[])if(d.open&&!d.reachableAfterReveal)add('dialog-action-unreachable','failure',{id:d.id});
 if(o.focusLostOnRestructure===true)add('focus-restructure','failure',{});
 for(const region of o.regions??[]){
  if(!region.overflows)continue;
  if(region.kind==='accidental'){add('accidental-region','failure',{id:region.id});continue;}
  if(!region.cue&&!region.alternativeControls)add('scroll-discovery','warning',{id:region.id,kind:region.kind});
  if(region.scrollbar==='hidden'&&(!region.alternativeControls||!region.keyboardVerified||!region.touchVerified))add('hidden-scrollbar-operation','warning',{id:region.id,kind:region.kind});
  if(region.sameAxisNested)add('nested-scroll','warning',{id:region.id,kind:region.kind});
 }
 if(o.priorityColumnsHidden)add('priority-columns','warning',{note:'Judge declared task and reachable detail, not width alone.'});
 if(o.bodyFocusStop)add('dialog-body-focus','warning',{note:'Check actual background-control access before asserting escape.'});
 return findings;
}

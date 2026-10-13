export function shelfEdges(left,width,total,tolerance=2){const max=Math.max(0,total-width);return {previous:left>tolerance,next:left<max-tolerance,max};}
export function shelfTarget(left,width,total,direction){const max=Math.max(0,total-width);return Math.min(max,Math.max(0,left+direction*width*.8));}
export function sceneTarget(index,direction,count){return Math.min(Math.max(0,count-1),Math.max(0,index+direction));}

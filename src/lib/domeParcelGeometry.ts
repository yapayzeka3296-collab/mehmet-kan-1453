type Center={lat:number;lng:number};

/** Small, dome-like parcel cells projected around a city center. */
export function domeCellPath(center:Center,index:number,total:number,radius=0.085){
  const cols=Math.max(8,Math.ceil(Math.sqrt(total*1.35)));
  const rows=Math.max(8,Math.ceil(total/cols));
  const col=index%cols,row=Math.floor(index/cols);
  const u0=col/cols,u1=(col+1)/cols;
  const v0=row/rows,v1=(row+1)/rows;
  const x=(u:number)=>(u-.5)*2;
  const y=(v:number)=>(v-.5)*2;
  const project=(xx:number,yy:number)=>{
    const rr=Math.min(1,Math.sqrt(xx*xx+yy*yy));
    const dome=Math.sqrt(Math.max(0,1-rr*rr));
    const scale=radius*(0.72+0.28*dome);
    const lat=center.lat+yy*scale;
    const cos=Math.max(Math.cos(center.lat*Math.PI/180),.2);
    const lng=center.lng+xx*scale/cos;
    return {lat,lng};
  };
  return [project(x(u0),y(v0)),project(x(u1),y(v0)),project(x(u1),y(v1)),project(x(u0),y(v1))];
}

export function parcelDomeRadius(tier:"digital"|"elite"|"premium"){
  if(tier==="premium") return 0.028;
  if(tier==="elite") return 0.055;
  return 0.09;
}

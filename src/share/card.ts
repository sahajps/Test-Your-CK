import qrcode from 'qrcode-generator';
import type { Culture } from '../engine/types';

const accent:Record<Culture,string>={chinese:'#E5484D',japanese:'#5B6CFF',korean:'#22C3B5',vietnamese:'#F5B301',pakistani:'#2FB463',indian:'#FF9933',western:'#94A3B8'};
export async function shareCard(data:{culture:Culture;cultureName:string;score:number;correct:number;title:string;url:string;radar:(number|null)[]}){
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d')!;
 const g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#191329');g.addColorStop(.55,'#0b0b14');g.addColorStop(1,'#241020');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
 x.globalAlpha=.24;x.fillStyle=accent[data.culture];for(let i=0;i<7;i++){x.beginPath();x.ellipse(800+Math.cos(i)*180,180+Math.sin(i)*120,150,70,i*.7,0,Math.PI*2);x.fill()}x.globalAlpha=1;
 x.fillStyle='#ff71ad';x.font='700 44px system-ui';x.fillText('TEST-YOUR-CK',80,110);x.fillStyle='#fff';x.font='700 76px system-ui';x.fillText(data.cultureName,80,260);x.font='800 220px system-ui';x.fillText(String(data.score),70,510);x.fillStyle='#aca7bd';x.font='500 42px system-ui';x.fillText(`${data.correct}/12  ·  ${data.title}`,80,590);
 const cx=360,cy=875,R=210,n=data.radar.length;x.strokeStyle='#554b6c';x.lineWidth=3;for(let ring=1;ring<=4;ring++){x.beginPath();for(let i=0;i<n;i++){const a=-Math.PI/2+i*Math.PI*2/n,rr=R*ring/4;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.stroke()}
 x.beginPath();data.radar.forEach((v,i)=>{const a=-Math.PI/2+i*Math.PI*2/n,rr=R*(v||0)/100;const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;i?x.lineTo(px,py):x.moveTo(px,py)});x.closePath();x.fillStyle=accent[data.culture]+'66';x.fill();x.strokeStyle=accent[data.culture];x.lineWidth=8;x.stroke();
 const qr=qrcode(0,'M');qr.addData(data.url);qr.make();const count=qr.getModuleCount(),size=270,cell=size/count;x.fillStyle='#fff';x.fillRect(725,760,size,size);x.fillStyle='#111';for(let r=0;r<count;r++)for(let col=0;col<count;col++)if(qr.isDark(r,col))x.fillRect(725+col*cell,760+r*cell,Math.ceil(cell),Math.ceil(cell));
 x.fillStyle='#fff';x.font='700 36px system-ui';x.textAlign='center';x.fillText('Can you beat me?',860,1110);x.textAlign='left';x.fillStyle='#aaa4b8';x.font='400 30px system-ui';x.fillText('Camellia · arXiv:2510.05291',80,1260);
 const blob=await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Canvas export failed')),'image/png'));
 const file=new File([blob],'test-your-ck-score.png',{type:'image/png'});
 if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'Test-Your-CK',text:`I scored ${data.score}!`});return}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

declare module 'qrcode-generator' {
  type QR={addData(s:string):void;make():void;getModuleCount():number;isDark(r:number,c:number):boolean};
  export default function qrcode(n:number,level:'L'|'M'|'Q'|'H'):QR;
}

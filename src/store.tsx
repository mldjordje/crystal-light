import { createContext, useContext, useState, type ReactNode } from 'react';
import { seedBookings, seedInquiries, type Booking, type Inquiry } from './data';
type State={bookings:Booking[];inquiries:Inquiry[];housekeeping:Record<string,string>;settings:Record<string,string>;vouchers:{id:string;amount:number;name:string}[]};
type Store=State & {setBookings:(next:Booking[]|((prev:Booking[])=>Booking[]))=>void;setInquiries:(next:Inquiry[]|((prev:Inquiry[])=>Inquiry[]))=>void;setHousekeeping:(v:Record<string,string>)=>void;setSettings:(v:Record<string,string>)=>void;addVoucher:(v:{id:string;amount:number;name:string})=>void;toast:(message:string)=>void};
const initial:State={bookings:seedBookings,inquiries:seedInquiries,housekeeping:{deluxe:'Za spremanje',superior:'Spremno',suite:'U toku'},settings:{breakfast:'12',late:'25',parking:'0',hotel:'Crystal Light',currency:'EUR'},vouchers:[]};
const Context=createContext<Store>(null!);
export function StoreProvider({children}:{children:ReactNode}){const [state,setState]=useState<State>(()=>{try{const s=localStorage.getItem('crystal-demo-v1');return s?{...initial,...JSON.parse(s)}:initial}catch{return initial}});const [message,setMessage]=useState('');
 const update=(fn:(s:State)=>State)=>setState(prev=>{const next=fn(prev);try{localStorage.setItem('crystal-demo-v1',JSON.stringify(next))}catch{}return next});
 const toast=(m:string)=>{setMessage(m);window.setTimeout(()=>setMessage(''),4500)};
 return <Context.Provider value={{...state,setBookings:v=>update(s=>({...s,bookings:typeof v==='function'?v(s.bookings):v})),setInquiries:v=>update(s=>({...s,inquiries:typeof v==='function'?v(s.inquiries):v})),setHousekeeping:v=>update(s=>({...s,housekeeping:v})),setSettings:v=>update(s=>({...s,settings:v})),addVoucher:v=>update(s=>({...s,vouchers:[...s.vouchers,v]})),toast}}>{children}{message&&<div role="status" className="toast"><span>✓</span>{message}</div>}</Context.Provider>
}
export const useStore=()=>useContext(Context);

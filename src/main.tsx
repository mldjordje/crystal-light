import { StrictMode, Component, type ReactNode, useEffect, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { StoreProvider } from './store';
import { DemoDock } from './components';
import Landing from './Landing';
import './styles.css';
const Room=lazy(()=>import('./Room'));const Booking=lazy(()=>import('./Booking'));const Guest=lazy(()=>import('./Guest'));const Admin=lazy(()=>import('./Admin'));
class ErrorBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true}}render(){return this.state.error?<div className="app-error"><h1>Hajde da pokušamo ponovo.</h1><p>Došlo je do greške pri otvaranju prikaza.</p><button className="btn btn-gold" onClick={()=>window.location.reload()}>Osveži stranicu</button></div>:this.props.children}}
function ScrollReset(){const {pathname,hash}=useLocation();useEffect(()=>{if(hash){const timer=setTimeout(()=>document.getElementById(hash.slice(1))?.scrollIntoView(),350);return()=>clearTimeout(timer)}window.scrollTo({top:0,behavior:'instant'})},[pathname,hash]);return null}
function App(){return <BrowserRouter><StoreProvider><ScrollReset/><ErrorBoundary><Suspense fallback={<div className="app-error"><span className="eyebrow">CRYSTAL LIGHT</span><h1>Vaš trenutak...</h1></div>}><Routes><Route path="/" element={<Landing/>}/><Route path="/sobe/:id" element={<Room/>}/><Route path="/booking" element={<Booking/>}/><Route path="/client" element={<Guest/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<div className="app-error"><h1>Ova stranica nije dostupna.</h1><Link to="/" className="btn btn-gold">Nazad na početnu</Link></div>}/></Routes></Suspense></ErrorBoundary><DemoDock/></StoreProvider></BrowserRouter>}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);

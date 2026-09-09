import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function forceTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export default function Preloader() {
  const [done, setDone] = useState(
    () => sessionStorage.getItem('crystal-intro') === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const root = useRef<HTMLDivElement>(null);

  const finish = () => {
    sessionStorage.setItem('crystal-intro', '1');
    forceTop();
    setDone(true);
    requestAnimationFrame(() => requestAnimationFrame(forceTop));
  };

  useEffect(() => {
    if (done) return;
    const previousOverflow = document.body.style.overflow;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    forceTop();
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: finish });
      timeline
        .fromTo('.intro-orbit', { rotation: -120, scale: 0.75, opacity: 0 }, { rotation: 0, scale: 1, opacity: 1, duration: 1.35, ease: 'power3.out' })
        .fromTo('.intro-letter', { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.15)
        .fromTo('.intro-word span', { yPercent: 110 }, { yPercent: 0, stagger: 0.055, duration: 0.7, ease: 'power3.out' }, 0.45)
        .fromTo('.intro-line', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0.35)
        .to('.intro-center', { opacity: 0, y: -25, duration: 0.45 }, 2.05)
        .to('.intro-curtain.top', { yPercent: -101, duration: 0.95, ease: 'power3.inOut' }, 2.2)
        .to('.intro-curtain.bottom', { yPercent: 101, duration: 0.95, ease: 'power3.inOut' }, 2.2)
        .to('.intro-skip', { opacity: 0, duration: 0.2 }, 2.1);
    }, root);
    const timer = window.setTimeout(finish, 4200);

    return () => {
      ctx.revert();
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      history.scrollRestoration = previousRestoration;
    };
  }, [done]);

  if (done) return null;
  return (
    <div className="preloader" ref={root} role="status" aria-label="Vitajte u Crystal Light">
      <div className="intro-curtain top" /><div className="intro-curtain bottom" />
      <div className="intro-center">
        <div className="intro-seal">
          <svg className="intro-orbit" viewBox="0 0 180 180"><ellipse cx="90" cy="90" rx="76" ry="58" /><ellipse cx="90" cy="90" rx="82" ry="64" /></svg>
          <span className="intro-letter">C</span><i className="intro-spark" />
        </div>
        <div className="intro-word">{'CRYSTAL LIGHT'.split('').map((letter, index) => <span key={index}>{letter === ' ' ? '\u00a0' : letter}</span>)}</div>
        <p>UMETNOST LEPIH TRENUTAKA</p><div className="intro-line" />
      </div>
      <button className="intro-skip" onClick={finish}>Preskoči uvod <span>↗</span></button>
    </div>
  );
}

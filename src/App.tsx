/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { 
  Star, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  Menu, 
  X, 
  ExternalLink 
} from "lucide-react";

// Asset Map (Optimized Direct URLs)
const VIDEO_URL = "https://videotourl.com/videos/1791050745151-8f469fad-c33a-4957-8006-8f285a30243f.mp4";
const PHOTO_1_SALON = "https://i.ibb.co/Fkh8KhVJ/Screenshot-2026-10-03-at-11-25-06-PM.png"; // salon floor
const PHOTO_2_DESK = "https://i.ibb.co/S796MMdf/Screenshot-2026-10-03-at-11-25-16-PM.png"; // reception
const PHOTO_3_WAVY = "https://i.ibb.co/20XsWmTP/Screenshot-2026-10-03-at-11-26-01-PM.png"; // long wavy chestnut (from https://ibb.co/JWXym092)
const PHOTO_4_BALAYAGE = "https://i.ibb.co/v6ghBgVd/Screenshot-2026-10-03-at-11-26-11-PM.png"; // balayage waves (from https://ibb.co/Hf1C21BP)
const PHOTO_5_GLOSSY = "https://i.ibb.co/svkXKmB7/Screenshot-2026-10-03-at-11-26-20-PM.png"; // glossy dark brown (from https://ibb.co/rGTXx7W9)
const PHOTO_6_SLEEK = "https://i.ibb.co/ZZYvhm0/Screenshot-2026-10-03-at-11-26-32-PM.png"; // sleek straight copper-brown (from https://ibb.co/FP0cBVF)

interface ServiceItem {
  id: string;
  name: string;
  desc: string;
  tag?: string;
}

const SERVICES_DATA: ServiceItem[] = [
  { id: "01", name: "Precision Haircuts", desc: "Tailored cuts engineered to fit your bone structure and individual styling needs." },
  { id: "02", name: "Hair Colour & Balayage", desc: "Hand-painted seamless transitions with custom tones and healthy depth.", tag: "Balayage Masterclass" },
  { id: "03", name: "Hair Treatments", desc: "Advanced deep conditioning, moisture therapy, and bond restoration services." },
  { id: "04", name: "Threading", desc: "Precise, organic facial hair removal to define eyebrows and clean facial contours." },
  { id: "05", name: "Facials", desc: "Curated skincare procedures using premium formulations for skin purification and glow." }
];

const GALLERY_DATA = [
  { img: PHOTO_5_GLOSSY, title: "Gloss colour", desc: "Reflective dark chocolate all-over shine" },
  { img: PHOTO_6_SLEEK, title: "Sleek straight", desc: "Precision glass-finish copper-brown press" },
  { img: PHOTO_3_WAVY, title: "Long layered waves", desc: "Dimensional warmth on rich chestnut base" },
  { img: PHOTO_4_BALAYAGE, title: "Balayage waves", desc: "Seamless melt of golden blonde highlights" }
];

const REVIEWS_DATA = [
  { quote: "The staff is very friendly and their service was truly incredible.", author: "Mahir T." },
  { quote: "Great place to experience luxury with decent prices 👌", author: "Aarav S." },
  { quote: "Nice clean & luxury salon services at good price", author: "Rohan P." }
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [spaceParallax, setSpaceParallax] = useState(0);

  // Refs
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const spaceSectionRef = useRef<HTMLElement>(null);
  
  // Custom video scrub + lerp logic inside requestAnimationFrame
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Scroll and motion triggers
    const handleScroll = () => {
      // 1. Calculate Hero Scroll Progress
      if (heroContainerRef.current) {
        const rect = heroContainerRef.current.getBoundingClientRect();
        const totalHeight = rect.height - window.innerHeight;
        const currentScroll = -rect.top;
        const progress = Math.max(0, Math.min(1, currentScroll / totalHeight));
        targetProgressRef.current = progress;
        setScrollProgress(progress);
      }

      // 2. Space section Parallax calculation
      if (spaceSectionRef.current) {
        const rect = spaceSectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Check if visible
        if (rect.top < viewportHeight && rect.bottom > 0) {
          const totalDistance = rect.height + viewportHeight;
          const progress = (viewportHeight - rect.top) / totalDistance; // 0 to 1
          const offset = (progress - 0.5) * 80; // translate from -40px to +40px
          setSpaceParallax(offset);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call
    handleScroll();

    // SMOOTH LERP LOOP for video scrub
    const updateVideoProgress = () => {
      // Lerp logic (0.12 coefficient)
      const diff = targetProgressRef.current - currentProgressRef.current;
      
      // Update our current smoothed progress
      currentProgressRef.current += diff * 0.12;

      // Only apply if video is loaded and differences are material
      if (videoRef.current && videoRef.current.duration) {
        const duration = videoRef.current.duration;
        const targetTime = currentProgressRef.current * duration;
        
        // Only update currentTime if the difference is > 0.02s
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.02) {
          videoRef.current.currentTime = Math.max(0, Math.min(duration - 0.05, targetTime));
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateVideoProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateVideoProgress);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoLoaded]);

  // Handle intersection observer triggers for entrance effects with resilient timeouts & fail-safes
  useEffect(() => {
    const runObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { 
          threshold: 0.02, // ultra-sensitive to guarantee trigger on any screen size
          rootMargin: "0px 0px 100px 0px" // triggers 100px before coming into view
        }
      );

      const targets = document.querySelectorAll(
        ".reveal-heading, .reveal-photo, .reveal-fade-up, .stagger-container"
      );
      targets.forEach((el) => observer.observe(el));
      return observer;
    };

    // 1. Initial trigger after paint
    const timer1 = setTimeout(() => {
      const obs = runObserver();
      return () => obs.disconnect();
    }, 100);

    // 2. Secondary trigger to catch late-renders/video-shifts
    const timer2 = setTimeout(() => {
      runObserver();
    }, 800);

    // 3. FAIL-SAFE: Force-reveal all elements after 2.5 seconds so nothing remains hidden
    const failSafeTimer = setTimeout(() => {
      const targets = document.querySelectorAll(
        ".reveal-heading, .reveal-photo, .reveal-fade-up, .stagger-container"
      );
      targets.forEach((el) => {
        el.classList.add("is-visible");
      });
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(failSafeTimer);
    };
  }, []);

  // Handle video meta loading
  const handleVideoMetadataLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setVideoLoaded(true);
    }
  };

  // Helper to compute Chapter Transitions based on scroll progress
  const getChapterStyle = (targetProgress: number) => {
    const range = 0.12; 
    const distance = Math.abs(scrollProgress - targetProgress);
    let opacity = 0;
    let translateY = 24; // in px

    if (distance < range) {
      const norm = distance / range; // 0 to 1
      opacity = Math.cos(norm * Math.PI / 2); // beautiful cosine easing curve
      translateY = 24 * (1 - opacity);
    }

    // Special handles for boundary zones
    if (targetProgress === 0 && scrollProgress < range) {
      opacity = 1 - (scrollProgress / range);
      translateY = 24 * (scrollProgress / range);
    }
    if (targetProgress === 0.95 && scrollProgress > 0.90) {
      const endNorm = (scrollProgress - 0.90) / 0.10; // 0 to 1
      opacity = Math.min(1, endNorm * 1.5);
      translateY = 16 * (1 - opacity);
    }

    return {
      opacity,
      transform: `translateY(${translateY}px)`,
      pointerEvents: opacity > 0.15 ? ("auto" as const) : ("none" as const),
      display: opacity > 0.005 ? "block" : "none"
    };
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-bone relative flex flex-col selection:bg-brand-brass selection:text-brand-black font-sans antialiased">
      
      {/* 3-ZONE HEADER CONTRACT */}
      <header className="fixed top-0 left-0 w-full z-50 bg-brand-black/95 border-b border-brand-bone/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Zone 1: Single element brand wordmark */}
          <a href="#" className="font-display text-xl tracking-tighter font-extrabold text-brand-bone hover:text-brand-brass transition-colors uppercase">
            TVC the Salon
          </a>

          {/* Zone 2: Navigation Links (4-5 items, clean typography) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="#services" className="hover:text-brand-brass transition-colors text-brand-bone">Services</a>
            <a href="#work" className="hover:text-brand-brass transition-colors text-brand-bone">The Work</a>
            <a href="#space" className="hover:text-brand-brass transition-colors text-brand-bone">The Space</a>
            <a href="#reviews" className="hover:text-brand-brass transition-colors text-brand-bone">Reviews</a>
            <a href="#visit" className="hover:text-brand-brass transition-colors text-brand-bone">Visit</a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-4">
            <a 
              href="https://2026.geteasysoftware.com/tvc_salon/qr/index.php?branch_id=UzN4eE9JUEUzaUltOERvTTJKVVNGUT09"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-brand-brass hover:bg-brand-brass/90 text-brand-black text-xs font-mono uppercase tracking-wider font-bold py-2.5 px-5 transition-colors border border-transparent"
            >
              Book Online
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-bone hover:text-brand-brass transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-brand-bone/10 bg-brand-black/98 px-6 py-8 flex flex-col gap-6 animate-fade-in">
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium tracking-wide border-b border-brand-bone/5 pb-2"
            >
              Services
            </a>
            <a 
              href="#work" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium tracking-wide border-b border-brand-bone/5 pb-2"
            >
              The Work
            </a>
            <a 
              href="#space" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium tracking-wide border-b border-brand-bone/5 pb-2"
            >
              The Space
            </a>
            <a 
              href="#reviews" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium tracking-wide border-b border-brand-bone/5 pb-2"
            >
              Reviews
            </a>
            <a 
              href="#visit" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium tracking-wide border-b border-brand-bone/5 pb-2"
            >
              Visit
            </a>
            <a 
              href="https://2026.geteasysoftware.com/tvc_salon/qr/index.php?branch_id=UzN4eE9JUEUzaUltOERvTTJKVVNGUT09"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-brand-brass text-brand-black text-xs font-mono uppercase tracking-wider font-bold py-3.5 px-5"
            >
              Book Appointment
            </a>
          </div>
        )}
      </header>

      {/* HERO SECTION: 500vh container for smooth scroll scrub */}
      <section 
        ref={heroContainerRef} 
        className="relative w-full h-[500vh] bg-brand-black select-none"
        id="hero"
      >
        {/* Sticky viewport frame */}
        <div className="sticky top-0 left-0 w-full h-svh overflow-hidden z-10 flex flex-col items-center justify-center">
          
          {/* Main Scscrubbed video layer */}
          <video
            ref={videoRef}
            src={VIDEO_URL}
            muted
            playsInline
            preload="auto"
            poster={PHOTO_1_SALON}
            onLoadedMetadata={handleVideoMetadataLoaded}
            className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-300"
          />

          {/* Dark scrim overlay, 35% opacity, no glassmorphism or blur as requested */}
          <div className="absolute inset-0 bg-[#0F0F0E]/35 pointer-events-none" />

          {/* CHAPTER 1 (0%): TVC THE SALON */}
          <div 
            style={getChapterStyle(0)}
            className="absolute inset-x-6 text-center max-w-4xl mx-auto flex flex-col items-center justify-center"
          >
            <span className="font-mono text-[10px] tracking-widest text-brand-brass uppercase mb-3 block">
              ESTABLISHED IN BHAT
            </span>
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none text-white select-none">
              TVC THE <span className="font-accent italic text-brand-brass font-normal">Salon</span>
            </h1>
            <p className="font-sans text-sm sm:text-lg text-brand-bone/90 mt-4 tracking-wide max-w-lg mx-auto">
              Hair studio, Bhat, Ahmedabad
            </p>
            <div className="mt-12 flex flex-col items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-brand-bone/40 animate-bounce">
                Scroll to explore
              </span>
              <div className="w-[1px] h-12 bg-brand-brass/45" />
            </div>
          </div>

          {/* CHAPTER 2 (25%): CUT. */}
          <div 
            style={getChapterStyle(0.25)}
            className="absolute inset-x-6 text-center max-w-4xl mx-auto"
          >
            <h2 className="font-display font-extrabold text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none text-white">
              CUT<span className="text-brand-brass">.</span>
            </h2>
            <p className="font-sans text-lg sm:text-xl text-brand-bone mt-3 font-medium">
              Precision <span className="font-accent italic text-brand-brass font-normal text-2xl sm:text-3xl">haircuts</span> tailored to your structure
            </p>
          </div>

          {/* CHAPTER 3 (50%): COLOUR. */}
          <div 
            style={getChapterStyle(0.50)}
            className="absolute inset-x-6 text-center max-w-4xl mx-auto"
          >
            <h2 className="font-display font-extrabold text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none text-white">
              COLOUR<span className="text-brand-brass">.</span>
            </h2>
            <p className="font-sans text-lg sm:text-xl text-brand-bone mt-3 font-medium">
              Seamless <span className="font-accent italic text-brand-brass font-normal text-2xl sm:text-3xl">balayage</span> and vivid, long-lasting tones
            </p>
          </div>

          {/* CHAPTER 4 (75%): CARE. */}
          <div 
            style={getChapterStyle(0.75)}
            className="absolute inset-x-6 text-center max-w-4xl mx-auto"
          >
            <h2 className="font-display font-extrabold text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none text-white">
              CARE<span className="text-brand-brass">.</span>
            </h2>
            <p className="font-sans text-lg sm:text-xl text-brand-bone mt-3 font-medium">
              Nourishing, deep <span className="font-accent italic text-brand-brass font-normal text-2xl sm:text-3xl">hair treatments</span> for healthy hair
            </p>
          </div>

          {/* CHAPTER 5 (95%): BOOK APPOINTMENT */}
          <div 
            style={getChapterStyle(0.95)}
            className="absolute inset-x-6 text-center max-w-4xl mx-auto flex flex-col items-center justify-center"
          >
            <div className="flex items-center justify-center gap-1.5 mb-2.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-brand-brass text-brand-brass" />
              ))}
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand-bone/80 mb-3">
              5.0 ★ on Google · 51 reviews
            </p>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-white uppercase max-w-xl">
              Ready for your <span className="font-accent italic text-brand-brass font-normal">transformation?</span>
            </h2>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="tel:+916351574721"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand-grey border border-brand-bone/15 text-brand-bone text-xs font-mono uppercase tracking-wider font-bold py-3.5 px-8 hover:bg-brand-bone hover:text-brand-black transition-all"
              >
                <Phone className="w-4 h-4" />
                Call 063515 74721
              </a>
              <a 
                href="https://2026.geteasysoftware.com/tvc_salon/qr/index.php?branch_id=UzN4eE9JUEUzaUltOERvTTJKVVNGUT09"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand-brass text-brand-black text-xs font-mono uppercase tracking-wider font-bold py-3.5 px-8 hover:bg-white transition-all"
              >
                <Calendar className="w-4 h-4" />
                Book Online
              </a>
            </div>
            <p className="text-xs text-brand-bone/40 font-mono mt-4 uppercase tracking-widest">
              Opens daily at 11 am · Bhat, Ahmedabad
            </p>
          </div>

          {/* Thin brass progress line at the very bottom edge of the stage */}
          <div className="absolute bottom-0 left-0 h-1 bg-brand-brass transition-all duration-75" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
      </section>

      {/* CORE CAPABILITIES / SERVICES */}
      <section className="bg-brand-black py-24 px-6 border-t border-brand-bone/10" id="services">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="reveal-heading">
              <span className="font-mono text-xs uppercase tracking-widest text-brand-brass mb-3 block">
                01 / MASTER CAPABILITIES
              </span>
              <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tight uppercase leading-none max-w-xl">
                Bespoke hair <span className="font-accent italic text-brand-brass font-normal text-5xl sm:text-7xl lowercase">services</span>
              </h2>
            </div>
            <p className="font-sans text-brand-bone/70 max-w-sm text-sm sm:text-base leading-relaxed reveal-fade-up">
              No generic treatments. We design haircuts, custom color melts, and luxury care treatments customized perfectly to your hair texture and face structure.
            </p>
          </div>

          {/* Numbered Row List separated by 1px rules */}
          <div className="border-t border-brand-bone/15 select-none">
            {SERVICES_DATA.map((service) => (
              <div 
                key={service.id}
                className="group relative border-b border-brand-bone/10 py-8 md:py-10 transition-colors duration-300 reveal-fade-up hover:border-brand-brass/40"
              >
                {/* Expandable flat brass bottom rule on hover */}
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-brass transition-all duration-500 ease-out group-hover:w-full" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left Column: Number + Name */}
                  <div className="flex items-start md:items-center gap-6 md:gap-8">
                    <span className="font-mono text-sm tracking-widest text-brand-bone/40 group-hover:text-brand-brass transition-colors duration-300 pt-1 md:pt-0">
                      {service.id}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-brand-bone group-hover:text-white transition-colors">
                        {service.name}
                      </h3>
                      {service.tag && (
                        <span className="text-[10px] font-mono tracking-widest text-[#A8582F] uppercase font-bold py-0.5 px-2 bg-[#A8582F]/10 border border-[#A8582F]/20 rounded-none w-max">
                          {service.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: One short line of description */}
                  <div className="md:text-right pl-11 md:pl-0">
                    <p className="font-sans text-sm sm:text-base text-brand-bone/60 group-hover:text-brand-bone transition-colors max-w-md md:ml-auto">
                      {service.desc}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* THE WORK (GALLERY) */}
      <section className="bg-[#121211] py-24 px-6 border-t border-brand-bone/10" id="work">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-20 text-center max-w-2xl mx-auto reveal-heading">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-brass mb-3 block">
              02 / RECENT WORK
            </span>
            <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tight uppercase leading-none">
              Drawn by <span className="font-accent italic text-brand-brass font-normal text-5xl sm:text-7xl lowercase">precision</span>
            </h2>
            <p className="font-sans text-brand-bone/70 text-sm sm:text-base mt-4 leading-relaxed">
              Browse the actual hair transformations, fresh cuts, and custom balayage work crafted directly by our master technicians.
            </p>
          </div>

          {/* Asymmetric editorial grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-x-12 md:gap-y-16">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-10 md:gap-16">
              
              {/* Photo 3: Long layered waves (Taller portrait crop) */}
              <div className="group reveal-fade-up">
                <div className="reveal-photo overflow-hidden aspect-[3/4] bg-brand-grey border border-brand-bone/10">
                  <img 
                    src={GALLERY_DATA[0].img} 
                    alt={GALLERY_DATA[0].title}
                    loading="lazy"
                    width="600"
                    height="800"
                    referrerPolicy="no-referrer"
                    className="reveal-img w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex justify-between items-baseline border-b border-brand-bone/10 pb-2">
                  <h3 className="font-display font-extrabold text-lg text-brand-bone uppercase tracking-tight">
                    {GALLERY_DATA[0].title}
                  </h3>
                  <span className="font-mono text-[10px] tracking-widest text-brand-brass uppercase">
                    Photo 01
                  </span>
                </div>
                <p className="text-sm text-brand-bone/60 mt-1 font-sans">
                  {GALLERY_DATA[0].desc}
                </p>
              </div>

              {/* Photo 5: Gloss colour (Medium crop) */}
              <div className="group reveal-fade-up md:mt-8">
                <div className="reveal-photo overflow-hidden aspect-[4/5] bg-brand-grey border border-brand-bone/10">
                  <img 
                    src={GALLERY_DATA[2].img} 
                    alt={GALLERY_DATA[2].title}
                    loading="lazy"
                    width="600"
                    height="750"
                    referrerPolicy="no-referrer"
                    className="reveal-img w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex justify-between items-baseline border-b border-brand-bone/10 pb-2">
                  <h3 className="font-display font-extrabold text-lg text-brand-bone uppercase tracking-tight">
                    {GALLERY_DATA[2].title}
                  </h3>
                  <span className="font-mono text-[10px] tracking-widest text-brand-brass uppercase">
                    Photo 03
                  </span>
                </div>
                <p className="text-sm text-brand-bone/60 mt-1 font-sans">
                  {GALLERY_DATA[2].desc}
                </p>
              </div>

            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-10 md:gap-16 md:pt-20">
              
              {/* Photo 4: Balayage waves (Medium crop) */}
              <div className="group reveal-fade-up">
                <div className="reveal-photo overflow-hidden aspect-[4/5] bg-brand-grey border border-brand-bone/10">
                  <img 
                    src={GALLERY_DATA[1].img} 
                    alt={GALLERY_DATA[1].title}
                    loading="lazy"
                    width="600"
                    height="750"
                    referrerPolicy="no-referrer"
                    className="reveal-img w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex justify-between items-baseline border-b border-brand-bone/10 pb-2">
                  <h3 className="font-display font-extrabold text-lg text-brand-bone uppercase tracking-tight">
                    {GALLERY_DATA[1].title}
                  </h3>
                  <span className="font-mono text-[10px] tracking-widest text-brand-brass uppercase">
                    Photo 02
                  </span>
                </div>
                <p className="text-sm text-brand-bone/60 mt-1 font-sans">
                  {GALLERY_DATA[1].desc}
                </p>
              </div>

              {/* Photo 6: Sleek straight (Taller portrait crop) */}
              <div className="group reveal-fade-up">
                <div className="reveal-photo overflow-hidden aspect-[3/4] bg-brand-grey border border-brand-bone/10">
                  <img 
                    src={GALLERY_DATA[3].img} 
                    alt={GALLERY_DATA[3].title}
                    loading="lazy"
                    width="600"
                    height="800"
                    referrerPolicy="no-referrer"
                    className="reveal-img w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex justify-between items-baseline border-b border-brand-bone/10 pb-2">
                  <h3 className="font-display font-extrabold text-lg text-brand-bone uppercase tracking-tight">
                    {GALLERY_DATA[3].title}
                  </h3>
                  <span className="font-mono text-[10px] tracking-widest text-brand-brass uppercase">
                    Photo 04
                  </span>
                </div>
                <p className="text-sm text-brand-bone/60 mt-1 font-sans">
                  {GALLERY_DATA[3].desc}
                </p>
              </div>

            </div>

          </div>



        </div>
      </section>

      {/* THE SPACE (PARALLAX HERO & COPY) */}
      <section 
        ref={spaceSectionRef} 
        className="bg-brand-black py-24 px-6 overflow-hidden border-t border-brand-bone/10 relative" 
        id="space"
      >
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left side: Editorial Layout with Overlapping Images */}
            <div className="lg:col-span-7 relative h-[450px] sm:h-[600px] w-full">
              
              {/* Photo 1: Large floor layout with parallax */}
              <div className="absolute top-0 left-0 w-[80%] h-[85%] overflow-hidden bg-brand-grey border border-brand-bone/10 reveal-photo">
                <img 
                  src={PHOTO_1_SALON} 
                  alt="TVC Salon Space Layout"
                  loading="lazy"
                  width="800"
                  height="600"
                  referrerPolicy="no-referrer"
                  style={{ transform: `translateY(${spaceParallax}px) scale(1.1)` }}
                  className="w-full h-full object-cover transition-transform duration-200 ease-out"
                />
              </div>

              {/* Photo 2: Smaller overlapping reception desk offset */}
              <div className="absolute bottom-0 right-0 w-[45%] h-[50%] overflow-hidden bg-brand-grey border border-brand-bone/15 shadow-xl reveal-photo z-20">
                <img 
                  src={PHOTO_2_DESK} 
                  alt="TVC Reception Area"
                  loading="lazy"
                  width="400"
                  height="300"
                  referrerPolicy="no-referrer"
                  className="reveal-img w-full h-full object-cover"
                />
              </div>

            </div>

            {/* Right side: Editorial text copy */}
            <div className="lg:col-span-5 flex flex-col justify-center reveal-heading">
              <span className="font-mono text-xs uppercase tracking-widest text-brand-brass mb-3 block">
                03 / THE ATELIER
              </span>
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase leading-none mb-6">
                Black ceiling<span className="text-brand-brass">.</span> Concrete<span className="text-brand-brass">.</span> Brass<span className="text-brand-brass">.</span>
              </h2>
              <div className="w-12 h-[1px] bg-brand-brass mb-6" />
              <p className="font-sans text-brand-bone/90 text-base sm:text-lg leading-relaxed mb-4 font-medium">
                Clean, calm, and made to look good.
              </p>
              <p className="font-sans text-brand-bone/60 text-sm sm:text-base leading-relaxed">
                Step inside an architectural layout made for sensory rest. Black ceilings absorb high-frequency chatter while custom panel lights ensure perfect, unshaded color evaluation. Every detail is functional, minimalist, and built with concrete blocks and soft raw brass offsets.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="bg-[#121211] py-24 px-6 border-t border-brand-bone/10" id="reviews">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
            
            {/* Left block: Huge Score Counter */}
            <div className="lg:col-span-4 reveal-fade-up">
              <span className="font-mono text-xs uppercase tracking-widest text-brand-brass mb-3 block">
                04 / PROOF OF CARE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-7xl sm:text-8xl tracking-tighter text-brand-bone">
                  5.0
                </span>
                <span className="text-brand-brass font-mono text-xl font-bold">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mt-3 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-brass text-brand-brass" />
                ))}
              </div>
              <p className="font-sans text-brand-bone/80 text-sm tracking-wide font-medium">
                Based on 51 verified Google reviews
              </p>
              <a 
                href="https://maps.app.goo.gl/q31Q4EgPV7qpLumW7"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-brass hover:text-white transition-colors"
              >
                Read reviews on Google Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right block: Context brief */}
            <div className="lg:col-span-8 reveal-heading">
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none">
                What our guests <span className="font-accent italic text-brand-brass font-normal text-4xl sm:text-6xl lowercase">experience</span>
              </h2>
              <p className="font-sans text-brand-bone/60 mt-4 max-w-2xl text-sm sm:text-base leading-relaxed">
                Consistency, service, and realistic prices are our signatures. Here is why we are highly rated in Ahmedabad and Gandhinagar.
              </p>
            </div>

          </div>

          {/* Three Flat Bone-Coloured Cards (Zero-Pill and High-Contrast) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-container">
            {REVIEWS_DATA.map((review, idx) => (
              <div 
                key={idx}
                className="reveal-fade-up bg-brand-bone text-brand-black p-8 flex flex-col justify-between h-64 border border-transparent hover:border-brand-brass transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#B58F57] text-[#B58F57]" />
                    ))}
                  </div>
                  <p className="font-sans text-base sm:text-lg font-medium tracking-tight text-brand-black leading-snug">
                    "{review.quote}"
                  </p>
                </div>
                
                {/* Clean unboxed metadata separator */}
                <div className="flex items-center gap-2 mt-6 text-xs text-brand-black/50 font-mono tracking-wider uppercase font-bold">
                  <span>{review.author}</span>
                  <span>·</span>
                  <span>Verified Guest</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* VISIT SECTION */}
      <section className="bg-brand-black py-24 px-6 border-t border-brand-bone/10 relative" id="visit">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Contact Details */}
            <div className="lg:col-span-6 reveal-heading">
              <span className="font-mono text-xs uppercase tracking-widest text-brand-brass mb-3 block">
                05 / LOCATION & HOURS
              </span>
              <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tight uppercase leading-none mb-8">
                Visit the <span className="font-accent italic text-brand-brass font-normal text-5xl sm:text-7xl lowercase">Salon</span>
              </h2>
              
              <div className="flex flex-col gap-8">
                
                {/* Address block */}
                <div className="flex gap-4">
                  <div className="p-3 bg-brand-grey border border-brand-bone/10 h-max text-brand-brass shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-brand-brass mb-1 font-bold">Address</h3>
                    <p className="font-sans text-sm sm:text-base text-brand-bone/80 leading-relaxed max-w-md">
                      Venus Avan Business Center, 15, Sardar Patel Ring Rd,<br />
                      near Radhe Fortune, Bhat, Ahmedabad, Gujarat 382428
                    </p>
                  </div>
                </div>

                {/* Hours block */}
                <div className="flex gap-4">
                  <div className="p-3 bg-brand-grey border border-brand-bone/10 h-max text-brand-brass shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-brand-brass mb-1 font-bold">Operating Hours</h3>
                    <p className="font-sans text-sm sm:text-base text-brand-bone/80">
                      Open daily from <span className="font-semibold text-white">11:00 AM – 8:00 PM</span>
                    </p>
                  </div>
                </div>

                {/* Contact phone block */}
                <div className="flex gap-4">
                  <div className="p-3 bg-brand-grey border border-brand-bone/10 h-max text-brand-brass shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-brand-brass mb-1 font-bold">Call Us</h3>
                    <p className="font-sans text-sm sm:text-base text-brand-bone/80">
                      Direct line: <a href="tel:+916351574721" className="hover:text-brand-brass underline underline-offset-4 font-semibold text-white">063515 74721</a>
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick action buttons & map box */}
            <div className="lg:col-span-6 reveal-fade-up">
              <div className="bg-brand-grey p-8 border border-brand-bone/10">
                <h3 className="font-display font-bold text-xl uppercase tracking-tight mb-4 text-white">
                  Get directions & schedule online
                </h3>
                <p className="font-sans text-sm text-brand-bone/60 mb-8 leading-relaxed">
                  We are conveniently situated at Venus Avan Business Center on SP Ring Road in Bhat, providing luxury salon services with ease of access for both Ahmedabad and Gandhinagar guests.
                </p>

                {/* Square buttons, solid brass fill, black text */}
                <div className="flex flex-col gap-4">
                  
                  <a 
                    href="https://2026.geteasysoftware.com/tvc_salon/qr/index.php?branch_id=UzN4eE9JUEUzaUltOERvTTJKVVNGUT09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-between bg-brand-brass hover:bg-white text-brand-black text-xs font-mono uppercase tracking-wider font-extrabold py-4 px-6 transition-all duration-300"
                  >
                    <span>Book Appointment Online</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a 
                    href="https://maps.app.goo.gl/q31Q4EgPV7qpLumW7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-between bg-brand-bone hover:bg-brand-brass hover:text-brand-black text-brand-black text-xs font-mono uppercase tracking-wider font-extrabold py-4 px-6 transition-all duration-300"
                  >
                    <span>Get GPS Directions on Maps</span>
                    <MapPin className="w-4 h-4" />
                  </a>

                  <a 
                    href="tel:+916351574721"
                    className="w-full inline-flex items-center justify-between border border-brand-bone/20 hover:border-brand-brass hover:text-brand-brass text-brand-bone text-xs font-mono uppercase tracking-wider font-extrabold py-4 px-6 transition-all duration-300"
                  >
                    <span>Call 063515 74721</span>
                    <Phone className="w-4 h-4" />
                  </a>

                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A0A09] py-16 px-6 border-t border-brand-bone/5 mt-auto pb-28 md:pb-16 text-center select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <span className="font-display font-black text-lg tracking-tighter uppercase text-brand-bone block mb-1">
              TVC the Salon
            </span>
            <p className="font-mono text-[10px] tracking-widest text-brand-bone/45 uppercase">
              Hairdresser in Ahmedabad & Gandhinagar
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-brand-bone/55 font-mono uppercase tracking-wider">
            <a href="#services" className="hover:text-brand-brass transition-colors">Services</a>
            <span>·</span>
            <a href="#work" className="hover:text-brand-brass transition-colors">The Work</a>
            <span>·</span>
            <a href="#space" className="hover:text-brand-brass transition-colors">The Space</a>
            <span>·</span>
            <a href="#reviews" className="hover:text-brand-brass transition-colors">Reviews</a>
            <span>·</span>
            <a href="https://maps.app.goo.gl/q31Q4EgPV7qpLumW7" target="_blank" rel="noopener noreferrer" className="hover:text-brand-brass transition-colors inline-flex items-center gap-1">Google Maps <ExternalLink className="w-3 h-3" /></a>
          </div>

          <p className="font-mono text-[10px] tracking-widest text-brand-bone/30 uppercase text-center md:text-right">
            © {new Date().getFullYear()} TVC the Salon. All rights reserved.
          </p>
        </div>
      </footer>

      {/* MOBILE PERSISTENT BOTTOM BAR */}
      {/* Aggregate height stays <15% of mobile viewport height, complies with safe-area bottom bounds */}
      <div 
        className="fixed bottom-0 left-0 w-full z-40 bg-[#0F0F0E]/98 border-t border-brand-bone/10 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="p-3.5 flex items-center justify-between gap-3 max-w-xl mx-auto">
          
          <a 
            href="tel:+916351574721"
            className="flex-1 inline-flex items-center justify-center gap-2.5 bg-brand-grey text-brand-bone border border-brand-bone/15 text-xs font-mono uppercase tracking-wider font-extrabold py-3.5 px-4 active:bg-brand-bone active:text-brand-black transition-all"
          >
            <Phone className="w-4 h-4 text-brand-brass" />
            <span>Call Now</span>
          </a>

          <a 
            href="https://maps.app.goo.gl/q31Q4EgPV7qpLumW7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2.5 bg-brand-brass text-brand-black text-xs font-mono uppercase tracking-wider font-extrabold py-3.5 px-4 active:bg-white transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span>Directions</span>
          </a>

        </div>
      </div>

    </div>
  );
}

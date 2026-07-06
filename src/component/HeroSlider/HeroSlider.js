"use client";

import React, { useState, useEffect } from "react";
import "./HeroSlider.css";

export default function HeroSlider({ currentSlide, setCurrentSlide, delay, setDelay, events = [] }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const nextSlide = () => {
    if (events.length === 0) return;
    setCurrentSlide(prev => prev === events.length - 1 ? 0 : prev + 1);
  };

  const prevSlide = () => {
    if (events.length === 0) return;
    setCurrentSlide(prev => prev === 0 ? events.length - 1 : prev - 1);
  };

  useEffect(() => {
    if (events.length <= 1) return;

    const timer = setTimeout(() => {
      nextSlide();
      if (delay !== 5000) {
        setDelay(5000);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentSlide, delay, events.length]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  const manualNextSlide = (e) => {
    e.stopPropagation();
    nextSlide();
  };

  const manualPrevSlide = (e) => {
    e.stopPropagation();
    prevSlide();
  };

  // Se o banco não tiver nenhum evento ativo, mostra a logo da Gruta centralizada com fundo escuro
  if (events.length === 0) {
    return (
      <div className="hero-slider" style={{ background: "#051329", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src="/assets/logo-gruta.png" alt="Gruta 342" style={{ width: "50%", objectFit: "contain" }} />
      </div>
    );
  }

  return (
    /* CORREÇÃO: A classe principal DEVE ser 'hero-slider' para o home.css aplicar o aspect-ratio e ocupar 100% */
    <div 
      className="hero-slider"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {events.length > 1 && (
        <button className="arrow left-arrow" onClick={manualPrevSlide} aria-label="Slide anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}
      
      <div 
        className="slider-content"
        style={{ transform: `translateX(-${currentSlide * 100}%)`, display: 'flex', height: '100%' }}
      >
        {events.map((slide) => (
          <div key={slide.id} className="slide" style={{ minWidth: '100%', height: '100%', position: 'relative' }}>
            <picture style={{ display: 'block', width: '100%', height: '100%' }}>
              <source media="(max-width: 768px)" srcSet={slide.bannerUrl || "/assets/logo-gruta.png"} />
              <img 
                src={slide.bannerUrl || "/assets/logo-gruta.png"} 
                alt={slide.title} 
                className="slide-image" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </picture>
          </div>
        ))}
      </div>
      
      {events.length > 1 && (
        <button className="arrow right-arrow" onClick={manualNextSlide} aria-label="Próximo slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}

      {events.length > 1 && (
        <div className="slider-dots">
          {events.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
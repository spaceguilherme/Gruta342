"use client";

import React, { useState, useEffect } from "react";
import HeroSlider from "../component/HeroSlider/HeroSlider";
import EventsSection from "../component/EventsSection/EventsSection";
import "./home.css";

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderDelay, setSliderDelay] = useState(5000);
  
  // Estado para armazenar os próximos eventos reais vindos do banco
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar os eventos diretamente da API que corrigimos no admin
  useEffect(() => {
    async function loadUpcomingEvents() {
      try {
        const response = await fetch("/api/admin/events");
        if (response.ok) {
          const data = await response.json();
          // Filtra apenas os eventos que têm a categoria "upcoming" (Próximos)
          const filtered = data.filter(evt => evt.category === "upcoming" && evt.is_visible !== false);
          setUpcomingEvents(filtered);
        }
      } catch (error) {
        console.error("Erro ao carregar próximos eventos na Home:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUpcomingEvents();
  }, []);

  const handleListClick = (index) => {
    setActiveSlide(index);
    setSliderDelay(30000); // Dá 30 segundos de paz para ler o card
  };

  if (isLoading) {
    return (
      <div className="home-loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: '#fff' }}>
        <span>Carregando a Gruta...</span>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* CORREÇÃO: Voltando a classe original do seu CSS para colocar lado a lado */}
      <div className="home-hero-split">
        
        {/* CORREÇÃO: Classe original do slider */}
        <div className="home-slider-wrapper">
          <HeroSlider 
            currentSlide={activeSlide} 
            setCurrentSlide={setActiveSlide} 
            delay={sliderDelay} 
            setDelay={setSliderDelay}
            events={upcomingEvents}
          />
        </div>
        
        <div className="home-events-sidebar">
          <h2 className="sidebar-title">Próximos Eventos</h2>
          
          <div className="sidebar-list">
            {upcomingEvents.map((event, index) => {
              // Tratamento estrito de data para exibir no formato do seu design (Dia e Mês curto)
              const eventDate = event.date ? new Date(event.date) : new Date();
              const day = String(eventDate.getUTCDate()).padStart(2, "0");
              const month = eventDate.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).toUpperCase().replace(".", "");

              return (
                <div 
                  key={event.id} 
                  className={`sidebar-event-item ${index === activeSlide ? "active" : ""}`}
                  onClick={() => handleListClick(index)}
                >
                  {/* COLUNA DA ESQUERDA: Data baseada no banco */}
                  <div className="event-date-col">
                    <span className="date-day">{day}</span>
                    <span className="date-month">{month}</span>
                  </div>

                  {/* COLUNA DA DIREITA: Conteúdo do Banco */}
                  <div className="event-content-col">
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>
                      <span className="event-time">{event.time}</span>
                    </div>
                    <p className="event-desc">{event.description}</p>
                  </div>
                </div>
              );
            })}

            {upcomingEvents.length === 0 && (
              <p style={{ color: "#8a9fc4", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
                Nenhum evento agendado por enquanto.
              </p>
            )}
          </div>
          
        </div>
        
      </div>
      
      <EventsSection />
    </div>
  );
}
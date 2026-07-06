"use client";

import React, { useState, useEffect } from "react";
import EventCard from "../EventCard/EventCard";
import "./EventsSection.css";

export default function EventsSection() {
  const [eventsData, setEventsData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Busca os dados do banco de dados quando a tela carrega
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/events");
        if (res.ok) {
          const data = await res.json();
          // Como essa é a seção "Últimos Eventos", filtramos apenas a categoria "past"
          const pastEvents = data.filter(event => event.category === "past").reverse();
          setEventsData(pastEvents);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const displayedEvents = showAll ? eventsData : eventsData.slice(0, 4);

  return (
    <section className="events-section">
      <h2 className="section-title">ÚLTIMOS EVENTOS</h2>

      {isLoading ? (
        <p style={{ textAlign: "center", color: "#00a8ff" }}>Carregando histórico da Gruta...</p>
      ) : (
        <>
          <div className="events-grid">
            {displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <EventCard key={event.id} data={event} />
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#aaa", gridColumn: "1 / -1" }}>
                Nenhum evento passado registrado ainda.
              </p>
            )}
          </div>

          {/* Botão Dinâmico: Alterna entre Ver mais e Ver menos */}
          {eventsData.length > 4 && (
            <div className="view-more-container">
              <button
                className="view-more-btn"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Ver menos" : "Ver mais"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
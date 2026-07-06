import React from "react";
import Image from "next/image";
import "./EventCard.css";

export default function EventCard({ data }) {
  // Função para transformar "2026-06-13" em "13 JUN 2026"
  const formatarDataGruta = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-"); // Divide em [Ano, Mês, Dia]
    if (parts.length !== 3) return dateStr;

    const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    
    const dia = parts[2];
    const mesTexto = meses[parseInt(parts[1], 10) - 1]; // Pega o mês correto na lista
    const ano = parts[0];

    return `${dia} ${mesTexto} ${ano}`;
  };

  return (
    <article className="event-card-vertical">
      
      {/* IMAGEM E DATA FLUTUANTE */}
      <div className="card-image-wrapper" style={{ position: "relative" }}> 
        <Image 
          src={data.bannerUrl} 
          alt={data.title} 
          className="card-image"
          width={500}
          height={500}
          priority={false}
        />
        <div className="floating-date">
          {formatarDataGruta(data.date)} {/* Aplica a formatação aqui */}
        </div>
      </div>
      
      {/* CONTEÚDO */}
      <div className="card-content">
        <h3 className="card-title">{data.title}</h3>
        
        {data.tags && data.tags.length > 0 && (
          <div className="card-tags">
            {data.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        <p className="card-description">{data.description}</p>
      </div>
      
    </article>
  );
}
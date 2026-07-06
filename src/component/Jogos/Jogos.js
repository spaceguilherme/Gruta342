"use client";

import React, { useState, useEffect } from "react";
import "./Jogos.css";

export default function Jogos() {
  const [gamesData, setGamesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Busca os jogos diretamente da nossa nova API
    const loadGames = async () => {
      try {
        const response = await fetch("/api/games");
        if (response.ok) {
          const data = await response.json();
          // Importante: Filtramos para exibir APENAS os jogos que não estão ocultos!
          const visibleGames = data.filter(game => game.is_visible);
          setGamesData(visibleGames);
        }
      } catch (error) {
        console.error("Erro ao carregar os jogos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGames();
  }, []);

  // Filtramos os jogos por categoria para criar as seções (com base nos dados do Banco)
  const tabuleiros = gamesData.filter(g => g.category === "Tabuleiros");
  const online = gamesData.filter(g => g.category === "Online");
  const proprios = gamesData.filter(g => g.category === "Próprios");

  // Sub-componente para não repetirmos código na hora de desenhar a grade
  const GameGrid = ({ title, tagline, games }) => (
    <div className="game-category-section">
      <h2 className="section-subtitle">{title}</h2>
      {tagline && <p className="section-tagline">{tagline}</p>}
      
      {/* Caso a categoria ainda não tenha jogos cadastrados/visíveis */}
      {games.length === 0 && !isLoading ? (
        <p style={{ color: "#8a9fc4", marginTop: "15px", fontStyle: "italic" }}>
          Nenhum jogo disponível nesta categoria no momento.
        </p>
      ) : (
        <div className="games-grid">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <img src={game.image} alt={game.title} className="game-cover" />
              <div className="game-overlay">
                <h3 className="game-title">{game.title}</h3>
                {game.badge && <span className="game-badge">{game.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="jogos-page">
      <div className="jogos-header">
        <h1 className="jogos-main-title">Acervo da Gruta</h1>
        {isLoading ? (
          <p className="jogos-intro">Carregando nosso acervo...</p>
        ) : (
          <p className="jogos-intro">
            De dados rolados a servidores crashados. Escolha seu veneno.
          </p>
        )}
      </div>

      {!isLoading && (
        <>
          <GameGrid 
            title="Jogos de Tabuleiro" 
            tagline="Onde amizades terminam e acusações começam." 
            games={tabuleiros} 
          />
          
          <div className="jogos-separator"></div>

          <GameGrid 
            title="Jogos Online" 
            tagline="Desculpas de lag, calls confusas e sobrevivência duvidosa." 
            games={online} 
          />

          <div className="jogos-separator"></div>

          <GameGrid 
            title="Gruta Produções" 
            tagline="Código nosso, bugs nossos também." 
            games={proprios} 
          />
        </>
      )}
    </section>
  );
}
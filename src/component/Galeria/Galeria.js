"use client";

import React, { useState, useEffect, useRef } from "react";
import "./Galeria.css";

const ChevronDownIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L6 6L11 1" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VideoPlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z" fill="white"/>
  </svg>
);

const parseDate = (dateString) => {
  if (!dateString) return new Date(0);
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
};

const getAspectWeight = (aspectStr) => {
  if (!aspectStr) return 0.75; 
  const [w, h] = aspectStr.split(':').map(Number);
  return h / w; 
};

const formatAspectRatio = (aspectStr) => {
  return aspectStr ? aspectStr.replace(':', '/') : '4/3';
};

export default function Galeria() {
  const [photosData, setPhotosData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [columnCount, setColumnCount] = useState(4); 

  const sortedPhotosData = [...photosData].sort((a, b) => parseDate(b.date) - parseDate(a.date));
  
  // NOVO ESTADO: Para guardar o texto digitado na busca
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const dropdownRef = useRef(null);

  const isVideo = (url) => {
    return url.toLowerCase().match(/\.(mp4|webm|ogg)$/);
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch("/api/gallery");
        if (response.ok) {
          const data = await response.json();
          setPhotosData(data.filter(photo => photo.is_visible));
        }
      } catch (error) {
        console.error("Erro ao carregar a galeria:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth <= 768) setColumnCount(2); 
      else if (window.innerWidth <= 1024) setColumnCount(3); 
      else setColumnCount(4); 
    };
    
    updateColumns(); 
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const allTags = Array.from(new Set(sortedPhotosData.flatMap(photo => photo.tags))).sort();
  
  // Filtra as tags que ainda não foram selecionadas E que batem com o texto digitado
  const availableTags = allTags.filter(tag => 
    !activeFilters.includes(tag) && 
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPhotos = activeFilters.length === 0
    ? sortedPhotosData
    : sortedPhotosData.filter(photo =>
      activeFilters.every(filter => photo.tags.includes(filter))
    );

  const hallOfFamePhotos = sortedPhotosData.filter(photo => photo.isHallOfFame);

  const selectedPhoto = sortedPhotosData.find(photo => photo.id === selectedPhotoId);
  const currentPhotoIndex = filteredPhotos.findIndex(photo => photo.id === selectedPhotoId);

  const columns = Array.from({ length: columnCount }, () => ({ photos: [], weight: 0 }));

  filteredPhotos.forEach((photo) => {
    let shortestColIndex = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columns[i].weight < columns[shortestColIndex].weight) {
        shortestColIndex = i;
      }
    }
    columns[shortestColIndex].photos.push(photo);
    columns[shortestColIndex].weight += getAspectWeight(photo.aspect);
  });

  const showNext = (e) => {
    e.stopPropagation(); 
    const nextIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
    setSelectedPhotoId(filteredPhotos[nextIndex].id);
  };

  const showPrev = (e) => {
    e.stopPropagation(); 
    const prevIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setSelectedPhotoId(filteredPhotos[prevIndex].id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleKeyDown = (event) => {
      if (selectedPhotoId === null) return;
      if (event.key === "ArrowRight") showNext(event);
      if (event.key === "ArrowLeft") showPrev(event);
      if (event.key === "Escape") setSelectedPhotoId(null);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhotoId, currentPhotoIndex, filteredPhotos]); 

  const handleAddFilter = (tag) => {
    if (!activeFilters.includes(tag)) {
      setActiveFilters([...activeFilters, tag]);
    }
    setSearchTerm(""); // Limpa a barra de pesquisa ao selecionar
    setIsDropdownOpen(false);
  };

  const handleRemoveFilter = (tagToRemove) => {
    setActiveFilters(activeFilters.filter(tag => tag !== tagToRemove));
  };

  return (
    <section className="galeria-page">

      <div className="galeria-header">
        <h1 className="galeria-main-title">Mural de Evidências</h1>
        <p className="galeria-intro">
          Registros de momentos que talvez não devessem ser registrados.
        </p>
      </div>
      
      {isLoading && <p style={{ textAlign: "center", color: "#8a9fc4", padding: "40px", fontStyle: "italic" }}>Revelando as fotos na câmara escura...</p>}

      <div className="galeria-filters-modern">
        <div className="custom-dropdown" ref={dropdownRef}>
          
          {/* O NOVO GATILHO COM BARRA DE DIGITAÇÃO */}
          <div 
            className={`dropdown-trigger ${isDropdownOpen ? 'focused' : ''}`}
            onClick={() => setIsDropdownOpen(true)}
          >
            <input 
              type="text" 
              className="dropdown-input"
              placeholder="Filtrar evidências..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
            />
            <span 
              className={`galeria-dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
              onClick={(e) => {
                e.stopPropagation(); // Evita que clique na seta reabra o menu
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <ChevronDownIcon />
            </span>
          </div>

          {isDropdownOpen && availableTags.length > 0 && (
            <ul className="dropdown-menu">
              {availableTags.map(tag => (
                <li key={tag} onClick={() => handleAddFilter(tag)}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
          
          {/* Mensagem customizada caso o usuário digite uma tag que não existe */}
          {isDropdownOpen && availableTags.length === 0 && (
            <ul className="dropdown-menu">
              <li style={{ pointerEvents: "none", color: "#666" }}>
                {searchTerm ? "Nenhuma tag encontrada" : "Nenhuma tag restante"}
              </li>
            </ul>
          )}
        </div>

        <div className="active-filters-container">
          {activeFilters.map(tag => (
            <span key={tag} className="filter-chip">
              {tag}
              <button
                className="filter-chip-remove"
                onClick={() => handleRemoveFilter(tag)}
                title={`Remover filtro ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {filteredPhotos.length > 0 ? (
        <div className="masonry-grid-modern">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="masonry-col">
              {col.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="masonry-item"
                  onClick={() => setSelectedPhotoId(photo.id)} 
                >
                  {isVideo(photo.img) ? (
                    <>
                      <div className="video-indicator" title="Vídeo">
                        <VideoPlayIcon />
                      </div>
                      <video 
                        src={photo.img} 
                        className="masonry-img" 
                        style={{ aspectRatio: formatAspectRatio(photo.aspect) }}
                        muted loop autoPlay playsInline 
                      />
                    </>
                  ) : (
                    <img 
                      src={photo.img} 
                      alt="Momento Gruta" 
                      className="masonry-img"
                      style={{ aspectRatio: formatAspectRatio(photo.aspect) }} 
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-photos-message">
          <p>Nenhuma evidência encontrada com essa exata combinação de filtros.</p>
        </div>
      )}

      <div className="galeria-separator"></div>

      <div className="hall-of-fame-section">
        <h2 className="section-subtitle">Hall da Fama</h2>
        <p className="section-tagline">Os momentos mais icônicos da Gruta.</p>

        <div className="hall-of-fame-grid">
          {hallOfFamePhotos.map((photo) => (
            <div
              key={`hof-${photo.id}`}
              className="hof-card"
              onClick={() => setSelectedPhotoId(photo.id)} 
            >
              {isVideo(photo.img) ? (
                <>
                  <div className="video-indicator" style={{top: '5px', left: '5px', width: '24px', height: '24px'}}>
                    <VideoPlayIcon />
                  </div>
                  <video src={photo.img} className="hof-img" muted loop autoPlay playsInline />
                </>
              ) : (
                <img src={photo.img} alt="Hall da Fama" className="hof-img" />
              )}
              <div className="hof-frame"></div>
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={() => setSelectedPhotoId(null)}>
          <button className="close-lightbox" onClick={() => setSelectedPhotoId(null)}>×</button>

          {filteredPhotos.length > 1 && (
            <>
              <button className="lightbox-nav-btn prev" onClick={showPrev} title="Anterior (Seta Esquerda)">
                <ArrowLeftIcon />
              </button>
              <button className="lightbox-nav-btn next" onClick={showNext} title="Próxima (Seta Direita)">
                <ArrowRightIcon />
              </button>
            </>
          )}

          <div className="lightbox-content polaroid-in" onClick={e => e.stopPropagation()}>
            <div className="lightbox-img-wrapper">
              {isVideo(selectedPhoto.img) ? (
                <video src={selectedPhoto.img} className="lightbox-img" controls autoPlay playsInline />
              ) : (
                <img src={selectedPhoto.img} alt="Ampliada" className="lightbox-img" />
              )}
              <span className="photo-date-stamp">{selectedPhoto.date}</span>
            </div>
            <div className="lightbox-caption">
              <p>{selectedPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
"use client";

import React, { useState, useRef, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // 1. IMPORTA O ROUTER
import "./AuthButton.css"; 

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter(); // 2. INICIALIZA O ROUTER

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="auth-loading">Carregando...</div>;
  }

  if (session) {
    const primeiroNome = session.user?.name ? session.user.name.split(" ")[0] : "Membro";

    return (
      <div className="auth-logged-in" ref={menuRef}>
        <span className="auth-greeting">Olá, {primeiroNome}</span>
        
        <div 
          className="auth-avatar-container" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Opções da Conta"
        >
          {session.user?.image ? (
            <img src={session.user.image} alt="Avatar" className="auth-avatar clickable" />
          ) : (
            <div className="auth-avatar-fallback clickable">{primeiroNome.charAt(0)}</div>
          )}
        </div>

        {isMenuOpen && (
          <div className="auth-dropdown">
            
            {session.user?.roles?.includes("admin") && (
              <button 
                className="dropdown-item" 
                style={{ color: "#00a8ff", fontWeight: "bold" }}
                onClick={() => {
                  setIsMenuOpen(false); // Fecha o menu
                  router.push("/admin"); // 3. REDIRECIONA PARA O PAINEL
                }}
              >
                Painel Admin
              </button>
            )}

            <button 
              className="dropdown-item logout-trigger" 
              onClick={() => {
                setIsMenuOpen(false);
                setShowConfirm(true);
              }}
            >
              Sair da conta
            </button>
          </div>
        )}
        
        {showConfirm && (
          <div className="logout-modal-overlay">
            <div className="logout-modal">
              <h3>Saindo da Gruta</h3>
              <p>Tem certeza que deseja desconectar sua conta?</p>
              <div className="logout-modal-actions">
                <button className="modal-btn cancel" onClick={() => setShowConfirm(false)}>
                  Cancelar
                </button>
                <button className="modal-btn confirm" onClick={() => signOut()}>
                  Sim, sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button className="auth-btn login-btn" onClick={() => signIn()}>
      Entrar na Gruta
    </button>
  );
}
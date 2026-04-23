import React from 'react';

interface SanctumLogoProps {
  size?: number;
  className?: string;
}

/**
 * Componente SVG da logo do Sanctum.
 * Design: Emblema circular azul marinho com raio e folhas estilizadas
 * sobre fundo azul vibrante com cantos arredondados.
 */
const SanctumLogo: React.FC<SanctumLogoProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fundo azul com cantos arredondados */}
      <rect width="512" height="512" rx="110" fill="#1E90FF" />
      
      {/* Círculo externo */}
      <circle cx="256" cy="256" r="195" stroke="#0A2E5C" strokeWidth="28" fill="none" />
      
      {/* Arco superior esquerdo (asa/folha esquerda) */}
      <path
        d="M140 310 C110 250, 130 170, 200 130"
        stroke="#0A2E5C"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Folha esquerda inferior */}
      <path
        d="M165 360 C140 320, 145 250, 185 200 C165 270, 170 310, 195 340 Z"
        fill="#0A2E5C"
      />
      
      {/* Folha direita inferior */}
      <path
        d="M347 360 C372 320, 367 250, 327 200 C347 270, 342 310, 317 340 Z"
        fill="#0A2E5C"
      />

      {/* Arco superior direito (asa/folha direita) */}
      <path
        d="M372 310 C402 250, 382 170, 312 130"
        stroke="#0A2E5C"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arco interno esquerdo */}
      <path
        d="M180 290 C165 240, 180 185, 230 155"
        stroke="#0A2E5C"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arco interno direito */}
      <path
        d="M332 290 C347 240, 332 185, 282 155"
        stroke="#0A2E5C"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      {/* Raio central */}
      <path
        d="M280 100 L240 230 L290 220 L232 412 L275 260 L228 270 Z"
        fill="#0A2E5C"
      />
    </svg>
  );
};

export default SanctumLogo;

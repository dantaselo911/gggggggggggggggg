
/**
 * NEXUS IPTV - FRONTEND PROTECTION LAYER
 * 
 * AVISO: Estas proteções são medidas de dissuasão para dificultar a inspeção casual
 * e o roubo de links por usuários comuns. Não garantem segurança absoluta contra
 * usuários avançados ou ferramentas de interceptação de rede.
 */

export const initFrontendProtections = (enabled: boolean) => {
  if (!enabled) return;

  // 1. Bloquear Clique Direito
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // console.log('Nexus Protection: Context menu blocked.');
  });

  // 2. Bloquear Teclas de Atalho de Inspeção
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
      e.preventDefault();
    }
    // Ctrl+U (Ver código fonte)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
    }
    // Ctrl+S, Ctrl+P
    if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
      e.preventDefault();
    }
  });

  // 3. Detecção de DevTools (Técnica de debugger)
  // Esta técnica força uma pausa se o DevTools estiver aberto
  setInterval(() => {
    const startTime = performance.now();
    // eslint-disable-next-line no-debugger
    debugger; 
    const endTime = performance.now();
    
    // Se o debugger demorar muito, provavelmente o DevTools está aberto
    if (endTime - startTime > 100) {
      // Ação drástica: Limpar embeds sensíveis ou recarregar
      const players = document.querySelectorAll('iframe');
      players.forEach(p => p.remove());
      // window.location.reload();
    }
  }, 2000);

  // 4. Bloquear Seleção de Texto em áreas sensíveis
  // Aplicado via CSS global (user-select: none)
  
  // 5. Bloquear Arrastar Imagens
  document.addEventListener('dragstart', (e) => {
    if ((e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
    }
  });
};

/**
 * Detecta se o usuário está usando AdBlock
 */
export const detectAdBlock = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return response.status === 0;
  } catch {
    return true;
  }
};

/**
 * Detecta manipulação no DOM (Remoção de elementos críticos)
 */
export const observeDOMInterference = (elementId: string, onInterference: () => void) => {
  const target = document.getElementById(elementId);
  if (!target) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        onInterference();
      }
    });
  });

  observer.observe(target, { attributes: true, childList: true, subtree: true });
  return observer;
};


import { UserCircle } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { type Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useEffect, useRef } from "react";

interface ClientListProps {
  clients: Client[];
  selectedClient: string;
  isScrolling: boolean;
  onClientSelect: (clientId: string) => void;
  setOpenState: (open: boolean) => void;
}

export const ClientList = ({
  clients,
  selectedClient,
  isScrolling,
  onClientSelect,
  setOpenState
}: ClientListProps) => {
  const { currency } = useCurrency();
  const listRef = useRef<HTMLDivElement>(null);
  
  // Add touch interactions for improved scroll behavior
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;
    
    // Enhanced touch behavior for better scrolling
    let startY = 0;
    let lastY = 0;
    let velocity = 0;
    let lastTime = 0;
    let isAnimating = false;
    
    const calculateMomentum = (distance: number, time: number) => {
      // Calculate momentum based on distance and time
      return distance / time * 0.3;
    };
    
    const animateMomentumScroll = (parent: HTMLElement, initialVelocity: number) => {
      if (!parent) return;
      
      let currentVelocity = initialVelocity;
      let lastTimestamp = performance.now();
      
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
      
      const step = (timestamp: number) => {
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Apply easing to gradually reduce velocity
        const friction = 0.95;
        currentVelocity *= friction;
        
        // Apply scroll
        parent.scrollBy(0, currentVelocity * elapsed);
        
        // Continue animation until velocity is negligible
        if (Math.abs(currentVelocity) > 0.1) {
          window.requestAnimationFrame(step);
        } else {
          isAnimating = false;
        }
      };
      
      isAnimating = true;
      window.requestAnimationFrame(step);
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimating) return;
      
      startY = e.touches[0].clientY;
      lastY = startY;
      lastTime = performance.now();
      velocity = 0;
      
      const parent = listElement.parentElement;
      if (parent) {
        // Remove any existing inertia scrolling
        parent.style.setProperty('scroll-behavior', 'auto');
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - lastY;
      const currentTime = performance.now();
      const timeElapsed = currentTime - lastTime;
      
      if (timeElapsed > 0) {
        // Calculate instantaneous velocity (pixels per ms)
        velocity = deltaY / timeElapsed;
      }
      
      lastY = currentY;
      lastTime = currentTime;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const parent = listElement.parentElement;
      if (!parent) return;
      
      // Apply momentum scrolling based on final velocity
      if (Math.abs(velocity) > 0.1) {
        animateMomentumScroll(parent, velocity * 20); // Amplify for better feel
      }
    };
    
    listElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    listElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    listElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      listElement.removeEventListener('touchstart', handleTouchStart);
      listElement.removeEventListener('touchmove', handleTouchMove);
      listElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleClientClick = (clientId: string, e: React.MouseEvent | React.TouchEvent) => {
    // Prevent event propagation to stop dropdown from closing
    e.preventDefault();
    e.stopPropagation();

    // Ignore clicks during or immediately after scrolling
    if (isScrolling) {
      console.log('Clic ignoré - défilement en cours');
      return;
    }

    // Manual selection handling to prevent auto-closing
    onClientSelect(clientId);
  };

  return (
    <div ref={listRef} className="client-list-container pb-48">
      {clients.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Aucun client trouvé
        </div>
      ) : (
        <>
          {/* Visual hint for vertical swiping - only show with more than 5 clients */}
          {clients.length > 5 && (
            <div className="flex justify-center items-center py-2 text-xs text-muted-foreground animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <span>Glisser pour faire défiler</span>
            </div>
          )}
          
          {clients.map(client => (
            <div 
              key={client.id} 
              onClick={e => handleClientClick(client.id.toString(), e)} 
              onTouchEnd={e => {
                // Only handle touch if it wasn't a scroll
                if (!isScrolling) {
                  handleClientClick(client.id.toString(), e);
                }
              }} 
              data-client-id={client.id.toString()} 
              className={`
                rounded-lg my-2 mx-3 p-2 transition-colors
                ${selectedClient === client.id.toString() 
                  ? 'bg-primary/15 border-l-4 border-primary' 
                  : 'hover:bg-muted/50'}
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-10 w-10 text-primary/80 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-base">
                      {client.prenom} {client.nom}
                    </span>
                  </div>
                </div>
                <span className={`font-mono text-lg font-semibold ${client.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {client.solde.toLocaleString()} {currency}
                </span>
              </div>
              
              {/* Hidden SelectItem to maintain the Select's value state */}
              <SelectItem value={client.id.toString()} className="sr-only" />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

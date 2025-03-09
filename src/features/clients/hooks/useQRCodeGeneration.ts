
import { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';

export interface QRCodeGenerationHookResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  generateQRCode: (url: string, size: number) => Promise<void>;
}

export const useQRCodeGeneration = (): QRCodeGenerationHookResult => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async (url: string, size: number) => {
    if (!canvasRef.current || !url) return;
    
    try {
      await QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 1,
        color: {
          dark: '#8B5CF6',
          light: '#FFFFFF'
        }
      });
      console.log("QR Code generated successfully");
    } catch (qrError) {
      console.error("Error generating QR canvas:", qrError);
      toast.error("Erreur lors de la génération de l'image QR.");
    }
  };

  return {
    canvasRef,
    generateQRCode
  };
};

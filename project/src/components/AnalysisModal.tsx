import React, { useState } from 'react';
import { X, Camera, Upload, Loader } from 'lucide-react'; // Ajout de Loader
import { useLotStore } from '../store/analysResultStore';

interface AnalysisModalProps {
  onClose: () => void;
  onCapture: () => Promise<Blob | null>;
}

export const AnalysisModal = ({ onClose, onCapture }: AnalysisModalProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setLots } = useLotStore();

  const handleCapture = async () => {
    setIsLoading(true);
    const blob = await onCapture();
    if (blob) {
      const url = URL.createObjectURL(blob);
      setCapturedImage(url);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;

    setIsLoading(true); // Démarrer le spinner lors de l'envoi

    try {
      // Créez un objet FormData pour envoyer l'image
      const formData = new FormData();
      const responseBlob = await fetch(capturedImage).then(r => r.blob());
      formData.append('file', responseBlob, 'capture.png'); // Assurez-vous que le nom du champ est correct

      // Effectuez l'appel API
      const response = await fetch('http://localhost:8000/api/detect_constructions/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'image au backend');
      }

      const result = await response.json();
      console.log('Résultat de l\'analyse:', result);

      // Mettre à jour les lots avec la réponse de l'API
      setLots(result.lots);

      // Fermez le modal après l'envoi
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setIsLoading(false); // Arrêter le spinner après le traitement
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Analyse de superposition</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!capturedImage ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Capturez une image de la carte pour commencer l'analyse
              </p>
              <button
                onClick={handleCapture}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full"
              >
                <Camera className="w-5 h-5" />
                {isLoading ? 'Capture en cours...' : 'Capturer la carte'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Capture de la carte"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    URL.revokeObjectURL(capturedImage);
                    setCapturedImage(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Reprendre la capture
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  disabled={isLoading} // Désactiver le bouton pendant le chargement
                >
                  {isLoading ? <Loader className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  {isLoading ? 'Analyse en cours...' : 'Envoyer pour analyse'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import create from 'zustand';

interface MapConfigStore {
  
  registerPoints: boolean;
  exportCoordinates: boolean;
  setRegisterPoints: (registerPoints: boolean) => void; // Méthode pour setter les lots à partir de l'API
  setExportCoordinates: (exportCoordinates: boolean) => void;
}

export const useMapConfigStore = create<MapConfigStore>((set) => ({
  
  registerPoints: false,
  exportCoordinates: false,
  setRegisterPoints: (registerPoints) => set({ registerPoints }), // Ajout de la méthode pour setter le lot sélectionné
  setExportCoordinates: (exportCoordinates) => set({ exportCoordinates }),
}));

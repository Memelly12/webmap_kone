import create from 'zustand';

interface Lot {
  numeroLot: string;
  description: string;
}
interface LotStore {
  lots: Lot[];
  selectedLot: number |null; // Changement de 'String' à 'string' pour respecter les conventions TypeScript
  setSelectLot: (selectedLot: number) => void; // Changement de 'String' à 'string'
  setLots: (lots: Lot[]) => void; // Méthode pour setter les lots à partir de l'API
}

export const useLotStore = create<LotStore>((set) => ({
  lots: [],
  selectedLot: null, // Initialisation de selectedLot
  setSelectLot: (selectedLot) => set({ selectedLot }), // Ajout de la méthode pour setter le lot sélectionné
  setLots: (lots) => set({ lots }), // Met à jour les lots avec la réponse de l'API
}));

import React, { useState } from 'react';
import { X, Upload, Eye, EyeOff, Table2, AlertTriangle } from 'lucide-react';
import { AnalysisModal } from './AnalysisModal';
import { useMapStore } from '../store/mapStore';
import { useLotStore } from '../store/analysResultStore';
import { useMapConfigStore } from '../store/mapconfigStore';
import useAOIStore from '../store/AOIStore';
interface SidebarProps {
  activeTool: string | null;
  onClose: () => void;
  onShowImportModal: () => void;
  onCapture?: () => Promise<Blob | null>;
  
}

export const Sidebar = ({ activeTool, onClose, onShowImportModal, onCapture  }: SidebarProps) => {
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const { layers, toggleLayerVisibility } = useMapStore();
  const { lots, setSelectLot } = useLotStore();
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const { registerPoints, setRegisterPoints, exportCoordinates, setExportCoordinates } = useMapConfigStore();
  const { coordinates } = useAOIStore();

  const renderContent = () => {
    switch (activeTool) {
      case 'layers':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{layer.name}</span>
                    <span className="text-xs text-gray-500">({layer.type})</span>
                  </div>
                  <button 
                    className="text-green-600"
                    onClick={() => {
                      toggleLayerVisibility(layer.id);
                    }}
                  >
                    {layer.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              ))}
              {layers.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucune couche importée
                </p>
              )}
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Enreistrement de points </h3>
                <p className="text-sm text-gray-600 mt-1">
                  selectionnez des points en un clic et exportez les sous forme de ficier excel
                </p>
              </div>
              <div className="p-4">
                <button 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-2"
                  onClick={() => {
                    setRegisterPoints(!registerPoints);
                  }} // Met à jour l'état au clic
                >
                  {registerPoints ? 'Desactiver' : 'Activer'}
                </button>
                {coordinates.length > 0 && (
                  <button 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    onClick={() => {
                      setExportCoordinates(!exportCoordinates);
                    }}
                  >
                    exporter
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Analyse de superposition</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Compare les bâtiments avec les zones approuvées
                </p>
              </div>
              <div className="p-4">
                <button 
                  onClick={() => setShowAnalysisModal(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Analyser
                </button>
              </div>
            </div>
            <div style={{ padding: '1rem' }}>
              {lots.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {lots.map((lot) => (
                    <div
                      key={lot.numeroLot}
                      onClick={() => {
                        setSelectedLot(lot.numeroLot);
                        setSelectLot(Number(lot.numeroLot));
                      }}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: selectedLot === lot.numeroLot ? '2px solid #4CAF50' : '1px solid #ccc',
                        backgroundColor: selectedLot === lot.numeroLot ? '#f0fff4' : '#fff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                        Ilot #{lot.numeroLot}
                      </h4>
                      <p style={{ margin: 0, color: '#666' }}>{lot.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999' }}>Aucun lot disponible.</p>
              )}
            </div>

          </div>
          
        );

      case 'basemap':
        return (
          <div className="grid grid-cols-2 gap-4">
            {['Streets', 'Satellite', 'Terrain', 'Dark', 'Light', 'Topographic'].map((style) => (
              <button
                key={style}
                className="aspect-square bg-gray-100 rounded-lg p-2 hover:bg-gray-200 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-full h-24 bg-gray-300 rounded"></div>
                <span className="text-sm font-medium">{style}</span>
              </button>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Bâtiment</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">150m²</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select className="w-full border rounded-md p-2">
                <option>Français</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unités de mesure
              </label>
              <select className="w-full border rounded-md p-2">
                <option>Métrique</option>
                <option>Impérial</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-semibold">
          {activeTool === 'layers' && 'Couches'}
          {activeTool === 'analysis' && 'Analyse spatiale'}
          {activeTool === 'basemap' && 'Fond de carte'}
          {activeTool === 'table' && 'Table attributaire'}
          {activeTool === 'imagery' && 'Imagerie'}
          {activeTool === 'settings' && 'Paramètres'}
          {activeTool === 'info' && 'Informations'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {showAnalysisModal && onCapture && (
        <AnalysisModal
          onClose={() => setShowAnalysisModal(false)}
          onCapture={onCapture}
        />
      )}
    </div>
  );
};
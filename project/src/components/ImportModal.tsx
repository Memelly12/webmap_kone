import React, { useState } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { Layer } from '../types/index.ts';
import { v4 as uuidv4 } from 'uuid'; // Importer la fonction UUID

interface ImportModalProps {
  onClose: () => void;
}

export const ImportModal = ({ onClose }: ImportModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'vector' | 'raster'>('vector');
  const [encoding, setEncoding] = useState('UTF-8');
  const [projection, setProjection] = useState('EPSG:4326');
  const { addLayer } = useMapStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;
  
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const fileData = event.target?.result;
  
      const newFile: Layer = {
        id: uuidv4(),
        visible: true,
        type: importType,
        projection: projection,
        name: selectedFile.name,
        data: fileData as string | ArrayBuffer,
      };
  
      addLayer(newFile);
  
      console.log('Importing file:', {
        file: selectedFile,
        type: importType,
        encoding,
        projection,
      });
  
      onClose();
    };
  
    // 🔁 Choix du mode de lecture selon le type
    if (importType === 'raster') {
      reader.readAsArrayBuffer(selectedFile); // TIFF, etc.
    } else {
      reader.readAsText(selectedFile, encoding); // GeoJSON, KML, etc.
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Importer des données</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de données
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="vector"
                  checked={importType === 'vector'}
                  onChange={(e) => setImportType(e.target.value as 'vector')}
                  className="mr-2"
                />
                Vectoriel (Shapefile)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="raster"
                  checked={importType === 'raster'}
                  onChange={(e) => setImportType(e.target.value as 'raster')}
                  className="mr-2"
                />
                Raster (GeoTIFF)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                accept={
                  importType === 'vector'
                    ? '.shp,.dbf,.prj,.shx'
                    : '.tif,.tiff'
                }
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedFile
                    ? selectedFile.name
                    : 'Cliquez pour sélectionner un fichier'}
                </span>
              </label>
            </div>
          </div>

          {importType === 'vector' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encodage
              </label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="UTF-8">UTF-8</option>
                <option value="ISO-8859-1">ISO-8859-1</option>
                <option value="Windows-1252">Windows-1252</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projection
            </label>
            <select
              value={projection}
              onChange={(e) => setProjection(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
              <option value="EPSG:3857">Web Mercator (EPSG:3857)</option>
              <option value="EPSG:32630">UTM Zone 30N (EPSG:32630)</option>
            </select>
          </div>

          {selectedFile && (
            <div className="bg-yellow-50 p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Assurez-vous que les fichiers associés (.dbf, .prj, .shx pour les
                shapefiles) sont également présents dans le même dossier.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              selectedFile
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-400 cursor-not-allowed'
            }`}
          >
            Importer
          </button>
        </div>
      </div>
    </div>
  );
};
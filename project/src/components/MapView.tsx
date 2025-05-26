import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { Layout } from './Layout';
import { AttributeTable } from './AttributeTable';
import Geocoder from 'ol-geocoder';
import WebGLTileLayer from 'ol/layer/WebGLTile';
import 'ol-geocoder/dist/ol-geocoder.min.css';
import { useMapStore } from '../store/mapStore';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import GeoTIFF from 'ol/source/GeoTIFF';
import html2canvas from 'html2canvas';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import { FeatureLike } from 'ol/Feature';
import { useLotStore } from '../store/analysResultStore';
import { useMapConfigStore } from '../store/mapconfigStore';
import CircleStyle from 'ol/style/Circle';
import useAOIStore from '../store/AOIStore';
import * as XLSX from 'xlsx';
import { Coordinate } from '../store/AOIStore';

export const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [showAttributeTable, setShowAttributeTable] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const { registerPoints, exportCoordinates, setExportCoordinates } = useMapConfigStore();
  const { layers } = useMapStore();
  const { selectedLot } = useLotStore();
  const { addCoordinate, coordinates } = useAOIStore();
  const blobUrlsRef = useRef<string[]>([]);  // Pour suivre les URLs de blobs et les révoquer plus tard

  const captureMap = async () => {
    if (!mapRef.current) return null;

    try {
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
      });

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Erreur lors de la capture de la carte :', error);
      return null;
    }
  };

  useEffect(() => {
    if (!mapRef.current || !popupRef.current) return;

    // Create popup overlay
    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });

    const vectorStyle = (feature: FeatureLike) => {
      const props = feature.getProperties();
      const label = props.NroLot ?? '';

      return new Style({
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
          color: '#ff0000',
          width: 3,
        }),
        text: new Text({
          text: label.toString(),
          font: 'bold 14px Arial',
          fill: new Fill({ color: '#ff0000' }),
          stroke: new Stroke({ color: '#ffffff', width: 3 }),
          overflow: true,
        }),
      });
    };

  

    // Initialiser la carte avec seulement la couche de base OSM
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        
      ],
      view: new View({
        center: fromLonLat([-4.0, 5.25]), // Port Bouet, Abidjan
        zoom: 13,
      }),
      overlays: [popup],
    });

    // Add Geocoder
    const geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'fr',
      placeholder: 'Rechercher une adresse...',
      limit: 5,
      keepOpen: false,
    });

    mapInstance.current.addControl(geocoder);
    
    // 1. Créer une source vectorielle
    const vectorSource = new VectorSource();

// 2. Créer une couche vectorielle avec un style simple
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }),
    });
    mapInstance.current?.addLayer(vectorLayer);
    // Handle map click events
    mapInstance.current.on('click', (evt) => {
      const coordinates = evt.coordinate;

      if (registerPoints) {
        const marker = new Feature({
          geometry: new Point(coordinates), // Créer un nouveau point avec les coordonnées cliquées
        });
        vectorSource.addFeature(marker); // Ajoutez le marqueur à la source de vecteur
        addCoordinate(coordinates[0], coordinates[1]);
      }

      const feature = mapInstance.current?.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature
      );

      if (feature) {
        const properties = feature.getProperties();
        setSelectedFeature(properties);

        popup.setPosition(coordinates);
        popupRef.current!.style.display = 'block';
      } else {
        popupRef.current!.style.display = 'none';
      }
    });

    // Traiter les couches raster séparément
    const rasterLayers = layers.filter(layer => layer.type === 'raster' && layer.data instanceof ArrayBuffer);
    const vectorLayers = layers.filter(layer => layer.type === 'vector');
    
    // 1. Ajouter d'abord les couches raster
    rasterLayers.forEach((layer, index) => {
      try {
        const blob = new Blob([layer.data], { type: 'image/tiff' });
        const url = URL.createObjectURL(blob);
        blobUrlsRef.current.push(url); // Stocker l'URL pour le nettoyer plus tard
        
        console.log(`Création de la couche raster ${index + 1}:`, url);
        
        // Configuration du GeoTIFF avec des options explicites
        const source = new GeoTIFF({
          sources: [{ 
            url,
            // // Ajouter des options spécifiques si nécessaire
            // nodata: layer.nodata || undefined,
            // // Définir un identifiant unique pour chaque source
            // sourceKey: `raster-${index}`, 
          }],
          // Options supplémentaires pour améliorer la compatibilité
          normalize: true,
          interpolate: true,
        });
        
        // Créer la couche WebGL avec un identifiant unique
        const rasterLayer = new WebGLTileLayer({
          source,
          visible: layer.visible,
          className: `raster-layer-${index}`, // Classe CSS unique
          opacity: 0.8, // Une légère transparence pour mieux voir la superposition
          zIndex: 10 + index, // S'assurer que les couches raster sont superposées dans le bon ordre
        });
        
        // Ajouter la couche à la carte
        mapInstance.current?.addLayer(rasterLayer);
        
        console.log(`Couche raster ${index + 1} ajoutée avec succès`);
        
        // Surveiller le chargement du raster
        source.on('change', () => {
          if (source.getState() === 'ready') {
            console.log(`Raster ${index + 1} prêt, état:`, source.getState());
          }
        });
      } catch (error) {
        console.error(`Erreur lors de l'ajout du raster ${index + 1}:`, error);
      }
    });

    // 2. Ensuite ajouter les couches vectorielles
    vectorLayers.forEach((layer, index) => {
      try {
        console.log(`Traitement de la couche vectorielle ${index + 1}:`, layer.data);
        
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(layer.data, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          }) as Feature<Geometry>[],
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: vectorStyle,
          visible: layer.visible,
          zIndex: 20 + index, // Les vecteurs au-dessus des rasters
        });

        mapInstance.current?.addLayer(vectorLayer);
        
        const extent = vectorSource.getExtent();
        console.log(`Étendue de la couche vectorielle ${index + 1}:`, extent);

        if (extent && !isNaN(extent[0])) {
          mapInstance.current?.getView().fit(extent, { 
            padding: [20, 20, 20, 20],
            duration: 1000 
          });
        }
      } catch (error) {
        console.error(`Erreur lors de l'ajout du vecteur ${index + 1}:`, error);
      }
    });

    // 3. Zoom sur le lot sélectionné si disponible
    if (selectedLot && mapInstance.current) {
      try {
        // Trouver la couche vectorielle qui contient le lot sélectionné
        let targetFeature: Feature<Geometry> | undefined;
        
        mapInstance.current.getLayers().forEach((mapLayer) => {
          if (mapLayer instanceof VectorLayer) {
            const source = mapLayer.getSource() as VectorSource;
            const features = source.getFeatures();
            const foundFeature = features.find(f => f.get("NroLot") === selectedLot);
            if (foundFeature) {
              targetFeature = foundFeature;
            }
          }
        });
        
        if (targetFeature && targetFeature.getGeometry()) {
          console.log('Zoom sur le lot sélectionné:', selectedLot);
          mapInstance.current.getView().fit(targetFeature.getGeometry()!.getExtent(), {
            duration: 1500,
            padding: [50, 50, 50, 50],
          });
        } else {
          console.log('Lot sélectionné non trouvé dans les couches:', selectedLot);
        }
      } catch (error) {
        console.error('Erreur lors du zoom sur le lot sélectionné:', error);
      }
    }

    // Cleanup function
    return () => {
      // Nettoyer les URL de blobs
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current = [];
      
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
      }
    };
  }, [layers, selectedLot, registerPoints]);

  // Fonction pour exporter les coordonnées
  const exportCoordinatesToExcel = (coordinates:Coordinate[])  => {
    // Créer un tableau d'objets pour les lignes du fichier Excel
    const data = coordinates.map(coord => ({
      'Longitude': coord.longitude,
      'Latitude': coord.latitude,
      'ID': coord.id,
    }));

    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();
    
    // Convertir les données en une feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajouter la feuille de calcul au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Coordonnées');

    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(workbook, 'coordonnees.xlsx');
  };
  useEffect(() => {
    if (exportCoordinates) {
      exportCoordinatesToExcel(coordinates);
    }
    setExportCoordinates(false);
  }, [exportCoordinates, coordinates]);

  return (
    <Layout onCapture={captureMap} >
      <div className="relative w-full h-full">
        <div ref={mapRef} className="w-full h-full" />

        {/* Popup overlay */}
        <div
          ref={popupRef}
          className="absolute bg-white rounded-lg shadow-lg p-4 hidden"
          style={{ minWidth: '200px' }}
        >
          {selectedFeature && (
            <div>
              <h3 className="font-bold mb-2">Informations</h3>
              {Object.entries(selectedFeature).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}: </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table des attributs */}
        {showAttributeTable && (
          <AttributeTable
            data={[]} 
            onClose={() => setShowAttributeTable(false)}
          />
        )}
      </div>
    </Layout>
  );
};
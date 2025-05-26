import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ImportModal } from './ImportModal';
import { 
  Layers,
  Map as MapIcon,
  Settings,
  Table2,
  LineChart,
  Image as ImageIcon,
  PlusCircle,
  Info,
  Menu,
  Camera
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onCapture?: () => Promise<Blob | null>;
  
}

export const Layout = ({ children, onCapture }: LayoutProps) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tools = [
    { id: 'add', icon: PlusCircle, title: 'Ajouter des données' },
    { id: 'layers', icon: Layers, title: 'Couches' },
    { id: 'basemap', icon: MapIcon, title: 'Fond de carte' },
    { id: 'analysis', icon: LineChart, title: 'Analyse' },
    { id: 'table', icon: Table2, title: 'Table attributaire' },
    // { id: 'imagery', icon: ImageIcon, title: 'Imagerie' },
    { id: 'capture', icon: Camera, title: 'Capture de carte' },
    { id: 'settings', icon: Settings, title: 'Paramètres' },
    { id: 'info', icon: Info, title: 'Informations' },
  ];

  const handleToolClick = async (toolId: string) => {
    if (toolId === 'add') {
      setShowImportModal(true);
      return;
    }

    if (toolId === 'capture' && onCapture) {
      const blob = await onCapture();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'carte.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      return;
    }

    if (activeTool === toolId) {
      setShowSidebar(false);
      setActiveTool(null);
    } else {
      setActiveTool(toolId);
      setShowSidebar(true);
    }
    setShowMobileMenu(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex relative">
        {/* Bouton menu mobile */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden absolute top-2 left-2 z-50 bg-white p-2 rounded-lg shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Barre d'outils verticale */}
        <div className={`${
          showMobileMenu ? 'block' : 'hidden'
        } md:block w-14 bg-white shadow-lg flex flex-col py-2 gap-1 z-40`}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`p-3 hover:bg-gray-100 relative group ${
                activeTool === tool.id ? 'bg-gray-100' : ''
              }`}
              title={tool.title}
            >
              <tool.icon className="w-5 h-5 text-gray-700" />
              {/* Tooltip - visible uniquement sur desktop */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded hidden md:group-hover:block whitespace-nowrap">
                {tool.title}
              </div>
            </button>
          ))}
        </div>

        {/* Panneau latéral */}
        {showSidebar && (
          <div className={`absolute md:relative w-full md:w-96 bg-white shadow-lg z-30 ${
            showMobileMenu ? 'left-14' : 'left-0'
          } md:left-0 h-full`}>
            <Sidebar
              onCapture={onCapture}
              activeTool={activeTool}
              onClose={() => {
                setShowSidebar(false);
                setActiveTool(null);
              }}
              onShowImportModal={() => setShowImportModal(false)}
            />
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 relative">
          {children}
        </div>
      </div>

      {/* Modal d'import */}
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
};
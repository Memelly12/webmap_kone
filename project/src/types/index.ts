export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface Building {
  id: string;
  geometry: any; // GeoJSON geometry
  properties: {
    approved: boolean;
    constructionDate: string;
    area: number;
  };
}

export interface Layer {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  visible: boolean;
  projection: string;
  data: any;
}
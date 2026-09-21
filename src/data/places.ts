export type PlaceCategory = 'plaza' | 'cafe' | 'veterinaria';

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  distanceLabel: string;
};

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  plaza: 'Plazas',
  cafe: 'Cafés',
  veterinaria: 'Veterinarias',
};

export const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  plaza: 'leaf',
  cafe: 'cafe',
  veterinaria: 'medkit',
};

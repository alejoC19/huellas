export type PlaceCategory = 'plaza' | 'cafe' | 'veterinaria';

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  distanceLabel: string;
  tags: string[];
  verifiedBy: number;
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

export const PLACES: Place[] = [
  {
    id: 'plaza-alberti',
    name: 'Plaza Alberti',
    category: 'plaza',
    neighborhood: 'Colegiales',
    address: 'Av. Álvarez Thomas 1450',
    latitude: -34.5765,
    longitude: -58.449,
    rating: 4.8,
    reviewCount: 132,
    distanceLabel: '400 m',
    tags: ['Sin correa', 'Bebedero'],
    verifiedBy: 132,
  },
  {
    id: 'parque-los-andes',
    name: 'Parque Los Andes',
    category: 'plaza',
    neighborhood: 'Chacarita',
    address: 'Av. Álvarez Thomas y Av. Forest',
    latitude: -34.5843,
    longitude: -58.4553,
    rating: 4.6,
    reviewCount: 98,
    distanceLabel: '1,1 km',
    tags: ['Sin correa', 'Sombra'],
    verifiedBy: 98,
  },
  {
    id: 'plaza-arenales',
    name: 'Plaza Arenales',
    category: 'plaza',
    neighborhood: 'Colegiales',
    address: 'Conde y Zapiola',
    latitude: -34.572,
    longitude: -58.447,
    rating: 4.5,
    reviewCount: 54,
    distanceLabel: '650 m',
    tags: ['Bebedero'],
    verifiedBy: 54,
  },
  {
    id: 'bar-iberia',
    name: 'Bar Iberia',
    category: 'cafe',
    neighborhood: 'Chacarita',
    address: 'Av. Corrientes 5583',
    latitude: -34.5875,
    longitude: -58.4535,
    rating: 4.7,
    reviewCount: 76,
    distanceLabel: '1,3 km',
    tags: ['Pet friendly', 'Terraza'],
    verifiedBy: 76,
  },
  {
    id: 'full-city-coffee',
    name: 'Full City Coffee',
    category: 'cafe',
    neighborhood: 'Colegiales',
    address: 'Av. Federico Lacroze 2100',
    latitude: -34.573,
    longitude: -58.4525,
    rating: 4.4,
    reviewCount: 41,
    distanceLabel: '550 m',
    tags: ['Pet friendly'],
    verifiedBy: 41,
  },
  {
    id: 'birra-pet-bar',
    name: 'Birra Pet Bar',
    category: 'cafe',
    neighborhood: 'Colegiales',
    address: 'Concepción Arenal 3200',
    latitude: -34.579,
    longitude: -58.446,
    rating: 4.3,
    reviewCount: 30,
    distanceLabel: '750 m',
    tags: ['Terraza', 'Sin correa'],
    verifiedBy: 30,
  },
  {
    id: 'clinica-zapiola',
    name: 'Clínica Zapiola',
    category: 'veterinaria',
    neighborhood: 'Colegiales',
    address: 'Zapiola 1780',
    latitude: -34.575,
    longitude: -58.45,
    rating: 4.9,
    reviewCount: 61,
    distanceLabel: '300 m',
    tags: ['Urgencias', 'Vacunas'],
    verifiedBy: 61,
  },
  {
    id: 'veterinaria-nunez',
    name: 'Veterinaria Núñez 24hs',
    category: 'veterinaria',
    neighborhood: 'Núñez',
    address: 'Av. Cabildo 3400',
    latitude: -34.568,
    longitude: -58.455,
    rating: 4.6,
    reviewCount: 45,
    distanceLabel: '1,6 km',
    tags: ['Guardia 24hs'],
    verifiedBy: 45,
  },
  {
    id: 'veterinaria-cabildo',
    name: 'Veterinaria Cabildo',
    category: 'veterinaria',
    neighborhood: 'Colegiales',
    address: 'Av. Cabildo 2250',
    latitude: -34.581,
    longitude: -58.448,
    rating: 4.5,
    reviewCount: 38,
    distanceLabel: '900 m',
    tags: ['Vacunas', 'Peluquería'],
    verifiedBy: 38,
  },
];

export function getPlaceById(id: string) {
  return PLACES.find((place) => place.id === id);
}

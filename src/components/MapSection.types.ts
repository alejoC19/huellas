import { Place, PlaceCategory } from '../data/places';

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapSectionHandle = {
  animateToRegion: (region: MapRegion, duration?: number) => void;
};

export type MapSectionProps = {
  places: Place[];
  category: PlaceCategory | null;
  selectedId: string;
  initialRegion: MapRegion;
  onSelectPlace: (place: Place) => void;
};

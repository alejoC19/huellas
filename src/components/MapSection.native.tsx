import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';

import { PlacePin } from './PlacePin';
import { MapSectionHandle, MapSectionProps } from './MapSection.types';

export const MapSection = forwardRef<MapSectionHandle, MapSectionProps>(
  ({ places, category, selectedId, initialRegion, onSelectPlace }, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, duration = 350) => {
        mapRef.current?.animateToRegion(region, duration);
      },
    }));

    return (
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        <UrlTile
          urlTemplate="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maximumZ={19}
          flipY={false}
          shouldReplaceMapContent={Platform.OS === 'android'}
        />

        {places.map((place) => {
          const dimmed = category ? place.category !== category : false;
          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              onPress={() => onSelectPlace(place)}
              tracksViewChanges={false}
            >
              <PlacePin
                category={place.category}
                selected={place.id === selectedId}
                dimmed={dimmed}
              />
            </Marker>
          );
        })}
      </MapView>
    );
  }
);

import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';

import { colors, fonts, fontSizes, spacing } from '../theme';
import { PlacePin } from './PlacePin';
import { MapSectionHandle, MapSectionProps } from './MapSection.types';

// En Android, react-native-maps siempre inicializa el SDK nativo de Google Maps
// (aunque se usen tiles de OSM/Carto vía UrlTile), y sin una API key configurada
// en app.json (android.config.googleMaps.apiKey) esa inicialización crashea la
// app. Hasta que se configure esa key, mostramos un estado vacío honesto en
// Android en vez de dejar que crashee. iOS usa Apple Maps por defecto y no
// necesita la key, así que ahí el mapa nativo funciona normalmente.
const GOOGLE_MAPS_KEY_CONFIGURED = false;

export const MapSection = forwardRef<MapSectionHandle, MapSectionProps>(
  ({ places, category, selectedId, initialRegion, onSelectPlace }, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, duration = 350) => {
        mapRef.current?.animateToRegion(region, duration);
      },
    }));

    if (Platform.OS === 'android' && !GOOGLE_MAPS_KEY_CONFIGURED) {
      return (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Ionicons name="map" size={40} color={colors.verdeParque} />
          <Text style={styles.text}>
            El mapa todavía no está disponible en Android.{'\n'}Podés ver los lugares en la lista
            de abajo mientras tanto.
          </Text>
        </View>
      );
    }

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

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.cremaBase,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  text: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

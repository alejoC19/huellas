import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '../../src/components/Chip';
import { MapSection } from '../../src/components/MapSection';
import { MapSectionHandle, MapRegion } from '../../src/components/MapSection.types';
import { PlaceCard } from '../../src/components/PlaceCard';
import { CATEGORY_LABELS, PlaceCategory } from '../../src/data/places';
import { useRemotePlaces } from '../../src/hooks/useRemotePlaces';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { formatDistance, haversineDistanceMeters } from '../../src/utils/geo';

const COLEGIALES_REGION: MapRegion = {
  latitude: -34.5755,
  longitude: -58.4505,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

const CATEGORIES: PlaceCategory[] = ['plaza', 'cafe', 'veterinaria'];

export default function Cerca() {
  const params = useLocalSearchParams<{ category?: string }>();
  const initialCategory = CATEGORIES.includes(params.category as PlaceCategory)
    ? (params.category as PlaceCategory)
    : null;

  const { places, loading } = useRemotePlaces();
  const mapRef = useRef<MapSectionHandle>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlaceCategory | null>(initialCategory);
  const [selectedId, setSelectedId] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!selectedId && places.length > 0) {
      setSelectedId(places[0].id);
    }
  }, [places, selectedId]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    })();
  }, []);

  const placesWithDistance = useMemo(() => {
    if (!userLocation) return places;
    return places.map((place) => ({
      ...place,
      distanceLabel: formatDistance(
        haversineDistanceMeters(userLocation.lat, userLocation.lng, place.latitude, place.longitude)
      ),
    }));
  }, [places, userLocation]);

  const filteredPlaces = useMemo(() => {
    return placesWithDistance.filter((place) => {
      const matchesCategory = !category || place.category === category;
      const matchesQuery =
        !query.trim() ||
        place.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        place.neighborhood.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [placesWithDistance, category, query]);

  const focusPlace = (place: { id: string; latitude: number; longitude: number }) => {
    setSelectedId(place.id);
    mapRef.current?.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      350
    );
  };

  const goToMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const position = await Location.getCurrentPositionAsync({});
    setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    mapRef.current?.animateToRegion(
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  return (
    <View style={styles.container}>
      <MapSection
        ref={mapRef}
        places={placesWithDistance}
        category={category}
        selectedId={selectedId}
        initialRegion={COLEGIALES_REGION}
        onSelectPlace={focusPlace}
      />

      {Platform.OS !== 'web' && <Text style={styles.attribution}>© OpenStreetMap · © CARTO</Text>}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar en Colegiales"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.chipsRow}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
            renderItem={({ item }) => (
              <Chip
                label={CATEGORY_LABELS[item]}
                active={category === item}
                onPress={() => setCategory(category === item ? null : item)}
              />
            )}
          />
        </View>

        <View style={styles.rightControls}>
          <Pressable style={styles.locateButton} onPress={() => router.push('/qr/escanear')}>
            <Ionicons name="qr-code" size={20} color={colors.azulVereda} />
          </Pressable>
          <Pressable style={styles.locateButton} onPress={goToMyLocation}>
            <Ionicons name="locate" size={20} color={colors.azulVereda} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.bottomCarousel}>
        {loading ? (
          <ActivityIndicator color={colors.verdeParque} />
        ) : filteredPlaces.length === 0 ? (
          <View style={styles.emptyCarousel}>
            <Text style={styles.emptyCarouselText}>No encontramos lugares para este filtro.</Text>
          </View>
        ) : (
          <FlatList
            horizontal
            data={filteredPlaces}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                selected={item.id === selectedId}
                onPress={() => focusPlace(item)}
                onGo={() => router.push(`/lugar/${item.id}`)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cremaBase,
  },
  attribution: {
    position: 'absolute',
    bottom: 148,
    right: spacing.md,
    fontSize: 9,
    fontFamily: fonts.textRegular,
    color: colors.textMuted,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    height: 48,
    marginTop: spacing.sm,
    shadowColor: colors.azulVereda,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  chipsRow: {
    marginTop: spacing.md,
  },
  chipsContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  rightControls: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 160,
    gap: spacing.sm,
  },
  locateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.azulVereda,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomCarousel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    minHeight: 60,
  },
  carouselContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyCarousel: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyCarouselText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});

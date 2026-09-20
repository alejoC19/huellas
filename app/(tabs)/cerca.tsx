import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '../../src/components/Chip';
import { MapSection } from '../../src/components/MapSection';
import { MapSectionHandle, MapRegion } from '../../src/components/MapSection.types';
import { PlaceCard } from '../../src/components/PlaceCard';
import { CATEGORY_LABELS, PLACES, Place, PlaceCategory } from '../../src/data/places';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';

const COLEGIALES_REGION: MapRegion = {
  latitude: -34.5755,
  longitude: -58.4505,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

const CATEGORIES: PlaceCategory[] = ['plaza', 'cafe', 'veterinaria'];

export default function Cerca() {
  const mapRef = useRef<MapSectionHandle>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const [selectedId, setSelectedId] = useState<string>(PLACES[0].id);

  const filteredPlaces = useMemo(() => {
    return PLACES.filter((place) => {
      const matchesCategory = !category || place.category === category;
      const matchesQuery =
        !query.trim() ||
        place.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        place.neighborhood.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const focusPlace = (place: Place) => {
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
        places={PLACES}
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
          <Pressable style={styles.locateButton} onPress={goToMyLocation}>
            <Ionicons name="locate" size={20} color={colors.azulVereda} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.bottomCarousel}>
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
  },
  carouselContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

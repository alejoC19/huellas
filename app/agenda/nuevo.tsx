import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Place } from '../../src/data/places';
import { useRemotePlaces } from '../../src/hooks/useRemotePlaces';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function NuevoItemAgenda() {
  const session = useAuthStore((state) => state.session);
  const { places } = useRemotePlaces();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeMatches = useMemo(() => {
    if (!placeQuery.trim() || selectedPlace) return [];
    const q = placeQuery.trim().toLowerCase();
    return places.filter((place) => place.name.toLowerCase().includes(q)).slice(0, 5);
  }, [placeQuery, places, selectedPlace]);

  const submit = async () => {
    if (!session || !title.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('agenda_items').insert({
        user_id: session.user.id,
        title: title.trim(),
        notes: notes.trim(),
        due_date: toDateOnly(dueDate),
        place_id: selectedPlace?.id ?? null,
      });
      if (insertError) throw insertError;
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardarlo. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Nuevo recordatorio</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>¿Qué es?</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Vacuna antirrábica"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>¿Cuándo?</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={colors.verdeParque} />
            <Text style={styles.dateButtonText}>
              {dueDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={(_event, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setDueDate(selected);
              }}
            />
          )}

          <Text style={styles.label}>Lugar (opcional)</Text>
          {selectedPlace ? (
            <View style={styles.selectedPlace}>
              <Ionicons name="location" size={16} color={colors.verdeParque} />
              <Text style={styles.selectedPlaceText}>{selectedPlace.name}</Text>
              <Pressable
                onPress={() => {
                  setSelectedPlace(null);
                  setPlaceQuery('');
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          ) : (
            <>
              <TextInput
                value={placeQuery}
                onChangeText={setPlaceQuery}
                placeholder="Buscar un lugar…"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              {placeMatches.length > 0 && (
                <FlatList
                  data={placeMatches}
                  keyExtractor={(item) => item.id}
                  style={styles.matchList}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.matchRow}
                      onPress={() => {
                        setSelectedPlace(item);
                        setPlaceQuery('');
                      }}
                    >
                      <Text style={styles.matchText}>{item.name}</Text>
                      <Text style={styles.matchMeta}>{item.neighborhood}</Text>
                    </Pressable>
                  )}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Detalles extra…"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.notesInput]}
            multiline
          />

          {error ? <Text style={styles.errorInline}>{error}</Text> : null}

          <Button
            label={submitting ? 'Guardando…' : 'Guardar'}
            onPress={submit}
            loading={submitting}
            disabled={!title.trim()}
            style={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cremaBase,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateButtonText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedPlaceText: {
    flex: 1,
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  matchList: {
    maxHeight: 160,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  matchText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  matchMeta: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  errorInline: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: '#E38585',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});

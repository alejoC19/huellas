import { useEffect, useState } from 'react';

import { Place, PlaceCategory } from '../data/places';
import { supabase } from '../lib/supabase';

type PlaceRow = {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  tags: string[];
};

type StatsRow = {
  place_id: string | null;
  checkin_count: number | null;
  avg_rating: number | null;
};

export function useRemotePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [{ data: placeRows }, { data: statsRows }] = await Promise.all([
        supabase
          .from('places')
          .select('id, name, category, neighborhood, address, latitude, longitude, tags'),
        supabase.from('place_stats').select('place_id, checkin_count, avg_rating'),
      ]);

      if (!mounted) return;

      const statsByPlace = new Map(
        ((statsRows ?? []) as StatsRow[]).map((row) => [row.place_id, row])
      );

      setPlaces(
        ((placeRows ?? []) as PlaceRow[]).map((row) => {
          const stats = statsByPlace.get(row.id);
          return {
            id: row.id,
            name: row.name,
            category: row.category as PlaceCategory,
            neighborhood: row.neighborhood,
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude,
            tags: row.tags,
            rating: stats?.avg_rating ? Number(stats.avg_rating) : 0,
            reviewCount: stats?.checkin_count ?? 0,
            distanceLabel: '',
          };
        })
      );
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { places, loading };
}

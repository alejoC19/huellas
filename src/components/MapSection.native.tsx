import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import { PlacePin } from './PlacePin';
import { MapRegion, MapSectionHandle, MapSectionProps } from './MapSection.types';

// react-native-maps siempre inicializa el SDK nativo de Google Maps en Android
// (aunque se usen tiles de OSM/Carto vía UrlTile), lo que requiere una API key
// de Google configurada con una cuenta de facturación — algo que este proyecto
// no tiene por ahora. En vez de eso, Android usa un mapa Leaflet dentro de un
// WebView con esos mismos tiles gratuitos: cero costo, sin cuenta de Google,
// y funciona igual en Expo Go. iOS usa Apple Maps por defecto (PROVIDER_DEFAULT),
// que no necesita ninguna key, así que ahí se mantiene el mapa nativo.
function regionToZoom(region: MapRegion) {
  const delta = region.longitudeDelta || 0.01;
  return Math.max(3, Math.min(19, Math.round(Math.log2(360 / delta))));
}

function buildLeafletHtml(region: MapRegion) {
  const zoom = regionToZoom(region);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #FFFDF6; }
  .huellar-pin { display: flex; align-items: center; justify-content: center; border-radius: 999px; box-shadow: 0 2px 4px rgba(33,51,70,0.25); border-style: solid; border-color: #BFE180; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${region.latitude}, ${region.longitude}], ${zoom});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

  var markers = {};
  var COLORS = { plaza: '#495B42', cafe: '#FFF2B0', veterinaria: '#213346' };
  var EMOJI = { plaza: '\\uD83C\\uDF3F', cafe: '\\u2615', veterinaria: '\\u2695\\uFE0F' };

  function makeIcon(category, selected, dimmed) {
    var size = selected ? 44 : 34;
    var bg = COLORS[category] || '#495B42';
    var html = '<div class="huellar-pin" style="width:' + size + 'px;height:' + size + 'px;background:' + bg + ';opacity:' + (dimmed ? 0.35 : 1) + ';border-width:' + (selected ? 3 : 0) + 'px;font-size:' + (selected ? 18 : 14) + 'px;">' + (EMOJI[category] || '') + '</div>';
    return L.divIcon({ html: html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  }

  function update(data) {
    var places = data.places || [];
    var ids = {};
    places.forEach(function (place) {
      ids[place.id] = true;
      var dimmed = data.category ? place.category !== data.category : false;
      var selected = place.id === data.selectedId;
      var icon = makeIcon(place.category, selected, dimmed);
      if (markers[place.id]) {
        markers[place.id].setLatLng([place.latitude, place.longitude]);
        markers[place.id].setIcon(icon);
      } else {
        var m = L.marker([place.latitude, place.longitude], { icon: icon }).addTo(map);
        m.on('click', function () {
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(place.id);
        });
        markers[place.id] = m;
      }
    });
    Object.keys(markers).forEach(function (id) {
      if (!ids[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
      }
    });
  }

  function animateToRegion(region, duration) {
    var z = Math.max(3, Math.min(19, Math.round(Math.log2(360 / (region.longitudeDelta || 0.01)))));
    map.flyTo([region.latitude, region.longitude], z, { duration: (duration || 350) / 1000 });
  }

  window.huellarUpdate = update;
  window.huellarAnimateToRegion = animateToRegion;
</script>
</body>
</html>`;
}

export const MapSection = forwardRef<MapSectionHandle, MapSectionProps>(
  ({ places, category, selectedId, initialRegion, onSelectPlace }, ref) => {
    const mapRef = useRef<MapView>(null);
    const webviewRef = useRef<WebView>(null);
    const [webReady, setWebReady] = useState(false);
    const html = useMemo(() => buildLeafletHtml(initialRegion), [initialRegion]);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, duration = 350) => {
        if (Platform.OS === 'android') {
          webviewRef.current?.injectJavaScript(
            `window.huellarAnimateToRegion(${JSON.stringify(region)}, ${duration}); true;`
          );
        } else {
          mapRef.current?.animateToRegion(region, duration);
        }
      },
    }));

    useEffect(() => {
      if (Platform.OS !== 'android' || !webReady) return;
      webviewRef.current?.injectJavaScript(
        `window.huellarUpdate(${JSON.stringify({ places, category, selectedId })}); true;`
      );
    }, [places, category, selectedId, webReady]);

    if (Platform.OS === 'android') {
      const handleMessage = (event: WebViewMessageEvent) => {
        const place = places.find((p) => p.id === event.nativeEvent.data);
        if (place) onSelectPlace(place);
      };

      return (
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html }}
          style={StyleSheet.absoluteFill}
          onLoadEnd={() => setWebReady(true)}
          onMessage={handleMessage}
        />
      );
    }

    return (
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        <UrlTile
          urlTemplate="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maximumZ={19}
          flipY={false}
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

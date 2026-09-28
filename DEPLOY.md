# Cómo generar el .apk de huellar para Android

Este proyecto se distribuye para Android como un `.apk` descargable directo
desde la landing (`/landing`), sin pasar por Google Play. No hace falta
ninguna cuenta paga para esto — solo una cuenta gratuita de Expo.

## Estado actual ✅

- Ya hay un build de producción funcionando: **huellar-alejoc19.vercel.app**
  tiene el botón "Descargar para Android" conectado a un `.apk` real. Login,
  check-ins, comunidad, beneficios y QR funcionan de punta a punta.
- **El mapa funciona en Android sin ninguna cuenta de Google** — ver el
  punto 1 de abajo. Ya no queda pendiente.
- El link del `.apk` expira 30 días después de generado (retención gratuita
  de EAS). Antes de esa fecha hay que generar un build nuevo — avisen y lo
  lanzo yo mismo con las herramientas de Expo conectadas.

## 1. El mapa en Android (resuelto, sin costo)

`react-native-maps` en Android siempre corre sobre el SDK de Google Maps
por debajo, aunque el mapa use los tiles de OpenStreetMap/Carto — y ese SDK
necesita una API key ligada a una cuenta de facturación de Google Cloud
(con tarjeta, aunque el uso en sí sea gratis). Se evaluó pagar el prepago
de esa cuenta y también MapLibre (gratis, pero rompe el flujo de probar con
Expo Go), y se descartaron ambos.

**Solución actual**: en Android, el mapa se renderiza con **Leaflet dentro
de un WebView** (`react-native-webview`), usando los mismos tiles gratuitos
de OpenStreetMap/Carto. Cero costo, cero cuenta de Google, y sigue
funcionando con `npx expo start` + Expo Go como siempre. iOS sigue usando
el mapa nativo (Apple Maps vía `PROVIDER_DEFAULT`), que nunca necesitó key.

Si en algún futuro se quiere el mapa 100% nativo en Android también
(mejor rendimiento con muchísimos markers, gestos más fluidos), ahí sí
haría falta la key de Google Maps o migrar a MapLibre — pero para el uso
actual de la app (unos pocos lugares en Colegiales) el WebView anda bien.

## 2. Generar un build nuevo

El proyecto ya está vinculado a EAS (`c1867e53-b97d-403e-8c25-e4bc11eff044`
en `app.json` → `expo.extra.eas.projectId`, slug `huellas`) y `eas.json` ya
tiene las variables de Supabase y `buildType: apk` — no hace falta repetir
ese setup.

**Opción A — pedímelo a mí.** Desde que conectaste el servidor MCP de Expo,
puedo ver, lanzar y cancelar builds directamente (así se hizo el build
`f862ecfe`). Avisame y lo dejo corriendo, te aviso cuando termine.

**Opción B — corrélo vos** (necesario si en algún momento el MCP no está
disponible):
```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile production
```
Corré esto con el repo actualizado (`git pull` primero) para que tome la
config correcta — el build `912d52b2` falló por justo este motivo (config
local desactualizada/generada a mano por `eas build:configure`, apuntando
a otro proyecto de Expo). Si `eas build:configure` te pide reconfigurar
`app.json`/`eas.json`, no lo aceptes — ya están armados a mano.

El build corre en los servidores de Expo (gratis, con cola compartida —
tarda entre 10 y 30 minutos). Al terminar da un link tipo
`https://expo.dev/artifacts/eas/xxxxxxxxxxxxxxxxxxxxxxxxxx.apk`, que sirve
el `.apk` directo sin que haya que subirlo a ningún lado — es la URL que va
en el botón "Descargar para Android" de la landing.

## 3. Actualizar el link en la landing

Pasame la URL del build y yo actualizo `landing/index.html` y redeployo en
Vercel (ya lo hice una vez, es directo).

## 4. Instalación en el celular de un usuario

Android va a mostrar una advertencia de "instalar apps de fuentes
desconocidas" la primera vez — es esperable al no venir de Google Play,
no significa que la app esté mal. El usuario tiene que aceptar esa opción
una sola vez.

## Actualizaciones futuras

Cada vez que cambie el código y se quiera que los usuarios tengan la
versión nueva, hay que repetir el build y actualizar el link de la
landing — no hay auto-actualización como en las tiendas oficiales. Si en
algún momento se vincula el repo de GitHub al proyecto de Expo
(`expo.dev/accounts/[cuenta]/projects/huellar/github`), puedo lanzar builds
yo mismo desde un commit específico sin que nadie tenga que tocar una
terminal — quedó sin hacer porque requiere el paso de browser que solo
puede hacer el dueño de la cuenta.

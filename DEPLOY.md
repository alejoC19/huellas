# Cómo generar el .apk de huellar para Android

Este proyecto se distribuye para Android como un `.apk` descargable directo
desde la landing (`/landing`), sin pasar por Google Play. No hace falta
ninguna cuenta paga para esto — solo una cuenta gratuita de Expo.

## Estado actual ✅ (con un pendiente conocido)

- Ya hay un build de producción funcionando: **huellar-alejoc19.vercel.app**
  tiene el botón "Descargar para Android" conectado a un `.apk` real (build
  `f862ecfe`, 21/09/2026). Login, check-ins, comunidad, beneficios y QR
  funcionan de punta a punta.
- **El mapa queda en blanco en esa build** — ver el punto 1 de abajo.
  No es un bug de código: es que todavía no tiene la API key de Google Maps.
- El link del `.apk` expira el **21/10/2026** (retención gratuita de EAS,
  30 días). Antes de esa fecha hay que generar un build nuevo — avisen y
  lo lanzo yo mismo con las herramientas de Expo conectadas.

## 1. Conseguir una API key de Google Maps (gratis, pero pide tarjeta) — PENDIENTE

`react-native-maps` en Android siempre corre sobre el SDK de Google Maps
por debajo, aunque el mapa use los tiles de OpenStreetMap/Carto (eso sigue
siendo gratis). Sin esta key, el mapa queda en blanco en una build real
(en Expo Go funciona igual porque Expo usa una key compartida solo para
desarrollo).

**Intentado el 21/09/2026**: Google empujó el flujo de "prueba gratis" de
Cloud, que pide un prepago único de USD 30 (reembolsable, viene con $300 de
crédito) para vincular una cuenta de facturación. Se decidió posponerlo por
falta de presupuesto en ese momento — la app sigue 100% funcional sin esto,
solo sin mapa visible en Android.

Cuando se retome, dos caminos:

**A) Pagar el prepago y usar la key de Google** (rápido, ~10 min):
1. Andá a [console.cloud.google.com](https://console.cloud.google.com/) y
   creá un proyecto (o usá uno existente).
2. Habilitá **"Maps SDK for Android"** en la biblioteca de APIs. Si te pide
   vincular facturación, es el paso del prepago de $30 mencionado arriba.
3. Creá una credencial de tipo **API key** en "Credenciales" → restringila
   ahí mismo a solo **"Maps SDK for Android"** (sección "Restricciones de
   API", buscala con el filtro de texto si la lista no la muestra de
   entrada).
4. (Recomendado) En "Restricciones de aplicaciones" elegí "Apps para
   Android" y agregá el `package name` `com.huellar.app` con el SHA-1 de
   la key de firma (`npx eas-cli@latest credentials` → Android → ver
   credenciales).

Con la key en mano, agregala a `app.json` dentro de `expo.android`:

```json
"config": {
  "googleMaps": {
    "apiKey": "TU_API_KEY_ACA"
  }
}
```

**B) Cambiar a una librería de mapas gratuita para siempre (MapLibre)**:
cero costo, pero MapLibre no viene incluida en Expo Go — se pierde la
comodidad de probar con `npx expo start` + escanear QR, hay que compilar
una build de desarrollo para probar en el celu de ahí en más. Evaluar si
vale la pena ese cambio de flujo antes de encararlo.

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

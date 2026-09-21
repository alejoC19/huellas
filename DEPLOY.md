# Cómo generar el .apk de huellar para Android

Este proyecto se distribuye para Android como un `.apk` descargable directo
desde la landing (`/landing`), sin pasar por Google Play. No hace falta
ninguna cuenta paga para esto — solo una cuenta gratuita de Expo.

## 1. Conseguir una API key de Google Maps (gratis)

`react-native-maps` en Android siempre corre sobre el SDK de Google Maps
por debajo, aunque el mapa use los tiles de OpenStreetMap/Carto (eso sigue
siendo gratis). Sin esta key, el mapa queda en blanco en una build real
(en Expo Go funciona igual porque Expo usa una key compartida solo para
desarrollo).

1. Andá a [console.cloud.google.com](https://console.cloud.google.com/) y
   creá un proyecto (o usá uno existente).
2. Habilitá **"Maps SDK for Android"** en la biblioteca de APIs.
3. Creá una credencial de tipo **API key** en "Credenciales".
4. (Recomendado) Restringila a "Android apps" y agregá el `package name`
   `com.huellar.app` con el SHA-1 de tu key de firma (EAS te lo muestra
   después del primer build, o lo sacás con
   `eas credentials --platform android`).
5. Google pide una cuenta de facturación asociada al proyecto, pero el uso
   normal de una app con pocos usuarios no debería superar la cuota
   mensual gratuita.

Con la key en mano, agregala a `app.json` dentro de `expo.android`:

```json
"config": {
  "googleMaps": {
    "apiKey": "TU_API_KEY_ACA"
  }
}
```

## 2. Generar el build

```bash
npx eas login          # cuenta gratuita de Expo (creála en expo.dev si no tenés)
npx eas build:configure # solo la primera vez, vincula el proyecto a tu cuenta

# Cargar las variables de Supabase como Environment Variables de EAS
# (el build corre en la nube y no tiene acceso a tu .env local)
npx eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://qhdvewichgadzcujhnhq.supabase.co" --environment production --visibility plaintext
npx eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "TU_ANON_KEY" --environment production --visibility plaintext

npx eas build --platform android --profile production
```

El build corre en los servidores de Expo (gratis, con cola compartida —
puede tardar entre 10 y 30 minutos). Al terminar te da un link tipo:

```
https://expo.dev/artifacts/eas/xxxxxxxxxxxxxxxxxxxxxxxxxx.apk
```

Ese link sirve el `.apk` directo, sin que tengas que subirlo a ningún
lado — es la URL que va en el botón "Descargar para Android" de la
landing.

## 3. Actualizar el link en la landing

Pasame la URL del build (o editala vos directo en
`landing/index.html`, buscá `DOWNLOAD_URL_PLACEHOLDER`) y redeployo la
landing con el link real.

## 4. Instalación en el celular de un usuario

Android va a mostrar una advertencia de "instalar apps de fuentes
desconocidas" la primera vez — es esperable al no venir de Google Play,
no significa que la app esté mal. El usuario tiene que aceptar esa opción
una sola vez.

## Actualizaciones futuras

Cada vez que cambies código y quieras que los usuarios tengan la versión
nueva, hay que repetir el build (`eas build ...`) y actualizar el link de
la landing — no hay auto-actualización como en las tiendas oficiales.

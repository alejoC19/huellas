# Setup de Supabase para huellar

## Estado actual: ya está todo aplicado ✅

El proyecto `huellas` (`qhdvewichgadzcujhnhq`, región `ca-central-1`) ya tiene:

- Las 8 migraciones corridas (`0001_init` a `0008_favorites`):
  11 tablas, RLS en todas, triggers de puntos, índices en foreign keys, policies
  optimizadas, los buckets de Storage `checkins` y `avatars` (públicos para
  lectura, cada usuario sube solo a su propia carpeta), un campo `rating`
  opcional (1-5) en `checkins`, la vista `place_stats` (huellas + promedio de
  estrellas reales por lugar) y la tabla `favorites` (lugares favoritos,
  privada por usuario) — revisado con el Security y Performance Advisor
  de Supabase. Sin warnings pendientes salvo dos que son config manual del
  dashboard, no de esquema (ver abajo).
- 9 lugares, 4 beneficios y 1 huella QR de ejemplo cargados.
- `.env` local con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  del proyecto (no está en git — armalo vos en tu compu, ver abajo).

Si en algún momento creás el proyecto de nuevo desde cero (o uno adicional para
otro entorno), estos son los pasos:

## 1. Crear el proyecto

1. Andá a [supabase.com](https://supabase.com) → **New project**.
2. Elegí una región (South America / São Paulo es la más cercana a Buenos Aires).
3. Guardá la contraseña de la base que te pida (no es la que usan los usuarios de la app, es la de administración).

## 2. Correr el esquema

En el dashboard de tu proyecto, andá a **SQL Editor → New query** y corré, en este orden:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_seed.sql`
3. `supabase/migrations/0003_harden_security.sql`
4. `supabase/migrations/0004_performance.sql`
5. `supabase/migrations/0005_checkins_storage.sql`
6. `supabase/migrations/0006_checkin_ratings_and_place_stats.sql`
7. `supabase/migrations/0007_avatars_storage.sql`
8. `supabase/migrations/0008_favorites.sql`

Esto crea las tablas (`profiles`, `places`, `checkins`, `points_events`, `qr_codes`,
`qr_redemptions`, `posts`, `post_likes`, `benefits`, `redemptions`), las políticas de
Row Level Security, los triggers que calculan los puntos en el servidor, los índices,
la vista `place_stats` y carga los 9 lugares + 4 beneficios + 1 huella QR de ejemplo.

## 3. Conectar la app en tu compu

Como `.env` no se sube al repo (tiene tus credenciales), tenés que crearlo vos
localmente cuando clones el proyecto:

```bash
cp .env.example .env
```

Y completar con los valores de **Project Settings → API** de tu proyecto:

```
EXPO_PUBLIC_SUPABASE_URL=https://qhdvewichgadzcujhnhq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

(Nunca la `service_role`, esa es solo para scripts de administración.)

Reiniciá `npx expo start` después de crear/editar `.env` (Expo solo lee las
variables `EXPO_PUBLIC_*` al arrancar).

## 4. (Opcional pero recomendado para probar rápido) Desactivar confirmación de email

Por defecto Supabase pide confirmar el email antes de poder loguearse. Para el demo
de la tesis puede ser más cómodo desactivarlo:

**Authentication → Providers → Email → "Confirm email"** → apagarlo.

Si lo dejás activado, después de registrarse el usuario va a necesitar hacer click en
el link que le llega por mail antes de poder iniciar sesión.

## 5. (Recomendado, config del dashboard) Protección contra contraseñas filtradas

El Security Advisor de Supabase marca esto como pendiente — no es algo que se
arregle con SQL, es un toggle:

**Authentication → Policies (o Auth settings) → "Leaked password protection"** → activarlo.

Con esto Supabase rechaza contraseñas que aparecen en bases de datos de filtraciones
conocidas (HaveIBeenPwned). No es necesario para probar la tesis, pero es gratis y
buena práctica.

## Qué quedó armado del lado del código

- `src/lib/supabase.ts`: cliente de Supabase con sesión persistida (AsyncStorage).
- `src/lib/database.types.ts`: tipos TypeScript **generados automáticamente** desde
  el esquema real del proyecto (no a mano). Si cambiás el esquema, regenerarlos con
  `npx supabase gen types typescript --project-id qhdvewichgadzcujhnhq > src/lib/database.types.ts`.
- `src/store/useAuthStore.ts`: sesión, perfil, `signUp`, `signIn`, `signOut`, `refreshProfile`.
- `app/auth/signup.tsx` y `app/auth/login.tsx`: pantallas reales de registro/login.
- `app/index.tsx`: si ya hay sesión guardada, entra directo a la app; si no, manda a
  onboarding.
- `app/(tabs)/index.tsx` (Home): nivel/puntos reales desde `profiles`, actividad
  reciente real desde `checkins` (si no hay ninguno, muestra un estado vacío en vez
  de datos inventados).
- `app/checkin/[id].tsx`: check-in real en 3 pasos — cámara (`expo-camera`),
  distancia real por GPS al lugar (`expo-location`), un selector de estrellas
  (`StarPicker`) opcional, sube la foto al bucket `checkins` de Storage, inserta
  en `checkins` (el trigger de la base suma +50 pts solo) y publica un post en
  `posts` para el feed de Comunidad.
- `app/(tabs)/cerca.tsx` (Mapa), `app/lugar/[id].tsx` (Detalle) y
  `app/(tabs)/comunidad.tsx`: leen los lugares reales de Supabase
  (`useRemotePlaces`, tabla `places` + vista `place_stats`) — ya no hay ningún
  dato de lugares mockeado en el cliente. Las estrellas y "N huellas" que se ven
  en el mapa y el detalle son reales: promedio de `checkins.rating` y cantidad
  de check-ins por lugar, no un número inventado.
- `app/(tabs)/perfil.tsx`, `app/beneficios.tsx`: stats, recorridos, insignias y
  canje de beneficios, todo contra datos reales (ver commits anteriores).
- `app/perfil/editar.tsx`: edición real de perfil (nombre, mascota, raza, edad,
  barrio) y foto de perfil, que se sube al bucket `avatars` de Storage. El
  `Avatar` (`src/components/Avatar.tsx`) se usa en el header de Inicio, en
  Perfil y en el autor de cada post de Comunidad — imagen real si hay
  `avatar_url`, ícono de huella como fallback si no.
- `app/perfil/puntos.tsx` y `app/perfil/canjes.tsx`: historial real de
  `points_events` y `redemptions` — de dónde salió cada punto y en qué se
  gastó, con pull-to-refresh.
- Favoritos: el corazón en `app/lugar/[id].tsx` inserta/borra en la tabla
  `favorites` (RLS: cada usuario solo ve/toca los suyos) y la pestaña
  "Favoritos" de `app/(tabs)/perfil.tsx` lista los lugares marcados.

Probado en este entorno con datos reales (incluyendo cámara con un dispositivo de
video simulado, e interceptando las respuestas de Supabase con datos de prueba para
verificar el layout sin depender de la red bloqueada del sandbox): el signup y el
check-in arman las llamadas correctas a `https://qhdvewichgadzcujhnhq.supabase.co/...`
con el payload esperado. Esta sandbox de desarrollo tiene bloqueada la salida de red
hacia Supabase (por política del entorno en la nube), así que la confirmación
end-to-end de que los puntos suman de verdad hay que hacerla desde tu celu/compu, que
sí tienen internet normal.

## Qué falta (opcional, no bloquea la tesis)

- "Siguiendo" en Comunidad y "Agenda" en Perfil muestran un estado "en
  construcción" honesto — no hay sistema de seguidores ni de agenda todavía.
- Las reseñas verificadas (+30 pts) y la huella QR escondida (+75 pts) están
  con su lógica de puntos lista en la base (`points_events`, `qr_codes`,
  `qr_redemptions`), pero todavía no tienen pantalla propia en la app.

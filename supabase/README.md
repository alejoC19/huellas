# Setup de Supabase para huellar

## Estado actual: ya está todo aplicado ✅

El proyecto `huellas` (`qhdvewichgadzcujhnhq`, región `ca-central-1`) ya tiene:

- Las 5 migraciones corridas (`0001_init`, `0002_seed`, `0003_harden_security`,
  `0004_performance`, `0005_checkins_storage`): 10 tablas, RLS en todas,
  triggers de puntos, índices en foreign keys, policies optimizadas y el
  bucket de Storage `checkins` (público para lectura, cada usuario sube solo
  a su propia carpeta) — revisado con el Security y Performance Advisor de
  Supabase. Sin warnings pendientes salvo dos que son config manual del
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

Esto crea las tablas (`profiles`, `places`, `checkins`, `points_events`, `qr_codes`,
`qr_redemptions`, `posts`, `post_likes`, `benefits`, `redemptions`), las políticas de
Row Level Security, los triggers que calculan los puntos en el servidor, los índices
y carga los 9 lugares + 4 beneficios + 1 huella QR de ejemplo.

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
  distancia real por GPS al lugar (`expo-location`), sube la foto al bucket
  `checkins` de Storage, inserta en `checkins` (el trigger de la base suma +50 pts
  solo) y publica un post en `posts` para el feed de Comunidad.

Probado en este entorno con datos reales (incluyendo cámara con un dispositivo de
video simulado): el signup y el check-in arman las llamadas correctas a
`https://qhdvewichgadzcujhnhq.supabase.co/...` con el payload esperado. Esta sandbox
de desarrollo tiene bloqueada la salida de red hacia Supabase (por política del
entorno en la nube), así que la confirmación end-to-end de que los puntos suman de
verdad hay que hacerla desde tu celu/compu, que sí tienen internet normal.

## Qué falta conectar (próximos bloques)

- El mapa (`src/data/places.ts`) todavía usa datos mockeados en el cliente en vez de
  leer la tabla `places` de Supabase (el check-in ya "puentea" esto buscando el lugar
  real por nombre, pero es temporal). Migrar Cerca a Supabase es el paso lógico
  siguiente.
- Comunidad, Perfil y Beneficios todavía muestran placeholders — sus tablas
  (`posts`/`post_likes`, `redemptions`, etc.) ya existen y, gracias al check-in, ya
  hay datos reales para mostrar en cuanto se conecten esas pantallas.

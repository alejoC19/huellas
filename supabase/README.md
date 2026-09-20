# Setup de Supabase para huellar

## 1. Crear el proyecto

1. Andá a [supabase.com](https://supabase.com) → **New project**.
2. Elegí una región (South America / São Paulo es la más cercana a Buenos Aires).
3. Guardá la contraseña de la base que te pida (no es la que usan los usuarios de la app, es la de administración).

## 2. Correr el esquema

En el dashboard de tu proyecto, andá a **SQL Editor → New query** y corré, en este orden:

1. Pegá y ejecutá todo `supabase/migrations/0001_init.sql`.
2. Pegá y ejecutá todo `supabase/migrations/0002_seed.sql`.

Esto crea las tablas (`profiles`, `places`, `checkins`, `points_events`, `qr_codes`,
`qr_redemptions`, `posts`, `post_likes`, `benefits`, `redemptions`), las políticas de
Row Level Security, los triggers que calculan los puntos en el servidor, y carga los
9 lugares + 4 beneficios + 1 huella QR de ejemplo que ya usa la app.

## 3. Conectar la app

En **Project Settings → API** copiá:

- **Project URL**
- **anon / public key** (nunca la `service_role`, esa es solo para scripts de administración)

Creá un archivo `.env` en la raíz del proyecto (junto a `package.json`), a partir de
`.env.example`:

```bash
cp .env.example .env
```

Y completá:

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
```

Reiniciá `npx expo start` después de crear/editar `.env` (Expo solo lee las
variables `EXPO_PUBLIC_*` al arrancar).

## 4. (Opcional pero recomendado para probar rápido) Desactivar confirmación de email

Por defecto Supabase pide confirmar el email antes de poder loguearse. Para el demo
de la tesis puede ser más cómodo desactivarlo:

**Authentication → Providers → Email → "Confirm email"** → apagarlo.

Si lo dejás activado, después de registrarse el usuario va a necesitar hacer click en
el link que le llega por mail antes de poder iniciar sesión.

## Qué quedó armado del lado del código

- `src/lib/supabase.ts`: cliente de Supabase con sesión persistida (AsyncStorage).
- `src/lib/database.types.ts`: tipos TypeScript del esquema (a mano; si instalás la
  Supabase CLI localmente podés regenerarlos con
  `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`).
- `src/store/useAuthStore.ts`: sesión, perfil, `signUp`, `signIn`, `signOut`.
- `app/auth/signup.tsx` y `app/auth/login.tsx`: pantallas reales de registro/login.
- `app/index.tsx`: si ya hay sesión guardada, entra directo a la app; si no, manda a
  onboarding.

## Qué falta conectar (próximos bloques)

Hoy `src/data/places.ts` (mapa) y el resto de las pantallas todavía usan datos
mockeados en el cliente. El esquema de Supabase ya tiene las tablas equivalentes
(`places`, `checkins`, `posts`, `benefits`, etc.), así que el próximo paso es
reemplazar esos mocks por queries reales a Supabase, pantalla por pantalla.

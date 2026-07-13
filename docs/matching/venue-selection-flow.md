# Selección de lugares (HU-06)

> Alcance: cómo se generan, se muestran y se eligen los **lugares** de la cita.
> La selección de lugares es el **primer paso** del flujo público por token
> (después viene la disponibilidad, HU-09). El flujo completo está en
> [availability-scheduling-flow.md](./availability-scheduling-flow.md).

---

## 1. Panorama

```
Se crea el Match (matcher semanal)
        │
        ▼
Link tokenizado por usuario → WhatsApp (dev: log en consola)
        │   URL de entrada: /flow/:token/places
        ▼
PASO 1 · Lugares (HU-06):  ve 3 opciones → elige exactamente 2 → avanza
        │   (el link pasa de VENUE a AVAILABILITY)
        ▼
PASO 2 · Horarios (HU-09): calendario → guarda → link consumido → tryConfirm
        │
        ▼
HU-08: si hay cruce de horario (el lugar SIEMPRE cruza) → Date confirmada

Empujón (sin cruce de horario): link nuevo emitido directo en paso
AVAILABILITY → el usuario NO repite la selección de lugares.
```

**Una sola superficie**: la selección de lugares vive **únicamente** en el flujo
público por token, igual que la de horarios. La página autenticada del dashboard
(`/dashboard/places`) fue eliminada — duplicaba el flujo y causaba que la
selección apareciera dos veces.

---

## 2. Módulos y responsabilidades

| Módulo | Rol |
|---|---|
| `matches` | `MatchesService.getVenueSuggestions()` genera/reusa las 3 opciones; `selectVenues()` guarda la elección (escritura pura, sin confirmación) |
| `availability` | Rutas públicas por token; `selectVenues` avanza el link a `AVAILABILITY`; `submitAvailability` (último paso) consume el link y dispara `tryConfirm` |
| `availability-link` | Máquina de pasos del token: `VENUE → AVAILABILITY → consumido` |
| `venues` | CRUD de lugares (admin) + `findActive()` para el ranking |

---

## 3. Modelo de datos

**`VenueOption`** — una fila por lugar sugerido por match:

```
id, matchId, userAId, userBId, venueId,
userASelected (bool), userBSelected (bool)
@@unique([matchId, venueId])   // respalda skipDuplicates en la generación
```

**`AvailabilityLink.step`**: `'VENUE'` (default, paso 1) → `'AVAILABILITY'`
(paso 2) → `consumedAt` (fin). Los links del empujón (HU-08) se emiten
directamente en `AVAILABILITY`.

---

## 4. Los 3 lugares son LOS MISMOS para ambos usuarios

La generación es **por match, no por usuario**:

1. La primera vez que cualquiera de los dos abre su link, `getVenueSuggestions()`
   crea las 3 filas `VenueOption` del match (`createMany` con `skipDuplicates`:
   dos aperturas simultáneas no duplican el set).
2. Las llamadas siguientes (del mismo usuario o del otro) **reusan** esas filas.
   Lo único personal es el flag `userASelected`/`userBSelected`.

El ranking es **determinista** (sin aleatoriedad): más coincidencias entre los
tags del lugar y los hobbies compartidos de la pareja, luego menor
`averageSpentPerPerson`, luego nombre alfabético (`rankVenuesForMatch` en
`matches.service.ts`).

### La regla "2 de 3" (por qué DEBEN ser los mismos 3)

Cada usuario elige **exactamente 2** de las 3 opciones (DTO: `min = max = 2`).
Dos subconjuntos de 2 dentro del mismo set de 3 siempre comparten al menos un
elemento (principio del palomar) → **siempre existe un lugar en común** y la
confirmación nunca falla por lugar. Si cada usuario viera lugares distintos, la
garantía se rompe; por eso el set es compartido por diseño.

---

## 5. Rutas públicas (token = credencial, sin login)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET`  | `/availability/:token/venues` | **Paso 1.** Devuelve las 3 opciones. Si el paso ya es `AVAILABILITY`, señaliza redirigir a horarios; si el link está consumido, `{ step: 'COMPLETED' }` |
| `POST` | `/availability/:token/venues` | Valida (exactamente 2, dentro del set), guarda flags, avanza el link a `AVAILABILITY` |
| `GET`  | `/availability/:token` | **Paso 2.** Calendario. Si el paso es `VENUE`, señaliza volver a lugares; consumido → `COMPLETED` |
| `POST` | `/availability/:token` | Guarda horarios, **consume el link** y dispara `tryConfirm` (HU-08) |

Frontend (fuera de `AuthGate`):
- `app/flow/[token]/places/page.tsx` — **página de entrada** del flujo.
- `app/availability/[token]/page.tsx` — paso final; muestra "¡Listo!" al terminar.

Un link consumido que se re-abre muestra una pantalla amable de "ya completaste
este paso" (los `GET` devuelven `COMPLETED`); los `POST` sí responden 410.

---

## 6. Empujón (HU-08) — los lugares NO se repiten

Cuando ambos terminan pero no hay cruce de horario, el sistema emite **un** link
nuevo por usuario **directamente en paso `AVAILABILITY`**: el usuario solo
agrega horarios nuevos; sus lugares elegidos se conservan en `VenueOption` (no
dependen del link). Al re-enviar horarios, `tryConfirm` corre de nuevo.

---

## 7. Cómo probar

```bash
cd backend
npm run db:seed
npm run build
node dist/src/scripts/run-weekly-matching.js   # loguea 2 links /flow/<token>/places
```

1. Abre el link de A → aparecen **primero los lugares** → elige 2 → pasa al
   calendario → elige horario → "¡Listo!".
2. Re-abre el mismo link → pantalla de completado (no error).
3. Repite con B usando el mismo horario → consola `[dev whatsapp] ¡Coincidieron!`
   y en `npx prisma studio`: `Date` `accepted`, `Match` `confirmed`.
4. **Empujón:** repite con horarios disjuntos → los links nuevos abren
   **directo el calendario** (sin paso de lugares).

Tests: `cd backend && npx jest src/modules/availability src/modules/matches`.

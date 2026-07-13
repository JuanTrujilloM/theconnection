# Notificaciones por correo (email + WhatsApp)

> Alcance: el canal de **correo** para las notificaciones salientes del ciclo de
> matching. Toda notificación que antes salía solo por WhatsApp ahora sale por
> **ambos canales a la vez**: el invite con el magic link (HU-05), la confirmación
> de la cita (HU-08), el empujón de disponibilidad, el rechazo (HU-07) y el
> reciclaje. El flujo de negocio no cambió — ver
> [availability-scheduling-flow.md](../matching/availability-scheduling-flow.md).
>
> El transporte de WhatsApp (Meta Cloud API) sigue **sin construir** (loguea en
> consola). El de correo **sí es real**: `MailService` envía por SMTP cuando
> `SMTP_HOST` está configurado; vacío = modo dev (loguea).

---

## 1. Panorama

```
MatchInviteService ─────────┐
MatchConfirmationService ───┼──> NotificationsService ──┬──> WhatsappNotifierService (dev: log)
MatchResponseService ───────┘        (fan-out,          └──> NotificationEmailsService
                                      Promise.allSettled)        │ payload → plantilla
                                                                 ▼
                                                          MailService.send()
                                                          (nodemailer / SMTP)
```

Los tres servicios de `matches` ya **no** inyectan `WhatsappNotifierService`
directo: inyectan `NotificationsService`, que reparte cada mensaje a los dos
canales. WhatsApp recibe el mismo payload de siempre (el dispatcher lo recorta);
el correo recibe el payload enriquecido (foto, edad, universidad, dirección).

---

## 2. Módulos y responsabilidades

| Pieza | Rol |
|---|---|
| `notifications/notifications.service.ts` | **Dispatcher.** Un método por mensaje (`notifyMatchInvite`, `notifyDateProposal`, …). Recorta el payload para WhatsApp y reparte a ambos canales. Nunca lanza |
| `notifications/notification-emails.service.ts` | Lado correo: mapea payload → plantilla → `mail.send()`. Sin fan-out ni lógica de negocio |
| `notifications/notification-payloads.ts` | Formas compartidas (`Recipient`, `PartnerSummary`, `*Notification`) + `buildPartnerSummary()` (foto primaria, edad) |
| `mail/mail.service.ts` | Transporte SMTP (nodemailer). `send(to, { subject, html })` genérico + `sendVerificationCode` (HU-01, existente) |
| `mail/templates/*.template.ts` | Una plantilla por correo: `fn(data): { subject, html }`. Copy y markup viven acá, no en los servicios |
| `whatsapp/` | Sin cambios — mismas 5 funciones, mismos payloads |

---

## 3. Los 5 mensajes

| Mensaje | Disparador | Plantilla | Asunto |
|---|---|---|---|
| Invite con magic link (HU-05) | Cron jueves 7pm / `inviteForMatch` | `match-invite.template.ts` (**rica**) | `¡{match} es tu match de la semana! 💘` |
| Cita confirmada (HU-08) | `tryConfirm` con cruce de horario + lugar | `date-confirmation.template.ts` (**rica**) | `¡Coincidieron! Tu cita con {match} 🎉` |
| Empujón de disponibilidad (HU-08) | `tryConfirm` sin cruce, 1ª vez | `more-availability.template.ts` | `Agrega más horarios para coincidir con {match}` |
| Match no continuó (HU-07) | Rechazo por chatbot / timeout 48h | `match-rejected.template.ts` | `Tu match de esta semana no continuó 😞` |
| Reciclaje (HU-08) | 2º fallo de agendamiento / deadline vencido | `rescheduling-failed.template.ts` | `No logramos coordinar tu cita esta vez` |

Las dos **ricas** siguen el estilo "Ditto":

- **Invite**: banner de expiración (`⏳ El enlace expira en N días`), tarjeta con la
  **foto principal** del match y barra con `nombre, edad` + `universidad · carrera`,
  botón CTA **"Elegir horario"** con el magic link, y el link crudo debajo como
  fallback.
- **Confirmación**: tarjeta de detalle con filas **Con / Lugar / Dirección / Cuándo**
  (la dirección sale del `Venue`; una fila vacía no se pinta).

Las otras tres son texto corto que espeja el copy de WhatsApp.

---

## 4. Plantillas HTML — decisiones

- **Todo inline-styled** (`mail/templates/email-layout.ts` arma header/footer):
  los clientes de correo eliminan `<style>`. Máx ~520px, divs/tablas simples.
- **La barra de la foto va debajo, no encima**: `position: absolute` y texto sobre
  background-image no son confiables en Outlook/Gmail.
- **`escapeHtml()` en todo valor interpolado** (nombres, lugares): son input de
  usuario/admin dentro de HTML.
- **La foto es la URL pública de S3** (`isPrimary`, o la primera). En dev local las
  fotos apuntan a `localhost` y no cargan en un inbox real — se resuelve solo al
  configurar S3. Sin foto, la tarjeta se omite.
- **`expiresInDays` se deriva del TTL real del token**
  (`AvailabilityLinkService.ttlHours()` → `Math.ceil(h/24)`), no de una constante
  aparte: el banner nunca miente sobre la expiración.

---

## 5. Aislamiento de fallas

`NotificationsService.dispatch()` usa `Promise.allSettled` y loguea los rechazos:

- Un canal caído (SMTP abajo, WhatsApp abajo) **no bloquea** al otro.
- El dispatcher **nunca lanza**: la confirmación de la cita ya hizo commit de su
  transacción cuando notifica — una falla de envío no puede deshacerla ni romper
  el flujo del caller.

---

## 6. Variables de entorno

```bash
# SMTP — vacío SMTP_HOST = modo dev: los correos se loguean en consola
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
MAIL_FROM="TheConnection <no-reply@theconnection.co>"

FRONTEND_URL=http://localhost:3000     # base del magic link
AVAILABILITY_LINK_TTL_HOURS=72         # TTL del token → "expira en N días" del correo
```

> Nota Mailtrap (plan gratis): limita los envíos por segundo. Como cada
> confirmación manda 2 correos casi simultáneos, el segundo puede fallar con
> `550 Too many emails per second` — el error queda logueado y el flujo sigue
> (ver §5). Un proveedor real no tiene ese límite.

---

## 7. Scripts útiles (`backend`, tras `npm run build`)

| Comando | Qué hace |
|---|---|
| `node dist/src/scripts/preview-emails.js [dir]` | Renderiza las 6 variantes (invite con y sin foto, confirmación, empujón, rechazo, reciclaje) a HTML con datos de ejemplo, **sin enviar nada**. Default: `./email-previews` |
| `node dist/src/scripts/issue-availability-link.js [matchId]` | Re-emite los links de un match y dispara el invite por **ambos** canales |
| `node dist/src/scripts/run-weekly-matching.js` | Matcher completo + invites (2 correos + 2 WhatsApp por match) |

---

## 8. Cómo probar

### Solo el diseño (sin DB, sin SMTP)
```bash
cd backend && npm run build
node dist/src/scripts/preview-emails.js
open email-previews/match-invite.html   # y las demás
```

### Modo dev (sin SMTP configurado)
Con `SMTP_HOST` vacío, cada envío aparece en consola:
```
[dev whatsapp] to +57300...: ¡Tenemos tu match de la semana con ...!
[dev mail] to ana@eafit.edu.co: "¡Abby es tu match de la semana! 💘"
```
Dispara los flujos igual que en
[availability-scheduling-flow.md §10](../matching/availability-scheduling-flow.md):
seed → `run-weekly-matching` → completar los dos flujos de token. Cada
notificación debe loguear **las dos líneas** (WhatsApp + mail).

### Con inbox real
Apunta `SMTP_*` a Mailtrap/Ethereal y repite: los correos llegan al inbox de
prueba y se puede revisar el render en un cliente real.

---

## 9. Tests automatizados

`notifications/notifications.service.spec.ts`:

- **Fan-out**: cada `notifyX` llama a WhatsApp (payload recortado exacto) y al
  correo (payload completo).
- **Aislamiento**: si un canal rechaza, el otro igual se llama y el método
  resuelve (en ambas direcciones).
- **`buildPartnerSummary`**: prefiere la foto `isPrimary`, cae a la primera,
  degrada a "tu match" sin perfil.
- **Plantilla del invite**: contiene el link, los días de expiración y el nombre
  **escapado**; sin foto, no hay `<img>`.

Ejecutar: `cd backend && npx jest src/modules/notifications`.

import { ChatUserContext } from '../user-context/user-resolver.service';

// Builds the per-request system prompt. The user's profile is injected so dating
// tips are personalized without an extra round-trip (AC #3). The greeting block
// only appears on the first message of a session (AC #2).
export function buildSystemPrompt(
  context: ChatUserContext,
  isNewSession: boolean,
): string {
  const greeting = isNewSession ? newSessionGreeting(context) : '';

  return [
    `Eres el asistente de TheConnection, una app de citas para estudiantes universitarios en Colombia.`,
    `Responde en el idioma del usuario; por defecto, español. Tono cercano, breve y útil (es WhatsApp).`,
    ``,
    `Solo puedes ayudar con estos temas:`,
    `- Consejos para citas (personalizados con el perfil del usuario).`,
    `- El match actual del usuario (usa la herramienta get_match_details).`,
    `- Los detalles de la próxima cita (usa la herramienta get_upcoming_date).`,
    `- Ayuda sobre cómo funciona la app (usa la herramienta get_app_help).`,
    ``,
    profileBlock(context),
    ``,
    `Reglas:`,
    `- Privacidad: nunca reveles datos privados de otra persona. Solo puedes hablar`,
    `  del match del propio usuario con los campos que devuelven las herramientas. Si`,
    `  piden información de otros usuarios, niégate con un aviso breve de privacidad.`,
    `- Alcance: si el mensaje es ofensivo o ajeno a estos temas, redirígelo con`,
    `  amabilidad a lo que sí puedes ayudar. No inventes datos de match ni de cita.`,
    `- Herramientas: si devuelven "NO_ACTIVE_MATCH", explica que aún no hay match esta`,
    `  semana. Si devuelven "NO_DATE_SCHEDULED", explica que todavía no hay cita`,
    `  confirmada. Convierte la fecha ISO a una hora local legible (Colombia).`,
    greeting,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

function profileBlock(context: ChatUserContext): string {
  const lines = [
    `Perfil del usuario actual:`,
    context.name ? `- Nombre: ${context.name}` : null,
    context.age !== null ? `- Edad: ${context.age}` : null,
    context.university ? `- Universidad: ${context.university}` : null,
    context.major ? `- Carrera: ${context.major}` : null,
    context.interests.length
      ? `- Intereses: ${context.interests.join(', ')}`
      : null,
    context.relationshipType ? `- Busca: ${context.relationshipType}` : null,
    context.energyVibe ? `- Vibra: ${context.energyVibe}` : null,
  ].filter((line): line is string => line !== null);
  return lines.join('\n');
}

function newSessionGreeting(context: ChatUserContext): string {
  const name = context.name ? ` ${context.name}` : '';
  return [
    ``,
    `Es el primer mensaje de la conversación: saluda por su nombre (Hola${name})`,
    `y, de forma natural (no como un menú numerado), menciona en qué puedes ayudar:`,
    `pedir consejos para tu cita, ver tu match actual, ver los detalles de tu próxima`,
    `cita, o ayuda con la app.`,
  ].join('\n');
}

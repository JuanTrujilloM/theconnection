import { Injectable } from '@nestjs/common';

// Static help/FAQ content the bot relays for "Get help with the app". No DB,
// no per-user data. Edit the copy here; the model paraphrases as needed.
const APP_HELP = `
¿Cómo funciona TheConnection?
  Cada semana nuestra IA te presenta un único match curado y te acompaña hasta una
  cita real en un lugar físico. Nada de scrollear sin parar.

¿Cuándo recibo mi match?
  Cada domingo a las 7:00 p. m. (hora Colombia) generamos los matches de la semana.

¿Cómo confirmo una cita?
  Cuando recibas tu match, eliges tus horarios disponibles, ambos escogen lugar y, si
  hay coincidencia, confirmamos la cita automáticamente y te avisamos por WhatsApp.

¿Puedo pausar los matches?
  Sí. En tu perfil puedes cambiar tu disponibilidad a "Pausado" cuando quieras.

¿Mis datos están seguros?
  Tratamos tus datos conforme a la ley de Habeas Data. Nunca compartimos tu número ni
  tu correo con tu match.

¿Necesitas más ayuda?
  Escríbenos a soporte@theconnection.co
`.trim();

@Injectable()
export class GetAppHelpTool {
  run(): string {
    return APP_HELP;
  }
}

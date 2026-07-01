import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Input contract for the WhatsApp transport: it resolves the sender's number and
// the message body, then calls ChatbotService.handleIncomingMessage with this.
export class IncomingMessageDto {
  @IsString()
  @IsNotEmpty()
  cellphone!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;

  // WhatsApp message id — the transport uses it for idempotency/dedupe; optional here.
  @IsOptional()
  @IsString()
  messageId?: string;
}

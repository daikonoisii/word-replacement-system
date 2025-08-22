export interface ITextDecoderService {
  decode(text: File): Promise<string>;
}

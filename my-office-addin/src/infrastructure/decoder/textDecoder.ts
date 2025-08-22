import Encoding from 'encoding-japanese';
import type { ITextDecoderService } from 'src/repositories/textDecoderInterface';

export class CsvTextDecoderService implements ITextDecoderService {
  decode(text: string): string {
    // 文字列をUint8Arrayに変換
    const uint8Array = Encoding.stringToCode(text);

    // 文字コード判定
    const detected = Encoding.detect(uint8Array);

    // UTF-8またはSJISでデコード
    if (detected === 'UTF8') {
      return Encoding.codeToString(
        Encoding.convert(uint8Array, 'UNICODE', 'UTF8')
      );
    } else if (detected === 'UNICODE') {
      return text;
    } else {
      return Encoding.codeToString(
        Encoding.convert(uint8Array, 'UNICODE', 'SJIS')
      );
    }
  }
}

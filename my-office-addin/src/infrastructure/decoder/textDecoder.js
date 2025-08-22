import Encoding from 'encoding-japanese';
export class CsvTextDecoderService {
    decode(file) {
        return file.arrayBuffer().then((arrayBuffer) => {
            const uint8Array = new Uint8Array(arrayBuffer);
            // BOM判定
            let decodedText;
            if (uint8Array[0] === 0xef &&
                uint8Array[1] === 0xbb &&
                uint8Array[2] === 0xbf) {
                // UTF-8 BOM
                decodedText = new TextDecoder('utf-8').decode(uint8Array.subarray(3));
            }
            else if (uint8Array[0] === 0xfe && uint8Array[1] === 0xff) {
                // UTF-16 BE BOM
                decodedText = new TextDecoder('utf-16be').decode(uint8Array.subarray(2));
            }
            else if (uint8Array[0] === 0xff && uint8Array[1] === 0xfe) {
                // UTF-16 LE BOM
                decodedText = new TextDecoder('utf-16le').decode(uint8Array.subarray(2));
            }
            else {
                // BOMなし: encoding-japaneseで判定・変換
                const detected = Encoding.detect(uint8Array);
                if (detected === 'UTF8') {
                    decodedText = Encoding.codeToString(Encoding.convert(uint8Array, 'UNICODE', 'UTF8'));
                }
                else if (detected === 'SJIS') {
                    decodedText = Encoding.codeToString(Encoding.convert(uint8Array, 'UNICODE', 'SJIS'));
                }
                else {
                    // その他はUTF-8でデコード
                    decodedText = new TextDecoder('utf-8').decode(uint8Array);
                }
            }
            return decodedText;
        });
    }
}

import { EncryptionProvider } from '../../domain/ports/encryption-provider';
import * as bcrypt from 'bcrypt';

export class BcryptEncryptor implements EncryptionProvider {
    async encrypt(text: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(text, saltRounds);
    }

    async compare(text: string, encryptedText: string): Promise<boolean> {
        return bcrypt.compare(text, encryptedText);
    }
}

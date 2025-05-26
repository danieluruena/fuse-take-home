import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  EncryptionProvider,
  ItemNotFoundException,
  Logger,
  User,
  UsersRepository,
} from '@shared/take-home-core';
import { TOKENS } from 'src/shared/tokens';

@Injectable()
export class UsersService {
  constructor(
    @Inject(TOKENS.USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @Inject(TOKENS.ENCRYPTION_PROVIDER)
    private readonly encryptionProvider: EncryptionProvider,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  private async userExists(email: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.getUserByEmail(email);
      return !!user;
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        return false;
      }
      throw error;
    }
  }

  async createUser(email: string, password: string): Promise<void> {
    if (await this.userExists(email)) {
      this.logger.info(`User with email ${email} already exists`);
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const currentDate = new Date();
    const user: User = {
      userId: crypto.randomUUID(),
      email,
      password: await this.encryptionProvider.encrypt(password),
      createdAt: currentDate.toISOString(),
    };
    await this.usersRepository.saveUser(user);
    this.logger.info(`User created with id: ${user.userId}`);
  }
}

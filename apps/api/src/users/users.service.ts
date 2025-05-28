import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  EncryptionProvider,
  ItemNotFoundException,
  Logger,
  Portfolio,
  PortfolioRepository,
  User,
  UsersRepository,
} from '@danieluruena/take-home-core';
import { TOKENS } from '../shared/tokens';

@Injectable()
export class UsersService {
  constructor(
    @Inject(TOKENS.USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @Inject(TOKENS.ENCRYPTION_PROVIDER)
    private readonly encryptionProvider: EncryptionProvider,
    @Inject(TOKENS.PORTFOLIO_REPOSITORY)
    private readonly portfolioRepository: PortfolioRepository,
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

  private async createUserPortfolio(userId: string): Promise<void> {
    const portfolio: Portfolio = {
      userId,
      stocks: [],
    };
    await this.portfolioRepository.savePortfolio(portfolio);
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

    try {
      await this.createUserPortfolio(user.userId);
      await this.usersRepository.saveUser(user);
    } catch (error) {
      await this.portfolioRepository.deletePortfolio(user.userId);
      this.logger.error(
        `Failed to create user portfolio for user ${user.userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Somethin went wrong while creating user.',
      );
    }
    this.logger.info(`User created with id: ${user.userId}`);
  }
}

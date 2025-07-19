import jwt from 'jsonwebtoken';
import { RefreshToken } from '../types';
import { User } from '../models';
import { JwtPayload } from '../types';
import { ROLES } from '../middleware/roles';

export class AuthService {
  private static instance: AuthService;
  private refreshTokens: Map<string, RefreshToken> = new Map();

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async generateTokens(userId: string, roles: string[]): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateAccessToken(userId, roles);
    const refreshToken = this.generateRefreshToken(userId);

    // Store refresh token in memory (in production use Redis or similar)
    this.refreshTokens.set(refreshToken, {
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: string, roles: string[]): string {
    const payload: JwtPayload = {
      id: userId,
      email: '', // Will be filled by middleware
      roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string);
  }

  private generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string);
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
      const storedToken = this.refreshTokens.get(refreshToken);

      if (!storedToken || storedToken.userId !== decoded.userId) {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = this.generateAccessToken(user._id.toString(), user.roles);
      return newAccessToken;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  public async logout(userId: string): Promise<void> {
    // Invalidate all refresh tokens for this user
    Array.from(this.refreshTokens.entries())
      .filter(([_, token]) => token.userId === userId)
      .forEach(([token]) => this.refreshTokens.delete(token));
  }

  public async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  public async getUserRoles(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.roles;
  }
}

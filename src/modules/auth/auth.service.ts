import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { MailService } from '@modules/mail/mail.service';
import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/services/user.service';
import { UserVerificationService } from '@modules/user/services/userVerification.service';

import { USER, USER_VERIFY } from '../../constants/responseMessages.const';
import { SALT_ROUNDS, SIX_HOURS_IN_MS } from './constants/auth.const';
import { signinDto } from './dto/signin.dto';
import { signupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userVerificationService: UserVerificationService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async sendVerificationEmail(email: string, uniqueString: string) {
    await this.mailService.sendMail({
      sender: process.env.NODEMAILER_USER,
      from: process.env.NODEMAILER_USER,
      subject: 'Verify your email for marketplace',
      html: `<p>Please verify your email <a href="${process.env.API_ROUTE}/verify/${uniqueString}">here</a></p>`,
      to: email,
    });
  }

  async createUserVerification(user: User) {
    // Generating unique string for verification
    const uniqueString = uuidv4();

    // Verification email will expire 6 hours from now
    const expiringAt = new Date(Date.now() + SIX_HOURS_IN_MS);

    // Send verification email
    await this.sendVerificationEmail(user.email, uniqueString);

    await this.userVerificationService.create({
      user: user,
      expiring_at: expiringAt,
      unique_string: uniqueString,
    });
  }

  async signup(signupBody: signupDto) {
    // Check if user already exists with same email id
    const userExists = await this.userService.findOneByEmail(signupBody.email);
    if (userExists) {
      throw new ConflictException(USER.CONFLICT_EXCEPTION);
    }

    const hashedPassword = await bcrypt.hash(signupBody.password, SALT_ROUNDS);
    signupBody.password = hashedPassword;

    // Create new user
    const user = await this.userService.create({
      ...signupBody,
      is_verified: false,
    });

    await this.createUserVerification(user);

    return { message: USER.REGISTERED };
  }

  async verifyUser(uniqueString: string) {
    const userVerification =
      await this.userVerificationService.findOneByUniqueString(uniqueString);

    // If user verification doesn't exist
    if (!userVerification) {
      throw new NotFoundException(USER_VERIFY.VERIFY_ERROR);
    }

    if (userVerification.user.is_verified) {
      throw new ConflictException(USER_VERIFY.VERIFIED_ALREADY);
    }

    // If user verification token expires create another and send new email to user
    if (new Date() >= userVerification.expiring_at) {
      await Promise.all([
        await this.userVerificationService.deleteOne(
          userVerification.user.user_id,
        ),
        await this.createUserVerification(userVerification.user),
      ]);
      throw new BadRequestException(USER_VERIFY.TOKEN_EXPIRED);
    }

    // Update user verification
    userVerification.user.is_verified = true;

    await Promise.all([
      this.userService.updateOne(userVerification.user.user_id, {
        is_verified: true,
      }),
      this.userVerificationService.deleteOne(userVerification.user_verify_id),
    ]);

    return { message: USER_VERIFY.VERIFIED };
  }

  async signin(signinBody: signinDto) {
    // Check if user exists in database
    const existingUser = await this.userService.findOneByEmail(
      signinBody.email,
    );
    if (!existingUser) {
      throw new NotFoundException(USER.NOT_FOUND);
    }

    // Checking password with existing user password
    const validPassword = await bcrypt.compare(
      signinBody.password,
      existingUser.password,
    );
    if (!validPassword) {
      throw new UnauthorizedException(USER.INVALID);
    }

    // Check if user is verified or not
    if (!existingUser.is_verified) {
      throw new ForbiddenException(USER_VERIFY.NOT_VERIFIED);
    }

    // Payload for jwt token
    const userPayload = {
      userId: existingUser.user_id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    };
    const jwt_token = await this.jwtService.signAsync(userPayload);

    return {
      message: USER.LOGGED_IN,
      payload: { token: jwt_token, user: userPayload },
    };
  }
}

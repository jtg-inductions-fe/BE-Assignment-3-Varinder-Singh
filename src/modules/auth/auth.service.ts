import {
    ConflictException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { signinDto } from './dto/signin.dto';
import { signupDto } from './dto/signup.dto';
import { UserService } from '../user/services/user.service';
import { UserVerificationService } from '../user/services/userVerification.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly userVerificationService: UserVerificationService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
    ) {}

    async signup(signupDto: signupDto) {
        // Check if user already exists with same email id
        const userExists = await this.userService.findOne(signupDto.email);
        if (userExists) {
            throw new ConflictException('User already exits.');
        }

        const hashedPassword = await bcrypt.hash(signupDto.password, 10);
        signupDto.password = hashedPassword;

        // Create new user
        const user = await this.userService.create({
            ...signupDto,
            is_verified: false,
        });
        if (!user) {
            throw new InternalServerErrorException('An error occured');
        }

        // Generating unique string for verification
        const uniqueString = uuidv4();

        // Verification email will expire 6 hours from now
        const expiringAt = new Date(Date.now() + 21600000);

        // Send verification email
        const userVerify = await this.userVerificationService.create({
            user: user,
            expiring_at: expiringAt,
            unique_string: uniqueString,
        });

        if (!userVerify) {
            throw new InternalServerErrorException('An error occured');
        }

        await this.mailService.sendMail({
            sender: process.env.NODEMAILER_USER,
            from: process.env.NODEMAILER_USER,
            subject: 'Verify your email for marketplace',
            html: `<p>Please verify your email <a href="${process.env.API_ROUTE}/verify/${uniqueString}">here</a></p>`,
            to: user.email,
        });

        return {
            message:
                'User registered successfully. Please verify your email to activate your account.',
        };
    }

    async verifyUser(uniqueString: string) {
        const userVerification =
            await this.userVerificationService.findOne(uniqueString);

        if (!userVerification) {
            throw new NotFoundException('User verification does not exist');
        }

        // Update user verification
        userVerification.user.is_verified = true;

        await Promise.all([
            this.userService.updateOne(userVerification.user),
            this.userVerificationService.deleteOne(
                userVerification.user_verify_id,
            ),
        ]);

        return { message: 'User verified successfully' };
    }

    async signin(signinDto: signinDto) {
        // Check if user exists in database
        const existingUser = await this.userService.findOne(signinDto.email);
        if (!existingUser) {
            throw new NotFoundException(
                "User doesn't exist with provided email id",
            );
        }

        // Check if user is verified or not
        if (!existingUser.is_verified) {
            throw new ForbiddenException(
                'User is not verified. Kindly check your email address for verification.',
            );
        }

        // Checking password with existing user password
        const validPassword = await bcrypt.compare(
            signinDto.password,
            existingUser.password,
        );
        if (!validPassword) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        // Payload for jwt token
        const payload = {
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
        };

        const jwt_token = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '24h',
        });

        return {
            message: 'User signed in successfully',
            payload: { token: jwt_token },
        };
    }
}

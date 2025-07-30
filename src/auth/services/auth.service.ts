import { Body, Get, Inject, Injectable, Post } from '@nestjs/common';

@Injectable()
export class AuthService {
    signup() {
        return 'signed up';
    }
}

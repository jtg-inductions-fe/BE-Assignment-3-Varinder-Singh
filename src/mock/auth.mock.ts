import { signinDto } from '@modules/auth/dto/signin.dto';
import { signupDto } from '@modules/auth/dto/signup.dto';
import { UserType } from '@modules/user/types/user.types';

export const mockUser: UserType & { user_id: string } = {
  user_id: '31be7a70-2c19-49f7-a359-cde3dbfafe58',
  name: 'varinder',
  email: 'virenderdhillon104@gmail.com',
  password: 'strong-password',
  role: 'seller',
  is_verified: true,
};

export const mockUserVerify = {
  user_verify_id: 'user_verify_id',
  user: mockUser,
  unique_string: 'unique_string',
  expiring_at: new Date(),
};

export const mockSignupDto: signupDto = {
  name: 'varinder',
  email: 'virenderdhillon104@gmail.com',
  password: 'strong-password',
  role: 'seller',
};

export const mockSigninDto: signinDto = {
  email: 'virenderdhillon104@gmail.com',
  password: 'strong-password',
};

export const mockUserService = {
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  delete: jest.fn(),
};

export const mockUserVerificationService = {
  findOneByUniqueString: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
};

export const mockMailService = {
  sendMail: jest.fn(),
};

export const mockJWTService = {
  signAsync: jest.fn(),
};

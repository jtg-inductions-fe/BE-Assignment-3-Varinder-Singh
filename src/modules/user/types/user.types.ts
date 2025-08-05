export interface UserType {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'seller' | 'buyer';
  is_verified: boolean;
}

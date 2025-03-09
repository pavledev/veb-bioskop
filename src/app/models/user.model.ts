import { AddressModel } from './address.model';

export interface UserModel
{
    userId: number;
    username: string;
    passwordHash: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: AddressModel;
    favoriteGenres: string[];
}

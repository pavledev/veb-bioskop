export interface UserModel
{
    userId: number;
    passwordHash: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    favoriteGenres: string[];
}

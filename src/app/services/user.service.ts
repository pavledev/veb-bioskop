import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { UserModel } from '../models/user.model';
import { UtilityService } from './utility.service';

@Injectable()
export class UserService
{
    private firestore: Firestore = inject(Firestore);
    private utilityService: UtilityService = inject(UtilityService);
    async getUsername(userId: string)
    {
        const userDocReference = doc(this.firestore, `users/${userId}`);
        const [error, snapshot] = await this.utilityService.catchError(getDoc(userDocReference));

        if (error)
        {
            return null;
        }

        if (snapshot.exists())
        {
            const user = snapshot.data() as UserModel;

            return user.username;
        }

        return null;
    }
}

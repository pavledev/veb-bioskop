import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { UserModel } from '../models/user.model';
import { UtilityService } from './utility.service';
import { from, map, Observable } from 'rxjs';

@Injectable()
export class UserService
{
    private firestore: Firestore = inject(Firestore);
    private utilityService: UtilityService = inject(UtilityService);

    getUsername(userId: string): Observable<string | null>
    {
        const userDocReference = doc(this.firestore, `users/${userId}`);

        return from(this.utilityService.catchError(getDoc(userDocReference))).pipe(
            map(([error, snapshot]) =>
            {
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
            })
        );
    }
}

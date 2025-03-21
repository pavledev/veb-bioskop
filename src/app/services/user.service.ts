import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { UserModel } from '../models/user.model';
import { UtilityService } from './utility.service';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private firestore: Firestore = inject(Firestore);
    private utilityService: UtilityService = inject(UtilityService);

    private userDocumentSubject: BehaviorSubject<UserModel | null> = new BehaviorSubject<UserModel | null>(null);

    get userDocument$(): Observable<UserModel | null>
    {
        return this.userDocumentSubject.asObservable();
    }

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

    async getUserDocument(uid: string)
    {
        const userDocumentReference = doc(this.firestore, 'users', uid);
        const userDocumentSnapshot = await getDoc(userDocumentReference);

        if (userDocumentSnapshot.exists())
        {
            this.userDocumentSubject.next(userDocumentSnapshot.data() as UserModel);
        }
        else
        {
            this.userDocumentSubject.next(null);
        }
    }

    clearUserDocument()
    {
        this.userDocumentSubject.next(null);
    }

    async updateUserProfile(uid: string, user: Partial<UserModel>, authService: AuthService)
    {
        if (user.username && user.username !== authService.currentUser?.displayName)
        {
            const isAvailable = await this.checkUsernameAvailability(user.username, authService.currentUser?.uid as string);

            if (!isAvailable)
            {
                return 'Već postoji korisnik sa ovim korisničkim imenom!';
            }
        }

        const error: string | null = await authService.updateFirebaseUser(user);

        if (error)
        {
            return error;
        }

        return await this.updateUserDocument(uid, user);
    }

    async updateUserDocument(uid: string, user: Partial<UserModel>)
    {
        const userDocReference = doc(this.firestore, 'users', uid);
        const [error] = await this.utilityService.catchError(
            updateDoc(userDocReference, user)
        );

        return error ? 'Došlo je do greške prilikom ažuriranja profila!' : null;
    }

    async checkUsernameAvailability(username: string, userId: string)
    {
        const usersReference = collection(this.firestore, 'users');
        const usernameQuery = query(usersReference, where('username', '==', username));
        const querySnapshot = await getDocs(usernameQuery);

        return querySnapshot.empty || querySnapshot.docs[0].id === userId;
    }

    async addReviewIdToUser(userId: string, reviewId: string): Promise<string | null>
    {
        const userDocReference = doc(this.firestore, `users/${userId}`);
        const userDocSnapshot = await getDoc(userDocReference);

        const userData = userDocSnapshot.data() as UserModel;
        const reviews = userData.reviews ? userData.reviews : [];

        reviews.push(reviewId);

        const [error] = await this.utilityService.catchError(updateDoc(userDocReference, {
            reviews: reviews
        }));

        return error ? 'Došlo je do greške prilikom ažuriranja korisničkog profila!' : null;
    }

    async addReservationIdToUser(userId: string, reservationId: string): Promise<string | null>
    {
        const userDocReference = doc(this.firestore, `users/${userId}`);
        const userDocSnapshot = await getDoc(userDocReference);

        const userData = userDocSnapshot.data() as UserModel;
        const reservations = userData.reservations ? userData.reservations : [];

        reservations.push(reservationId);

        const [error] = await this.utilityService.catchError(updateDoc(userDocReference, {
            reservations: reservations
        }));

        return error ? 'Došlo je do greške prilikom ažuriranja korisničkog profila!' : null;
    }
}

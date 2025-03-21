import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    collectionData
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UtilityService } from './utility.service';
import { MovieReviewModel } from '../models/movie.review.model';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { ReservationModel } from '../models/reservation.model';
import { UserService } from './user.service';

@Injectable()
export class ReservationService
{
    private firestore: Firestore = inject(Firestore);
    private authService: AuthService = inject(AuthService);
    private userService: UserService = inject(UserService);
    private utilityService: UtilityService = inject(UtilityService);

    async addReservation(reservation: ReservationModel): Promise<string | null>
    {
        const user: User | null = this.authService.currentUser;

        if (!user)
        {
            return 'Morate biti prijavljeni da biste rezervisali karte!';
        }

        const userId = user.uid;
        const reservationsCollection = collection(this.firestore, 'reservations');
        const reservationReference = doc(reservationsCollection);

        reservation.id = reservationReference.id;
        reservation.userId = userId;

        const [error] = await this.utilityService.catchError(setDoc(reservationReference, reservation));

        if (error)
        {
            return 'Došlo je do greške prilikom rezervacije karata!';
        }

        return await this.userService.addReservationIdToUser(userId, reservationReference.id);
    }

    getAllReservations(): Observable<ReservationModel[]>
    {
        const user = this.authService.currentUser;

        if (!user)
        {
            return new Observable<ReservationModel[]>((observer) =>
            {
                observer.next([]);
                observer.complete();
            });
        }

        const userId = user.uid;
        const reservationsCollection = collection(this.firestore, 'reservations');
        const reservationsQuery = query(reservationsCollection, where('userId', '==', userId));

        return collectionData(reservationsQuery, { idField: 'id' }) as Observable<ReservationModel[]>;
    }
}

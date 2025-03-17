import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
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

@Injectable({
    providedIn: 'root'
})
export class MovieReviewService
{
    private firestore: Firestore = inject(Firestore);
    private authService: AuthService = inject(AuthService);
    private utilityService: UtilityService = inject(UtilityService);

    async addReview(movieId: string, title: string, content: string, rating: number): Promise<string | null>
    {
        const user: User | null = this.authService.currentUser;

        if (!user)
        {
            return 'Morate biti prijavljeni da biste kreirali recenziju!';
        }

        const userId = user.uid;
        const reviewsCollection = collection(this.firestore, 'reviews');
        const reviewReference = doc(reviewsCollection);

        const newReview: MovieReviewModel = {
            id: reviewReference.id,
            userId,
            movieId,
            title,
            content,
            rating,
            createdAt: Timestamp.now().toDate().toISOString(),
            updatedAt: null
        };

        const [error] = await this.utilityService.catchError(setDoc(reviewReference, newReview));

        if (error)
        {
            return 'Došlo je do greške prilikom kreiranja recenzije!';
        }

        return null;
    }

    getReviewsByMovieId(movieId: string): Observable<MovieReviewModel[]>
    {
        const reviewsCollection = collection(this.firestore, 'reviews');
        const query1 = query(reviewsCollection, where('movieId', '==', movieId));

        return collectionData(query1, { idField: 'id' }) as Observable<MovieReviewModel[]>;
    }

    async updateReview(reviewId: string, updatedData: Partial<MovieReviewModel>): Promise<boolean>
    {
        const reviewRef = doc(this.firestore, `reviews/${reviewId}`);
        const [error] = await this.utilityService.catchError(updateDoc(reviewRef, { ...updatedData, updatedAt: Timestamp.now().toDate().toISOString() }));

        if (error)
        {
            console.error("Error updating review:", error);
            return false;
        }

        return true;
    }

    async deleteReview(reviewId: string): Promise<boolean>
    {
        const reviewRef = doc(this.firestore, `reviews/${reviewId}`);
        const [error] = await this.utilityService.catchError(deleteDoc(reviewRef));

        if (error)
        {
            console.error("Error deleting review:", error);
            return false;
        }

        return true;
    }
}

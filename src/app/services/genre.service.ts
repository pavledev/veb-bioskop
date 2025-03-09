import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';

@Injectable()
export class GenreService
{
    constructor(private firestore: Firestore)
    {
    }

    async getGenres(): Promise<string[]>
    {
        const genresCollection = collection(this.firestore, 'genres');

        return getDocs(genresCollection)
            .then(querySnapshot => querySnapshot.docs.map(doc => doc.data()['name']))
            .catch(error =>
            {
                console.error("Greška prilikom dohvatanja žanrova:", error);
                return [];
            });
    }
}

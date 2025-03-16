import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { UtilityService } from './utility.service';

@Injectable()
export class GenreService
{
    private injector = inject(Injector);
    private firestore = inject(Firestore);
    private utilityService = inject(UtilityService);

    async getGenres()
    {
        return runInInjectionContext(this.injector, async () =>
        {
            const genresCollection = collection(this.firestore, 'genres');
            const promise = getDocs(genresCollection)
                .then(querySnapshot => querySnapshot.docs.map(doc => doc.data()['name']));

            return this.utilityService.catchError(promise);
        });
    }
}

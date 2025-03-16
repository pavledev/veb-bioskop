import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilityService
{
    async catchError<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]>
    {
        return promise
            .then((data) =>
            {
                return [undefined, data] as [undefined, T];
            })
            .catch((error) =>
            {
                return [error];
            });
    }
}

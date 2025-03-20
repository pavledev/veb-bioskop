import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilityService
{
    public async catchError<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]>
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

    public getSlug(title: string): string
    {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    public removeDuplicates(arr: string[]): string[]
    {
        return [...new Set(arr)];
    }

    public sortArray(arr: string[]): string[]
    {
        return arr.sort((a, b) => a.localeCompare(b));
    }
}

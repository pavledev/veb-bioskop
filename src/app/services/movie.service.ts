import { inject, Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { UtilityService } from './utility.service';

@Injectable()
export class MovieService
{
    private client: AxiosInstance;
    private utilityService = inject(UtilityService);

    constructor()
    {
        this.client = axios.create({
            baseURL: 'https://app.cineplexx.rs/api',
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'sr'
            }
        });
    }

    async getMovies()
    {
        return this.utilityService.catchError(this.client.post('/v1/movies/search/advanced', {}));
    }

    async getMovieDetails(movieSlug: string | null)
    {
        return this.utilityService.catchError(this.client.get(`/v1/movies/${movieSlug}`));
    }

    async getTrailerURL(movieTitle: string)
    {
        return this.utilityService.catchError(this.client.post('/v1/movies/search/advanced', { title: movieTitle }));
    }

    async getLocations()
    {
        return this.utilityService.catchError(this.client.post('/v1/locations'));
    }
}

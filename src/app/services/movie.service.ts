import { Injectable } from '@angular/core';
import axios, {AxiosInstance, AxiosResponse} from 'axios';

@Injectable()
export class MovieService
{
    private client: AxiosInstance;

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

    async getMovies(): Promise<AxiosResponse<any, any>>
    {
        return this.client.post('/v1/movies/search/advanced', {});
    }

    async getMovieDetails(movieSlug: string | null): Promise<AxiosResponse<any, any>>
    {
        return this.client.get(`/v1/movies/${movieSlug}`);
    }
}

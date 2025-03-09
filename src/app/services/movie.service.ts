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
                'Accept': 'application/json'
            }
        });
    }

    async getMovies(): Promise<AxiosResponse<any, any>>
    {
        return this.client.post('/v1/movies/search/advanced', {});
    }
}

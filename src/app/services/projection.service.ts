import { inject, Injectable } from '@angular/core';
import { ProjectionModel } from '../models/projection.model';
import { MovieModel } from '../models/movie.model';
import { MovieService } from './movie.service';

@Injectable()
export class ProjectionService
{
    private readonly movieService: MovieService = inject(MovieService);

    private readonly PROJECTIONS_STORAGE_KEY = 'projections';
    private readonly hallCount = 12;
    private readonly maxTicketsPerHall = 100;
    private readonly minPrice = 500;
    private readonly maxPrice = 1000;
    private readonly projectionInterval = 150;

    private generateRandomPrice(): number
    {
        return this.minPrice + Math.floor(Math.random() * (this.maxPrice - this.minPrice + 1));
    }

    private formatTime(hours: number, minutes: number): string
    {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    private generateTimeSlots(): string[]
    {
        const startHour = 10;
        const endHour = 22;
        const timeSlots: string[] = [];

        for (let hour = startHour; hour < endHour; hour++)
        {
            for (let minute = 0; minute < 60; minute += 30)
            {
                if (hour * 60 + minute + this.projectionInterval <= endHour * 60)
                {
                    timeSlots.push(this.formatTime(hour, minute));
                }
            }
        }

        return timeSlots;
    }

    private generateHalls(): string[]
    {
        return Array.from({ length: this.hallCount }, (_, index) => `Hall ${index + 1}`);
    }

    private generateUniquePairs(): { halls: string[], times: string[] }
    {
        const halls = this.generateHalls();
        const timeSlots = this.generateTimeSlots();
        const pairCount = Math.min(halls.length, timeSlots.length);

        const shuffledHalls = [...halls].sort(() => Math.random() - 0.5);
        const shuffledTimes = [...timeSlots].sort(() => Math.random() - 0.5);

        return {
            halls: shuffledHalls.slice(0, pairCount),
            times: shuffledTimes.slice(0, pairCount)
        };
    }

    public async generateProjections()
    {
        const [error, response] = await this.movieService.getAllMovies();

        if (error)
        {
            return;
        }

        const today = new Date();
        const maxDate = new Date(today);

        maxDate.setDate(today.getDate() + 6);

        const projections: ProjectionModel[] = response.data
            .filter((movie: MovieModel) =>
            {
                const movieStartDate = new Date(movie.startDate);
                return movieStartDate <= maxDate;
            })
            .map((movie: MovieModel) =>
            {
                const { halls, times } = this.generateUniquePairs();
                return {
                    title: movie.title,
                    price: this.generateRandomPrice(),
                    maxTicketCount: this.maxTicketsPerHall,
                    halls,
                    times
                };
            });

        localStorage.setItem(this.PROJECTIONS_STORAGE_KEY, JSON.stringify(projections));
    }

    public getProjections(): ProjectionModel[]
    {
        const data: string | null = localStorage.getItem(this.PROJECTIONS_STORAGE_KEY);

        return data ? JSON.parse(data) : [];
    }

    public hasProjection(title: string): boolean
    {
        return this.getProjections().some(projection => projection.title === title);
    }
}

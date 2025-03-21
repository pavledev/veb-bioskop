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
    private readonly maxTicketsPerReservation = 6;
    private readonly minPrice = 500;
    private readonly maxPrice = 1000;
    private readonly projectionInterval = 150;

    private allHalls: string[] = [];
    private allTimes: string[] = [];

    constructor()
    {
        this.allHalls = this.generateHalls();
        this.allTimes = this.generateTimeSlots();
    }

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
        return Array.from({ length: this.hallCount }, (_, index) => `Sala ${index + 1}`);
    }

    private generateHallTimePairs(): { hall: string, time: string }[]
    {
        const pairs: { hall: string, time: string }[] = [];
        this.allHalls.forEach(hall =>
        {
            this.allTimes.forEach(time =>
            {
                pairs.push({ hall, time });
            });
        });

        return pairs;
    }

    public async generateProjections()
    {
        const [error, response] = await this.movieService.getAllMovies();

        if (error)
        {
            return;
        }

        const shuffledPairs = this.generateHallTimePairs().sort(() => Math.random() - 0.5);

        const projections: ProjectionModel[] = response.data.map((movie: any) =>
        {
            const hallCount = Math.floor(Math.random() * 5) + 1;
            const timeCount = Math.floor(Math.random() * 5) + 1;

            const selectedHalls = Array.from(new Set(shuffledPairs.splice(0, hallCount).map(pair => pair.hall)));
            const selectedTimes = Array.from(new Set(shuffledPairs.splice(0, timeCount).map(pair => pair.time)));

            const sortedHalls = selectedHalls.sort((a, b) =>
            {
                const numA = parseInt(a.replace(/\D+/g, ''), 10);
                const numB = parseInt(b.replace(/\D+/g, ''), 10);
                return numA - numB;
            });

            const sortedTimes = selectedTimes.sort((a, b) =>
            {
                const [hourA, minuteA] = a.split(':').map(Number);
                const [hourB, minuteB] = b.split(':').map(Number);
                return (hourA * 60 + minuteA) - (hourB * 60 + minuteB);
            });

            return {
                movieId: movie.id,
                title: movie.title,
                price: this.generateRandomPrice(),
                maxTicketCount: this.maxTicketsPerReservation,
                times: sortedTimes,
                halls: sortedHalls,
                technologies: movie.availableTechCMS.map((technology: any): string[] => technology.Description.replace(/<[^>]+>/g, ''))
            };
        });

        localStorage.setItem(this.PROJECTIONS_STORAGE_KEY, JSON.stringify(projections));
    }

    public getProjections(): ProjectionModel[]
    {
        const data = localStorage.getItem(this.PROJECTIONS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    public hasProjection(title: string): boolean
    {
        return this.getProjections().some(projection => projection.title === title);
    }
}

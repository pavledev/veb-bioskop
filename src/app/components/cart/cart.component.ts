import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartItemModel } from '../../models/cart.item.model';
import { CartService } from '../../services/cart.service';
import { UtilityService } from '../../services/utility.service';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { ProjectionService } from '../../services/projection.service';
import { ProjectionModel } from '../../models/projection.model';

@Component({
    selector: 'app-cart',
    imports: [MatCardModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        RouterLink,
        MatOption,
        MatSelect],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css',
    providers: [CartService, MovieService, ProjectionService]
})
export class CartComponent implements OnInit
{
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly cartService: CartService = inject(CartService);
    private readonly movieService: MovieService = inject(MovieService);
    public readonly projectionService: ProjectionService = inject(ProjectionService);
    public readonly utilityService: UtilityService = inject(UtilityService);
    public readonly cartForm: FormGroup;

    public cartItems: CartItemModel[] | null = null;
    public projections: ProjectionModel[] = [];
    public cinemaLocations: string[] | null = null;
    public projectionDates: string[] | null = null;
    public error: string | null = null;

    constructor()
    {
        this.cartForm = this.formBuilder.group({
            cinemaLocation: ['', Validators.required],
            projectionDate: ['', Validators.required],
            projectionTime: ['', Validators.required],
            hall: ['', Validators.required],
            technology: ['', Validators.required],
            ticketCount: ['', Validators.required]
        });
    }

    async ngOnInit()
    {
        const [error, response] = await this.movieService.getLocations();

        if (error)
        {
            this.error = error.message;
        }
        else
        {
            this.cinemaLocations = response.data.map((location: any) => location.name);
        }

        this.cartItems = this.cartService.getCartItems();

        const titles = this.cartItems.map(item => item.title);

        this.projections = this.projectionService.getProjections().filter((projection: ProjectionModel) => titles.includes(projection.title));

        this.generateProjectionDays();
    }

    generateProjectionDays()
    {
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const daysOfWeek = ['ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota', 'nedelja'];
        const months = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
        this.projectionDates = [];

        if (currentHour < 22)
        {
            this.projectionDates.push('Danas');
        }

        for (let i = (currentHour < 22 ? 1 : 0); i < 7; i++)
        {
            const date = new Date();
            date.setDate(currentDate.getDate() + i);

            const day = date.getDate();
            const month = months[date.getMonth()];
            const dayOfWeek = i === 0 ? 'Sutra' : daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];

            this.projectionDates.push(`${day}. ${month}, ${dayOfWeek}`);
        }
    }
}

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
    providers: [CartService, MovieService]
})
export class CartComponent implements OnInit
{
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly cartService: CartService = inject(CartService);
    private readonly movieService: MovieService = inject(MovieService);
    public readonly utilityService: UtilityService = inject(UtilityService);
    public readonly cartForm: FormGroup;

    public readonly cartItems: CartItemModel[];
    public cinemaLocations: string[] | null = null;
    public error: string | null = null;
    constructor()
    {
        this.cartForm = this.formBuilder.group({
            cinemaLocation: ['', [Validators.required, Validators.minLength(2)]],
            projectionDate: ['', [Validators.required, Validators.minLength(2)]],
            projectionTime: ['', [Validators.required, Validators.email]],
            ticketCount: ['', [Validators.required, Validators.minLength(6)]],
            technology: ['', [Validators.required]]
        });

        this.cartItems = this.cartService.getCartItems();
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
    }
}

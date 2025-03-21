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
import { QuantitySelectorComponent } from '../quantity-selector/quantity-selector.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { ReservationService } from '../../services/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ReservationModel } from '../../models/reservation.model';

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
        MatSelect, QuantitySelectorComponent, MatProgressSpinner],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css',
    providers: [CartService, MovieService, ProjectionService, ReservationService]
})
export class CartComponent implements OnInit
{
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly dialog: MatDialog = inject(MatDialog);
    private readonly snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly cartService: CartService = inject(CartService);
    private readonly movieService: MovieService = inject(MovieService);
    public readonly projectionService: ProjectionService = inject(ProjectionService);
    private readonly reservationService: ReservationService = inject(ReservationService);
    public readonly utilityService: UtilityService = inject(UtilityService);
    public cartForms: FormGroup[] = [];

    public isCreatingReservations: boolean = false;
    public cartItems: CartItemModel[] | null = null;
    public projections: ProjectionModel[] = [];
    public cinemaLocations: string[] | null = null;
    public projectionDates: string[] | null = null;
    public error: string | null = null;

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

        this.loadCartItemsAndProjections();
        this.generateProjectionDays();
    }

    loadCartItemsAndProjections(): void
    {
        this.cartItems = this.cartService.getCartItems();
        this.cartForms = [];

        this.cartItems.forEach(() =>
        {
            this.cartForms.push(this.formBuilder.group({
                cinemaLocation: ['', Validators.required],
                projectionDate: ['', Validators.required],
                projectionTime: ['', Validators.required],
                hall: ['', Validators.required],
                technology: ['', Validators.required],
                ticketCount: [1, Validators.required]
            }));
        });

        const titles = this.cartItems.map(item => item.title);

        this.projections = this.projectionService.getProjections().filter((projection: ProjectionModel) => titles.includes(projection.title));
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

    openAlertDialog(cartItemIndex: number): void
    {
        const buttonElement = document.activeElement as HTMLElement;

        buttonElement.blur();

        const dialogRef: MatDialogRef<AlertDialogComponent> = this.dialog.open(AlertDialogComponent, {
            data: {
                type: 'warning',
                title: 'Potvdra brisanja',
                message: 'Da li ste sigurni da želite da obrišete ovaj film iz korpe?',
                showCancelButton: true
            }
        });

        dialogRef.afterClosed().subscribe(result =>
        {
            if (result === true)
            {
                this.cartService.removeItem(cartItemIndex);
                this.loadCartItemsAndProjections();
            }
        });
    }

    getTotalPrice(): number
    {
        return this.cartForms.reduce((total, form, index) =>
        {
            const ticketCount = form.get('ticketCount')?.value;
            const price = this.projections[index].price;

            return total + ticketCount * price;
        }, 0);
    }

    async addReservations()
    {
        const hasInvalidForm = this.cartForms.some(form =>
        {
            if (form.invalid)
            {
                Object.values(form.controls).forEach(control => control.markAsDirty());

                return true;
            }

            return false;
        });

        if (hasInvalidForm)
        {
            return;
        }

        this.isCreatingReservations = true;
        this.cartForms.forEach((form: FormGroup): void => form.disable());

        let error: string | null = null;

        for (const [index, form] of this.cartForms.entries())
        {
            const reservation: ReservationModel = {
                id: '',
                userId: '',
                movieId: this.projections[index].movieId,
                title: this.projections[index].title,
                price: this.projections[index].price,
                totalPrice: this.projections[index].price * form.value.ticketCount,
                ticketCount: form.value.ticketCount,
                date: form.value.projectionDate,
                time: form.value.projectionTime,
                hall: form.value.hall,
                technology: form.value.technology,
                status: 'Rezervisano'
            };

            error = await this.reservationService.addReservation(reservation);

            if (error)
            {
                break;
            }
        }

        this.isCreatingReservations = false;
        this.cartForms.forEach((form: FormGroup): void => form.enable());

        if (error)
        {
            this.snackBar.open(error, "Zatvori", {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
        else
        {
            this.snackBar.open('Rezervacija je uspešno kreirana.', "Zatvori", {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
    }
}

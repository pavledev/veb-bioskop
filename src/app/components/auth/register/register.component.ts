import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatPrefix } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { GenreService } from '../../../services/genre.service';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../loading/loading.component';
import { ErrorComponent } from '../../error/error.component';
import { AuthService } from '../../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
    selector: 'app-register',
    imports: [
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        RouterLink,
        MatPrefix,
        ReactiveFormsModule,
        MatSelectModule,
        LoadingComponent,
        FormsModule,
        ErrorComponent,
        MatProgressSpinnerModule,
        NgxMaskDirective
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
    providers: [GenreService]
})
export class RegisterComponent implements OnInit
{
    private readonly router: Router = inject(Router);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly genreService: GenreService = inject(GenreService);
    private readonly authService: AuthService = inject(AuthService);
    public readonly registerForm: FormGroup;

    public genres: string[] | null = null;
    public error: string | null = null
    public isRegistering: boolean = false;

    constructor()
    {
        this.registerForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            username: ['', [Validators.required, Validators.minLength(6)]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required, this.validateSamePassword]],
            phoneNumber: ['', [Validators.required]],
            city: ['', [Validators.required]],
            streetName: ['', [Validators.required]],
            streetNumber: ['', [Validators.required]],
            favoriteGenres: ['', [Validators.required]]
        });

        this.registerForm.get('password')?.valueChanges.subscribe(() =>
        {
            this.registerForm.get('confirmPassword')?.updateValueAndValidity();
        });
    }

    async ngOnInit()
    {
        const [error, genres] = await this.genreService.getGenres();

        if (error)
        {
            this.error = error.message;
        }
        else
        {
            this.genres = genres;
        }
    }

    private validateSamePassword(control: AbstractControl): ValidationErrors | null
    {
        const password = control.parent?.get('password');
        const confirmPassword = control.parent?.get('confirmPassword');

        return password?.value == confirmPassword?.value ? null : { 'notSame': true };
    }

    async registerUser()
    {
        if (this.registerForm.invalid)
        {
            Object.values(this.registerForm.controls).forEach(control => control.markAsDirty());

            return;
        }

        const { confirmPassword, ...user } = this.registerForm.value;

        this.isRegistering = true;
        this.registerForm.disable();

        const [error, firebaseUser] = await this.authService.register(user);

        this.isRegistering = false;
        this.registerForm.enable();

        if (error)
        {
            this.snackBar.open(error as string, 'Zatvori', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
        else
        {
            this.snackBar.open('Usprešna registracija.', 'Zatvori', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });

            this.router.navigateByUrl('prijava');
        }
    }
}

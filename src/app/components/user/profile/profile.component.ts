import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatPrefix } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
import { firstValueFrom, Observable, Subject, takeUntil } from 'rxjs';
import { User } from '@angular/fire/auth';
import { UserModel } from '../../../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { PasswordConfirmDialogComponent } from '../../password-confirm-dialog/password-confirm-dialog.component';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'app-profile',
    imports: [
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatPrefix,
        ReactiveFormsModule,
        MatSelectModule,
        LoadingComponent,
        FormsModule,
        ErrorComponent,
        MatProgressSpinnerModule,
        NgxMaskDirective
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    providers: [GenreService]
})
export class ProfileComponent implements OnInit, OnDestroy
{
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly dialog: MatDialog = inject(MatDialog);
    private readonly genreService: GenreService = inject(GenreService);
    private readonly authService: AuthService = inject(AuthService);
    private readonly userService: UserService = inject(UserService);
    public readonly profileForm: FormGroup;
    public readonly passwordForm: FormGroup;

    public genres: string[] | null = null;
    public error: string | null = null
    public isUpdatingProfile: boolean = false;
    public isUpdatingPassword: boolean = false;

    public userDocument$: Observable<UserModel | null> = this.userService.userDocument$;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor()
    {
        this.profileForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            username: ['', [Validators.required, Validators.minLength(6)]],
            phoneNumber: ['', [Validators.required]],
            city: ['', [Validators.required]],
            streetName: ['', [Validators.required]],
            streetNumber: ['', [Validators.required]],
            favoriteGenres: ['', [Validators.required]]
        });

        this.passwordForm = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required, this.validateSamePassword]],
        });

        this.passwordForm.get('password')?.valueChanges.subscribe(() =>
        {
            this.passwordForm.get('confirmPassword')?.updateValueAndValidity();
        });
    }

    async ngOnInit()
    {
        this.userDocument$.pipe(takeUntil(this.unsubscribe$)).subscribe((userDoc) =>
        {
            if (userDoc)
            {
                this.profileForm.patchValue({
                    firstName: userDoc.firstName,
                    lastName: userDoc.lastName,
                    email: userDoc.email,
                    username: userDoc.username,
                    phoneNumber: userDoc.phoneNumber,
                    city: userDoc.city,
                    streetName: userDoc.streetName,
                    streetNumber: userDoc.streetNumber,
                    favoriteGenres: userDoc.favoriteGenres || []
                });
            }
        });

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

    ngOnDestroy(): void
    {
        this.unsubscribe$.next();
        this.unsubscribe$.complete()
    }

    private validateSamePassword(control: AbstractControl): ValidationErrors | null
    {
        const password = control.parent?.get('password');
        const confirmPassword = control.parent?.get('confirmPassword');

        return password?.value == confirmPassword?.value ? null : { 'notSame': true };
    }

    async updateProfile()
    {
        if (this.profileForm.invalid)
        {
            return;
        }

        const currentEmail = this.authService.currentUser?.email;

        if (this.profileForm.value.email !== currentEmail)
        {
            const buttonElement = document.activeElement as HTMLElement;

            buttonElement.blur();

            const dialogReference = this.dialog.open(PasswordConfirmDialogComponent, {
                width: '400px',
                disableClose: true
            });

            const currentPassword = await firstValueFrom(dialogReference.afterClosed());

            if (!currentPassword)
            {
                return;
            }
        }

        this.isUpdatingProfile = true;
        this.profileForm.disable();

        if (!this.authService.currentUser)
        {
            return;
        }

        const error: string | null = await this.userService.updateUserProfile(this.authService.currentUser.uid, this.profileForm.value, this.authService);

        this.isUpdatingProfile = false;
        this.profileForm.enable();

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
            this.snackBar.open("Profil je uspešno ažuriran!", "Zatvori", {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
    }

    async updatePassword()
    {
        if (this.passwordForm.invalid)
        {
            return;
        }

        const buttonElement = document.activeElement as HTMLElement;

        buttonElement.blur();

        const dialogReference = this.dialog.open(PasswordConfirmDialogComponent, {
            width: '400px',
            disableClose: true
        });

        const currentPassword = await firstValueFrom(dialogReference.afterClosed());

        if (!currentPassword)
        {
            return;
        }

        const password = this.passwordForm.value.password;

        this.isUpdatingPassword = true;
        this.passwordForm.disable();

        if (!this.authService.currentUser)
        {
            return;
        }

        const error: string | null = await this.userService.updateUserProfile(this.authService.currentUser.uid, { password }, this.authService);

        this.isUpdatingPassword = false;
        this.passwordForm.enable();

        if (error)
        {
            this.snackBar.open("Greška pri ažuriranju lozinke!", "Zatvori", {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
        else
        {
            this.snackBar.open("Lozinka je uspešno ažurirana!", "Zatvori", {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
    }
}

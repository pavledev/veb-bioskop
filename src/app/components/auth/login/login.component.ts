import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-login',
    imports: [
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatProgressSpinner
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent
{
    private readonly router: Router = inject(Router);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly authService: AuthService = inject(AuthService);
    public readonly loginForm: FormGroup;

    public isLoggingIn: boolean = false;

    constructor()
    {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    async loginUser()
    {
        if (this.loginForm.invalid)
        {
            Object.values(this.loginForm.controls).forEach(control => control.markAsDirty());

            return;
        }

        this.isLoggingIn = true;
        this.loginForm.disable();

        const [error, firebaseUser] = await this.authService.login(this.loginForm.value.email, this.loginForm.value.password);

        this.isLoggingIn = false;
        this.loginForm.enable();

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
            this.router.navigateByUrl('/');
        }
    }
}

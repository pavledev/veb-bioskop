import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-password-confirm-dialog',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinner
    ],
    templateUrl: './password-confirm-dialog.component.html',
    styleUrl: './password-confirm-dialog.component.css'
})
export class PasswordConfirmDialogComponent
{
    private readonly dialogReference: MatDialogRef<PasswordConfirmDialogComponent> = inject(MatDialogRef<PasswordConfirmDialogComponent>);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly authService: AuthService = inject(AuthService);
    public readonly passwordForm: FormGroup;

    public isReauthenticating: boolean = false;

    constructor()
    {
        this.passwordForm = this.formBuilder.group({
            password: ['', [Validators.required]]
        });
    }

    async confirm()
    {
        if (this.passwordForm.invalid)
        {
            Object.values(this.passwordForm.controls).forEach(control => control.markAsDirty());

            return;
        }

        const currentPassword: string = this.passwordForm.value.password;

        this.isReauthenticating = true;
        this.passwordForm.disable();

        const reauthError = await this.authService.reauthenticateUser(currentPassword);

        this.isReauthenticating = false;
        this.passwordForm.enable();

        if (reauthError)
        {
            this.passwordForm.get('password')?.setErrors({ authError: reauthError });
        }
        else
        {
            this.dialogReference.close(currentPassword);
        }
    }

    cancel()
    {
        this.dialogReference.close(null);
    }
}

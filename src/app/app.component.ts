import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AuthService } from './services/auth.service';
import { AsyncPipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatToolbar, MatButtonModule, RouterLink, MatIcon, AsyncPipe, MatMenuModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent
{
    private router: Router = inject(Router);
    private authService: AuthService = inject(AuthService);

    public user$: Observable<User | null> = this.authService.user$;

    async logout()
    {
        await this.authService.logout();

        this.router.navigateByUrl('/');
    }
}

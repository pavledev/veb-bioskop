import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartItemModel } from '../../models/cart.item.model';
import { CartService } from '../../services/cart.service';
import { UtilityService } from '../../services/utility.service';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-cart',
    imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink, FormsModule, MatError, MatFormField, MatInput, MatLabel, MatPrefix, ReactiveFormsModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css',
    providers: [CartService]
})
export class CartComponent
{
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly cartService: CartService = inject(CartService);
    public readonly utilityService: UtilityService = inject(UtilityService);
    public readonly cartForm: FormGroup;

    public cartItems: CartItemModel[];

    constructor()
    {
        this.cartItems = this.cartService.getCartItems();
    }
}

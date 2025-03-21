import { Injectable } from '@angular/core';
import { CartItemModel } from '../models/cart.item.model';

@Injectable()
export class CartService
{
    private readonly CART_STORAGE_KEY = 'cart';

    addToCart(item: CartItemModel): void
    {
        const cartItems: CartItemModel[] = this.getCartItems();

        cartItems.push(item);
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartItems));
    }

    getCartItems(): CartItemModel[]
    {
        const storedItems: string | null = localStorage.getItem(this.CART_STORAGE_KEY);

        return storedItems ? JSON.parse(storedItems) as CartItemModel[] : [];
    }

    removeItem(index: number): void
    {
        const cartItems: CartItemModel[] = this.getCartItems();

        if (index >= 0 && index < cartItems.length)
        {
            cartItems.splice(index, 1);

            localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }

    clearCart(): void
    {
        localStorage.removeItem(this.CART_STORAGE_KEY);
    }
}

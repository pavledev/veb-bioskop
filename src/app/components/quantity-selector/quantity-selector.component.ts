import { Component, forwardRef, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-quantity-selector',
    imports: [MatIconModule, MatButtonModule],
    templateUrl: './quantity-selector.component.html',
    styleUrl: './quantity-selector.component.css',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => QuantitySelectorComponent),
            multi: true,
        },
    ],
})
export class QuantitySelectorComponent implements ControlValueAccessor
{
    @Input() min: number = 0;
    @Input() max: number = 99;
    value: number = 0;

    private onChange = (value: number) =>
    {
    };

    private onTouched = () =>
    {
    };

    increment(): void
    {
        if (this.value < this.max)
        {
            this.value++;
            this.onChange(this.value);
            this.onTouched();
        }
    }

    decrement(): void
    {
        if (this.value > this.min)
        {
            this.value--;
            this.onChange(this.value);
            this.onTouched();
        }
    }

    writeValue(value: number): void
    {
        this.value = value;
    }

    registerOnChange(fn: (value: number) => void): void
    {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void
    {
        this.onTouched = fn;
    }
}

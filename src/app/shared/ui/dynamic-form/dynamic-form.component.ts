import { Component, effect, input, output, inject , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DynamicField } from '../../models/dynamic-form.model';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dynamic-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      @for (field of fields(); track field.key) {
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-700">{{ field.label }}</label>
          @switch (field.type) {
            @case ('number') {
              <p-inputNumber
                [formControlName]="field.key"
                [suffix]="field.suffix ?? ''"
                [prefix]="field.prefix ?? ''"
                [min]="field.validators?.min ?? null"
                [max]="field.validators?.max ?? null"
                [step]="field.validators?.step ?? 1"
                [minFractionDigits]="0"
                [maxFractionDigits]="4"
                mode="decimal"
                class="w-full"
                styleClass="w-full"
                [class.p-disabled]="readonly() || field.readonly"
              />
            }
            @case ('select') {
              <p-dropdown
                [formControlName]="field.key"
                [options]="field.options ?? []"
                optionLabel="label"
                optionValue="value"
                styleClass="w-full"
                [placeholder]="'Seleccionar ' + field.label.toLowerCase()"
                [class.p-disabled]="readonly() || field.readonly"
              />
            }
            @case ('boolean') {
              <label class="inline-flex items-center gap-2" [class.cursor-pointer]="!readonly() && !field.readonly" [class.cursor-not-allowed]="readonly() || field.readonly" [class.opacity-75]="readonly() || field.readonly">
                <input
                  type="checkbox"
                  [formControlName]="field.key"
                  class="w-5 h-5 rounded border-surface-300 accent-primary-500"
                  [class.p-disabled]="readonly() || field.readonly"
                />
                <span class="text-sm text-surface-600">Sí</span>
              </label>
            }
            @default {
              <input
                pInputText
                [type]="field.type"
                [formControlName]="field.key"
                class="w-full p-inputtext p-component"
                [class.p-disabled]="readonly() || field.readonly"
              />
            }
          }
        </div>
      }
      @if (!hideSubmit()) {
        <div class="flex gap-3 pt-2">
          <p-button
            type="submit"
            [label]="submitLabel()"
            icon="pi pi-refresh"
            styleClass="w-full"
            [disabled]="form.invalid || isSubmitting() || form.pristine"
          />
        </div>
      }
    </form>
  `
})
export class DynamicFormComponent {
  private fb = inject(FormBuilder);
  fields = input<DynamicField[]>([]);
  readonly = input(false);
  hideSubmit = input(false);
  submitLabel = input('Guardar');
  isSubmitting = input(false);
  formSubmit = output<any>();
  form: FormGroup = this.fb.group({});

  constructor() {
    effect(() => {
      this.buildForm();
    });
  }
  private buildForm() {
    const group: any = {};
    
    this.fields().forEach(field => {
      const validators = [];
      if (field.validators?.required) validators.push(Validators.required);
      if (field.validators?.min !== undefined) validators.push(Validators.min(field.validators.min));
      if (field.validators?.max !== undefined) validators.push(Validators.max(field.validators.max));
      if (field.validators?.email) validators.push(Validators.email);
      const control = this.fb.control(
        {
          value: field.value ?? (field.type === 'boolean' ? false : null),
          disabled: this.readonly() || field.readonly
        },
        validators
      );
      
      group[field.key] = control;
    });
    this.form = this.fb.group(group);
  }
  onSubmit() {
    if (this.form.valid && !this.readonly()) {
      this.formSubmit.emit(this.form.value);
    }
  }
}

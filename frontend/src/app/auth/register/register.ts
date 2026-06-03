import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmar = control.get('confirmarPassword')?.value;
    return password && confirmar && password !== confirmar ? { noCoinciden: true } : null;
}

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    form: FormGroup;
    errorMensaje = signal('');
    cargando = signal(false);

    constructor(
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router,
    ) {
        this.form = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmarPassword: ['', Validators.required],
        }, { validators: passwordsIguales });
    }

    registrar() {
        if (this.form.invalid) return;
        this.cargando.set(true);
        this.errorMensaje.set('');

        const { nombre, email, password } = this.form.value;
        this.authService.register(nombre, email, password).subscribe({
            next: () => {
                // Login automático después del registro
                this.authService.login(email, password).subscribe({
                    next: () => this.router.navigate(['/productos']),
                    error: () => this.router.navigate(['/login']),
                });
            },
            error: (err) => {
                this.cargando.set(false);
                this.errorMensaje.set(err.error?.message || 'No se pudo crear la cuenta');
            },
        });
    }
}

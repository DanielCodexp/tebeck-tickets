import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent {

    public loginForm: FormGroup;
    public isLoading = false;
    public msgs: Message[] = [];


    valCheck: string[] = ['remember'];

    password!: string;

    constructor(
        public fb: FormBuilder,
        public layoutService: LayoutService,
        private loginService: AuthService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,6}$")]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    public async submitForm() {

        try {
            console.log(this.loginForm.value);
            this.isLoading = true;
            this.msgs = [];
            if (this.loginForm.invalid) {
                this.loginForm.markAllAsTouched();
                this.showErrorViaMessages();
                return;
            }

            if (this.loginForm.valid) {
                this.isLoading = true;
                await this.loginService.login(
                    this.loginForm.value.email,
                    this.loginForm.value.password
                );
            }
            return
        } catch (e: any) {
            console.log('error', e)
            this.showErrorViaMessages();
            this.isLoading = false;
        } finally {
            this.isLoading = false;
        }
    }

    showErrorViaMessages() {
        this.msgs = [];
        this.msgs.push({ severity: 'error', summary: 'Error', detail: 'Por favor verifique sus datos' });
    }

}

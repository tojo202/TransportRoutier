import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  model = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  showPassword = false;
  showConfirm = false;
  isLoading = false;
  error = '';
  success = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    if (this.isLoading) return;

    if (form.invalid) {
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return;
    }

    if (this.model.password !== this.model.password_confirmation) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.register({
      name: this.model.name,
      email: this.model.email,
      password: this.model.password,
      password_confirmation: this.model.password_confirmation,
      role: 'client'
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/platform']), 800);
      },
      error: (err) => {
        this.isLoading = false;
        const e = err?.error || {};
        this.error =
          e.errors?.email?.[0] ||
          e.errors?.name?.[0] ||
          e.errors?.password?.[0] ||
          e.message ||
          'Erreur lors de la création du compte. Réessayez.';
      }
    });
  }
}
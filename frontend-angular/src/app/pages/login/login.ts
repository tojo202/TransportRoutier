import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  
  roles = [
    { id: 'admin', label: 'ADMIN', icon: 'shield' },
    { id: 'agent', label: 'AGENT', icon: 'support_agent' },
    { id: 'driver', label: 'CHAUFFEUR', icon: 'directions_bus' },
    { id: 'client', label: 'CLIENT', icon: 'person' }
  ];
  selectedRole = 'admin';
  showPassword = false;
  isLoading = false;
  error = '';
  isDemoMode = true; // Permet de préremplir sur demande ou en mode démo

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  selectRole(roleId: string) {
    this.selectedRole = roleId;
    if (this.isDemoMode) {
      this.fillDemo(roleId as any);
    }
  }

  fillDemo(role: 'admin' | 'agent' | 'driver' | 'client') {
    const demos: Record<string, { email: string; password: string }> = {
      'admin': { email: 'admin@transport.com', password: 'Admin123!' },
      'agent': { email: 'agent@transport.com', password: 'Agent123!' },
      'driver': { email: 'driver@transport.com', password: 'Driver123!' },
      'client': { email: 'client@transport.com', password: 'Client123!' }
    };
    
    if (demos[role]) {
      this.loginForm.patchValue({
        email: demos[role].email,
        password: demos[role].password
      });
      this.loginForm.markAsTouched();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';
    
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        const role = res.user?.role || this.selectedRole;
        if (role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'agent') {
          this.router.navigate(['/reservations']);
        } else if (role === 'driver') {
          this.router.navigate(['/driver-trips']);
        } else {
          this.router.navigate(['/platform']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401 || error.status === 422) {
          this.error = 'Identifiants invalides. Veuillez vérifier votre e-mail et mot de passe.';
        } else {
          this.error = 'Erreur de connexion au serveur. Veuillez réessayer ultérieurement.';
        }
      }
    });
  }
}

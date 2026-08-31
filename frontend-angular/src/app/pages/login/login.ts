import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  roles = [
    { id: 'admin', label: 'ADMIN', icon: 'shield' },
    { id: 'agent', label: 'AGENT', icon: 'support_agent' },
    { id: 'driver', label: 'CHAUFFEUR', icon: 'directions_bus' },
    { id: 'client', label: 'CLIENT', icon: 'work' }
  ];
  selectedRole = 'admin';
  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  selectRole(roleId: string) {
    this.selectedRole = roleId;
  }

  fillDemo(role: 'admin' | 'agent' | 'driver') {
    const demos = {
      'admin': { email: 'admin@transport.com', password: 'Admin123!' },
      'agent': { email: 'agent@transport.com', password: 'Agent123!' },
      'driver': { email: 'driver@transport.com', password: 'Driver123!' }
    };
    
    this.email = demos[role].email;
    this.password = demos[role].password;
  }

  onSubmit() {
    this.isLoading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401 || error.status === 422) {
          this.error = 'Identifiants invalides';
        } else {
          this.error = 'Erreur de connexion au serveur';
        }
      }
    });
  }
}

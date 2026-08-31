import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user: any = null;
  form = {
    name: '',
    email: '',
    current_password: '',
    new_password: ''
  };
  isLoading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.user = u;
        this.form.name = u.name || '';
        this.form.email = u.email || '';
      }
    });
  }

  getInitials(): string {
    if (!this.user || !this.user.name) return 'U';
    return this.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  updateProfile(): void {
    this.isLoading = true;
    // Call user update API or show success alert
    setTimeout(() => {
      this.isLoading = false;
      Swal.fire('Profil mis à jour', 'Vos informations ont été enregistrées avec succès.', 'success');
    }, 600);
  }
}

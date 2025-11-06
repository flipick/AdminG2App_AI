import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // adjust the path if needed
import { TokenService } from '../../../services/token.service';
import { ILoginRequest } from '../../../../../src/app/model/login';
import { PermissionService } from '../../../services/permission-service';
import { IRole } from '../../../model/permission';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginRequest!: ILoginRequest;
  loginForm: FormGroup;
  loginError = false;
  errorMessage = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private TokenService: TokenService,
    private permissionService: PermissionService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.loginError = true;
      return;
    }

    const loginRequest = {
      userName: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        // ✅ Check if accessToken exists to determine success
        if (response && response.accessToken) {
          this.loginError = false;
          this.TokenService.saveSessionInLocal(response);
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError = true;
          this.errorMessage = 'Login failed. Please check credentials.';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loginError = true;
        this.errorMessage = 'Server error occurred.';
      }
    });
  }
}

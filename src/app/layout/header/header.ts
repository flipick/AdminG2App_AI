import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/token.service';
import { PermissionService } from '../../services/permission-service';
import { getRoleName, getUserName } from '../../services/utility';
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  userName: string = '';
  roleName: string = '';
  isDropdownOpen = false;
  hovering = false; // keeps menu open while pointer is over menu area

  @ViewChild('dropdownRoot', { static: true }) dropdownRoot!: ElementRef;
  constructor(private authService: AuthService, private router: Router, private tokenService: TokenService, private permissionService: PermissionService) {}

  ngOnInit() {
    this.roleName = getRoleName();
  }
  
  onLogout(): void {
   // localStorage.clear();
    this.tokenService.removeSessionInLocal();
    this.router.navigate(['/login']);
  }

  refreshToken(session: any): Observable<any> {
    return this.authService.refreshToken(session);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Close on outside click
  @HostListener('document:click', ['$event'])
  handleClickOutside(ev: Event) {
    if (!this.dropdownRoot?.nativeElement.contains(ev.target)) {
      this.closeDropdown();
    }
  }
}

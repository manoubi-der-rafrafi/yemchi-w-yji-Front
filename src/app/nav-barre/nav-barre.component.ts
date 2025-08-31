import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgIf } from '@angular/common'; // Import nécessaire pour *ngIf
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav-barre',
  standalone: true,
  imports: [NgIf , RouterModule], // Ajout ici
  templateUrl: './nav-barre.component.html',
  styleUrls: ['./nav-barre.component.css']
})
export class NavBarreComponent {
  isMobile = false;
  isconnected: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService,private router: Router // <-- AJOUTE ICI !
) 
  {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
    this.authService.isConnected$.subscribe(
      isConnected => this.isconnected = isConnected
    );
    console.log(this.isconnected);
  }
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // optionnel : redirection après déconnexion
  }



}

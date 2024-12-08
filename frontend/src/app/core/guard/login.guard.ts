import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {AuthorizationService} from "../services/authorization.service";


@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthorizationService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const logged = this.authService.isAuthenticated();
    if (logged) {
      return true;
    } else {
      this.router.navigate(['/login']).then(() => {
        localStorage.clear();
      });
      return false;
    }
  }
}

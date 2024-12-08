import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from "../../../environments/environment";
import {Router, withDebugTracing} from "@angular/router";
import {AuthorizationService} from "../../core/services/authorization.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: []
})
export class LoginComponent implements OnInit, OnDestroy {
    username: string = '';
    password: string = '';

    apiRoot = environment.domainForLocalhost;
    constructor(private router: Router,
                private authService: AuthorizationService) {
    }

    ngOnDestroy(): void {
        localStorage.setItem('userName', JSON.stringify(this.username));
    }

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }

    login() {

        localStorage.setItem('userName', JSON.stringify(this.username));
        // this.authService.authenticate(this.username, this.password).subscribe(
        //     (response) => {
        //         // On success, store the token and navigate to the dashboard
        //         localStorage.setItem('authToken', response.token);
        //         this.router.navigate(['/dashboard']);
        //     },
        //     (error) => {
        //         // Handle error (e.g., show an error message)
        //         console.error('Authentication failed', error);
        //     }
        // );
        if (this.username && this.password) {
            const mockToken = 'dummy-token';
            localStorage.setItem('token', mockToken);
            const fullPath = `${this.apiRoot}dashboard`;
            this.router.navigate(['/dashboard']);
        }else {
            console.error('Username and password are required');
        }

    }
}

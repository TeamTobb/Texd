import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, Router} from 'angular2/router';
import {EditorController} from './editor';
import {LoginController} from './login';
import {RegisterController} from './register';
import {DashboardComponent} from './dashboard';
import {SettingsComponent} from './settings/settings';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {CORE_DIRECTIVES} from 'angular2/common';

@Component({
    selector: 'my-app',
    templateUrl: 'views/mainview.html',
    directives: [ROUTER_DIRECTIVES, TAB_DIRECTIVES, CORE_DIRECTIVES]
})
@RouteConfig([
    { path: '/docs', name: 'Dashboard', component: DashboardComponent, useAsDefault: true },
    { path: '/docs/:id', name: 'Editor', component: EditorController },
    { path: '/settings/...', name: "Settings", component: SettingsComponent },
    { path: '/login', name: 'Login', component: LoginController },
    { path: '/register', name: 'Register', component: RegisterController }
])
export class MainView{
    public title = 'Main view';
    public loggedIn = false;
    public notLoggedIn = !this.loggedIn;

    constructor(private _router: Router) {
        if (localStorage.getItem('id_token') != undefined) {
            this.loggedIn = true;
            this.notLoggedIn = !this.loggedIn;
        }
    }

    logOut(){
        localStorage.removeItem('id_token');
        this.loggedIn = false;
        this.notLoggedIn = !this.loggedIn;
    }

    public goToDashboard() {
        console.log("Go to dashboard function");
        this.title = "Dashboard";
        this._router.navigate(['Dashboard', 'Documents', {}]);
    }

    public goToSettings() {
        console.log("Go to settings function");
        this.title = "Settings";
        this._router.navigate(['Settings', 'Main', {}]);
    }

    public goToRegister() {
        this.title = "Register";
        this._router.navigate(['Register', {}]);
    }

    public goToLogin() {
        this.title = "Login";
        this._router.navigate(['Login', {}]);
    }
}

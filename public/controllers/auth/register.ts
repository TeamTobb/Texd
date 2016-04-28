import {Component, Input, Output, OnChanges, SimpleChange, Directive, OnInit} from 'angular2/core';
import {NgForm} from 'angular2/common';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {Router, ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {DocumentService} from '../../service/document.ts';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap'


@Component({
    selector: 'login',
    templateUrl: 'views/auth/register.html',
    directives: [Alert]
})
export class RegisterController {
    public user: {
        username: string,
        password: string
    }

    public alerts: Array<Object> = [];
    constructor(private http: Http, private router: Router) {
        this.user = { username: "", password: "" }
    }

    onSubmit() {
        var headers = new Headers()
        headers.append('Content-Type', 'application/json');
        this.http.post('./register', JSON.stringify({ username: this.user.username, password: this.user.password }), { headers: headers }).map((res: Response) => res.json()).subscribe(res => {
            if (res.name == "BadRequestError") {
                this.alerts.push({
                    msg: res.message,
                    type: 'danger',
                    closable: 'true'
                })
            }
            if (res.success == true) {
                this.alerts = [];
                this.alerts.push({
                    msg: 'User successfully created',
                    type: 'success',
                    closeable: 'true'
                })
                setTimeout(() => {
                    this.router.navigate(['Login', {}]);

                }, 1500)
            }
        })
    }
    public closeAlert(i: number): void {
        this.alerts.splice(i, 1);
    }
}
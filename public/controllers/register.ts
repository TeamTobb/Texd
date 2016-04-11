import {Component, Input, Output, OnChanges, SimpleChange, Directive, OnInit} from 'angular2/core';
import {NgForm} from 'angular2/common';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {Router, ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {DocumentService} from '../data_access/document.ts';

@Component({
  selector: 'login',
  templateUrl: 'views/register.html',
  providers: [HTTP_BINDINGS]
})
export class RegisterController{
    public user: {
        username: string, 
        password: string 
    }
    
    constructor(private http: Http){
        this.user = {username: "", password: ""}
    }
    
    onSubmit(){
        var headers = new Headers()
        headers.append('Content-Type', 'application/json');

        this.http.post('./register', JSON.stringify({username: this.user.username, password: this.user.password}), {headers: headers}).map((res: Response) => res.json()).subscribe(res => {
            console.log(JSON.stringify(res, null, 2));  
        })  
    }
}
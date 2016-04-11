import {Component, Input, Output, OnChanges, SimpleChange} from 'angular2/core';
import {Http, Headers, HTTP_PROVIDERS, HTTP_BINDINGS, Response} from 'angular2/http';
import {Router, ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {AuthHttp, AuthConfig, JwtHelper} from "angular2-jwt/angular2-jwt"; //I am stating it twice
import {Directive} from "angular2/core";
import {OnInit} from 'angular2/core';
import {DocumentService} from '../data_access/document.ts';

@Component({
  selector: 'login',
  templateUrl: 'views/login.html'
})
export class LoginController{
 public user: {
        username: string, 
        password: string 
    }
    public token; 
    
    constructor(private http: Http, private authHttp: AuthHttp){
      this.user = {username: "", password: ""}
    }
    
    onSubmit(){
        var headers = new Headers()
        headers.append('Content-Type', 'application/json');
        
        console.log("login()")
        this.http.post('./login', JSON.stringify({username: this.user.username, password: this.user.password}), {headers: headers}).map((res: Response) => res.json()).subscribe(res => {
            if(res.token){
                localStorage.setItem('id_token', res.token);
            }
        })
    }
    
    getSecureResource(){
        this.authHttp.get('/secret').map((res: Response) => res.json()).subscribe(res => {
            console.log(JSON.stringify(res, null, 2));
        })
    }
    
    deleteToken(){
        console.log("delete token")
        // localStorage.removeItem('id_token')
        localStorage.setItem('id_token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzAzYzdhMjc2YWRmZWViMTFmYjMxNWMiLCJzYWx0IjoiY2ZlNjdjZjg3ZTg2MzNiODgxYzQ3MjFlYzVhMzU2MTRmNjM1NzU3NzZhZWQ1OGExN2IyMDM1OGM1NmZmNDg3ZCIsImhhc2giOiJjNzY2OTUwNWRjY2U1Y2FmYzg4Zjc0NjhmMzNhYWY5MTJhOTMxYTYyOWRmNDdjMjBmYTdjOTIxMDI3NjdjMmFjZjRjYzkxN2VmYzY3YjIyOGFiZjM1Y2EyOGYxYzQ5YTIwNWYzYzNmOWMyOTg1N2NiMTU1MDU4NGZiMzMzODkzNDlmOWZmMDRlYWJmN2Q3NzE1NGNhYTJhMTEzYjVhNjg2ODk3NDlkMDQ3MzFhNzBlZjIzMTJhNWE0MGQ2MDNjMDY0ZjIyOTY2NWYwOGQ2MmU4YmZmMDBlNjRkZDczMzhlZjExZGNiNmE0MjUxZWM1MzkzODhkZmRiMDE5MTViNGUwOTRlYTFjMzdjOTI1OGFjZDcwM2QxOTdkN2RjODcwZWNmMzJiYzBjZTRmZWQ4MzYwMTg1Y2EwYzhmYTMwNjBiYzM4YzIwYjlmYmFlYjRhNDlmMjJkM2YzMzg4NTU5OTFhZGZjOGFjNmUyYjUxOTJjMzhiNDFkYzJkZmQxODJmYTJlODhiZjdjMGMwNzg3NzhlMDVkYzgxZDRlZTQ1ZWY0MDY1ZGVkMmQ2MTg1ODJiMDlhM2VjM2E4M2JhNzFmN2ZkNjFlZmVjMTU5Y2EwNDIwOGEyNjNkZjhkYTVhMzQ4YzQ3M2JiODFmNDcyMTI1NzIyOTMyYjk0ODExMWM5NDczYzIzODE5YTNiNTdhZWU1YjQ1YmFlOGU3N2NkMjMwZmE1MTgwMjVlYzc1MzlmZGEzNDllYTA2OTJlYTllZTgxYzk1MzQwOWNhODIyMmFjMDRhZTVjNWVmOGU2MTk0NjM4YjJlNWEwOGRhNmNkNDRiMmQ3N2ZlNjFhMzc5YzNhNjYyNWNkNmI0MWYwNGU2NWIzMjFiYTJjMGJkYmUxMGM5Yjg0YjFmYTlmZTA3OGY4NzdkNjhlNWNmYWQ1M2UwN2YxMTBkYjQxYjIwN2UyNWY2Njg3OTI1YjkwZDk3OTBmZmY2MDg1NzQ2OGVlOTFiNTAwOWNiNDAxZWRlNTlkNTNhMjNlM2FiMTczOGE5NTA1NDM0ZjNmYzgxNjViODk0OWUwYTE4YzMwODBiMWI1OTdlYmVlN2RlNDAyN2FmYWExZTBlZDU3YTNhZTJlZWZhMzc1ZDQ2YzMyYTQ5NDE4NWIyZmI1YjMwMjkwYzkzYmM0YTM0ODAzMjFmMjNiZGNhMTFhZDdiY2UwNGUxNTc3Y2JhY2ZmNmRjNDNhNTc1YTJjZjFiNDllMjY3ODI3YWY0NGEyNmQ3NzBlZmM5ODgzYjk2YmU5YTcxMzcyNGM4OTY0ZDAyMjNjZjg3MzAzOTE0MjFlMzE5NzFiYzg0NTBkZDNlNmQwMDkxOGEyY2ZmNzQ4YTNiIiwidXNlcm5hbWUiOiJqb3JnIiwiX192IjowfQ.ECY78i1qmttjxufFdHWT8GtCVCjF7tRmFonrwz58hZo');
    }
}
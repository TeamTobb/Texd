import {bootstrap} from 'angular2/platform/browser';
import {provide} from "angular2/core";
import {MainView} from './mainview';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {AuthHttp, AuthConfig} from "angular2-jwt/angular2-jwt"; //I am stating it twice
import {HTTP_PROVIDERS, Http} from 'angular2/http';

bootstrap(MainView, [
    ROUTER_PROVIDERS, 
    HTTP_PROVIDERS,
    provide(AuthHttp, {
        useFactory: (http) => {
            return new AuthHttp(new AuthConfig(), http);
        },
        deps: [Http]
    })
    ]);

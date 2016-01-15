import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app.component';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {HTTP_BINDINGS} from 'angular2/http';

bootstrap(AppComponent, [HTTP_BINDINGS]);

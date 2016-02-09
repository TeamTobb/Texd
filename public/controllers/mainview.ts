import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, Router} from 'angular2/router';
import {EditorController} from './editor';
import {DashboardComponent} from './dashboard';
import {SettingsComponent} from './settings';

@Component({
  selector: 'my-app',
  templateUrl:'views/mainview.html',
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '/docs', name: 'Dashboard', component: DashboardComponent, useAsDefault: true},
  {path: '/docs/:id', name: 'Editor', component: EditorController},
  {path: '/settings/...', name: "Settings", component: SettingsComponent}
])
export class MainView {
  public title = 'Main view';

  constructor(private _router: Router) {}

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
}

import {Component, OnInit} from 'angular2/core';
import {Router, ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {SettingsPage} from './settingspage';

@Component({
  selector: 'settings',
  templateUrl: 'views/settings.html',
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '', name: 'Main', component: SettingsPage},
  {path: '/page/:id', name: 'SettingsPage', component: SettingsPage}
])
export class SettingsComponent {
    private chapters : string[] = ["Setting 0", "Setting 1"];

    constructor(private _router: Router) {
      this.chapters.push("test");
    }

    public changeChapter(chapter : number) {
      console.log("changing chapter to: " + chapter);
      this._router.navigate(['SettingsPage', { id: chapter }]);
    }
}

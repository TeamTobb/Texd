import {Component, OnInit} from 'angular2/core';
import {Router, ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {SettingsPage} from './settingspage';
import {DocumentStyle} from './settingsPages/documentStyle';
import {DocumentService} from '../data_access/document.ts';

@Component({
    selector: 'settings',
    templateUrl: 'views/settings.html',
    providers: [DocumentService],
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: '', name: 'Main', component: SettingsPage },
    { path: '/page/:id', name: 'SettingsPage', component: SettingsPage },
    { path: '/style/document/:id', name: 'DocumentStyle', component: DocumentStyle }
])
export class SettingsComponent {
    private settingTypes: string[] = ["Style", "User", "Keymap"];

    constructor(private _router: Router) {

    }

    public changeChapter(settingType: number) {
        console.log("changing settingType to: " + settingType);

        switch (settingType) {
            case 0:
                this._router.navigate(['DocumentStyle', { id: 0 }]);
                break;
            case 1:
                this._router.navigate(['SettingsPage', { id: settingType }]);
                break;
            case 2:
                this._router.navigate(['SettingsPage', { id: settingType }]);
                break;

            default:
                this._router.navigate(['Main', {  }]);
                break;
        }


    }
}

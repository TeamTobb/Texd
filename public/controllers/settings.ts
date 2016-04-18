import {Component, OnInit, AfterViewInit} from 'angular2/core';
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
export class SettingsComponent implements AfterViewInit {
    private settingTypes: string[] = ["Style", "User", "Keymap"];
    private active = 0;
    constructor(private _router: Router) {
    }
    ngAfterViewInit() {
        if (this.active == 0) {
            //this.setSelectedSettingsTab(0)
        }       
    }

    public changeChapter(settingType: number) {
        console.log("changing settingType to: " + settingType);

        switch (settingType) {
            case 0:
                this.active = 0;
                this._router.navigate(['DocumentStyle', { id: 0 }]);
                break;
            case 1:
                this._router.navigate(['SettingsPage', { id: settingType }]);
                break;
            case 2:
                this._router.navigate(['SettingsPage', { id: settingType }]);
                break;

            default:
                this._router.navigate(['Main', {}]);
                break;
        }
        this.setSelectedSettingsTab(settingType);
    }

    setSelectedSettingsTab(tab) {
        for (var key in this.settingTypes) {
            if (key == tab) {
                document.getElementById("settingType" + key).className = "activeSettings"
            } else {
                document.getElementById("settingType" + key).className = "settingsLeftTableItem"

            }
        }
    }
    
}

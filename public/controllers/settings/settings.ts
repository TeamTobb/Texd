import {PluginPage} from "./pluginpage";
import {Component, OnInit, AfterViewInit} from 'angular2/core';
import {Router, ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {SettingsPage} from './settingspage';
import {DocumentStyle} from './documentStyle';
import {DocumentService} from '../../data_access/document.ts';
import {KeymapPage} from './keymappage';

@Component({
    selector: 'settings',
    templateUrl: 'views/settings.html',
    providers: [DocumentService],
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: '', name: 'Main', component: SettingsPage },
    { path: '/page/:id', name: 'SettingsPage', component: SettingsPage },
    { path: '/style/document/:id', name: 'DocumentStyle', component: DocumentStyle },
    { path: '/page/plugins', name: 'PluginPage', component: PluginPage},
    { path: '/page/keymap', name: 'KeymapPage', component: KeymapPage}
])
export class SettingsComponent implements AfterViewInit {
    private settingTypes: string[] = ["Style", "User", "Keymap", "Plugins"];
    private active = 0;

    constructor(private _router: Router) {}

    ngAfterViewInit() {
        // this.setSelectedSettingsTab(this.active);
    }

    public changeChapter(settingType: number) {
        console.log(settingType);
        switch (settingType) {
            case 0:
                this.active = 0;
                this._router.navigate(['DocumentStyle', { id: 0 }]);
                break;
            case 1:
                this.active = 1;
                this._router.navigate(['SettingsPage', { id: settingType }]);
                break;
            case 2:
                this.active = 2;
                this._router.navigate(['KeymapPage', {}]);
                break;
            case 3:
                this.active = 3;
                this._router.navigate(['PluginPage', {}]);
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

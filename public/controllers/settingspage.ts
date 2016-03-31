import {Component, OnInit} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';

@Component({
    selector: 'settingspage',
    providers: [],
    template: '<div>teststring 2 from child:: {{test}}<br> {{chaptersText[current_chapter]}}<br></div>'
})
export class SettingsPage implements OnInit {
    public test: string = "";
    public current_chapter = 0;
    private chapters: string[] = ["setting 0", "setting 1"];
    private chaptersText: string[] = ["text from chapter 0", "text from chapter 1"];

    constructor(private _router: Router, private _routeParams: RouteParams) {
        let id = + parseInt(this._routeParams.get('id'));
        console.log("test");
        if (id) {
            console.log("chapter id: " + id);
            if (this.chapters[id]) {
                this.current_chapter = id;
            }
            else {
                console.log("No chapter with id: " + id);
            }
        }
        else {
            console.log("no chapter id provided");
        }
    }

    ngOnInit() {
        this.test = "testtest";
        console.log("onInit");
    }

}

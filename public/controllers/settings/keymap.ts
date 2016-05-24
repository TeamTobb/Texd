import {KeyMap} from "../../utils/keymap.ts";
import {Component} from 'angular2/core';

@Component({
    selector: 'keymapPage',
    templateUrl: 'views/settings/keymap.html',
    directives: []
})
export class KeymapPage {
    public keymap : KeyMap = new KeyMap();

    constructor() {}

    public keys() : Array<string> {
        return Object.keys(this.keymap.keys);
    }
}

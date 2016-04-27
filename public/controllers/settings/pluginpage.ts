import {Component} from 'angular2/core';

import {DocumentService} from '../../data_access/document.ts';
import {PluginItem} from '../../utils/parseMap';


@Component({
    selector: 'pluginPage',
    templateUrl: 'views/components/pluginpage.html',
    directives: []
})
export class PluginPage {
    items: PluginItem[] = [];

    constructor(private documentService: DocumentService) {
        this.setupPluginItems();
    }

    setupPluginItems() {
        console.log("test fujnction in pluginpage.ts");
        this.documentService.getPlugins(() => {
            var parseMap = this.documentService.parseMap.parseMap;
            for (var item in parseMap) {
                this.items.push(parseMap[item].item);
            }
        })
    }

}

import {Component} from 'angular2/core';
import {DocumentService} from '../../service/document.ts';
import {PluginItem} from '../../utils/parseMap';


@Component({
    selector: 'pluginPage',
    templateUrl: 'views/settings/plugin.html',
    directives: []
})
export class PluginPage {
    items: PluginItem[] = [];

    constructor(private documentService: DocumentService) {
        this.setupPluginItems();
    }

    setupPluginItems() {
        this.documentService.getPlugins(() => {
            var parseMap = this.documentService.parseMap.parseMap;
            for (var item in parseMap) {
                this.items.push(parseMap[item].item);
            }
        })
    }

}

export class ParseMap{
    private parseMap : Plugin[] = []; // TODO: Make static

    getMap() : Plugin[] {
        return this.parseMap;
    }

    /*
    {
    	"tagname" : "img",
    	"html" : "<img src='$src' height='$height' width='$width'>$value</img>",
    	"attr" : ["src"],
    	"optattr" : ["height","width"]
    }
    */

    parseHtmlString(html : string) : any {

    }

    generateParseMap(plugins: any[]){
        console.log("generateParseMap");

        plugins.forEach((plugin)=>{


        });



    }

}


export interface Plugin{
    getRef: (parentRef) => any;
    generateHtmlWithAttr: (attributeList) => any;
    getClosingBracket: () => any;
}

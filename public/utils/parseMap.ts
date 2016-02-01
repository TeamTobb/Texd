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
    consider adding allowed nested somehow
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
    // attributelist is key -> value ( src : "hei.png")
    // value is the first occurence of "text" in current JSON scope
    // value is all that is recursively inside this #
    generateHtmlWithAttr: (attributeList, value) => any;
    getClosingBracket: () => any;
}

//Singleton (eager initialization) - achieved through @Component-providers in app.js
import {Document, Chapter, Paragraph} from "../domain/document.ts"
import {Diff} from "../domain/diff.ts";

export class DocumentService{
    
    private documents: Document[] = []; 
    
    constructor(){
        console.log("documentService constructor");
        var paragraphs1: Paragraph[] = []; 
        paragraphs1.push(new Paragraph("Hei #b bloggen # #h1 overskrift her #)", []));
        paragraphs1.push(new Paragraph("Hei #b bloggen # #h1 overskrift her #)", []));
        paragraphs1.push(new Paragraph("Hei #b bloggen # #h1 overskrift her #)", []));
        paragraphs1.push(new Paragraph("Hei #b bloggen # #h1 overskrift her #)", []));
        var chapters: Chapter[] = []; 
        chapters.push(new Chapter("Kapittel header", paragraphs1));
        this.documents.push(new Document(2, "Test tittel", "Test navn", ["Borgar", "Jørgen", "bjørn"], chapters));
        console.log(this.documents[0]);
    }
    
    //mock implementation
    public getDocument(documentId: number){
        return this.documents[documentId]; 
    }
    
    public updateParagraph(documentId: number, diff: Diff){
        var document = this.getDocument(documentId); 
        console.log(document); 
        if(document){
            if(document.chapters[diff.chapter]){
                console.log("we are setting paragraph")
                if(diff.newelement){
                    console.log("newElement is true"); 
                    document.chapters[diff.chapter].paragraphs.splice(diff.index, 0, diff.paragraph);
                    console.log(document);
                    return;     
                }
                document.chapters[diff.chapter].paragraphs[diff.index] = diff.paragraph;              
            }
        }
        console.log(document);  
    }
    
    public appendChapter(documentId: number){
        if(this.documents[documentId]){
            this.documents[documentId].chapters.push(new Chapter({}, {}));
        }
    }
    
    public onSocketMessage(message){
       
    }
}

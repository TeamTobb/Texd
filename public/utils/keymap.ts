export class KeyMap {
    public keys: { [name: string]: number };

    constructor() {
        // first get standard key settings
        this.getStandardKeySettings;
        // then replace those saved by user previously
        this.getKeysFromUserSettings;
    }

    private getStandardKeySettings() {
        this.keys["parseCurrentChapter"] = 80; // p
        this.keys["createNewChapter"] = 67; // c
        this.keys["createNewParagraph"] = 78 // n
    }

    private getKeysFromUserSettings() {
        // mock implementation
        // should get from DB
        this.keys["parseCurrentChapter"] = 80;
    }

    // user should have validation by some sort (?) in db?
    public saveNewUserKeySetting(user: string, keyName: string, keyNumber: number) {
        this.keys[keyName] = keyNumber;
        // save to db
    }
}

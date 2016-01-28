/// <reference path="../../typings/tsd.d.ts"/>


import {Parser} from './parser';
    describe('Parser tests', () => {
      it('1. Basic text-string test', () => {
          var p: Parser = new Parser();
          var text = "The quick brown fox jumps over the lazy dog";
          var textWanted = '{"content":[{"text":"'+text+'"}]}';
          expect(p.getParsedJSON(text)).toEqual(textWanted);
      });
      it('2. Basic text with #b (bold)', () => {
          var text = "The quick brown #b fox # jumps over the lazy dog";
          var p: Parser = new Parser();
          var textWanted = '{"content":[{"text":"The quick brown"},{"b":[{"text":"fox"}]},{"text":"jumps over the lazy dog"}]}';
          expect(p.getParsedJSON(text)).toEqual(textWanted);
      });

      it('3. Basic text with #b within a #h1', () => {
          var text = "#h1 The quick brown #b fox # # jumps over the lazy dog";
          var p: Parser = new Parser();
          var textWanted = '{"content":[{"h1":[{"text":"The quick brown"},{"b":[{"text":"fox"}]}]},{"text":"jumps over the lazy dog"}]}';
          expect(p.getParsedJSON(text)).toEqual(textWanted);
      });

})

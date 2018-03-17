import Quill from 'quill';

const Clipboard = Quill.import('modules/clipboard');
const Delta = Quill.import('delta');
const HTML_TAG_REG = /(<([^>]+)>)/ig;

export const configQuillEditor = () => {
  Quill.register('modules/clipboard', ClipboardWithNoHTMLTag, true);
}


export class ClipboardWithNoHTMLTag extends (Clipboard as { new(quill, options): any; }) {
  constructor(quill, options){
    super(quill, options);
    this.addCustomMatcher();
  }

  //When primefacesNG set saved data to quilljs, they're using pasteHTML
  //which is call this dangerouslyPasteHTML function
  //Should remove custom matcher temporary for correctly render the saved data into quilljs
  dangerouslyPasteHTML(index, html, source = 'api') {
    let result;
    this.removeCustomMatcher();
    if (typeof index === 'string') {
      result =  this.quill.setContents(this.convert(index), html);
    } else {
      let paste = this.convert(html);
      result = this.quill.updateContents(new Delta().retain(index).concat(paste), source);
    }

    this.addCustomMatcher();
    return result;
  }

  addCustomMatcher(){
    this.addMatcher(Node.ELEMENT_NODE, this.elementNodeMatcher);
    this.addMatcher(Node.TEXT_NODE, this.textNodeMatcher);
  }

  removeCustomMatcher(){
    this.matchers = this.matchers.filter((pair) => {
      const selector = pair[0];
      const matcher = pair[1];
      return matcher.toString() != this.elementNodeMatcher.toString()
        && matcher.toString() != this.textNodeMatcher.toString()
    })
  }

  elementNodeMatcher(node, delta){
    let text = node.textContent || node.innerText || "";
    return new Delta().insert(text.replace(HTML_TAG_REG,""));
  }

  textNodeMatcher(node, delta) {
    return new Delta().insert(node.data.replace(HTML_TAG_REG,""));
  }
}

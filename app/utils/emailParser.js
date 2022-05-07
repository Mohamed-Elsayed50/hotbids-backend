"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeText = exports.getTextFromHtmlString = void 0;
const node_html_parser_1 = require("node-html-parser");
exports.getTextFromHtmlString = (text, filterText) => {
    const html = node_html_parser_1.parse(text);
    let result = '';
    html.childNodes.forEach(node => {
        const text = node.textContent.replace(/"/g, "");
        if (text.length > 0) {
            result += exports.normalizeText(node.textContent, filterText) + (node.nodeType === node_html_parser_1.NodeType.TEXT_NODE ? '' : ' ');
        }
    });
    return result;
};
exports.normalizeText = (text, filterFn) => {
    let textChunks = text
        .split('\n')
        .map(v => v.length === 0 ? "\n" : v);
    if (filterFn) {
        const index2 = textChunks.findIndex(filterFn);
        textChunks = textChunks.filter((v, index) => index <= index2);
    }
    return textChunks.map(v => v.trim()).join(' ');
};
//# sourceMappingURL=emailParser.js.map
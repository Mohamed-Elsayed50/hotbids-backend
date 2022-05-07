import { parse, NodeType } from "node-html-parser"

export const getTextFromHtmlString = (text: string, filterText?: (v: string) => boolean): string => {
    const html = parse(text)
    let result = ''
        
    html.childNodes.forEach(node => {
        const text = node.textContent.replace(/"/g, "")
        if (text.length > 0) {
            result += normalizeText(node.textContent, filterText) + (node.nodeType === NodeType.TEXT_NODE ? '' : ' ')
        }
    })

    return result
}

export const normalizeText = (text: string, filterFn?: (v: string) => boolean): string => {
    let textChunks = text
        .split('\n')
        .map(v => v.length === 0 ? "\n" : v)

    if (filterFn) {
        const index2 = textChunks.findIndex(filterFn)
        textChunks = textChunks.filter((v, index) => index <= index2)
    }

    return textChunks.map(v => v.trim()).join(' ')
}
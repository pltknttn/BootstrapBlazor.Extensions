﻿import mermaid from './mermaid.min.js';

export async function init(id, content) {
    mermaid.initialize({ startOnLoad: false });
    const render = await mermaid.render(id + '-svg', content);
    if (render) {
        const el = document.getElementById(id);
        el.innerText = "";
        el.innerHTML = render.svg;
    }
}
export function getContent(id) {
    let svgDataUrl = "";
    const el = document.getElementById(id);
    if (el) {
        for (let e in el.childNodes) {
            if (el.childNodes[e].nodeName == "svg") {
                const svgElement = el.childNodes[e];
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svgElement);
                const encodedString = encodeURIComponent(svgString);
                svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodedString));
                return svgDataUrl;
            }
        }
    }
}

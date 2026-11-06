// The site CSS, inlined in every page (one request per page).
import siteCss from '../styles/site.css?raw';
import printCss from '../styles/print.css?raw';

const minify = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();

export const CSS = minify(siteCss + printCss);

// initial commit version; untested as it is right now
// TODO: add MIT license

(function(w, d) {
    'use strict';
    
    var support = d.createElement('div'),
        supportLineClamp = support.style.WebkitLineClamp === '',
        
        getChildTextNodes = function getChildTextNodes(el, nodes) {
            var i,
                style;

            if(el.childNodes) {
                for(i = 0; i < el.childNodes.length; i++) {
                    if(el.childNodes[i].nodeType === Node.ELEMENT_NODE) {
                        style = w.getComputedStyle ? w.getComputedStyle(el.childNodes[i]) : el.currentStyle;
                    } else {
                        style = false;
                    }

                    // we ignore elements that are not spoken
                    if(! (style.speak && style.speak === 'none')) {
                        getChildTextNodes(el.childNodes[i], nodes);
                    }
                }
            }
            // we are not interested of white space text nodes, so we ignore those
            if(el.nodeType === Node.TEXT_NODE && /\S/.test(el.nodeValue)) {
                nodes.push(el);
            }
        },
        getRectHeight = function getRectHeight(el) {
            var rect;

            if(el.getBoundingClientRect) {
                rect = el.getBoundingClientRect();

                if(!rect.height) {
                    return rect.bottom - rect.top;
                } else {
                    return rect.height;
                }
            }

            return 0;
        },
        ellipsisLastline = function ellipsisLastline(el) {
            var elHyphen,
                elLastline,
                elLineClamp,
                elOverflow,
                i,
                innerHeight,
                j,
                lastNode,
                lineHeight,
                lines = 0,
                linesToRemove,
                nodes = [],
                prevChar,
                range,
                rect,
                paddingBottom,
                paddingTop,
                r = 1,
                style,
                textLines;

            // see if the browser is Opera Presto
            if(!w.opera) {
                style = w.getComputedStyle ? w.getComputedStyle(el) : el.currentStyle;

                lineHeight = parseFloat(style.lineHeight);
                paddingTop = parseFloat(style.paddingTop);
                paddingBottom = parseFloat(style.paddingBottom);
                innerHeight = getRectHeight(el) - paddingTop - paddingBottom;

                if(innerHeight > 0) {
                    // use floor to only get the fully visible lines
                    lines = Math.floor(innerHeight / lineHeight);
                }

                // so do we have more things to do?
                if(lines > 1) {
                    // get all the text nodes
                    getChildTextNodes(el, nodes);

                    // see if we got any
                    if(nodes.length) {
                        // cache the last one
                        lastNode = nodes[nodes.length - 1];
                        // create a full range so we can see if we have anything to do
                        range = d.createRange();
                        range.setStart(nodes[0], 0);
                        range.setEnd(lastNode, lastNode.length);
                        // use ceil to account for inline rect being slightly smaller
                        textLines = Math.ceil(getRectHeight(range) / lineHeight);

                        linesToRemove = textLines - lines;

                        // see if we have anything to do
                        if(linesToRemove > 0) {
                            // see if we support WebKit's line-clamp
                            if(supportLineClamp) {
                                elLineClamp = d.createElement('span');

                                elLineClamp.setAttribute('data-line-clamp', lines);
                                // set the necessary CSS
                                elLineClamp.style.WebkitLineClamp = lines;
                                // move original content here
                                elLineClamp.appendChild(range.extractContents());
                                // cleanup
                                range.detach();
                                // move new element inside the original parent
                                el.appendChild(elLineClamp);

                                return;
                            }
                            // we hide also the last line that would otherwise be visible
                            linesToRemove++;

                            if(nodes.length > 1) {
                                // find the node in which the line break will happen
                                for(i = 0; i < nodes.length - 1; i++) {
                                    range.setStart(nodes[i], nodes[i].length - 1);

                                    textLines = Math.ceil(getRectHeight(range) / lineHeight);

                                    if(textLines <= linesToRemove) {
                                        break;
                                    }
                                }
                            } else {
                                i = 0;
                            }

                            for(j = 0; j < nodes[i].length - 1; j++) {
                                // ignore white space
                                if(/\S/.test(nodes[i].nodeValue.slice(j++, j--))) {
                                    range.setStart(nodes[i], j);

                                    textLines = Math.ceil(getRectHeight(range) / lineHeight);

                                    if(textLines === linesToRemove) {
                                        break;
                                    }
                                }
                            }

                            if(j > 0) {
                                prevChar = nodes[i].nodeValue.charCodeAt(j - 1);
                            } else if(i > 0) {
                                prevChar = nodes[i - 1].nodeValue.charCodeAt(nodes[i - 1].length - 1);
                            }

                            // Presto bug
                            if(w.opera && prevChar !== 32) {
                                if(j > 0) {
                                    range.setStart(nodes[i], --j);
                                } else if(i > 0) {
                                    j = nodes[--i].length;
                                    range.setStart(nodes[i], --j)
                                }
                            }

                            // a trick to get full available width on last visible line
                            el.style.textAlign = 'justify';

                            rect = range.getClientRects();

                            while(r < rect.length && rect[r].top === rect[0].top) {
                              r++;
                            }
                            // and the trick ends here
                            el.style.textAlign = '';

                            // now we can create our nice element with the last visible line
                            elLastline = d.createElement('span');
                            //elLastline.setAttribute('data-ellipsis', range.toString());
                            elLastline.setAttribute('data-lastline', '');
                            
                            // if there is only one word in the line then this calculation goes wrong, but any other case is OK
                            elLastline.style.width = (rect[--r].right - rect[0].left) + 'px';
                            elLastline.style.marginTop = (lines - 1) * lineHeight + 'px';
                            
                            // screen readers, ignore plz
                            elLastline.style.speak = 'none';
                            elLastline.setAttribute('role', 'presentation');
                            elLastline.tabIndex = -1;
                            
                            elLastline.appendChild(range.cloneContents());
                            el.insertBefore(elLastline, el.firstChild);

                            // we like hyphenation so add a hyphen
                            if(prevChar !== 32) {
                                elHyphen = d.createElement('span');
                                elHyphen.setAttribute('data-hyphen', '');
                                el.appendChild(elHyphen);
                            }

                            elOverflow = d.createElement('span');
                            elOverflow.setAttribute('data-overflow', '');
                            elOverflow.appendChild(range.extractContents());
                            // cleanup
                            range.detach();
                            el.appendChild(elOverflow);

                        } else {
                            // cleanup
                            range.detach();            
                        }
                    }
                } else {
                    el.setAttribute('data-ellipsis-lastline', 'single');
                }
            } else {
                el.setAttribute('data-ellipsis-lastline', 'opera');
            }
        },
        init = function init() {
            setTimeout(function() {
                var e = d.querySelectorAll && d.createRange ? d.querySelectorAll('[data-ellipsis-lastline]') : [],
                    i;

                for(i = 0; i < e.length; i++) {
                    ellipsisLastline(e[i]);
                }
            });
        };
    
    if(w.addEventListener) {
        w.addEventListener('load', init, false);
    } else if(w.attachEvent) {
        w.attachEvent('onload', init);
    }
    
    // cleanup
    support = void 0;
    
})(window, document);
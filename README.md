Polyfill for ellipsis-lastline
==============================

This is a polyfill for Opera Presto's unique CSS feature `text-overflow: -o-ellipsis-lastline;` which is the simplest addition to get a nice support for multiline ellipsis. The CSS native `text-overflow: ellipsis;` is quite limited as it only works per line basis and it doesn't even make much sense to see a multiple line text with long contents on each of the rows, each ending in ellipsis.

(insert example here of overflowing text, ellipsis and ellipis-lastline)

There are many issues that need to be taken into account:

1. Overflowing content should not be permanently removed. A screen reader should be able to read it all even if it is not visually displayed and user should be able to select all the contents and get even the part after the ellipsis.

2. Rendering should be as identical as possible between various browsers.

3. Complex contents and layout should be supported. Text only support is a no go for a polyfill.

I'm tired. I shouldn't be writing this but they're making an awful lot of noise just when I should be getting to bed. So that's why you're facepalming atm because you don't care. You just want the code. And it's not ready yet. Sorry.
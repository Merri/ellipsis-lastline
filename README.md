*WARNING! Not ready for production!*

Polyfill for Last Line Ellipsis
===============================
This is a polyfill for Opera Presto's unique CSS feature `text-overflow: -o-ellipsis-lastline;` which is the simplest addition to get a nice support for multiline ellipsis. The CSS native `text-overflow: ellipsis;` is quite limited as it only works per line basis and it doesn't even make much sense to see a multiple line text with long contents on each of the rows, each ending in ellipsis.

![Sample render on Presto](https://raw.github.com/merri/ellipsis-lastline/master/README/presto-render.png)

On the above render we have a sample box with some width, padding and overflow set to hidden.

1. This is what render looks like if no height is given.
2. `text-overflow: ellipsis;` and `white-space: pre;` is not what we want.
3. `text-overflow: -o-ellipsis-lastline;` and `height: 7.5em` is almost there: however this seems like a bug in Opera's implementation as ellipsis is added to any very long unbreakable line even before the last line.
4. Most often this is what we want: `word-wrap: break-word;` is added to the rules so only the last line will have ellipsis.

Thus four CSS properties are necessary for the effect:

- `height` (`width` is not a requirement)
- `overflow: hidden;`
- `text-overflow: -o-ellipsis-lastline;`
- `word-wrap: break-word;`

Opera vs. Webkit
----------------
But wait! Why choose the Opera version? It is now way over a year since Opera abandoned their Presto rendering engine in favor of Webkit! And Webkit is a much more porular browser engine so why not polyfill it's proprietary solution instead?

The reason is quite simple: Opera's solution fallbacks way better in CSS than Webkit's solution. You only add one property and the only thing non-Presto browsers lack is the ellipsis. In comparison `-webkit-line-clamp` property and the related deprecated `display: -webkit-box;` work so that you have to give a number of lines you want to be displayed. The issue with this is that...

1. `display: box` is a very old implementation of the flexible box model.
2. It changes the way the element behaves so much that it is hard to duplicate the behavior in other browsers.
3. As you give the number of lines to limit the height of the box you also have to do double work to explicitly give height of the box for other browsers that do not support `line-clamp`. Otherwise you'd get a very tall box in other browsers where all text is displayed, while Webkits display the box in a certain height.
4. You'd need to support three proprietary properties in the polyfill as that many are required to control the effect properly.
5. Polyfilling a single property is far easier to accomplish.

Doing it right
--------------
There are many issues that need to be taken into account:

1. Overflowing content *should not* be permanently removed. A screen reader should be able to read it all even if it is not visually displayed and user should be able to select all the contents and get even the part after the ellipsis. None of the current multiline ellipsis gets this right. They remove the content permanently.
2. Rendering should be as identical as possible between various browsers. This can be tricky to accomplish.
3. Complex contents should be supported. Text only support is a no go for a polyfill.
4. Resizing browser should update the ellipsis position.
5. Ellipsis position should be as the last visible character of the line. It should not be fixed in the right bottom corner.

How this polyfill works
-----------------------

The polyfill assumes that an explicit height is set to the element. This is the only way to hide content. The polyfill *does not* parse CSS to check text-overflow property. Instead HTML `data-ellipsis-lastline` attribute is used to find the elements that are styled.

*Opera 12.17- (Presto)*

Supporting the old Opera is simple. The polyfill checks for existance of `window.opera` and then simply adds this style to the element:

    text-overflow: -o-ellipsis-lastline;

*Webkit*

Polyfill checks if `-webkit-line-clamp` is supported. If it is then an extra `span` wrapper element is created with the following styles:

    display: -webkit-box;
    -webkit-line-clamp: (calculated number of visible lines);
    -webkit-box-orient: vertical;

All content within the element is moved within this `span`. The polyfill runs some code to calculate visible lines.

*Other browsers*

Support for other browsers is much more complex. The last visible character is located.
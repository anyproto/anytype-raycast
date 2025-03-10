module.exports = {
  multipass: true,
  plugins: [
    "preset-default",
    {
      // Custom plugin to remove fill properties from inline style attributes
      name: "removeStyleFill",
      type: "perItem",
      fn: (node) => {
        if (node.attributes && node.attributes.style) {
          // Remove any "fill: ..." declarations from the style attribute
          node.attributes.style = node.attributes.style.replace(/fill:\s*[^;]+;?/g, "");
          // If the style attribute is now empty, remove it entirely
          if (node.attributes.style.trim() === "") {
            delete node.attributes.style;
          }
        }
      },
    },
    {
      // Remove any explicit fill attributes on elements
      name: "removeAttrs",
      params: {
        attrs: "(fill)",
      },
    },
  ],
};

export default function (node) {
  let ot = document.activeElement;
  node.onmouseenter = () => {
    ot = document.activeElement;
    node.focus();
  };
  node.onmouseleave = () => {
    node.blur();
    // Don't refocus on node that was already hidden
    if (!inView(el)) {
      return;
    }
    ot?.focus();
  };
}

function inView(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    top + height <= window.pageYOffset + window.innerHeight &&
    left + width <= window.pageXOffset + window.innerWidth
  );
}

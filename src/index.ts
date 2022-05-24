const SAMPLE_COUNT = 5000;

declare const __DEBUG__: boolean;

const template = `<section>
  <ul>
    <li>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</li>
    <li>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</li>
    <li>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</li>
    <li>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</li>
    <li>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</li>
    <li>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</li>
    <li>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</li>
  </ul>
</section>
`;

// window.requestAnimationFrame(() => {
//   console.log('requestAnimationFrame');
// });

if (document.readyState !== 'loading') {
  main();
} else {
  document.addEventListener('DOMContentLoaded', main);
}

async function main() {
  dbg('Generating test dom');
  const message = document.getElementById('message')!;
  message.textContent = `Loading ${SAMPLE_COUNT} sections...`;
  setTimeout(() => {
    const container = document.getElementById('data')!;
    container.style.display = 'none';
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const d = document.createElement('div');
      d.innerHTML = template;
      container.appendChild(d);
    }
    container.style.display = 'block';
    message.style.display = 'none';

    const resCss = document.getElementById('resCss')!;
    const resXpath = document.getElementById('resXpath')!;
    const btnCss = document.getElementById('btnCss')!;
    const btnXpath = document.getElementById('btnXpath')!;

    btnCss.removeAttribute('disabled');
    btnXpath.removeAttribute('disabled');

    btnCss.addEventListener('click', () => {
      btnCss.setAttribute('disabled', '');
      setTimeout(() => {
        const duration = cssSelectorBenchmark();
        resCss.innerHTML = duration.toString();
        btnCss.removeAttribute('disabled');
      });
    });
    btnXpath.addEventListener('click', () => {
      btnXpath.setAttribute('disabled', '');
      setTimeout(() => {
        const duration = xpathSelectorBenchmark();
        resXpath.innerHTML = duration.toString();
        btnXpath.removeAttribute('disabled');
      });
    });
  }, 50);
}

function cssSelectorBenchmark() {
  const t0 = window.performance.now();
  for (let s of document.querySelectorAll('section')) {
    dbg(s);
    for (let span of s.querySelectorAll('a span:nth-of-type(2)')) {
      dbg(span);
      let result = span;
    }
  }
  const t1 = window.performance.now();
  return t1 - t0;
}

function xpathSelectorBenchmark() {
  const t0 = window.performance.now();
  for (let s of window.$x('//section')) {
    dbg(s);
    for (let span of window.$x('.//a//span[2]', s)) {
      dbg(span);
      let result = span;
    }
  }
  const t1 = window.performance.now();
  return t1 - t0;
}

declare global {
  interface Window {
    $x: (xpath: string, context?: Node) => Generator<Node>;
  }
}

// Add $x function to Window
if (window['$x'] == null) {
  window.$x = function* $x(xpath: string, context?: Node) {
    dbg('context=', context);

    const iterator = window.document.evaluate(
      xpath,
      context ?? document.documentElement,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null,
    );
    let node = iterator.iterateNext();
    while (node) {
      yield node;
      node = iterator.iterateNext();
    }
  };
}

function dbg(...params: any[]) {
  if (__DEBUG__) console.log('DBG: ', ...params);
}

export {};

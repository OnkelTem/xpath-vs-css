const SAMPLE_COUNT = 5000;

declare const __DEBUG__: boolean;

const template = `<section>
  <div>
    <p>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</p>
    <p>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</p>
    <p>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</p>
    <p>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</p>
    <p>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</p>
    <p>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</p>
    <p>Mauris placerat <strong>pellentesque nunc, <a href="#">in <span>pharetra</span> <span>diam</span></a> egestas ac.</strong> Integer at erat in dolor euismod sagittis. In hac habitasse platea dictumst.</p>
  </div>
</section>
`;

type Result = {
  runs: number;
  curr: number;
  avg: number;
};
const results = new Map<string, Result>();

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

    const totalDiv = document.getElementById('total')!;

    const cssContainer = document.getElementById('css')!;
    const xpathContainer = document.getElementById('xpath')!;

    const resCss = cssContainer.querySelector('.results')!;
    const resXpath = xpathContainer.querySelector('.results')!;

    const btnCss = cssContainer.querySelector('button')!;
    const btnXpath = xpathContainer.querySelector('button')!;

    btnCss.removeAttribute('disabled');
    btnXpath.removeAttribute('disabled');

    btnCss.addEventListener('click', () => {
      btnCss.setAttribute('disabled', '');
      setTimeout(() => {
        const duration = cssSelectorBenchmark();
        saveResult('css', duration);
        renderResults('css', resCss);
        btnCss.removeAttribute('disabled');
        renderTotal(totalDiv);
      });
    });
    btnXpath.addEventListener('click', () => {
      btnXpath.setAttribute('disabled', '');
      setTimeout(() => {
        const duration = xpathSelectorBenchmark();
        saveResult('xpath', duration);
        renderResults('xpath', resXpath);
        btnXpath.removeAttribute('disabled');
        renderTotal(totalDiv);
      });
    });
  }, 50);
}

function saveResult(benchmark: string, duration: number) {
  if (results.has(benchmark)) {
    const result = results.get(benchmark)!;
    results.set(benchmark, {
      curr: duration,
      avg: (result.avg * result.runs + duration) / (result.runs + 1),
      runs: result.runs + 1,
    });
  } else {
    results.set(benchmark, {
      curr: duration,
      avg: duration,
      runs: 1,
    });
  }
}

function renderResults(benchmark: string, el: Element) {
  if (results.has(benchmark)) {
    const result = results.get(benchmark)!;
    el.querySelector('.runs')!.innerHTML = 'runs: ' + formatNumber(result.runs, 0);
    el.querySelector('.current')!.innerHTML = 'curr: ' + formatNumber(result.curr) + 'ms';
    el.querySelector('.average')!.innerHTML = 'avg: ' + formatNumber(result.avg) + 'ms';
  }
}

function renderTotal(el: Element) {
  if (results.has('css') && results.has('xpath')) {
    const resultCss = results.get('css')!;
    const resultXpath = results.get('xpath')!;
    const [aStr, bStr, factor] =
      resultCss.avg > resultXpath.avg
        ? ['CSS-selector', 'XPath', formatNumber(resultCss.avg / resultXpath.avg)]
        : ['XPath', 'CSS-selector', formatNumber(resultXpath.avg / resultCss.avg)];
    el.innerHTML = `${aStr} is ${factor} times slower than ${bStr}`;
  }
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

function formatNumber(v: number, digits = 2) {
  return '<tt>' + v.toFixed(digits) + '</tt>';
}

export {};

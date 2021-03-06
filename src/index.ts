import { params } from "queryparams";
import Velocity from "velocity-animate";
import { SETS } from "./data";

const SET_ID = location.hash.replace("#/", "");

const PARAMS = params({
  seconds: 5,
  set: SET_ID || "bentheim-castle-and-landschaft",
  bgColor: "black",
  easing: "ease-in-out",
  edge: 5,
});

const rect = (el: HTMLElement, edge: number) => {
  const p = edge * 0.01;
  const h = el.offsetHeight;
  const w = el.offsetWidth;
  const a = h * p;
  const b = w * p;
  const c = w - b;
  const d = h - a;

  return `rect(${a}px, ${c}px, ${d}px, ${b}px)`;
};

const renderNode = (html: string) =>
  <HTMLElement>(
    new DOMParser().parseFromString(html, "text/html").body.firstChild
  );

const VELOCITY_CONFIG = {
  duration: PARAMS.seconds * 1000,
  loop: true,
  easing: PARAMS.easing,
};

const SIDES = {
  L: "L",
  R: "R",
};

const DOM = {
  root: document.getElementById("root"),
};

const STATE = {
  loops: 0,
  active: SIDES.L,
};

const SET = SETS[PARAMS.set];

document.title = `Edge Transfer (${SET.name})`;

const EDGES = {
  [SIDES.L]: renderNode(
    `<div
        id='${SIDES.L}'
        class='Edge'
        style='background-image: url(${SET.images[SIDES.L]});'
      >
        <div
          class='Edge--void'
          style='top: ${PARAMS.edge}%; right: ${PARAMS.edge}%; bottom: ${
      PARAMS.edge
    }%; left: ${PARAMS.edge}%;'
        ></div>
      </div>
    `
  ),
  [SIDES.R]: renderNode(
    `<div
        id='${SIDES.R}'
        class='Edge'
        style='background-image: url(${SET.images[SIDES.R]});'
      >
        <div
          class='Edge--void'
          style='top: ${PARAMS.edge}%; right: ${PARAMS.edge}%; bottom: ${
      PARAMS.edge
    }%; left: ${PARAMS.edge}%;'
        ></div>
      </div>
    `
  ),
};

DOM.root.appendChild(EDGES[SIDES.L]);
DOM.root.appendChild(EDGES[SIDES.R]);

document.body.style.backgroundColor = EDGES[
  SIDES.L
].style.backgroundColor = EDGES[SIDES.R].style.backgroundColor = PARAMS.bgColor;

const TRANSFERS = {
  [SIDES.L]: renderNode(`
      <div
        class='Transfer'
        style='clip: ${rect(EDGES[SIDES.L], PARAMS.edge)}'
      ></div>`),
  [SIDES.R]: renderNode(`
      <div
        class='Transfer'
        style='clip: ${rect(EDGES[SIDES.R], PARAMS.edge)}'
      ></div>`),
};

const TRANSFER_ACTIVE_CLASS = "Transfer--active";

const activate = ({ active, inactive }) => {
  active.classList.add(TRANSFER_ACTIVE_CLASS);
  inactive.classList.remove(TRANSFER_ACTIVE_CLASS);
};

const flip = () => {
  STATE.loops++;

  if (!(STATE.loops % 2)) {
    if (STATE.active === SIDES.L) {
      STATE.active = SIDES.R;
      activate({
        active: TRANSFERS[SIDES.R],
        inactive: TRANSFERS[SIDES.L],
      });
      return;
    }

    STATE.active = SIDES.L;
    activate({
      active: TRANSFERS[SIDES.L],
      inactive: TRANSFERS[SIDES.R],
    });
    return;
  }
};

EDGES[SIDES.L].appendChild(TRANSFERS[SIDES.L]);
EDGES[SIDES.R].appendChild(TRANSFERS[SIDES.R]);

activate({
  active: TRANSFERS[SIDES.L],
  inactive: TRANSFERS[SIDES.R],
});

Velocity(
  TRANSFERS[SIDES.L],
  {
    translateZ: 0,
    translateX: "100%",
  },
  {
    ...VELOCITY_CONFIG,
    progress: (_els, complete) => {
      if (complete === 1) {
        flip();
      }
    },
  }
);

Velocity(
  TRANSFERS[SIDES.R],
  {
    translateZ: 0,
    translateX: "-100%",
  },
  VELOCITY_CONFIG
);

window.addEventListener("resize", () => {
  TRANSFERS[SIDES.L].style.clip = rect(EDGES[SIDES.L], PARAMS.edge);
  TRANSFERS[SIDES.R].style.clip = rect(EDGES[SIDES.R], PARAMS.edge);
});

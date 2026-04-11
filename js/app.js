// =========================
// Global Run State
// =========================
let isRunning = false;
let activeLoopCancels = [];

// =========================
// Canvas + Renderer
// =========================
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) renderer.setSize(width, height, false);
  return needResize;
}

// =========================
// Scene + Camera
// =========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

// =========================
// Objects
// =========================
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
cube.name = "cube1";
scene.add(cube);

scene.add(new THREE.DirectionalLight(0xffffff, 1));

// =========================
// Animation Loop
// =========================
function animate() {
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// =========================
// Sidebar Blocks
// =========================
const blockDefinitions = {
  view: [
    { name: "Set Size", action: "setSize", inputs: ["x", "y", "z"] },
    { name: "Reset Camera", action: "resetCamera", inputs: [] }
  ],
  motion: [
    { name: "Set Position", action: "setPosition", inputs: ["x", "y", "z"] },
    { name: "Move X", action: "moveX", inputs: ["amount"] },
    { name: "Move Y", action: "moveY", inputs: ["amount"] },
    { name: "Move Z", action: "moveZ", inputs: ["amount"] }
  ],
  control: [
    { name: "Repeat", action: "repeat", inputs: ["times"] },
    { name: "Forever", action: "forever", inputs: [] },
    { name: "Wait", action: "wait", inputs: ["seconds"] }
  ]
};

const blocksContainer = document.getElementById("blocks-container");

function loadCategory(category) {
  blocksContainer.innerHTML = "";
  blockDefinitions[category].forEach(block => {
    const div = document.createElement("div");
    div.className = "block";
    div.dataset.action = block.action;

    const title = document.createElement("span");
    title.textContent = block.name;
    div.appendChild(title);

    block.inputs.forEach(name => {
      const input = document.createElement("input");
      input.className = "block-input";
      input.dataset.inputName = name;
      input.type = "number";
      div.appendChild(input);
    });

    blocksContainer.appendChild(div);
  });
}

document.querySelectorAll(".category-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".category-tab.selected").classList.remove("selected");
    tab.classList.add("selected");
    loadCategory(tab.dataset.category);
  });
});

loadCategory("view");

// =========================
// Script Explorer
// =========================
const scriptWorkspace = document.getElementById("script-workspace");
const scriptList = document.getElementById("script-list");
const addScriptBtn = document.getElementById("add-script");

let currentScriptId = "script1";
let scriptCounter = 1;

function getScriptContainer(id) {
  let container = scriptWorkspace.querySelector(`.script-container[data-script-id="${id}"]`);
  if (!container) {
    container = document.createElement("div");
    container.className = "script-container";
    container.dataset.scriptId = id;
    scriptWorkspace.appendChild(container);
  }
  return container;
}

function setActiveScript(id) {
  currentScriptId = id;

  scriptList.querySelectorAll(".script-item").forEach(item => {
    item.classList.toggle("selected", item.dataset.scriptId === id);
  });

  scriptWorkspace.querySelectorAll(".script-container").forEach(container => {
    container.style.display = container.dataset.scriptId === id ? "block" : "none";
  });
}

scriptList.addEventListener("click", e => {
  const item = e.target.closest(".script-item");
  if (item) setActiveScript(item.dataset.scriptId);
});

addScriptBtn.addEventListener("click", () => {
  scriptCounter++;
  const id = `script${scriptCounter}`;

  const item = document.createElement("div");
  item.className = "script-item";
  item.dataset.scriptId = id;
  item.textContent = `Script ${scriptCounter}`;
  scriptList.appendChild(item);

  getScriptContainer(id);
  setActiveScript(id);
});

getScriptContainer("script1");
setActiveScript("script1");

// =========================
// Tabs
// =========================
document.querySelectorAll(".top-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".top-tab.selected").classList.remove("selected");
    tab.addEventListener("selected");

    const view = tab.dataset.view;

    if (view === "preview") {
      canvas.style.display = "block";
      scriptWorkspace.style.display = "none";
    } else {
      canvas.style.display = "none";
      scriptWorkspace.style.display = "block";
    }
  });
});

// =========================
// Dragging + Snapping + Delete
// =========================
const sidebar = document.getElementById("sidebar");

function makeDraggable(block) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  block.querySelectorAll("input").forEach(input => {
    input.addEventListener("mousedown", e => e.stopPropagation());
  });

  block.addEventListener("mousedown", e => {
    isDragging = true;

    const rect = block.getBoundingClientRect();
    const parentRect = block.parentElement.getBoundingClientRect();

    block.style.position = "absolute";
    block.style.left = rect.left - parentRect.left + "px";
    block.style.top = rect.top - parentRect.top + "px";
    block.style.width = "calc(100% - 20px)";
    block.style.zIndex = 1000;

    offsetX = e.pageX - rect.left;
    offsetY = e.pageY - rect.top;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;

    const parentRect = block.parentElement.getBoundingClientRect();
    block.style.left = e.pageX - parentRect.left - offsetX + "px";
    block.style.top = e.pageY - parentRect.top - offsetY + "px";

    const blockRect = block.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();

    const overlapsSidebar =
      blockRect.right > sidebarRect.left &&
      blockRect.left < sidebarRect.right &&
      blockRect.bottom > sidebarRect.top &&
      blockRect.top < sidebarRect.bottom;

    block.style.background = overlapsSidebar ? "#802020" : "#2a2a2a";
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;

    const blockRect = block.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();

    const overlapsSidebar =
      blockRect.right > sidebarRect.left &&
      blockRect.left < sidebarRect.right &&
      blockRect.bottom > sidebarRect.top &&
      blockRect.top < sidebarRect.bottom;

    if (overlapsSidebar) {
      block.remove();
      return;
    }

    const parent = block.parentElement;
    const siblings = [...parent.querySelectorAll(".script-block")].filter(b => b !== block);

    let insertBefore = null;
    const blockCenter = blockRect.top + blockRect.height / 2;

    for (const sib of siblings) {
      const sibRect = sib.getBoundingClientRect();
      const sibCenter = sibRect.top + sibRect.height / 2;

      if (blockCenter < sibCenter) {
        insertBefore = sib;
        break;
      }
    }

    block.style.position = "relative";
    block.style.left = "0px";
    block.style.top = "0px";
    block.style.width = "auto";
    block.style.zIndex = 1;
    block.style.background = "#2a2a2a";

    if (insertBefore) {
      parent.insertBefore(block, insertBefore);
    } else {
      parent.appendChild(block);
    }
  });
}

// =========================
// Drag blocks FROM sidebar
// =========================
blocksContainer.addEventListener("mousedown", e => {
  const block = e.target.closest(".block");
  if (!block) return;

  e.preventDefault();

  const scriptContainer = getScriptContainer(currentScriptId);

  const scriptBlock = block.cloneNode(true);
  scriptBlock.classList.add("script-block");
  scriptBlock.classList.remove("block");
  scriptBlock.dataset.action = block.dataset.action;

  scriptContainer.appendChild(scriptBlock);

  makeDraggable(scriptBlock);

  const evt = new MouseEvent("mousedown", {
    clientX: e.clientX,
    clientY: e.clientY,
    bubbles: true
  });
  scriptBlock.dispatchEvent(evt);
});

// =========================
// EXECUTION ENGINE
// =========================
const actions = {
  // =========================
  // CONTROL BLOCKS
  // =========================

  repeat: (sprite, inputs, index, blocks) => {
    const times = Number(inputs.times) || 1;

    const next = blocks[index + 1];
    if (!next) return;

    const nextAction = actions[next.dataset.action];
    if (!nextAction) return;

    const nextInputs = {};
    next.querySelectorAll("input").forEach(input => {
      nextInputs[input.dataset.inputName] = input.value;
    });

    for (let i = 0; i < times; i++) {
      if (!isRunning) return;
      nextAction(sprite, nextInputs, index + 1, blocks);
    }
  },

  forever: (sprite, inputs, index, blocks) => {
    const next = blocks[index + 1];
    if (!next) return;

    const nextAction = actions[next.dataset.action];
    if (!nextAction) return;

    const nextInputs = {};
    next.querySelectorAll("input").forEach(input => {
      nextInputs[input.dataset.inputName] = input.value;
    });

    let cancelled = false;

    function loop() {
      if (!isRunning || cancelled) return;

      nextAction(sprite, nextInputs, index + 1, blocks);
      requestAnimationFrame(loop);
    }

    loop();

    activeLoopCancels.push(() => cancelled = true);
  },

  wait: (sprite, inputs, index, blocks) => {
    const seconds = Number(inputs.seconds) || 0;

    setTimeout(() => {
      if (!isRunning) return;

      const next = blocks[index + 1];
      if (!next) return;

      const nextAction = actions[next.dataset.action];
      if (!nextAction) return;

      const nextInputs = {};
      next.querySelectorAll("input").forEach(input => {
        nextInputs[input.dataset.inputName] = input.value;
      });

      nextAction(sprite, nextInputs, index + 1, blocks);
    }, seconds * 1000);
  },

  // =========================
  // VIEW BLOCKS
  // =========================

  setSize: (sprite, inputs) => {
    sprite.scale.set(
      Number(inputs.x) || 1,
      Number(inputs.y) || 1,
      Number(inputs.z) || 1
    );
  },

  resetCamera: () => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  },

  // =========================
  // MOTION BLOCKS
  // =========================

  setPosition: (sprite, inputs) => {
    sprite.position.set(
      Number(inputs.x) || 0,
      Number(inputs.y) || 0,
      Number(inputs.z) || 0
    );
  },

  moveX: (sprite, inputs) => {
    sprite.position.x += Number(inputs.amount) || 0;
  },

  moveY: (sprite, inputs) => {
    sprite.position.y += Number(inputs.amount) || 0;
  },

  moveZ: (sprite, inputs) => {
    sprite.position.z += Number(inputs.amount) || 0;
  }
};

// =========================
// Run Script
// =========================
function runScript(scriptId) {
  const container = getScriptContainer(scriptId);
  const blocks = [...container.querySelectorAll(".script-block")];

  const spriteName = document.querySelector(".sprite-item.selected").dataset.sprite;
  const sprite = scene.getObjectByName(spriteName);

  blocks.forEach((block, index) => {
    if (!isRunning) return;

    const actionName = block.dataset.action;
    const action = actions[actionName];
    if (!action) return;

    const inputs = {};
    block.querySelectorAll("input").forEach(input => {
      inputs[input.dataset.inputName] = input.value;
    });

    action(sprite, inputs, index, blocks);
  });
}

// =========================
// Run Button
// =========================
document.getElementById("run-script").addEventListener("click", () => {
  isRunning = true;
  activeLoopCancels = [];
  runScript(currentScriptId);
});

// =========================
// Stop Button
// =========================
document.getElementById("stop-script").addEventListener("click", () => {
  isRunning = false;

  // Cancel all forever loops
  activeLoopCancels.forEach(cancel => cancel());
  activeLoopCancels = [];

  // Reset cube + camera
  cube.position.set(0, 0, 0);
  cube.scale.set(1, 1, 1);
  camera.position.set(0, 0, 5);
});

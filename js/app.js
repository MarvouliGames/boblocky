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
    { name: "Change Color", action: "changeColor", inputs: ["color"] },
    { name: "Set Size", action: "setSize", inputs: ["x", "y", "z"] },
    { name: "Reset Camera", action: "resetCamera", inputs: [] }
  ],
  motion: [
    { name: "Set Position", action: "setPosition", inputs: ["x", "y", "z"] },
    { name: "Move X", action: "moveX", inputs: ["amount"] },
    { name: "Move Y", action: "moveY", inputs: ["amount"] },
    { name: "Move Z", action: "moveZ", inputs: ["amount"] }
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
      input.type = name === "color" ? "color" : "number";
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
// Tabs: Preview vs Scripts
// =========================
document.querySelectorAll(".top-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".top-tab.selected").classList.remove("selected");
    tab.classList.add("selected");

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
// Scratch‑style Dragging + Snapping + Delete
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
  // Fix: ensure color inputs have a default hex value
scriptBlock.querySelectorAll('input[type="color"]').forEach(input => {
  if (!input.value) input.value = "#ff0000";
});

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
  changeColor: (sprite, inputs) => {
  const hex = inputs.color;

  // Ignore empty or invalid values
  if (!hex || !/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return;

  sprite.material.color.set(hex);
  sprite.material.needsUpdate = true;
},


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

function runScript(scriptId) {
  const container = getScriptContainer(scriptId);
  const blocks = [...container.querySelectorAll(".script-block")];

  const spriteName = document.querySelector(".sprite-item.selected").dataset.sprite;
  const sprite = scene.getObjectByName(spriteName);

  blocks.forEach(block => {
    const actionName = block.dataset.action;
    const action = actions[actionName];
    if (!action) return;

    const inputs = {};
    block.querySelectorAll("input").forEach(input => {
      inputs[input.dataset.inputName] = input.value;
    });

    action(sprite, inputs);
  });
}

// =========================
// Run Button
// =========================
document.getElementById("run-script").addEventListener("click", () => {
  runScript(currentScriptId);
});

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
  if (needResize) {
    renderer.setSize(width, height, false);
  }
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
camera.lookAt(0, 0, 0);

// =========================
// Objects
// =========================
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
cube.name = "cube1";
scene.add(cube);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// =========================
// Block Definitions
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

window.addEventListener("resize", () => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
});

// =========================
// Sidebar Category Loading
// =========================
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

    block.inputs.forEach(inputName => {
      const input = document.createElement("input");
      input.type = inputName === "color" ? "color" : "number";
      input.placeholder = inputName;
      input.className = "block-input";
      input.dataset.inputName = inputName;
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
// Sprite Selection
// =========================
let selectedSprite = "cube1";

document.querySelectorAll(".sprite-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelector(".sprite-item.selected").classList.remove("selected");
    item.classList.add("selected");
    selectedSprite = item.dataset.sprite;
  });
});

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
  if (!item) return;
  setActiveScript(item.dataset.scriptId);
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
// Draggable + Snapping + Delete-on-sidebar
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
    block.style.zIndex = 1000;
    block.style.width = "calc(100% - 20px)";

    offsetX = e.offsetX;
    offsetY = e.offsetY;
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
    block.style.zIndex = "1";
    block.style.background = "#2a2a2a";

    if (insertBefore) {
      parent.insertBefore(block, insertBefore);
    } else {
      parent.appendChild(block);
    }
  });
}

// =========================
// Sidebar Block → Script Block
// =========================
blocksContainer.addEventListener("click", e => {
  const block = e.target.closest(".block");
  if (!block) return;

  const scriptContainer = getScriptContainer(currentScriptId);

  const scriptBlock = block.cloneNode(true);
  scriptBlock.classList.add("script-block");
  scriptBlock.classList.remove("block");

  scriptContainer.appendChild(scriptBlock);
  makeDraggable(scriptBlock);
});

// =========================
// Run Script Block on Click
// =========================
scriptWorkspace.addEventListener("click", e => {
  const scriptBlock = e.target.closest(".script-block");
  if (!scriptBlock) return;

  const action = scriptBlock.dataset.action;
  const mesh = scene.getObjectByName(selectedSprite);
  if (!mesh) return;

  const inputs = {};
  scriptBlock.querySelectorAll(".block-input").forEach(input => {
    const name = input.dataset.inputName;
    inputs[name] = input.type === "number" ? Number(input.value) : input.value;
  });

  if (action === "setPosition") {
    mesh.position.set(inputs.x || 0, inputs.y || 0, inputs.z || 0);
  }

  if (action === "setSize") {
    mesh.scale.set(inputs.x || 1, inputs.y || 1, inputs.z || 1);
  }

  if (action === "changeColor") {
    mesh.material.color.set(inputs.color || "#ffffff");
  }

  if (action === "moveX") mesh.position.x += inputs.amount || 0;
  if (action === "moveY") mesh.position.y += inputs.amount || 0;
  if (action === "moveZ") mesh.position.z += inputs.amount || 0;

  if (action === "resetCamera") {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }
});

// =========================
// Tabs: Preview vs Scripts
// =========================
const topTabs = document.querySelectorAll(".top-tab");

topTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".top-tab.selected").classList.remove("selected");
    tab.classList.add("selected");

    const view = tab.dataset.view;

    if (view === "preview") {
      scriptWorkspace.style.display = "none";
      canvas.classList.add("fullscreen");
    } else {
      scriptWorkspace.style.display = "block";
      canvas.classList.remove("fullscreen");
    }
  });
});

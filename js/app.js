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
// Add Blocks to Script Workspace
// =========================
blocksContainer.addEventListener("click", e => {
  const block = e.target.closest(".block");
  if (!block) return;

  const scriptContainer = getScriptContainer(currentScriptId);

  const scriptBlock = block.cloneNode(true);
  scriptBlock.classList.add("script-block");
  scriptBlock.classList.remove("block");

  scriptContainer.appendChild(scriptBlock);
});

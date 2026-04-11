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
cube.name = "cube1"; // IMPORTANT
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
// Window Resize
// =========================
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

    // Block title
    const title = document.createElement("span");
    title.textContent = block.name;
    div.appendChild(title);

    // Inputs
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

// Load default category
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
// Script Panel
// =========================
const scriptArea = document.getElementById("script-scroll");

function makeDraggable(block) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  block.addEventListener("mousedown", (e) => {
    isDragging = true;
    block.style.position = "absolute";
    block.style.zIndex = 1000;

    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    block.style.left = e.pageX - offsetX + "px";
    block.style.top = e.pageY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}


// =========================
// Block Click Actions
// =========================
blocksContainer.addEventListener("click", e => {
  if (!e.target.classList.contains("block")) return;

  const block = e.target;
  const action = block.dataset.action;
  const mesh = scene.getObjectByName(selectedSprite);

  // Collect inputs
  const inputs = {};
  block.querySelectorAll(".block-input").forEach(input => {
    const name = input.dataset.inputName;
    inputs[name] = input.type === "number" ? Number(input.value) : input.value;
  });

  // Add to script panel
  const scriptBlock = document.createElement("div");
  scriptBlock.className = "script-block";
  scriptBlock.textContent = block.textContent;
  scriptArea.appendChild(scriptBlock);
  makeDraggable(scriptBlock);

  // Execute actions
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




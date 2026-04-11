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
    { name: "Change Color", action: "changeColor" },
    { name: "Set Size", action: "setSize" },
    { name: "Reset Camera", action: "resetCamera" }
  ],

  motion: [
    { name: "Set Position", action: "setPosition" },
    { name: "Move X", action: "moveX" },
    { name: "Move Y", action: "moveY" },
    { name: "Move Z", action: "moveZ" }
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
    div.textContent = block.name;
    div.dataset.action = block.action;
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

  const action = e.target.dataset.action;
  const mesh = scene.getObjectByName(selectedSprite);
  if (!mesh) return;

  // Add block to script panel
  const scriptBlock = document.createElement("div");
  scriptBlock.className = "script-block";
  scriptBlock.textContent = e.target.textContent;
  scriptArea.appendChild(scriptBlock);
  makeDraggable(scriptBlock);


  // Execute block action
  if (action === "changeColor") {
    mesh.material.color.set(Math.random() * 0xffffff);
  }

  if (action === "setSize") {
    mesh.scale.set(2, 2, 2);
  }

  if (action === "setPosition") {
    mesh.position.set(0, 1, 0);
  }

  if (action === "moveX") mesh.position.x += 0.5;
  if (action === "moveY") mesh.position.y += 0.5;
  if (action === "moveZ") mesh.position.z += 0.5;

  if (action === "resetCamera") {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }
});




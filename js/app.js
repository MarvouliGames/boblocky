const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight);


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


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

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


const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000
);



camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
scene.add(cube);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
});

document.querySelectorAll(".block").forEach(block => {
  block.addEventListener("click", () => {
    const action = block.dataset.action;

    if (action === "addCube") {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      scene.add(cube);
    }

    if (action === "addSphere") {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x0099ff })
      );
      scene.add(sphere);
    }

    if (action === "addDirectionalLight") {
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.add(light);
    }

    if (action === "addPointLight") {
      const light = new THREE.PointLight(0xffffff, 1, 50);
      light.position.set(0, 3, 0);
      scene.add(light);
    }

    if (action === "resetCamera") {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      const scriptArea = document.getElementById("script-scroll");

    const scriptBlock = document.createElement("div");
    scriptBlock.className = "script-block";
    scriptBlock.textContent = e.target.textContent;

scriptArea.appendChild(scriptBlock);

    }
  });
});



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

let selectedSprite = "cube1";

document.querySelectorAll(".sprite-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelector(".sprite-item.selected").classList.remove("selected");
    item.classList.add("selected");
    selectedSprite = item.dataset.sprite;
  });
});

blocksContainer.addEventListener("click", e => {
  if (!e.target.classList.contains("block")) return;

  const action = e.target.dataset.action;

  if (action === "changeColor") {
    const mesh = scene.getObjectByName(selectedSprite);
    mesh.material.color.set(Math.random() * 0xffffff);
  }

  if (action === "setSize") {
    const mesh = scene.getObjectByName(selectedSprite);
    mesh.scale.set(2, 2, 2);
  }

  if (action === "setPosition") {
    const mesh = scene.getObjectByName(selectedSprite);
    mesh.position.set(0, 1, 0);
  }

  if (action === "moveX") {
    const mesh = scene.getObjectByName(selectedSprite);
    mesh.position.x += 0.5;
  }

  // etc...
});



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



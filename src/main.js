import './assets/styles.css'; // Adjust the path as necessary
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'lil-gui';


// Initialize the GUI
const gui = new GUI();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const hdrLoader = new THREE.TextureLoader();
hdrLoader.load('/images/bg/clouds1.jpg', (texture) => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.background = envMap;
    scene.environment = envMap;
    const exposure = 0.1;
    scene.environment.exposure = exposure;
});
                        //the lower the more fog in an area         //lower the stonger fog
scene.fog = new THREE.Fog(0xcccccc, 1.5925,                     35);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;

controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 4;
controls.minDistance = 10;
controls.maxDistance = 35;

const groundHeight = 3;

function checkCameraPosition() {
    if (camera.position.y < groundHeight) {
        camera.position.y = groundHeight;
    }
}

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 20, 20);
light.castShadow = true; // Enable shadow casting for the light

// Configure shadow properties for the light
light.shadow.mapSize.width = 1024; // Set shadow map resolution
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 1; // Set the near clipping plane for shadow camera
light.shadow.camera.far = 50; // Set the far clipping plane for shadow camera
light.shadow.camera.left = -30; // Set shadow camera's left plane
light.shadow.camera.right = 30; // Set shadow camera's right plane
light.shadow.camera.top = 20; // Set shadow camera's top plane
light.shadow.camera.bottom = -30; // Set shadow camera's bottom plane
light.shadow.bias = -0.0001; // Adjust bias to correct shadow precision issues

scene.add(light);

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;

const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();
const TileswallTexture = textureLoader.load('/images/texture/tile.jpg');
const roofTexture = textureLoader.load('/images/texture/gold.jpg');

// Load the texture (ensure this line is before you use the texture)
const TilesgroundTexture = textureLoader.load('/images/texture/tile.jpg');
TilesgroundTexture.wrapS = THREE.RepeatWrapping;
TilesgroundTexture.wrapT = THREE.RepeatWrapping;
TilesgroundTexture.repeat.set(40, 40);

// Set the soil height (this can represent the depth of the semi-sphere)
const soilHeight = 0.5; // You can adjust this value as needed

// --- 1. Flat Circle (Base) ---
const radius = 21; // Radius of the circle
const segments = 32; // Number of segments (control detail)

// Create the flat circle geometry (base ground)
const flatCircleGeometry = new THREE.CircleGeometry(radius, segments);

// Apply the material using the loaded texture
const flatCircleMaterial = new THREE.MeshStandardMaterial({
    map: TilesgroundTexture, // Apply the texture to the material
    metalness: 1,
    roughness: 0.4,
    envMap: scene.environment,
    reflectivity: 0.9,
});

// Create the flat circle mesh
const flatCircle = new THREE.Mesh(flatCircleGeometry, flatCircleMaterial);

// Rotate the circle so that it lies flat on the X-Y plane (normal rotation)
flatCircle.rotation.x = -Math.PI / 2; // Flat circle (ground)

// Enable shadow reception
flatCircle.receiveShadow = true;

// Add the flat circle to the scene
scene.add(flatCircle);

// --- 2. Semi-Sphere (Flipped) ---
const thetaStart = 0; // Start angle (full circle)
const thetaLength = Math.PI; // Half sphere (180 degrees)

// Create a semi-sphere geometry (the flat top and rounded bottom)
const semiSphereGeometry = new THREE.SphereGeometry(radius, segments, segments, thetaStart, thetaLength);

// Apply the same material as the flat circle (you can change it if needed)
const semiSphereMaterial = new THREE.MeshStandardMaterial({
    map: TilesgroundTexture, // Apply the texture to the material
    metalness: 1,
    roughness: 0.4,
    envMap: scene.environment,
    reflectivity: 0.9,
});

// Create the mesh for the flipped semi-sphere
const semiSphere = new THREE.Mesh(semiSphereGeometry, semiSphereMaterial);

// Rotate the semi-sphere to flip it vertically
semiSphere.rotation.x = Math.PI / 2; // Flip the sphere along the X-axis

// Position the semi-sphere slightly above the base ground to make it visible
semiSphere.position.y = radius * 0.010; // Position it slightly above the flat ground

// Enable shadow reception
semiSphere.receiveShadow = true;

// Add the semi-sphere to the scene
scene.add(semiSphere);


///
//-------------------------------------------------------- House Geometry (Box)                   
const houseGeometry = new THREE.BoxGeometry(6, 7.5, 6); // Original house geometry
TileswallTexture.wrapS = THREE.RepeatWrapping;
TileswallTexture.wrapT = THREE.RepeatWrapping;
TileswallTexture.repeat.set(4, 5);
const TileswallMaterial = new THREE.MeshStandardMaterial({
    map: TileswallTexture,
    depth: soilHeight,
    metalness: 1,
    roughness: 0.3,
    envMap: scene.environment,
    reflectivity: 0.9,
});




//GUI-------------------------------------------------------------

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(20, 20, 20);

scene.add(directionalLight);

// Create a folder for the lighting controls
const lightFolder = gui.addFolder('Lighting Controls');

// Add a control to adjust the intensity of the ambient light (representing the time of day)
const lightControl = {
    timeOfDay: 1.06  // Default: 1 (daytime)
};

// Adjust the intensity of the ambient light based on `timeOfDay`
lightFolder.add(lightControl, 'timeOfDay', 0, 2).name('Sun').onChange((value) => {
    if (ambientLight) {
        ambientLight.intensity = value; // Adjust the ambient light intensity
    }

    if (directionalLight) {
        directionalLight.intensity = value; // Adjust the directional light intensity
    }

    // Optional: You can also change the color of the light to simulate sunset/sunrise
    if (value < 1) {
        // Nighttime - dim light, change color to cooler tone
        if (ambientLight) ambientLight.color.set(0x444444);  // Dimming to a cooler tone
        if (directionalLight) directionalLight.color.set(0x444444);  // Dimming directional light
    } else {
        // Daytime - bright light, change color to warmer tone
        if (ambientLight) ambientLight.color.set(0xffffff);  // Bright white light
        if (directionalLight) directionalLight.color.set(0xffffff);  // Bright directional light
    }
});

// Open the folder by default
lightFolder.open();

// Ensure the GUI is added to the DOM
document.body.appendChild(gui.domElement);


//GUI---------------------------------------------------------------


// Add fog and lighting controls to the GUI
const fogControl = {
    color: scene.fog.color.getHex(), // Fog color
    near: scene.fog.near,            // Fog starting distance
    far: scene.fog.far               // Fog ending distance
};

// Add a folder for the fog controls
const fogFolder = gui.addFolder('Fog Controls');

/* Fog color control
fogFolder.addColor(fogControl, 'color').name('Fog Color').onChange((value) => {
    scene.fog.color.set(value); // Update fog color
});*/

// Fog near control
fogFolder.add(fogControl, 'near', 0.1, 20).name('Fog').onChange((value) => {
    scene.fog.near = value; // Update fog starting distance
});

/*Fog far control
fogFolder.add(fogControl, 'far', 5, 100).name('Fog Far').onChange((value) => {
    scene.fog.far = value; // Update fog ending distance
});*/

// Open the fog folder by default
fogFolder.open();

gui.width = 300; // Set the width of the GUI panel
// Access the GUI DOM element
const guiDom = gui.domElement;

// Apply CSS styles
guiDom.style.position = "absolute";  // Adjust position
guiDom.style.top = "20px";           // Set distance from the top
guiDom.style.right = "20px";         // Set distance from the right
guiDom.style.background = "#333";    // Set a dark background
guiDom.style.border = "4px solid #7dc1f5"; // Add a border
guiDom.style.borderRadius = "4px";   // Round the corners
guiDom.style.padding = "10px";       // Add padding
guiDom.style.backgroundColor = "#3d5e78";
guiDom.style.fontFamily = "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif";


//------------------------------------ Create the original house (Box)
const Tileswall1 = new THREE.Mesh(houseGeometry, TileswallMaterial); // House body (Box)
Tileswall1.position.y = 2;
Tileswall1.castShadow = true;
scene.add(Tileswall1);

// Create the top half of the sphere (Roof)
const topHalfGeometry = new THREE.SphereGeometry(3.2, 30, 30, 0, Math.PI * 2, 0, Math.PI / 2); // Top half of the sphere (roof)
const TileswallMaterial1 = new THREE.MeshStandardMaterial({
    map: roofTexture,
    depth: soilHeight,
    metalness: 1,
    roughness: 0,
    envMap: scene.environment,
    reflectivity: 0.9,
});
const topHalf = new THREE.Mesh(topHalfGeometry, TileswallMaterial1);
topHalf.position.y = 5.9; // Position the top half above the house
topHalf.castShadow = true;
scene.add(topHalf);

// Second Box Geometry (small tile above the house)
const houseGeometry2 = new THREE.BoxGeometry(6.7, 0.3, 6.7); // Small tile above the house
const TileswallMaterial2 = new THREE.MeshStandardMaterial({
    map: TileswallTexture,
    depth: soilHeight,
    metalness: 1,
    roughness: 0,
    envMap: scene.environment,
    reflectivity: 0.9,
});
const Tileswall2 = new THREE.Mesh(houseGeometry2, TileswallMaterial2); 
Tileswall2.position.y = 5.8; // Position the small tile above the house
Tileswall2.castShadow = true;
scene.add(Tileswall2);



// Cloning the entire house structure (Box + Sphere + Second Box)

//---------------------------------------------------------------------------/ Left Side Clone
const houseLeft = Tileswall1.clone();
                    // width  //height  //width back
houseLeft.scale.set(0.9,         0.8,           0.9); // Slightly smaller (90%)
houseLeft.position.set(-5, 2, -5); // Position it to the left
houseLeft.castShadow = true;
scene.add(houseLeft);

// Top Half for Left Side
const topHalfLeft = topHalf.clone();
topHalfLeft.scale.set(0.9, 0.9, 0.9); // Slightly smaller (90%)
topHalfLeft.position.set(-5, 5, -5); // Position the roof above the left clone
topHalfLeft.castShadow = true;
scene.add(topHalfLeft);

// Second top Box for Left Side
const Tileswall2Left = Tileswall2.clone();

Tileswall2Left.scale.set(0.98, 0.9, 1.1); // Slightly smaller (90%)
Tileswall2Left.position.set(-5, 5, -5); // Position the second tile above the left clone
Tileswall2Left.castShadow = true;
scene.add(Tileswall2Left);

//---------------------------------------------------------------------------/Right Side Clone
const houseRight = Tileswall1.clone();
                  // width  //height  //width back
houseRight.scale.set(0.9,         0.8,           0.9); // Slightly smaller (90%)
houseRight.position.set(5, 2, -5); // Position it to the right
houseRight.castShadow = true;
scene.add(houseRight);


// Top Half for Right Side
const topHalfRight = topHalf.clone();
topHalfRight.scale.set(0.9, 0.9, 0.9); // Slightly smaller (90%)
topHalfRight.position.set(5, 5, -5); // Position the roof above the right clone
topHalfRight.castShadow = true;
scene.add(topHalfRight);

// Second Box top for Right Side
const Tileswall2Right = Tileswall2.clone();
Tileswall2Right.scale.set(0.98, 0.9, 1.1); // Slightly smaller (90%)
Tileswall2Right.position.set(5, 5, -5); // Position the second tile above the right clone
Tileswall2Right.castShadow = true;
scene.add(Tileswall2Right);


///////////////////----------------FRONT YARD
const housefront1 = Tileswall1.clone();
                  // width  //height  //width back
housefront1.scale.set(1.1,         0.10,           0.3); // Slightly smaller (90%)
housefront1.position.set(5, 0, 6); // Position it to the right
housefront1.castShadow = true;
scene.add(housefront1);
///////// FRONT YARD LEFT
const housefront2 = Tileswall1.clone();
                  // width  //height  //width back
housefront2.scale.set(1.1,         0.10,           0.3); // Slightly smaller (90%)
housefront2.position.set(-5, 0, 6); // Position it to the right
housefront2.castShadow = true;
scene.add(housefront2);

///////// FRONT YARD DOORWAY
const housefrontway = Tileswall1.clone();
                  // width  //height  //width back
housefrontway.scale.set(0.4,         0.10,    1.1); // Slightly smaller (90%)
housefrontway.position.set(0, 0, 6); // Position it to the right
housefrontway.castShadow = true;
scene.add(housefrontway);

///////// FRONT YARD DOORWAY ROOF
const housefrontroof = Tileswall1.clone();
                  // width  //height  //width back
housefrontroof.scale.set(0.4,         0.040,    1.1); // Slightly smaller (90%)
                            //X //UP //Y
housefrontroof.position.set(0, 3, 6); // Position it to the right
housefrontroof.castShadow = true;
scene.add(housefrontroof);

///////// FRONT YARD WALL
const housefrontWall = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall.position.set(-1, 1.5, 3.3); // Position it to the right
housefrontWall.castShadow = true;
scene.add(housefrontWall);
///////// FRONT YARD WALL
const housefrontWall1 = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall1.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall1.position.set(-1, 1.5, 5.6); // Position it to the right
housefrontWall1.castShadow = true;
scene.add(housefrontWall1);

///////// FRONT YARD WALL

const housefrontWall2 = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall2.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall2.position.set(-1, 1.5, 7.6); // Position it to the right
housefrontWall2.castShadow = true;
scene.add(housefrontWall2);

///////// FRONT YARD WALL

const housefrontWall3 = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall3.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall3.position.set(-1, 1.5, 9); // Position it to the right
housefrontWall3.castShadow = true;
scene.add(housefrontWall3);

//flip

///////// FRONT YARD WALL
const housefrontWall4 = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall4.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall4.position.set(1, 1.5, 3.3); // Position it to the right
housefrontWall4.castShadow = true;
scene.add(housefrontWall4);
///////// FRONT YARD WALL
const housefrontWall5 = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall5.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall5.position.set(1, 1.5, 5.6); // Position it to the right
housefrontWall5.castShadow = true;
scene.add(housefrontWall5);

///////// FRONT YARD WALL

const housefrontWall6 = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall6.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall6.position.set(1, 1.5, 7.6); // Position it to the right
housefrontWall6.castShadow = true;
scene.add(housefrontWall6);

///////// FRONT YARD WALL

const housefrontWall7 = Tileswall1.clone();
                  // width  //height  //width back
housefrontWall7.scale.set(0.020,         0.4,    0.030); // Slightly smaller (90%)
                            //X //UP //Y
housefrontWall7.position.set(1, 1.5, 9); // Position it to the right
housefrontWall7.castShadow = true;
scene.add(housefrontWall7);

///---------------------

//SEMI SIRCLE FOR ROOF


const shape = new THREE.Shape();
const radius1 = 5;
shape.moveTo(0, 0);
shape.arc(0, 0, radius1, 0, Math.PI, false);

const extrudeSettings = { depth: 6, bevelEnabled: false };
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

const loader = new THREE.TextureLoader();
const texture = loader.load('/images/texture/purpletile1.jpg');

texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(0.1, 0.8);

const material = new THREE.MeshStandardMaterial({
    map: texture,
    depth: soilHeight,
    metalness: 1,
    roughness: 0,
    envMap: scene.environment,
    reflectivity: 0.9,
});

const semiCircle = new THREE.Mesh(geometry, material);
scene.add(semiCircle);

semiCircle.scale.set(0.24, 0.20, 1);
semiCircle.position.set(0, 3, 3);

//SEMI SIRCLE FOR ROOF LEFT

const clonedSemiCircle = semiCircle.clone();


clonedSemiCircle.position.set(2.2, 3, 0.40); 
clonedSemiCircle.scale.set(0.235, 0.25, 1);  

clonedSemiCircle.rotation.y = Math.PI / 2;  // 90 degrees in radians


scene.add(clonedSemiCircle);

//SEMI SIRCLE FOR ROOF RIGHT

const clonedSemiCircle1 = semiCircle.clone();


clonedSemiCircle1.position.set(-8.2, 3, 0.40); 
clonedSemiCircle1.scale.set(0.235, 0.25, 1);  



clonedSemiCircle1.rotation.y = Math.PI / 2;  // 90 degrees in radians




scene.add(clonedSemiCircle1);



//front gold roof
const shape1 = new THREE.Shape();
const radius2 = 5;
shape1.moveTo(0, 0);
shape1.arc(0, 0, radius2, 0, Math.PI, false);

const extrudeSettings1 = { depth: 0.30, bevelEnabled: false };
const geometry1 = new THREE.ExtrudeGeometry(shape, extrudeSettings1);

const loader1 = new THREE.TextureLoader();
const texture1 = loader1.load('/images/texture/gold.jpg');

texture1.wrapS = THREE.RepeatWrapping;
texture1.wrapT = THREE.RepeatWrapping;
texture1.repeat.set(0.1, 0.8);

const material1 = new THREE.MeshStandardMaterial({
    map: texture1,
    depth: soilHeight,
    metalness: 1,
    roughness: 0,
    envMap: scene.environment,
    reflectivity: 0.9,
});

const semiCircle1 = new THREE.Mesh(geometry1, material1);
scene.add(semiCircle1);

semiCircle1.scale.set(0.24, 0.20, 1);
semiCircle1.position.set(0, 3, 8.99);


//-------------------------/ Clone to Gold Front Right
const clonedSemiGOLD = semiCircle1.clone();

clonedSemiGOLD.position.set(8.190, 3, 0.40);
clonedSemiGOLD.scale.set(0.235, 0.25, 1);

clonedSemiGOLD.rotation.y = Math.PI / 2;  // 90 degrees in radians

scene.add(clonedSemiGOLD);

//-------------------------/ Clone to Gold Front left
const clonedSemiGOLD1 = semiCircle1.clone();

clonedSemiGOLD1.position.set(-8.480, 3, 0.40);
clonedSemiGOLD1.scale.set(0.235, 0.25, 1);

clonedSemiGOLD1.rotation.y = Math.PI / 2;  // 90 degrees in radians

scene.add(clonedSemiGOLD1);

// Door texture
const doorTexture = loader.load('/images/Materials/Doortile.png');

// Create a box geometry for the door (width, height, depth)
const doorGeometry = new THREE.BoxGeometry(3, 7, 3);  // The last value is the thickness of the door

// Door material
const doorMaterial = new THREE.MeshStandardMaterial({
    map: doorTexture,
    side: THREE.FrontSide,
    metalness: 1,
    roughness: 0,
    transparent: true,
    alphaTest: 0.5,
    opacity: 1
});

// Create the door mesh
const door = new THREE.Mesh(doorGeometry, doorMaterial);

// Set the door's position
door.position.set(0, 0, 1.8);
door.scale.set(0.4, 0.830, 1);

// Add door to the scene
scene.add(door);

//-----------------------------CLONE DOOR RIGHT
const clonedDoor = door.clone();
                        //X         // Y        //X FRONT
clonedDoor.position.set(0.0100,       1.5,         0.4);
                    //WIDTH     //HEIGHT   WIDTH BACK
clonedDoor.scale.set(   0.4,    0.350,      2.1);
clonedDoor.rotation.y = Math.PI / 2;
scene.add(clonedDoor);


///------------------------------


const wallConfigs = [
    // Front Yard
    { scale: [1.1, 0.10, 0.3], position: [5, 0, 6] },
    { scale: [1.1, 0.10, 0.3], position: [-5, 0, 6] },
    //facing front
    { scale: [0.28, 0.10, 0.8], position: [-2, 0, 13.2] },
    { scale: [0.28, 0.10, 0.8], position: [2, 0, 13.2] },



    // Front Yard Doorway
    { scale: [0.4, 0.10, 1.1], position: [0, 0, 6] },
    // Front Yard Doorway Roof
    { scale: [0.4, 0.040, 1.1], position: [0, 3, 6] },
   


    // Front Yard Walls Left
    { scale: [0.020, 0.4, 0.030], position: [-1, 1.5, 3.3] },
    { scale: [0.020, 0.4, 0.030], position: [-1, 1.5, 5.6] },
    { scale: [0.020, 0.4, 0.030], position: [-1, 1.5, 7.6] },
    { scale: [0.020, 0.4, 0.030], position: [-1, 1.5, 9] },

    // Front Yard Walls Right
    { scale: [0.020, 0.4, 0.030], position: [1, 1.5, 3.3] },
    { scale: [0.020, 0.4, 0.030], position: [1, 1.5, 5.6] },
    { scale: [0.020, 0.4, 0.030], position: [1, 1.5, 7.6] },
    { scale: [0.020, 0.4, 0.030], position: [1, 1.5, 9] },


         //RIGHT doorway                                  //y     //floor     x//------------------------------------
    { scale: [1.5, 0.10, 0.40], position: [4     , 0,      0.4] }, 
    { scale: [1.5, 0.040, 0.40], position: [4     , 3,      0.4] },

     //Walls Left
     { scale: [0.020, 0.4, 0.030], position: [3.7     , 1.5,      1.4] },
     { scale: [0.020, 0.4, 0.030], position: [5.3     , 1.5,      1.4] },
     { scale: [0.020, 0.4, 0.030], position: [6.5     , 1.5,      1.4] },
     { scale: [0.020, 0.4, 0.030], position: [7.9     , 1.5,      1.4] },
 
     //Walls Right
     { scale: [0.020, 0.4, 0.030], position: [3.7     , 1.5,      -0.6] },
     { scale: [0.020, 0.4, 0.030], position: [5.3     , 1.5,      -0.6] },
     { scale: [0.020, 0.4, 0.030], position: [6.5     , 1.5,      -0.6] },
     { scale: [0.020, 0.4, 0.030], position: [7.9     , 1.5,      -0.6] },

        //LEFT doorway                                  //y     //floor     x//------------------------------------
    { scale: [1.5, 0.10, 0.40], position: [-4     , 0,      0.4] }, 
    { scale: [1.5, 0.040, 0.40], position: [-4     , 3,      0.4] },

      //Walls Left
      { scale: [0.020, 0.4, 0.030], position: [-3.7     , 1.5,      1.4] },
      { scale: [0.020, 0.4, 0.030], position: [-5.3     , 1.5,      1.4] },
      { scale: [0.020, 0.4, 0.030], position: [-6.5     , 1.5,      1.4] },
      { scale: [0.020, 0.4, 0.030], position: [-7.9     , 1.5,      1.4] },
  
      //Walls Right
      { scale: [0.020, 0.4, 0.030], position: [-3.7     , 1.5,      -0.6] },
      { scale: [0.020, 0.4, 0.030], position: [-5.3     , 1.5,      -0.6] },
      { scale: [0.020, 0.4, 0.030], position: [-6.5     , 1.5,      -0.6] },
      { scale: [0.020, 0.4, 0.030], position: [-7.9     , 1.5,      -0.6] },
        
     
];

wallConfigs.forEach(config => {
    const wall = Tileswall1.clone();
    wall.scale.set(...config.scale);
    wall.position.set(...config.position);
    wall.castShadow = true;
    scene.add(wall);
    
});
//------------------------------------------------------PALM TREES
function createPalmTree() {
    const palmTree = new THREE.Group();

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const trunkTexture = textureLoader.load('/images/texture/Palmtrunk.jpg');
    const palmleavesTexture = textureLoader.load('/images/texture/pineleaves1.jpg');

    // Palm Tree Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 6, 16);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        map: trunkTexture,
        metalness: 1,
        roughness: 0.4,
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;  // Adjusted for better alignment
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    palmTree.add(trunk);

    // Palm Leaves
    const leafGeometry = new THREE.SphereGeometry(1, 3, 12);
    const leafMaterial = new THREE.MeshStandardMaterial({
        map: palmleavesTexture,
        color: 0x63d663,
    });

    const palmLeaves = new THREE.Group();
    for (let i = 0; i < 6; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.rotation.y = (Math.PI / 3) * i;
        leaf.castShadow = true;
        leaf.receiveShadow = true;

        // Apply random jitter to the leaf position
        const jitterAmount = 1;
        leaf.position.x += (Math.random() - 0.5) * jitterAmount;
        leaf.position.y += (Math.random() - 0.5) * jitterAmount;
        leaf.position.z += (Math.random() - 0.5) * jitterAmount;

        palmLeaves.add(leaf);
        leaf.scale.set(0.5, 0.5, 2.4); // Scale each leaf
    }

    palmLeaves.position.y = 6;  // Position above the trunk
    palmTree.add(palmLeaves);

    return palmTree;
}

// Function to animate the tree swing effect
let swingAngle = 0;
const swingSpeed = 0.0015;  // Speed of the swinging motion (higher is slower)

function animateTreeSwing(palmTree) {
    // Swing the palm tree trunk and leaves using sine for smooth oscillation
    swingAngle += swingSpeed;
    const swingAmount = Math.sin(swingAngle) * 0.1; // Control the swinging amplitude
    
    // Rotate trunk slightly
    palmTree.rotation.y = swingAmount;

    // Optionally, add swinging for leaves
    palmTree.children[1].rotation.y = swingAmount * 0.5; // Adjust leaf swing intensity

    // Recursively call animation
    requestAnimationFrame(() => animateTreeSwing(palmTree));
}

// Function to move and scale palm tree
function moveAndScaleTree(palmTree, position, scale) {
    palmTree.position.set(position.x, position.y, position.z);
    palmTree.scale.set(scale.x, scale.y, scale.z);
}

// Create and add 8 palm trees to the scene
const positions = [
    { x: 2, y: 0, z: 12 },
    { x: 2, y: 0, z: 13 },
    { x: 2, y: 0, z: 14 },
    { x: 2, y: 0, z: 15 },
    { x: -2, y: 0, z: 12 },
    { x: -2, y: 0, z: 13 },
    { x: -2, y: 0, z: 14 },
    { x: -2, y: 0, z: 15 }
];

const scale = { x: 0.4, y: 0.6, z: 0.5 };  // Scaling factor for all trees

for (let i = 0; i < 8; i++) {
    const palmTreeClone = createPalmTree();
    moveAndScaleTree(palmTreeClone, positions[i], scale);
    scene.add(palmTreeClone);
    
    // Start animating each tree
    animateTreeSwing(palmTreeClone);
}

//----------------------------------------------------------LOLLI


function createLollipop(scale, position) {
    const textureLoader = new THREE.TextureLoader();

    // Load textures
    const lolitrunktex = textureLoader.load('/images/texture/tile.jpg');
    const lolisphereTex = textureLoader.load('/images/bg/tech1.webp');

    // Trunk Material
    const trunkMaterial = new THREE.MeshStandardMaterial({
        map: lolitrunktex,
        roughness: 0.4,
        metalness: 0.6,
    });

    const trunkHeight = 5;
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 12);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true; // Enable shadow casting
    trunk.receiveShadow = true; // Optional

    // Sphere Material
    const sphereMaterial = new THREE.MeshStandardMaterial({
        map: lolisphereTex,
        roughness: 0,
        metalness: 0.4,
    });

    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = trunkHeight;
    sphere.scale.set(4, 0.5, 2);
    sphere.castShadow = true; // Enable shadow casting
    sphere.receiveShadow = true; // Optional

    const lollipop = new THREE.Group();
    lollipop.add(trunk);
    lollipop.add(sphere);
    lollipop.scale.set(scale.x, scale.y, scale.z);
    lollipop.position.set(position.x, position.y, position.z);

    return lollipop;
}


// Create the first lollipop
const scale1 = { x: 0.4, y: 1.7, z: 0.4 };
const position1 = { x: -12, y: 0, z: 5 };
const lollipop1 = createLollipop(scale1, position1);
scene.add(lollipop1);

// FLIP
const scale2 = { x: 0.4, y: 1.7, z: 0.4 };
const position2 = { x: 12, y: 0, z: 5 };
const lollipop2 = createLollipop(scale2, position2);
scene.add(lollipop2);

// BEHIND THE FIRST
const scale3 = { x: 0.5, y: 2.3, z: 0.4 };
const position3 = { x: -10, y: 0, z: -6 };
const lollipop3 = createLollipop(scale3, position3);
scene.add(lollipop3);

// BEHIND THE FLIP
const scale4 = { x: 0.5, y: 2.3, z: 0.4 };
const position4 = { x: 10, y: 0, z: -6 };
const lollipop4 = createLollipop(scale4, position4);
scene.add(lollipop4);

//-----------------------------------------------------PINE TREES



function createPineTree(x, z, scale = 1) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    const textureLoader = new THREE.TextureLoader();
    const foliageTexture = textureLoader.load('/images/texture/pineleaves1.jpg');
   
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, 2.5, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    const foliageGeometry1 = new THREE.ConeGeometry(3, 6, 8);
    const foliageMaterial1 = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        map: foliageTexture
    });
    const foliage1 = new THREE.Mesh(foliageGeometry1, foliageMaterial1);
    foliage1.position.set(0, 6, 0);
    foliage1.castShadow = true;
    foliage1.receiveShadow = true;
    treeGroup.add(foliage1);

    const foliageGeometry2 = new THREE.ConeGeometry(2.5, 5, 8);
    const foliageMaterial2 = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        map: foliageTexture
    });
    const foliage2 = new THREE.Mesh(foliageGeometry2, foliageMaterial2);
    foliage2.position.set(0, 8, 0);
    foliage2.castShadow = true;
    foliage2.receiveShadow = true;
    treeGroup.add(foliage2);

    const foliageGeometry3 = new THREE.ConeGeometry(2, 4, 8);
    const foliageMaterial3 = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        map: foliageTexture
    });
    const foliage3 = new THREE.Mesh(foliageGeometry3, foliageMaterial3);
    foliage3.position.set(0, 9.5, 0);
    foliage3.castShadow = true;
    foliage3.receiveShadow = true;
    treeGroup.add(foliage3);

    const foliageGeometry4 = new THREE.ConeGeometry(4, 8, 8);
    const foliageMaterial4 = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        map: foliageTexture
    });
    const foliage4 = new THREE.Mesh(foliageGeometry4, foliageMaterial4);
    foliage4.position.set(0, 5, 0);
    foliage4.castShadow = true;
    foliage4.receiveShadow = true;
    treeGroup.add(foliage4);

    treeGroup.scale.set(scale, scale, scale);

    scene.add(treeGroup);

    // Start the swinging animation for this tree
    animateTreeSwing(treeGroup);
}

// Create pine trees and add to the scene
createPineTree(-13, -14, 0.5);
createPineTree(-14, -12, 0.5);
createPineTree(-15, -10, 0.5);
createPineTree(-16, -8, 0.5);

createPineTree(13, -14, 0.5);
createPineTree(14, -12, 0.5);
createPineTree(15, -10, 0.5);
createPineTree(16, -8, 0.5);

createPineTree(-13, 14, 0.5);
createPineTree(-14, 12, 0.5);
createPineTree(-15, 10, 0.5);
createPineTree(-16, 8, 0.5);

createPineTree(13, 14, 0.5);
createPineTree(14, 12, 0.5);
createPineTree(15, 10, 0.5);
createPineTree(16, 8, 0.5);

// Front yard pine trees
createPineTree(7, 6, 0.4);
createPineTree(5, 6, 0.4);
createPineTree(3, 6, 0.4);

// Front yard pine trees (other side)
createPineTree(-7, 6, 0.4);
createPineTree(-5, 6, 0.4);
createPineTree(-3, 6, 0.4);

//------------------------------------------------------------------MODELS







window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    checkCameraPosition();
    controls.update();
    renderer.render(scene, camera);
}

animate();

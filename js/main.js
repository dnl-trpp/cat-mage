import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {Skeleton} from './Skeleton.js'
import { Fireball } from './Fireball.js';
import { GameOptions } from './GameOptions.js';
import { dumpObject } from './utility.js';

//GameStatus enumerator
const GameStatus = {
    Menu:1,
    Playng:2,
    Paused:3,
    Starting:4,
    Debug:5
}
var gameStat = GameStatus.Menu;

//PressedKeys dict to handle input
var PressedKeys = {
    A:false,
    S:false,
    D:false,
    W:false,
    Q:false,
    E:false,
    Space:false,
    Down:false,
    Up:false
}

//Menu Setup
document.getElementById("startGame").addEventListener("click", function(){
    gameStat = GameStatus.Starting;
    document.getElementById("Menu").style.display = 'none';

});

//Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;
camera.position.y = 0.5;
scene.background = new THREE.Color(0.53,0.81,0.92);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

//Create Plane
const planeTextureScaling = 10;
const planeGeom = new THREE.PlaneGeometry( 50, 50);
const planeColor = new THREE.TextureLoader().load('../img/floor_color.jpg');
planeColor.wrapS = THREE.RepeatWrapping;
planeColor.wrapT = THREE.RepeatWrapping;
planeColor.repeat.set( planeTextureScaling,planeTextureScaling );
const planeNormal = new THREE.TextureLoader().load('../img/floor_normal.jpg');
planeNormal.wrapS = THREE.RepeatWrapping;
planeNormal.wrapT = THREE.RepeatWrapping;
planeNormal.repeat.set( planeTextureScaling,planeTextureScaling );
const planeHeight = new THREE.TextureLoader().load('../img/floor_height.png');
planeHeight.wrapS = THREE.RepeatWrapping;
planeHeight.wrapT = THREE.RepeatWrapping;
planeHeight.repeat.set( planeTextureScaling,planeTextureScaling );
const planeMat = new THREE.MeshStandardMaterial( 
    {color: 0xeeeee4, 
     side: THREE.DoubleSide, 
     map: planeColor,
     normalMap: planeNormal,
     normalScale: new THREE.Vector2(5,5),
     //displacementMap: planeHeight,
     //displacementScale: 0.1
    });
const plane = new THREE.Mesh( planeGeom, planeMat );
plane.receiveShadow = true;
plane.rotation.x = Math.PI /2.0;
scene.add( plane );




//Light 1
const color = 0xFFFFFF;
const light1 = new THREE.DirectionalLight(color, 0.5);
light1.position.set(-1, 2, 4);
scene.add(light1);



//Light 2
const light2 = new THREE.DirectionalLight(color, 0.3);
light2.position.set(-1, 2, -4);
scene.add(light2);

//Light 3 (Shadow)
const light3 = new THREE.DirectionalLight(color, 0.8);
light3.position.set(0, 10, 0);
light3.castShadow=true;
light3.shadow.mapSize.width = 512;
light3.shadow.mapSize.height = 512;
light3.shadow.camera.left = -30;
light3.shadow.camera.bottom = -30;
light3.shadow.camera.right = 30;
light3.shadow.camera.top = 30;
light3.shadow.camera.near = 0.1;
light3.shadow.camera.far = 100;
scene.add(light3);


//Global Objects
var fireBallsArray = [];
var enemyArray = [];
var flame1 = new THREE.Object3D();
var flame2 = new THREE.Object3D();
var flame3 = new THREE.Object3D();
var pg = new THREE.Object3D(); 
var playerMesh;
const gltfLoader = new GLTFLoader();

//Load main character
gltfLoader.load('../models/Mage/scene.gltf', (gltf) => {
  var root = gltf.scene;
  playerMesh = root;
  pg.add(playerMesh);
  scene.add(pg);
  //console.log(dumpObject(pg).join('\n'));

  //Shadow caster
  const geometry = new THREE.SphereGeometry(0.5,32,16);
  const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  material.transparent = true;
  material.opacity = 0.0;
  const capsule = new THREE.Mesh( geometry, material );

  capsule.castShadow = true;
  pg.add( capsule );
  capsule.position.y += 0.6;


  flame1.add(pg.getObjectByName('flamesprite001_2'));
  flame2.add(pg.getObjectByName('flamesprite002_3'));
  flame3.add(pg.getObjectByName('flamesprite003_4'));
  pg.getObjectByName('GLTF_SceneRootNode').add(flame1);
  pg.getObjectByName('GLTF_SceneRootNode').add(flame2);
  pg.getObjectByName('GLTF_SceneRootNode').add(flame3);

  pg.position.y += 0.1;
  //console.log(pg.getObjectByName('Object_4'));
  //
  //console.log(dumpObject(pg).join('\n'));
  //console.log(pg);
  playerMesh.scale.set(0.5,0.5,0.5);
});


const curve = new THREE.CubicBezierCurve(
	new THREE.Vector2( 0, 2 ),
	new THREE.Vector2( -5, 2 ),
    new THREE.Vector2( -5, -5 ),
	new THREE.Vector2( 0, -5 )
);
var timetoanimate = 0;


function animateCamera(){
    camera.position.y += 0.02;
    var point = curve.getPointAt(timetoanimate);
    camera.position.x = point.x;
    camera.position.z = point.y;
    timetoanimate+=0.01
}

function displayMenu(){



}

//COMMANDS
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    //console.log(keyCode);
    if (keyCode == 87) {
        PressedKeys.W = true;
    } else if (keyCode == 83) {
        PressedKeys.S = true;
    } else if (keyCode == 65) {
        PressedKeys.A = true;
    } else if (keyCode == 68) {
        PressedKeys.D = true;
    }
      else if (keyCode == 81) {
        PressedKeys.Q = true;
    } else if (keyCode == 69) {
        PressedKeys.E = true;
    } else if (keyCode == 32) {
        if(!PressedKeys.Space && gameStat==GameStatus.Playng) fire();
        PressedKeys.Space = true;
    } else if (keyCode == 38) {
        PressedKeys.Up = true;
    } else if (keyCode == 40){
        PressedKeys.Down = true;
    }
};
document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        PressedKeys.W = false;
    } else if (keyCode == 83) {
        PressedKeys.S = false;
    } else if (keyCode == 65) {
        PressedKeys.A = false;
    } else if (keyCode == 68) {
        PressedKeys.D = false;
    }else if (keyCode == 81) {
        PressedKeys.Q = false;
    } else if (keyCode == 69) {
        PressedKeys.E = false;
    }  else if (keyCode == 32) {
        PressedKeys.Space = false;
    }else if (keyCode == 38) {
        PressedKeys.Up = false;
    } else if (keyCode == 40){
        PressedKeys.Down = false;
    }
};

function fire(){
    var fireball = new Fireball(scene,pg.position,pg.rotation);
    fireBallsArray.push(fireball);
}

function checkFireballEnemyCollision(){
    for(var i=enemyArray.length-1;i>=0;i--){
        //console.log(enemyArray);
        for(var j=fireBallsArray.length-1;j>=0;j--){
            var enemy=enemyArray[i];
            var fireball=fireBallsArray[j];
            var enemyPos=new THREE.Vector2(enemy.mesh.position.x,enemy.mesh.position.z);
            var fireballPos=new THREE.Vector2(fireball.mesh.position.x,fireball.mesh.position.z);
            if(enemyPos.distanceTo(fireballPos)<= fireball.hitSize+enemy.hitSize){
                console.log("Collision detected");
                //Destroy fireball
                scene.remove(fireball.mesh);
                fireBallsArray.splice(j,1);

                //Damage enemy
                enemy.health -= fireball.damage;
                if(enemy.health<=0){
                    //Destroy enemy
                    scene.remove(enemy.mesh);
                    enemyArray.splice(i,1);
                }
            }

        }
    }

}

function moveFireballs(){
    for(var i=fireBallsArray.length-1;i>=0;i--){
        fireBallsArray[i].mesh.position.z += Math.cos(fireBallsArray[i].direction.y)*GameOptions.fireballSpeed;
        fireBallsArray[i].mesh.position.x += Math.sin(fireBallsArray[i].direction.y)*GameOptions.fireballSpeed;
        if( fireBallsArray[i].ttl-- < 0 ) 
        {
            scene.remove(fireBallsArray[i].mesh);
            fireBallsArray.splice(i,1);
            //renderer.renderLists.dispose();
        }
    }

}

function handleControls(){
    if (PressedKeys.W){
        pg.position.z += Math.cos(pg.rotation.y)*GameOptions.forwardSpeed;
        pg.position.x += Math.sin(pg.rotation.y)*GameOptions.forwardSpeed;
    }
    if (PressedKeys.S){
        pg.position.z -= Math.cos(pg.rotation.y)*GameOptions.forwardSpeed;
        pg.position.x -= Math.sin(pg.rotation.y)*GameOptions.forwardSpeed;
    }
    if(PressedKeys.A){
        pg.rotation.y += GameOptions.cameraSpeedX;
    }
    if(PressedKeys.D){
        pg.rotation.y -= GameOptions.cameraSpeedX;
    }
    if(PressedKeys.E){
        pg.position.z += Math.sin(pg.rotation.y)*GameOptions.forwardSpeed;
        pg.position.x -= Math.cos(pg.rotation.y)*GameOptions.forwardSpeed;
    }
    if(PressedKeys.Q){
        pg.position.z -= Math.sin(pg.rotation.y)*GameOptions.forwardSpeed;
        pg.position.x += Math.cos(pg.rotation.y)*GameOptions.forwardSpeed;
    }
    if(PressedKeys.Up){
        camera.position.y += GameOptions.cameraSpeedY;
        
        camera.lookAt(pg.position.x,pg.position.y,pg.position.z);
    }
    if(PressedKeys.Down){
        camera.position.y -= GameOptions.cameraSpeedY;
        camera.lookAt(pg.position.x,pg.position.y,pg.position.z);
    }

}

var charAnimProp={
    maxFloatingOffset:0.1
}
function animateCharacter(time){
    flame1.rotation.y += 0.025;
    flame2.rotation.y -= 0.03;
    flame3.rotation.y += 0.027;

    if(playerMesh) playerMesh.position.y = 0.15+Math.sin(time*0.001)*charAnimProp.maxFloatingOffset; 

}


//render loop
function animate(time) {

	requestAnimationFrame( animate );
    animateCharacter(time);

    if(gameStat==GameStatus.Debug){
        camera.position.y = 10;
        camera.position.x =0;
        camera.position.z = 0;
    
    } else if(gameStat == GameStatus.Menu){
       displayMenu();
       camera.lookAt(0,0.7,0);

    } else if (gameStat == GameStatus.Starting){
        if(timetoanimate<=1){
            animateCamera();
            camera.lookAt(0,0.7,0);
        }else{
            gameStat = GameStatus.Playng;
            camera.position.x=0;
            camera.position.z = -5;
            camera.lookAt(0,0.7,0);
            pg.add(camera);
            var enemy = new Skeleton(scene,0,5);     
            enemyArray.push(enemy);      
        }
        
    } else if (gameStat == GameStatus.Playng){
            handleControls();
            moveFireballs();
            checkFireballEnemyCollision();
            
    }
    
	renderer.render( scene, camera );
}


animate();



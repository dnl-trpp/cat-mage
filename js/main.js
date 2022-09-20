import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {Wizard} from './Wizard.js'
import {Skeleton} from './Skeleton.js'
import { Fireball } from './Fireball.js';
import { WizardBall } from './WizardBall.js';
import { GameOptions } from './GameOptions.js';
import { dumpObject, resetObject } from './utility.js';
import { TWEEN } from './tween.module.min.js';

//GameStatus enumerator
const GameStatus = {
    Menu:1,
    Playng:2,
    Paused:3,
    Starting:4,
    Debug:5,
    Win:6,
    Lost:7,
    ChoosingUpgrade:8
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

//Upgrade Menu
var gameWonDiv = document.getElementById("GameWonDiv");
var smallWonDiv = document.getElementById("SmallWonDiv");
var overlayDiv = document.getElementById("overlay");
var tryagainBtn = document.getElementById("TryAgain");
tryagainBtn.addEventListener("click",function(){
    location.reload();

});
tryagainBtn.style.display = 'none';
gameWonDiv.style.display = 'none';
smallWonDiv.style.display = 'none';
overlayDiv.style.display = 'none';
var leftUpgrade =  document.getElementById("leftPowerup");
leftUpgrade.style.display = 'none';
var middleUpgrade =  document.getElementById("middlePowerup");
middleUpgrade.style.display = 'none';
var rightUpgrade =  document.getElementById("rightPowerup");
rightUpgrade.style.display = 'none';
leftUpgrade.addEventListener("click",function(){
    GameOptions.playerHealth++;
    cleanupWave();
});

middleUpgrade.addEventListener("click",function(){
    GameOptions.fireballDamage += 0.5;
    GameOptions.fireballHitSize += 0.1;
    Fireball.fireballGeometry = new THREE.SphereGeometry(GameOptions.fireballHitSize,32,16);
    cleanupWave();
});

rightUpgrade.addEventListener("click",function(){
    GameOptions.fireballTTL += 100;
    GameOptions.fireballSpeed += 0.01;
    cleanupWave();
});

function cleanupWave(){
    leftUpgrade.style.display = 'none';
    middleUpgrade.style.display = 'none';
    rightUpgrade.style.display = 'none';
    gameWonDiv.style.display = 'none';
    smallWonDiv.style.display = 'none';
    overlayDiv.style.display = 'none';
    spawnWave(wave);
    wave++;
    gameStat= GameStatus.Playng;

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
scene.background = new THREE.Color().setHex(0x918c8c);
scene.fog = new THREE.Fog(0x918c8c, 10, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

//Create Plane
const planeTextureScaling = 10;
const planeGeom = new THREE.PlaneGeometry( 50, 50);
const planeColor = new THREE.TextureLoader().load('./img/floor_color.jpg');
planeColor.wrapS = THREE.RepeatWrapping;
planeColor.wrapT = THREE.RepeatWrapping;
planeColor.repeat.set( planeTextureScaling,planeTextureScaling );
const planeNormal = new THREE.TextureLoader().load('./img/floor_normal.jpg');
planeNormal.wrapS = THREE.RepeatWrapping;
planeNormal.wrapT = THREE.RepeatWrapping;
planeNormal.repeat.set( planeTextureScaling,planeTextureScaling );
const planeHeight = new THREE.TextureLoader().load('./img/floor_height.png');
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
var wizardArray = [];
var wizardBallsArray = [];
var flame1 = new THREE.Object3D();
var flame2 = new THREE.Object3D();
var flame3 = new THREE.Object3D();
var pg = new THREE.Object3D(); 
//Special proprieties
pg.health = GameOptions.playerHealth;
pg.hitSize = 0.3;
pg.lastHitTime = -2001.0;

pg.add(camera);
var playerMesh;
var playerMaterial;
var invulnerabilityTween;
const gltfLoader = new GLTFLoader();

//Load main character
gltfLoader.load('./models/Mage/scene.gltf', (gltf) => {
  var root = gltf.scene;
  playerMesh = root;
  pg.add(playerMesh);
  scene.add(pg);
  //console.log(dumpObject(pg).join('\n'));
  playerMaterial = pg.getObjectByName("Object_13").material;
  invulnerabilityTween = new TWEEN.Tween(playerMaterial)
  .to({opacity:0},200)
  .easing(TWEEN.Easing.Linear.None)
  .yoyo(true)
  .repeat(Infinity);
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
  pg.position.z = -15;
  //console.log(pg.getObjectByName('Object_4'));
  //
  //console.log(dumpObject(pg).join('\n'));
  //console.log(pg);
  playerMesh.scale.set(0.5,0.5,0.5);
});

var walls = [];
var wallMaterial1;
var wallMaterial2;
//Load Props
gltfLoader.load('./models/Props/scene.gltf', (gltf) => {
    var root = gltf.scene;
    console.log(dumpObject(root).join('\n'));


    //Load walls
    var wallOb = root.getObjectByName('brick_wall001');
    wallOb.position.x = 0;
    wallOb.position.y= 0;
    wallOb.position.z= 0;
    
    wallMaterial1 = wallOb.children[0].material;
    wallMaterial2 = wallOb.children[1].material;
    wallMaterial1.color.setHex(0x635e5e);
    wallMaterial2.color.setHex(0x918c8c);
    var scale = 2.0;
    wallOb.scale.set(scale,scale,scale);
    var ob = new THREE.Object3D();
    for(var i=-7;i<7;i++){
        var wall = wallOb.clone();
        wall.position.x = i*4;
        ob.add(wall);
    }
    ob.position.z = -25;
    walls.push(ob);
    scene.add(ob);
    console.log(ob);
    ob = ob.clone();
    ob.position.z = 25;
    walls.push(ob);
    scene.add(ob);
    ob = ob.clone();
    ob.position.x = 24;
    ob.position.z = 0;
    ob.rotation.y = Math.PI /2.0;
    walls.push(ob);
    scene.add (ob);
    ob = ob.clone();
    ob.position.x = -24;
    ob.rotation.y = -Math.PI /2.0;
    walls.push(ob);
    scene.add (ob);

    //Load Bricks
    var brickOb = root.getObjectByName('bricks001');
    brickOb.position.x  = -1;
    brickOb.position.y = 0.11;
    brickOb.position.z = -14;
    //brickOb.children[0].material.color.setHex(0x918c8c);
    brickOb.scale.set(0.8,0.8,0.8);
    scene.add(brickOb);

    for (var i=0;i<11;i++){
        brickOb = brickOb.clone();
        brickOb.position.x = Math.random()*40-20;
        brickOb.position.z = Math.random()*40-20;
        brickOb.rotation.z = Math.random()*6;
        scene.add(brickOb);
    }

    //Load barrel
    var barrelOb = root.getObjectByName('barrel');
    barrelOb.position.x = 3;
    barrelOb.position.y = 0.5;
    barrelOb.position.z = -20;
    while(barrelOb.position.x > -2 && barrelOb.position.x <2 && barrelOb.position.z > -17 && barrelOb.position.z < -13){
        barrelOb.position.x = Math.random()*40-20;
        barrelOb.position.z = Math.random()*40-20;
    }
    barrelOb.scale.set(0.7,0.7,0.7);
    scene.add(barrelOb);

    for (var i=0;i<5;i++){
        barrelOb = barrelOb.clone();
        barrelOb.position.x = Math.random()*40-20;
        barrelOb.position.z = Math.random()*40-20;
        while(barrelOb.position.x > -2 && barrelOb.position.x <2 && barrelOb.position.z > -17 && barrelOb.position.z < -13){
            barrelOb.position.x = Math.random()*40-20;
            barrelOb.position.z = Math.random()*40-20;
        }
        barrelOb.rotation.z = Math.random()*6;
        scene.add(barrelOb);
    }

    //Load broken barrel
    //var barrelOb2 = new THREE.Object3D();
    //for(let i=16;i<26;i++){
    //    root.getObjectByName('barrel0'+i).position.x = 0;
    //    root.getObjectByName('barrel0'+i).position.z = 0;
    //    root.getObjectByName('barrel0'+i).scale.set(1,1,1);
    //    console.log(root.getObjectByName('barrel0'+i).position);
    //    barrelOb2.add(root.getObjectByName('barrel0'+i));
//
    //}
    //barrelOb2.position.x = 0; 
    //barrelOb2.position.y = 0.5;
    //barrelOb2.position.z = 0;
    //barrelOb2.scale.set(0.7,0.7,0.7);
    //scene.add(barrelOb2);

    //Load candle
    var candleOb = new THREE.Object3D();

    var candle1 = root.getObjectByName('candle');
    var candle2 = root.getObjectByName('candle001');
    var candle3 = root.getObjectByName('candle002');
    var candle4 = root.getObjectByName('candle003');

    resetObject(candle1);
    resetObject(candle2);
    candle2.position.x = 0.3
    candle2.position.z = 0.1
    resetObject(candle3);
    candle3.position.x = 0.2;
    candle2.position.z = 0.3
    resetObject(candle4);
    candle4.position.x = 0.1
    candle4.position.z = 0.1;

    candleOb.add(candle1);
    candleOb.add(candle2);
    candleOb.add(candle3);
    candleOb.add(candle4);

    candleOb.position.x=1;
    candleOb.position.z = -16;
    candleOb.position.y = 0;
    scene.add(candleOb);

    for (var i=0;i<5;i++){
        candleOb = candleOb.clone();
        candleOb.position.x = Math.random()*40-20;
        candleOb.position.z = Math.random()*40-20;
        candleOb.rotation.y = Math.random()*6;
        scene.add(candleOb);
    }
  });




const curve = new THREE.CubicBezierCurve(
	new THREE.Vector2( 0, 2 ),
	new THREE.Vector2( -5, 2 ),
    new THREE.Vector2( -5, -5 ),
	new THREE.Vector2( 0, -5 )
);
var timetoanimate = 0;


function animateCamera(){
    camera.position.y += 0.03;
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

function moveWizard(time){
    for(var i=wizardArray.length-1;i>=0;i--){
        var enemy=wizardArray[i];

        if(enemy.isDying){
            enemy.dieAnimation(time);
            if(enemy.isDead){
                scene.remove(enemy.mesh);
                wizardArray.splice(i,1);
            }
        }
        var dir= new THREE.Vector2(pg.position.x-enemy.mesh.position.x,pg.position.z-enemy.mesh.position.z);
        dir.normalize();
        enemy.mesh.rotation.y=Math.atan2(dir.x,dir.y);
        //enemy.mesh.position.x += dir.x * GameOptions.skeletonSpeed * deltaTime;
        //enemy.mesh.position.z += dir.y * GameOptions.skeletonSpeed * deltaTime;
    }
    
}

function moveSkeleton(time,deltaTime){
    for(var i=enemyArray.length-1;i>=0;i--){
        var enemy=enemyArray[i];
        
        if(enemy.isDying){
            enemy.dieAnimation(time);
            if(enemy.isDead) {
                scene.remove(enemy.mesh);
                enemyArray.splice(i,1);
            }
            continue;
        }

        //Collision with other Skeleton
        for(var j=enemyArray.length-1;j>=0;j--){
            if(j==i) break;
            var other = enemyArray[j];
            var enemyPos = new THREE.Vector2(enemy.mesh.position.x,enemy.mesh.position.z);
            var otherPos = new THREE.Vector2(other.mesh.position.x,other.mesh.position.z);
            var dir = new THREE.Vector2().subVectors(enemyPos,otherPos);
            //Colliding
            if(dir.length() <= enemy.hitSize+other.hitSize){
                dir.normalize();
                enemy.mesh.position.x += dir.x * GameOptions.collisionIntensity;
                enemy.mesh.position.z += dir.y * GameOptions.collisionIntensity;
            }
        }

        var dir= new THREE.Vector2(pg.position.x-enemy.mesh.position.x,pg.position.z-enemy.mesh.position.z);
        //If Close to Player
        if(dir.length()<=1) {
            if(!enemy.isAttacking){
                enemy.resetRotations();
                enemy.isAttacking = true;
            }
            else{
                enemy.attackAnimation(time);
            }
            dir.normalize();
            enemy.mesh.rotation.y=Math.atan2(-dir.x,-dir.y);

            //Handle invincibility frames
            if(time-pg.lastHitTime< GameOptions.invulnerability) continue;
            pg.lastHitTime = time;
            playerMaterial.transparent = true;
            invulnerabilityTween = new TWEEN.Tween(playerMaterial)
                .to({opacity:0},200)
                .easing(TWEEN.Easing.Linear.None)
                .yoyo(true)
                .repeat(Infinity);
            invulnerabilityTween.start();
            //Damage pg
            pg.health -= enemy.damage;
            console.log("Hit: "+pg.health);
            if(pg.health<=0){
                //Destroy pg
                pg.isDying = true;
                gameStat=GameStatus.Lost;
                scene.attach(camera);
            }
            continue;
        }
        if(enemy.isAttacking){
            enemy.resetRotations();
            enemy.isAttacking = false;
        }
        enemy.moveAnimation(time);

        dir.normalize();
        enemy.mesh.rotation.y=Math.atan2(-dir.x,-dir.y);
        enemy.mesh.position.x += dir.x * GameOptions.skeletonSpeed * deltaTime;
        enemy.mesh.position.z += dir.y * GameOptions.skeletonSpeed * deltaTime;

    }




}


function checkWizardballPlayerCollision(time){
        for(var j=wizardBallsArray.length-1;j>=0;j--){
            var wizardball=wizardBallsArray[j];
            if (!wizardball) break;
            var pgPos=new THREE.Vector2(pg.position.x,pg.position.z);
            var wizardballPos=new THREE.Vector2(wizardball.mesh.position.x,wizardball.mesh.position.z);
            if(pgPos.distanceTo(wizardballPos)<= wizardball.hitSize+pg.hitSize){
                console.log("Collision detected");
                //Destroy wizardball
                scene.remove(wizardball.mesh);
                wizardBallsArray.splice(j,1);

                //Handle invincibility frames
                if(time-pg.lastHitTime< GameOptions.invulnerability) continue;
                pg.lastHitTime = time;
                playerMaterial.transparent = true;
                invulnerabilityTween = new TWEEN.Tween(playerMaterial)
                    .to({opacity:0},200)
                    .easing(TWEEN.Easing.Linear.None)
                    .yoyo(true)
                    .repeat(Infinity);
                invulnerabilityTween.start();

                //Damage pg
                pg.health -= wizardball.damage;
                console.log("Hit: "+pg.health);
                if(pg.health<=0){
                    //Destroy pg
                    pg.isDying = true;
                    gameStat=GameStatus.Lost;
                    scene.attach(camera);
                }
            }

        }
}

function checkFireballEnemyCollision(){
    for(var i=enemyArray.length-1;i>=0;i--){
        //console.log(enemyArray);
        for(var j=fireBallsArray.length-1;j>=0;j--){
            var enemy=enemyArray[i];
            var fireball=fireBallsArray[j];
            if (!enemy || !fireball) break;
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
                    //scene.remove(enemy.mesh);
                    enemy.isDying=true;
                    //enemyArray.splice(i,1);
                }
            }

        }
    }

    for(var i=wizardArray.length-1;i>=0;i--){
        //console.log(wizardArray);
        for(var j=fireBallsArray.length-1;j>=0;j--){
            var wizard=wizardArray[i];
            var fireball=fireBallsArray[j];
            if (!wizard || !fireball) break;
            var wizardPos=new THREE.Vector2(wizard.mesh.position.x,wizard.mesh.position.z);
            var fireballPos=new THREE.Vector2(fireball.mesh.position.x,fireball.mesh.position.z);
            if(wizardPos.distanceTo(fireballPos)<= fireball.hitSize+wizard.hitSize){
                console.log("Collision detected");
                //Destroy fireball
                scene.remove(fireball.mesh);
                fireBallsArray.splice(j,1);

                //Damage wizard
                wizard.health -= fireball.damage;
                if(wizard.health<=0){
                    //Destroy wizard
                    wizard.stopAttackAnimation();
                    wizard.isDying=true;
                    //scene.remove(wizard.mesh);
                    //wizardArray.splice(i,1);
                }
            }

        }
    }

}


function moveWizardBalls(deltaTime){
    for(var i=wizardBallsArray.length-1;i>=0;i--){

        wizardBallsArray[i].mesh.position.z -= wizardBallsArray[i].direction.y*GameOptions.wizardballSpeed*deltaTime;
        wizardBallsArray[i].mesh.position.x -= wizardBallsArray[i].direction.x*GameOptions.wizardballSpeed*deltaTime;
        wizardBallsArray[i].ttl-= deltaTime;
        if( wizardBallsArray[i].ttl < 0 ) 
        {
            scene.remove(wizardBallsArray[i].mesh);
            wizardBallsArray.splice(i,1);
            //renderer.renderLists.dispose();
        }
    }
}


function moveFireballs(deltaTime){
    for(var i=fireBallsArray.length-1;i>=0;i--){
        fireBallsArray[i].mesh.position.z += Math.cos(fireBallsArray[i].direction.y)*GameOptions.fireballSpeed*deltaTime;
        fireBallsArray[i].mesh.position.x += Math.sin(fireBallsArray[i].direction.y)*GameOptions.fireballSpeed*deltaTime;
        fireBallsArray[i].ttl-= deltaTime;
        if( fireBallsArray[i].ttl < 0 ) 
        {
            scene.remove(fireBallsArray[i].mesh);
            fireBallsArray.splice(i,1);
            //renderer.renderLists.dispose();
        }
    }

}

function wallCollision(pos){
    return pos > 23 || pos < -23;
}

function handleControls(deltaTime){
    var offZ = Math.cos(pg.rotation.y)*GameOptions.forwardSpeed*deltaTime;
    var offX = Math.sin(pg.rotation.y)*GameOptions.forwardSpeed*deltaTime;
    if (PressedKeys.W){
        if(!wallCollision(pg.position.z+offZ)) pg.position.z += offZ;
        if(!wallCollision(pg.position.x+offX)) pg.position.x += offX;
    }
    if (PressedKeys.S){
        if(!wallCollision(pg.position.z-offZ)) pg.position.z -= offZ;
        if(!wallCollision(pg.position.x-offX)) pg.position.x -= offX;
    }
    if(PressedKeys.A){
        pg.rotation.y += GameOptions.cameraSpeedX*deltaTime;
    }
    if(PressedKeys.D){
        pg.rotation.y -= GameOptions.cameraSpeedX*deltaTime;
    }
    if(PressedKeys.E){
        if(!wallCollision(pg.position.z+ offX)) pg.position.z += offX;
        if(!wallCollision(pg.position.x- offZ)) pg.position.x -= offZ;
    }
    if(PressedKeys.Q){
        if(!wallCollision(pg.position.z- offX)) pg.position.z -= offX;
        if(!wallCollision(pg.position.x + offZ)) pg.position.x += offZ;
    }
    if(PressedKeys.Up){
        camera.position.y += GameOptions.cameraSpeedY*deltaTime;
        
        camera.lookAt(pg.position.x,0.7,pg.position.z);
    }
    if(PressedKeys.Down){
        camera.position.y -= GameOptions.cameraSpeedY*deltaTime;
        camera.lookAt(pg.position.x,0.7,pg.position.z);
    }

}

var charAnimProp={
    maxFloatingOffset:0.1
}


function animateCharacter(time,deltaTime){
    //console.log(flame1.rotation.y);
    if(deltaTime){
        flame1.rotation.y += 0.025*deltaTime/10;
        //console.log(flame1.rotation.y);
        flame2.rotation.y -= 0.03*deltaTime/10;
        flame3.rotation.y += 0.027*deltaTime/10;
    //console.log(flame1.rotation.y);
    }

    if(playerMesh) playerMesh.position.y = 0.15+Math.sin(time*0.001)*charAnimProp.maxFloatingOffset; 

        //console.log("pl");
        //console.log(dumpObject(playerMesh).join('\n'));
    if(playerMaterial){
        if(time-pg.lastHitTime>= GameOptions.invulnerability){
            playerMaterial.opacity= 1.0;
           playerMaterial.transparent = false;
           invulnerabilityTween.stop();
        }
    }

    if(pg.isDying){
        pg.scale.set(pg.scale.x-0.02,pg.scale.y-0.02,pg.scale.y-0.02);
        pg.rotation.x = Math.sin(time*0.02)*0.1;
        pg.position.y -= 0.01;
        if(pg.scale.x<= 0) scene.remove(pg);
    }

}

var wave=0;

function wizardFire(staff){
    var worldPos= new THREE.Vector3;
    staff.getWorldPosition(worldPos);
    var dir= new THREE.Vector3(worldPos.x-pg.position.x,worldPos.z-pg.position.z);
    dir.normalize();
    var wizardBall = new WizardBall(scene, worldPos, dir);
    wizardBallsArray.push(wizardBall);
    //console.log("FIRE");
}
function spawnWave(wave){

    pg.health = GameOptions.playerHealth;

    var numSkeleton = GameOptions.waves[wave][0]; 
    var numWizards = GameOptions.waves[wave][1]; 
    for(var i=0;i<numSkeleton;i++){
        //Spawn skeleton in random position
        console.log("spawn skel");
        enemyArray.push(new Skeleton(scene,Math.floor(Math.random()*30-15),Math.floor(Math.random() * 30-15)));
    }
    for(var i=0;i<numWizards;i++){
        //Spawn skeleton in random position
        console.log("spawn wiza");
        var wizard=new Wizard(scene,Math.floor(Math.random()*30-15),Math.floor(Math.random()*20-5),wizardFire);
        wizard.startAttackAnimation(Math.random()*2000);
        wizardArray.push( wizard);
    }


}

const raycaster = new THREE.Raycaster();
var prevTime=0;
var deltaTime=0;
//render loop
function animate(time) {
    deltaTime = time-prevTime;
	requestAnimationFrame( animate );
    animateCharacter(time,deltaTime);

    if(gameStat==GameStatus.Debug){
        camera.position.y = 10;
        camera.position.x =0;
        camera.position.z = 0;
    
    } else if(gameStat == GameStatus.Menu){
       displayMenu();
       camera.lookAt(pg.position.x,0.7,pg.position.z);

    } else if (gameStat == GameStatus.Starting){
        if(timetoanimate<=1){
            animateCamera();
            camera.lookAt(pg.position.x,0.7,pg.position.z);
        }else{
            gameStat = GameStatus.Playng;
            camera.position.x = 0;
            camera.position.z = -5;
            gameStat= GameStatus.Playng;
            camera.lookAt(pg.position.x,0.7,pg.position.z);
            //pg.add(camera);
            //Spawining first wave 
            console.log("Wave 1");
            spawnWave(wave);
            wave++;
            
        }
        
    } else if (gameStat == GameStatus.Playng){
            handleControls(deltaTime);
            moveFireballs(deltaTime);
            moveSkeleton(time,deltaTime);
            moveWizard(time);
            moveWizardBalls(deltaTime);
            checkFireballEnemyCollision();
            checkWizardballPlayerCollision(time);

            raycaster.setFromCamera( new THREE.Vector2(0,0), camera );
            const intersects = raycaster.intersectObjects( walls);

            if (intersects.length>0){

                wallMaterial1.transparent = true;
                wallMaterial1.opacity = 0.3;
                wallMaterial2.transparent = true;
                wallMaterial2.opacity = 0.3;

            }else{
                wallMaterial1.transparent = false;
                wallMaterial2.transparent = false;
                wallMaterial1.opacity = 1.0;
                wallMaterial2.opacity = 1.0;
            }




            if(enemyArray.length==0 && wizardArray.length==0){
                gameStat = GameStatus.Win;
            }
            
    } else if (gameStat == GameStatus.Win){
        if(wave < GameOptions.waves.length) {
            //Cleaning up
            TWEEN.removeAll();
            console.log("Wave won!");
            console.log("Wave "+wave);
            leftUpgrade.style.display = 'block'; 
            middleUpgrade.style.display = 'block';
            rightUpgrade.style.display = 'block';
            gameWonDiv.style.display = 'block';
            gameWonDiv.textContent = ' Wave clear!'
            smallWonDiv.style.display = 'block';
            overlayDiv.style.display = 'block';
            gameStat = GameStatus.ChoosingUpgrade;
        }else{
            console.log("Game Won!");
        }
    } else if (gameStat == GameStatus.Lost){
        console.log("Game Over!")
        overlayDiv.style.display = 'block';
        gameWonDiv.style.display = 'block';
        tryagainBtn.style.display = 'block';
        gameWonDiv.textContent = 'Game Over!'
    }
    prevTime = time;
    TWEEN.update(time);
	renderer.render( scene, camera );
}


animate();



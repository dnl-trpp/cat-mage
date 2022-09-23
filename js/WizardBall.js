import * as THREE from './three.module.js';
import {GameOptions} from './GameOptions.js';

class WizardBall{
    
    static{
        //var texture = new THREE.TextureLoader().load('./img/fire_texture.jpg');
        //texture.repeat.set(100, 100);
        WizardBall.spriteMaterial = new THREE.SpriteMaterial( { color:0xdd571c } );
        WizardBall.fireballGeometry = new THREE.SphereGeometry(0.2,32,16);
        WizardBall.fireballMaterial = new THREE.MeshStandardMaterial( {color: 0xdd571c,emissive:0x222222} );
    }

    constructor(scene,pos,dir){
        this.mesh = new THREE.Mesh( WizardBall.fireballGeometry, WizardBall.fireballMaterial );
        this.mesh.position.copy(pos);
        this.mesh.position.y = 1;
        this.direction = new THREE.Vector3(dir.x, dir.y, dir.z);
        this.ttl = GameOptions.wizardballTTL;
        this.hitSize = 0.2;
        this.exploded=false;
        this.exploding = false;
        this.explodingAnimTime = 2000;
        //this.mesh.scale.set(5.0,5.0,5.0);
        this.damage= 1;
        scene.add(this.mesh);
        this.sprites = [];
        if(GameOptions.particles) for(var i=0;i<10;i++){
            this.sprites.push(this.createSprite());
            this.mesh.add(this.sprites[i]);
        }
    }


    createSprite(){
        var sprite= new THREE.Sprite( WizardBall.spriteMaterial );
        sprite.scale.set(0.05,0.05,0.05);
        sprite.position.x = Math.random()*0.5-0.25;
        sprite.position.z = Math.random()*0.5-0.25;
        sprite.position.y = Math.random()*0.5-0.25;
        return sprite;
    }
    moveSprite(deltaTime){

        if(this.exploding){
            this.explodingAnimTime -= deltaTime;
            if(this.explodingAnimTime<0) this.exploded = true;
        }
        for(var i=0;i< this.sprites.length;i++){
            if(this.exploding){
                if(!this.sprites[i].dir) {
                    this.sprites[i].scale.set(0.1,0.1,0.1);
                    this.sprites[i].position.x = 0;
                    this.sprites[i].position.y = 0;
                    this.sprites[i].position.z = 0;
                    this.sprites[i].dir = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5);
                    continue;
                }
                this.sprites[i].position.x += this.sprites[i].dir.x*deltaTime*0.03;
                this.sprites[i].position.y += this.sprites[i].dir.y*deltaTime*0.03;
                this.sprites[i].position.z += this.sprites[i].dir.z*deltaTime*0.03;
                this.explodingAnimTime -= deltaTime;
                if(this.explodingAnimTime<0) this.exploded = true;
                continue;
            }
            this.sprites[i].position.y += 0.0007*deltaTime;
            if (this.sprites[i].position.y>0.5) this.sprites[i].position.y = Math.random(0.3)-0.15;
        }
    }
    
}

export {WizardBall} 
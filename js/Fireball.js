import * as THREE from './three.module.js';
import {GameOptions} from './GameOptions.js';

class Fireball{
    
    static{

        Fireball.spriteMaterial = new THREE.SpriteMaterial( { color:0x42a7f5} );
        Fireball.fireballGeometry = new THREE.SphereGeometry(0.2,32,16);
        Fireball.fireballMaterial = new THREE.MeshStandardMaterial( {color:0x42a7f5,emissive: 0x555555} );
        
    }

    constructor(scene,pos,dir){
        this.sprites = [];
        this.mesh = new THREE.Mesh( Fireball.fireballGeometry, Fireball.fireballMaterial );
        this.mesh.position.copy(pos);
        this.mesh.position.y+=0.5;
        this.exploding = false;
        this.exploded = false;
        this.explodingAnimTime = 200;
        if(GameOptions.particles) for(var i=0;i<10;i++){
            this.sprites.push(this.createSprite());
            this.mesh.add(this.sprites[i]);
        }
        this.direction = new THREE.Vector3(dir.x, dir.y, dir.z);
        this.ttl = GameOptions.fireballTTL;
        this.hitSize = GameOptions.fireballHitSize;
        //this.mesh.scale.set(5.0,5.0,5.0);
        this.damage= GameOptions.fireballDamage;
        scene.add(this.mesh);
    }

    createSprite(){
        var sprite= new THREE.Sprite( Fireball.spriteMaterial );
        sprite.scale.set(GameOptions.fireballHitSize/4,GameOptions.fireballHitSize/4,GameOptions.fireballHitSize/4);
        sprite.position.x = Math.random()*0.5-0.25;
        sprite.position.z = Math.random()*0.5-0.25;
        sprite.position.y = Math.random()*0.5-0.3+GameOptions.fireballHitSize;
        return sprite;
    }
    moveSprite(deltaTime){

        if(this.exploding){
            this.explodingAnimTime -= deltaTime;
            if(this.explodingAnimTime<0) this.exploded = true;
        }
        for(var i=0;i< this.sprites.length;i++){
            if(this.exploding){
                this.mesh.scale.set(1,1,1);
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
                continue;
            }
            this.sprites[i].position.y += 0.0007*deltaTime;
            if (this.sprites[i].position.y>0.5) this.sprites[i].position.y = Math.random(0.3)-0.15;
        }
    }


    
}

export {Fireball} 
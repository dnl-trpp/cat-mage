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
        //this.mesh.scale.set(5.0,5.0,5.0);
        this.damage= 1;
        scene.add(this.mesh);
        this.sprites = [];
        for(var i=0;i<10;i++){
            this.sprites.push(this.createSprite());
            this.mesh.add(this.sprites[i]);
        }
    }


    createSprite(){
        var sprite= new THREE.Sprite( WizardBall.spriteMaterial );
        sprite.scale.set(GameOptions.fireballHitSize/4,GameOptions.fireballHitSize/4,GameOptions.fireballHitSize/4);
        sprite.position.x = Math.random()*0.5-0.25;
        sprite.position.z = Math.random()*0.5-0.25;
        sprite.position.y = Math.random()*0.5-0.25;
        return sprite;
    }
    moveSprite(deltaTime){

        for(var i=0;i< this.sprites.length;i++){
            this.sprites[i].position.y += 0.0007*deltaTime;
            if (this.sprites[i].position.y>0.5) this.sprites[i].position.y = Math.random(0.3)-0.15;
        }
    }
    
}

export {WizardBall} 
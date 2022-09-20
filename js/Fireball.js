import * as THREE from './three.module.js';
import {GameOptions} from './GameOptions.js';

class Fireball{
    
    static{
        Fireball.fireballGeometry = new THREE.SphereGeometry(0.2,32,16);
        Fireball.fireballMaterial = new THREE.MeshStandardMaterial( {color: 0xed8840, emissive: 0xf5c542} );
    }

    constructor(scene,pos,dir){
        this.mesh = new THREE.Mesh( Fireball.fireballGeometry, Fireball.fireballMaterial );
        this.mesh.position.copy(pos);
        this.mesh.position.y+=0.5;
        this.direction = new THREE.Vector3(dir.x, dir.y, dir.z);
        this.ttl = GameOptions.fireballTTL;
        this.hitSize = GameOptions.fireballHitSize;
        //this.mesh.scale.set(5.0,5.0,5.0);
        this.damage= GameOptions.fireballDamage;
        scene.add(this.mesh);
    }

    
}

export {Fireball} 
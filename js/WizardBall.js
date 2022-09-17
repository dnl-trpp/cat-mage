import * as THREE from './three.module.js';
import {GameOptions} from './GameOptions.js';

class WizardBall{
    
    static{
        WizardBall.fireballGeometry = new THREE.SphereGeometry(0.2,32,16);
        WizardBall.fireballMaterial = new THREE.MeshStandardMaterial( {color: 0xed8840, emissive: 0xf5c542} );
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
    }

    
}

export {WizardBall} 
import {GLTFLoader} from './GLTFLoader.js';
import { dumpObject } from './utility.js';
import * as THREE from './three.module.js';

class Wizard{
    
    static{
        const gltfLoader = new GLTFLoader();
        //Load Wizard
        gltfLoader.load('../models/Wizard/scene.gltf', (gltf) => {
        
            Wizard.root = new THREE.Object3D;
            gltf.scene.scale.set(0.025,0.025,0.025);
            Wizard.root.add(gltf.scene);
            Wizard.root.getObjectByName('Cone006_Material_#4_0').material.color.setHex(0x452515);

 
            console.log(dumpObject(Wizard.root).join('\n'));
        });
    }

    constructor(scene,x,z){
        this.mesh = Wizard.root.clone();
        this.mesh.position.y = 0;
        this.mesh.position.z = z;
        this.mesh.position.x = x;

        this.scettro = this.mesh.getObjectByName('Cylinder002');
        scene.add(this.mesh);
    }


}

export {Wizard} 
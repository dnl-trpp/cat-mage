import {GLTFLoader} from './GLTFLoader.js';
import { dumpObject } from './utility.js';
import * as THREE from './three.module.js';

class Skeleton{
    
    static{
        Skeleton.loaded= false;
        const gltfLoader = new GLTFLoader();
        //Load skeleton
        gltfLoader.load('../models/Skeleton/scene.gltf', (gltf) => {
        
            Skeleton.root = new THREE.Object3D;
            gltf.scene.scale.set(1.5,1.5,1.5);
            Skeleton.root.add(gltf.scene)
            

            //scene.add(root);
            //console.log(dumpObject(Skeleton.root).join('\n'));
        
            //Shadow caster
            const geometry = new THREE.SphereGeometry(0.3,32,16);
            const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            material.transparent = true;
            material.opacity = 0.0;
            const capsule = new THREE.Mesh( geometry, material );
        
        
            capsule.castShadow = true;
            Skeleton.root.add( capsule );
        
            console.log(this.root);
            Skeleton.loaded = true;
            //console.log(dumpObject(pg).join('\n'));
        });
    }

    constructor(scene,x,z){
        //while(!Skeleton.loaded) {};
        this.mesh = Skeleton.root.clone();
        this.mesh.position.y = 2.0;
        this.mesh.position.z = z;
        this.mesh.position.x = x;
        scene.add(this.mesh);
        console.log("New skeleton created");
        console.log(dumpObject(this.mesh).join('\n'));

        this.hitSize = 0.3;
        this.health = 1.0;
    }

    


}

export {Skeleton} 
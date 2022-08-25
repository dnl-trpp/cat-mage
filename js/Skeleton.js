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

            var rightFemor = Skeleton.root.getObjectByName('femur_derecha');
            var rightTibia = Skeleton.root.getObjectByName('espinilla_derecha');
            var rightTalon = Skeleton.root.getObjectByName('talon_derecha');
            var rightDedos = Skeleton.root.getObjectByName('dedos_pie_derecha');
            rightFemor.attach(rightTibia);
            rightTibia.attach(rightTalon);
            rightTalon.attach(rightDedos);
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
        this.rightFemor = this.mesh.getObjectByName('femur_derecha');
        this.leftFemor = this.mesh.getObjectByName('femur_izquierdo');
        console.log(this.rightFemor);
        console.log(this.leftFemor);
        this.timeOffset = 0;
        scene.add(this.mesh);
        console.log("New skeleton created");
        console.log(dumpObject(this.mesh).join('\n'));

        this.hitSize = 0.3;
        this.health = 1.0;
    }

    moveAnimation(time){
        this.rightFemor.rotation.x = -2+ Math.sin(time*0.005)*0.8;
        this.leftFemor.rotation.x = -2+-Math.sin(time*0.005)*0.8;
        //console.log(this.rightFemor.rotation.z);
        //console.log(this.leftFemor);
    }

    


}

export {Skeleton} 
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
            Skeleton.root.add(gltf.scene);

            var rightFemor = Skeleton.root.getObjectByName('femur_derecha');
            var rightTibia = Skeleton.root.getObjectByName('espinilla_derecha');
            var rightTalon = Skeleton.root.getObjectByName('talon_derecha');
            var rightDedos = Skeleton.root.getObjectByName('dedos_pie_derecha');
            rightFemor.attach(rightTibia);
            rightTibia.attach(rightTalon);
            rightTalon.attach(rightDedos);

            var leftFemor = Skeleton.root.getObjectByName('femur_izquierdo');
            var leftTibia = Skeleton.root.getObjectByName('espinilla_izquierda');
            var leftTalon = Skeleton.root.getObjectByName('talon_izquierda');
            var leftDedos = Skeleton.root.getObjectByName('dedos_pie_izquierda');
            leftFemor.attach(leftTibia);
            leftTibia.attach(leftTalon);
            leftTalon.attach(leftDedos);

            var leftOmer = Skeleton.root.getObjectByName('humero_izquierdo');
            var leftRadio = Skeleton.root.getObjectByName('radio_izquierda');
            var leftBaseMano = Skeleton.root.getObjectByName('base_mano_izquierda');
            var leftDitaMano = Skeleton.root.getObjectByName('dedos_mano_izquierda');
            var leftPuntaMano = Skeleton.root.getObjectByName('puanta_dedos_manos_izquierda');
            leftOmer.attach(leftRadio);
            leftRadio.attach(leftBaseMano);
            leftBaseMano.attach(leftDitaMano);
            leftDitaMano.attach(leftPuntaMano);


            var rightOmer = Skeleton.root.getObjectByName('humero_derecha');
            var rightRadio = Skeleton.root.getObjectByName('radio_derecha');
            var rightBaseMano = Skeleton.root.getObjectByName('base_mano_derecha');
            var rightDitaMano = Skeleton.root.getObjectByName('dedos_mano_derecha');
            var rightPuntaMano = Skeleton.root.getObjectByName('punta_dedos_derecha');
            rightOmer.attach(rightRadio);
            rightRadio.attach(rightBaseMano);
            rightBaseMano.attach(rightDitaMano);
            rightDitaMano.attach(rightPuntaMano);



            
            //scene.add(root);
            console.log(dumpObject(Skeleton.root).join('\n'));
        
            //Shadow caster
            const geometry = new THREE.SphereGeometry(0.5,32,16);
            const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            material.transparent = true;
            material.opacity = 0.0;
            const capsule = new THREE.Mesh( geometry, material );
        
        
            capsule.castShadow = true;
            Skeleton.root.add( capsule );
        
            //console.log(this.root);
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
        this.rightTibia = this.mesh.getObjectByName('espinilla_derecha');
        this.leftTibia = this.mesh.getObjectByName('espinilla_izquierda');
        this.leftOmer = this.mesh.getObjectByName('humero_izquierdo');
        this.rightOmer = this.mesh.getObjectByName('humero_derecha');
        this.rightRadio = this.mesh.getObjectByName('radio_derecha');
        this.leftRadio = this.mesh.getObjectByName('radio_izquierda');
        this.head = this.mesh.getObjectByName('cabeza');

        this.timeOffset = 0;
        scene.add(this.mesh);
        //console.log("New skeleton created");
        //console.log(dumpObject(this.mesh).join('\n'));

        this.moveAnimationSpeed = 0.007;
        this.attackAnimationSpeed = 0.007;
        this.hitSize = 0.3;
        this.health = 1.0;
        this.animationOffset = Math.random()*6/this.moveAnimationSpeed;
        this.attackAnimationOffset = Math.random()*6/this.attackAnimationSpeed;
        this.isAttacking = false;
        this.isDying = false;
        this.isDead = false;
    }

    moveAnimation(timef){
        var time = timef+this.animationOffset;
        var animationSpeed = this.moveAnimationSpeed;
        this.rightFemor.rotation.x = -1.4+ Math.sin(time*animationSpeed)*0.6;
        this.leftFemor.rotation.x = -1.4 -Math.sin(time*animationSpeed)*0.6;
        this.rightTibia.rotation.x = -0.4-Math.sin(time*animationSpeed)*0.5;
        this.leftTibia.rotation.x = -0.4+Math.sin(time*animationSpeed)*0.5;
        this.mesh.position.y = 2.0 + Math.sin(time*animationSpeed*2) * 0.05;
        this.leftOmer.rotation.x  = -1.4+ Math.sin(time*animationSpeed)*0.6;
        this.rightOmer.rotation.x = -1.4 -Math.sin(time*animationSpeed)*0.6;
        this.rightRadio.rotation.x = 0.3-Math.sin(time*animationSpeed)*0.3;
        this.leftRadio.rotation.x = 0.3+Math.sin(time*animationSpeed)*0.3;
        this.head.position.y = -30.0+Math.sin(time*animationSpeed*1.5)*6;

        //console.log(this.rightFemor.rotation.z);
        //console.log(this.leftFemor);
    }

    resetRotations(){
        this.rightFemor.rotation.x = -Math.PI/2;
        this.leftFemor.rotation.x = -Math.PI/2;
        this.rightTibia.rotation.x =0.0;
        this.leftTibia.rotation.x = 0.0;
        this.leftOmer.rotation.x  = -Math.PI/2;
        this.rightOmer.rotation.x = -Math.PI/2;
        this.rightRadio.rotation.x =0.0;
        this.leftRadio.rotation.x = 0.0;
        this.mesh.position.y = 2.0;
        this.head.position.y = -30.0;
    }
    attackAnimation(timef){
        var time = timef + this.attackAnimationOffset;
        var animationSpeed = this.attackAnimationSpeed;
        this.rightOmer.rotation.x = -1.0 -Math.sin(time*animationSpeed)*0.6;
        this.rightRadio.rotation.x = 1.0-Math.sin(time*animationSpeed);
        this.leftOmer.rotation.x = -1.6 -Math.sin(time*animationSpeed/2)*0.2;
        this.head.position.y = -30.0+Math.sin(time*animationSpeed*1.5)*6;
        this.mesh.rotation.x = Math.sin(time*animationSpeed)*0.01;
        this.rightFemor.rotation.x = -1.5+ Math.sin(time*animationSpeed)*0.05;
        this.leftFemor.rotation.x = -1.5 -Math.sin(time*animationSpeed)*0.05;
        this.rightTibia.rotation.x = -0.2-Math.sin(time*animationSpeed)*0.01;
        this.leftTibia.rotation.x = -0.2+Math.sin(time*animationSpeed)*0.01;
        this.mesh.position.y = 2.0 + Math.sin(time*animationSpeed*2) * 0.02;
    }

    dieAnimation(time){
        this.mesh.scale.set(this.mesh.scale.x-0.02,this.mesh.scale.y-0.02,this.mesh.scale.y-0.02);
        this.mesh.rotation.x = Math.sin(time*0.02)*0.1;
        this.mesh.position.y -= 0.02;
        if(this.mesh.scale.x<= 0) this.isDead=true;
    }

    


}

export {Skeleton} 
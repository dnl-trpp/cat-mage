import {GLTFLoader} from './GLTFLoader.js';
import { dumpObject,exportObject } from './utility.js';
import { TWEEN } from './tween.module.min.js';
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

            var body = Wizard.root.getObjectByName('Cone005');
            var head = Wizard.root.getObjectByName('Sphere001');
            var nose  = Wizard.root.getObjectByName('Box001');
            var leftEye  = Wizard.root.getObjectByName('Box003');
            var hat  = Wizard.root.getObjectByName('Box002');
            var leftArm = Wizard.root.getObjectByName('Cone007');
            var leftHand = Wizard.root.getObjectByName('Sphere002');
            var rightArm = Wizard.root.getObjectByName('Cone008');
            var rightHand = Wizard.root.getObjectByName('Sphere003');
            var beard = Wizard.root.getObjectByName('Sphere004');
            var rightMustache = Wizard.root.getObjectByName('GeoSphere002');
            var leftMustache = Wizard.root.getObjectByName('GeoSphere003');
            var weapon = Wizard.root.getObjectByName('Cylinder002');
            var rightEye = Wizard.root.getObjectByName('Box002_Material_#2_0');

            body.attach(head);
            head.attach(nose);
            head.attach(leftEye);
            head.attach(rightEye);
            head.attach(hat);
            body.attach(leftArm);
            leftArm.attach(leftHand);
            body.attach(rightArm);
            rightArm.attach(rightHand);
            head.attach(beard);
            head.attach(rightMustache);
            head.attach(leftMustache);
            rightHand.attach(weapon);

 
            console.log(dumpObject(Wizard.root).join('\n'));
        });
    }

    constructor(scene,x,z,wizardFire){
        this.mesh = Wizard.root.clone();
        this.mesh.position.y = 0.4;
        this.mesh.position.z = z;
        this.mesh.position.x = x;
        this.hitSize = 0.6;
        this.health = 1.0;
        this.isDying = false;
        this.isDead = false;

        this.body = this.mesh.getObjectByName('Cone005');
        this.head = this.mesh.getObjectByName('Sphere001');
        this.rightArm = this.mesh.getObjectByName('Cone008');
        this.rightHand = this.mesh.getObjectByName('Sphere003');
        this.staff = this.mesh.getObjectByName('GeoSphere001')

        var firstKFDuration = 1000;
        var secondKFDuration = 500;

        
        //BODY ANIMATION SETUP
        this.attackBodyTween = new TWEEN.Tween(this.body.rotation)
        .to( {z:-114/360*6.28,x:-95/360*6.28},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        var attackBodyKF1 = new TWEEN.Tween(this.body.rotation)
        .to( {z:-82/360*6.28,x:-78/360*6.28,y:7/360*6.28},secondKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        var attackBodyKF2 = new TWEEN.Tween(this.body.rotation)
        .to( {z:this.body.rotation.z,x:this.body.rotation.x,y:this.body.rotation.y},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        this.attackBodyTween.chain(attackBodyKF1);
        attackBodyKF1.chain(attackBodyKF2);
        attackBodyKF2.chain(this.attackBodyTween);

        //HEAD ANIMATION SETUP
        this.attackHeadTween = new TWEEN.Tween(this.head.rotation)
        .to( {y:-18/360*6.28,z:-14.6/360*6.28},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        var attackHeadKF1 = new TWEEN.Tween(this.head.rotation)
        .to( {x:7/360*6.28,y:7.5/360*6.28},secondKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        var attackHeadKF2 = new TWEEN.Tween(this.head.rotation)
        .to( {x:this.head.rotation.x,y:this.head.rotation.y,z:this.head.rotation.z},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        this.attackHeadTween.chain(attackHeadKF1);
        attackHeadKF1.chain(attackHeadKF2);
        attackHeadKF2.chain(this.attackHeadTween);

        //RIGHT ARM ANIMATION SETUP
        this.attackRightArmTween = new TWEEN.Tween(this.rightArm.rotation)
        .to( {y:67.15/360*6.28},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        var attackRightArmKF1 = new TWEEN.Tween(this.rightArm.rotation)
        .to( {y:this.rightArm.rotation.y},secondKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        var attackRightArmKF2 = new TWEEN.Tween(this.rightArm.rotation)
        .to( {y:this.rightArm.rotation.y},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)

        this.attackRightArmTween.chain(attackRightArmKF1);
        attackRightArmKF1.chain(attackBodyKF2)
        attackRightArmKF2.chain(this.attackRightArmTween);

        //RIGHT Hand ANIMATION SETUP
        this.attackRightHandTween = new TWEEN.Tween(this.rightHand.rotation)
        .to( {y:-10.9/360*6.28,z:-56.3/360*6.28},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut);

        this.attackRightHandKF1 = new TWEEN.Tween(this.rightHand.rotation)
        .to( {x:172/360*6.28,y:-42.5/360*6.28,z:-89.6/360*6.28},secondKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(_=>wizardFire(this.staff));

        var attackRightHandKF2 = new TWEEN.Tween(this.rightHand.rotation)
        .to( {x:this.rightHand.rotation.x,y:this.rightHand.rotation.y,z:this.rightHand.rotation.z},firstKFDuration)
        .easing(TWEEN.Easing.Cubic.InOut);

        this.attackRightHandTween.chain(this.attackRightHandKF1);
        this.attackRightHandKF1.chain(attackRightHandKF2);
        attackRightHandKF2.chain(this.attackRightHandTween);

        this.floatingTween = new TWEEN.Tween(this.mesh.position)
        .to( {y:0.5},3000)
        .easing(TWEEN.Easing.Linear.None)
        .yoyo(true)
        .repeat(Infinity);

         
        scene.add(this.mesh);
    }

    startAttackAnimation(delay){
        this.attackBodyTween.delay(delay).start();
        this.attackHeadTween.delay(delay).start();
        this.attackRightArmTween.delay(delay).start();
        this.attackRightHandTween.delay(delay).start();
        this.floatingTween.delay(delay).start();
    }

    stopAttackAnimation(){
        //Unchain tweens
        this.attackBodyTween.chain().stop();
        this.attackHeadTween.chain().stop();
        this.attackRightArmTween.chain().stop();
        this.attackRightHandTween.chain().stop();
        this.floatingTween.chain().stop();
        this.attackRightHandKF1.chain().stop();

    }

    dieAnimation(time){
        this.mesh.scale.set(this.mesh.scale.x-0.02,this.mesh.scale.y-0.02,this.mesh.scale.y-0.02);
        this.mesh.rotation.x = Math.sin(time*0.02)*0.1;
        this.mesh.position.y -= 0.01;
        if(this.mesh.scale.x<= 0) this.isDead=true;
    }

}

export {Wizard} 
import {GLTFExporter} from './GLTFExporter.js'

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

function resetObject(ob){
  ob.position.x=0;
  ob.position.y=0;
  ob.position.z=0;
  ob.scale.set(1,1,1);
}

function exportObject(ob){
              // Instantiate a exporter
  const exporter = new GLTFExporter();

  // Parse the input and generate the glTF output
  exporter.parse(
    Wizard.root,
    // called when the gltf has been generated
    function ( gltf ) {

          var link = document.createElement( 'a' );
          link.style.display = 'none';
          document.body.appendChild( link ); // Firefox workaround, see #6594

      console.log( JSON.stringify(gltf) );
          link.href = URL.createObjectURL(new Blob( [ JSON.stringify(gltf)], { type: 'text/plain' } ));
          link.download = 'scene.gltf';
          link.click();
    });

}
export {dumpObject,resetObject,exportObject};
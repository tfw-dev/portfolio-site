"use client"; 
import Image from 'next/image'
import { useEffect } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function Home() {
  useEffect(() => {
    let camera, scene, light, renderer, CSSRenderer
    let root, ring, CSSPlane
    
    function makeElementObject( width, height,css3dObject) {

      const obj = new THREE.Object3D

      obj.css3dObject = css3dObject
      obj.add(css3dObject)

  
      // make an invisible plane for the DOM element to chop
      // clip a WebGL geometry with it.
      var material = new THREE.MeshPhongMaterial({
          opacity	: 0.1,
          color	: new THREE.Color( 0x101010 ),
          blending: THREE.CustomBlending,
          blendEquation: THREE.SubtractEquation,
          blendSrc: THREE.SrcAlphaFactor,
          blendDst: THREE.OneFactor,
          // blendEquation: THREE.SubtractEquation,
          // blendSrc: THREE.SrcAlphaFactor,
          // blendDst: THREE.OneMinusSrcAlphaFactor,
          transparent: true,
          // side	: THREE.DoubleSide,
      });
      var geometry = new THREE.BoxGeometry( width + 3, height, 1 );
      var mesh2 = new THREE.Mesh( geometry, material );
      mesh2.castShadow = false
      mesh2.receiveShadow = false
      obj.lightShadowMesh = mesh2
      obj.add( mesh2 );
  
      obj.position.set(0,0,-50)

      return obj
    }


    init()

    function init() {

      // create root object group
      root = new THREE.Object3D()

      // Create Scene
      scene = new THREE.Scene();


      // Create Camera
      camera = new THREE.PerspectiveCamera(
        45, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near
        10000 // Far
      );


      
         // light
      var ambientLight = new THREE.AmbientLight( 0xffffff, 4 );
      ambientLight.castShadow  = true
      scene.add( ambientLight );


      light = new THREE.PointLight( 0xffffff, 600, 40);
      light.castShadow = true
      light.position.z = 10
      light.position.y = -20

      // scene.add( new THREE.PointLightHelper( light, 10 ) )

      root.add( light );

      // Create Topographic Square    
      let squareWidth = 40;
      let squareHeight= 40;

      const element = document.createElement( "div" );
      element.style.width = squareWidth+'px';
      element.style.height = squareHeight+'px';
      element.style.opacity = "1";
      const childElement = document.createElement( 'div' );
      element.appendChild(childElement)
      element.className = 'pattern-border';
      childElement.className = 'faded-pattern';
      childElement.style.width = 39.5+'px';
      childElement.style.height = 39.5+'px';


      var css3dObject = new CSS3DObject( element );
      css3dObject.position.z = 0
      css3dObject.position.y = 15
      
      let CSSPlane = makeElementObject( squareWidth, squareHeight, css3dObject)  

      
      root.add( CSSPlane  );

      // Create shape logo
      const shapeLogotexture = new THREE.TextureLoader().load( "../../public/newtop.png" );
 
      const shapeLogoMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide, map:shapeLogotexture  } );

      const shapeLogoGeometry = new THREE.RingGeometry(1.2, 1, 60 ); 
      const shapeLogoMesh = new THREE.Mesh( shapeLogoGeometry, shapeLogoMaterial ); 
        shapeLogoMesh.position.z = -1;
      root.add(shapeLogoMesh)

      function addShape(shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {
        addLineShape(shape, color, x, y, z, rx, ry, rz, s);
      }

      function addLineShape(shape, color, x, y, z, rx, ry, rz, s) {
        // lines
    
        shape.autoClose = true;
    
        var points = shape.getPoints();
        var spacedPoints = shape.getSpacedPoints(50);
    
        var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
        var geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints(
          spacedPoints
        );
    
        // solid line
    
        var line = new THREE.Line(
          geometryPoints,
          new THREE.LineBasicMaterial({ color: color, map: shapeLogotexture })
        );
        line.position.set(0,0,0,0);
        line.rotation.set(rx, ry, rz);
        line.scale.set(s, s, s);
        root.add(line)
    
      }

        // Rounded rectangle

  var roundedRectShape = new THREE.Shape();



  (function roundedRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
  })(roundedRectShape, 0, 0, 5, 5, 2);

  var extrudeSettings = {
    depth: 8,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1
  };
  addShape(
    roundedRectShape,
    extrudeSettings,
    0xffffff,
    -150,
    150,
    0,
    0,
    0,
    0,
    1
  );

      // Create Ring
      var material = new THREE.MeshLambertMaterial({
        color: 0x181818,
        side: THREE.DoubleSide,
     })

    var outerRadius = 35;
    var innerRadius = 30;
    var height = 10;

      var arcShape = new THREE.Shape();
      arcShape.moveTo(outerRadius * 2, outerRadius);
      arcShape.absarc(outerRadius, outerRadius, outerRadius, 0, Math.PI * 2, false);
      var holePath = new THREE.Path();
      holePath.moveTo(outerRadius + innerRadius, outerRadius);
      holePath.absarc(outerRadius, outerRadius, innerRadius, 0, Math.PI * 2, true);
      arcShape.holes.push(holePath);
      
      var geometry = new THREE.ExtrudeGeometry(arcShape, {
        depth: height,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 1000
      });

      geometry.center();
      geometry.rotateX(Math.PI * -.5);
      ring = new THREE.Mesh(geometry, material);
      ring.position.z = -50
      ring.position.y = 0
      ring.castShadow = true;
      ring.receiveShadow = false;
      root.add(ring)

      // Add root group to the scene
      scene.add(root)

      // Setup Renderers
      CSSRenderer = new CSS3DRenderer();
      CSSRenderer.setSize(innerWidth, innerHeight);
      document.querySelector('#css').appendChild(CSSRenderer.domElement);
      
      // Put the mainRenderer on top
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = 0;
      renderer.domElement.style.zIndex = 1;
      renderer.setSize(innerWidth, innerHeight);
      CSSRenderer.domElement.appendChild(renderer.domElement);
      

      const controls = new OrbitControls( camera, renderer.domElement );

      //controls.update() must be called after any manual changes to the camera's transform
      camera.position.set( 0, 0, 100)
      controls.update();

      function render() {
        requestAnimationFrame(render);
        CSSRenderer.render( scene, camera );
        renderer.render(scene, camera);
  
      }

      render();

      
      // //Helpers
      // const axesHelper = new THREE.AxesHelper(10 );
      // scene.add( axesHelper );
  
    }


});
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
       <div  className="rounded-lg">
        <div id="css"></div>
          <div className="loading-pattern rounded-lg">
          </div>
       </div>
    </main>
  )
}

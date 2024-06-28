"use client"; 
import Image from 'next/image'
import { useEffect } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// Line Addons
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

// Custom Shaders
import vertexShader from "../app/shaders/vertex.glsl?raw"
import fragmentShader from "../app/shaders/fragment.glsl?raw"

// Textures
import topoPattern from '../../public/topographic-pattern.png'
import backgroundGradient from '../../public/newtop.png'

export default function Home() {
  useEffect(() => {
    // Three.js Variables

    interface threeJSObject{
      [key: string]: Function
    }

    let 
    camera: threeJSObject , 
    scene:  threeJSObject, 
    light:  threeJSObject , 
    renderer:  threeJSObject, 
    CSSRenderer:  threeJSObject

    let 
    root:  threeJSObject , 
    ring:  threeJSObject


    // THREE.ColorManagement.enabled = true;
    function init() {

      // create root object group
      root = new THREE.Object3D()

      // Set Scene
      scene = new THREE.Scene();

      // Set Camera
      camera = new THREE.PerspectiveCamera(
        45, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near
        10000 // Far
      );

      // Set light
      var light = new THREE.AmbientLight( 0xffffff, 4 );
      // scene.add( new THREE.PointLightHelper( light, 10 ) )
      root.add( light );


      //Set Shape
      const squareTopHalf = new THREE.Shape();
      const squareBotHalf = new THREE.Shape();

      interface ShapeObject {
        moveTo: Function,
        lineTo: Function,
        quadraticCurveTo: Function
      }

      function setTopShape(shape: ShapeObject) {

      // Define Rounded Square Size
      let x = 1; let y = 1; let width = 50; let height1 = 35; let radius = 10
        shape.moveTo( x, y + radius ),
        shape.lineTo( x, y + height1 - radius );
        shape.quadraticCurveTo( x, y + height1, x + radius, y + height1 );
        shape.lineTo( x + width - radius, y + height1 );
        shape.quadraticCurveTo( x + width, y + height1, x + width, y + height1 - radius );
        shape.lineTo( x + width , y + radius );
      }

      function setBotShape(shape: ShapeObject) {

      // Define Rounded Square Size
      let x = 1; let y = 1; let width = 50; let height1 = 35; let radius = 10
        shape.moveTo( x, y - radius ),
        shape.lineTo( x, y - height1 + radius );
        shape.quadraticCurveTo( x, y - height1 , x + radius, y - height1 );
        shape.lineTo( x + width - radius, y - height1 );
        shape.quadraticCurveTo( x + width ,y - height1, x + width, y - height1 + radius );
         shape.lineTo( x + width  , y - radius );
      }

      setTopShape(squareTopHalf)
      setBotShape(squareBotHalf)

      const squareTopHalfGeometry = new THREE.ShapeGeometry( squareTopHalf );
      const squareBotHalfGeometry = new THREE.ShapeGeometry( squareBotHalf );



      //Texture Loader
      const textureLoader = new THREE.TextureLoader()
      const textureTop = textureLoader.load(topoPattern.src)
      const textureBot = textureLoader.load(topoPattern.src)
      const textureBG = textureLoader.load( backgroundGradient.src)
      
      textureTop.anisotropy =  16;
      textureBot.anisotropy =  16;
      textureBG.anisotropy =  16;

      setTimeout( function() {
		
        textureTop.needsUpdate = true;
        textureBot.needsUpdate = true;

        textureBG.needsUpdate = true;

      }, 1000 );



      textureTop.offset.set(0.25,0.5)
      // scale x2 horizontal
      textureTop.repeat.set(0.65, 1);
      // scale x2 vertical
      textureTop.repeat.set(1, 0.2);
      // scale x2 proportional
      textureTop.repeat.set(0.50, 0.50);

      textureBot.center.set(0.5, 0.5)

      textureBot.offset.set(-0.002,-0.25)
      // scale x2 horizontal
      textureBot.repeat.set(0.65, 1);
      // scale x2 vertical
      textureBot.repeat.set(1, 0.2);
      // scale x2 proportional
      textureBot.repeat.set(0.50, 0.50);
      textureBot.rotation =  3.15


      textureTop.colorSpace = THREE.SRGBColorSpace
      textureBot.colorSpace = THREE.SRGBColorSpace

      textureBG.colorSpace = THREE.SRGBColorSpace

      let points = new Float32Array([ 1, 0, 0 ])

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3( 1, 36, 0 ),
        new THREE.Vector3( 11, 31, 0 ),
        new THREE.Vector3( 11, 10, 0 )
      ]);

      const curvePoints = curve.getPoints( 50 );

      const geometry1 = new LineGeometry()
      geometry1.setPositions(points)
      var uniforms = {
          lineTexture: { value: textureBG }
      };


      var shaderMaterial = new THREE.RawShaderMaterial( {

        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        linewidth: 0.4
      } );

      // var shaderMaterial1 = new LineMaterial({
      //   color: "0xffffff",
      //   linewidth: 0.1
      // } );
			
      let line = new Line2( geometry1, shaderMaterial );
      line.scale.set( 1, 1, 1 );
      line.computeLineDistances()

      scene.add(line)

      line.position.z = -50;
      line.position.x = -25;
      line.position.y = 12;



      const squareTopMat = new THREE.MeshBasicMaterial( {map: textureTop, transparent: true } );
      const squareBotMat = new THREE.MeshBasicMaterial( {map: textureBot, transparent: true } );


      const squareTopHalfMesh = new THREE.Mesh( squareTopHalfGeometry, squareTopMat ) ;
      const squareBotHalfMesh = new THREE.Mesh( squareBotHalfGeometry, squareBotMat) ;

      const squareTopHalfEdges = new THREE.EdgesGeometry( squareTopHalfGeometry ); 
      const squareBotHalfEdges = new THREE.EdgesGeometry( squareBotHalfGeometry ); 
      const squareEdgesMaterial = new THREE.LineBasicMaterial( { map: textureBG } );


      const squareTopHalfLine = new THREE.LineSegments(squareTopHalfEdges, squareEdgesMaterial ); 
      const squareBotHalfLine = new THREE.LineSegments(squareBotHalfEdges, squareEdgesMaterial ); 

      scene.add( squareTopHalfLine );
      scene.add( squareBotHalfLine );


      squareTopHalfLine.position.z = -50;
      squareTopHalfLine.position.x = -25;
      squareTopHalfLine.position.y = -10;


      squareBotHalfLine.position.z = -50;
      squareBotHalfLine.position.x = -25;
      squareBotHalfLine.position.y = 10;

      let pos = squareTopHalfGeometry.attributes.position;
      let b3 = new THREE.Box3().setFromBufferAttribute(pos);
      let b3size = new THREE.Vector3();
      b3.getSize(b3size);
      let uv = [];
      for(let i = 0; i < pos.count; i++){
        let x = pos.getX(i);
        let y = pos.getY(i);
        let u = (x - b3.min.x) / b3size.x;
        let v = (y - b3.min.y) / b3size.y;
        uv.push(u, v);
      }
      squareTopHalfGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      squareBotHalfGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));

    
      squareTopHalfMesh.position.z = -50;
      squareTopHalfMesh.position.x = -25;
      squareTopHalfMesh.position.y = -10;

      squareBotHalfMesh.position.z = -50;
      squareBotHalfMesh.position.x = -25;
      squareBotHalfMesh.position.y = 10;


      scene.add( squareTopHalfMesh );
      scene.add( squareBotHalfMesh );

      // Create shape logo
      const shapeLogotexture = new THREE.TextureLoader().load( "/newtop.png" );
 
      const shapeLogoMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, map:shapeLogotexture   } );



      const shapeLogoGeometry = new THREE.RingGeometry(1.2, 1, 60 ); 
      const shapeLogoMesh = new THREE.Mesh( shapeLogoGeometry, shapeLogoMaterial ); 
      shapeLogoMesh.position.z = -1;
      root.add(shapeLogoMesh)

      function addShape(shape, color, x, y, z, rx, ry, rz, s) {
        addLineShape(shape, color, x, y, z, rx, ry, rz, s);
      }

      function addLineShape(shape, color, x, y, z, rx, ry, rz, s) {
        // lines
    
        shape.autoClose = true;
    
        var points = shape.getPoints();
        var spacedPoints = shape.getSpacedPoints(50);
    
        var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
     
    
        // solid line
        var line = new THREE.Line(
          geometryPoints,
          new THREE.LineBasicMaterial({ color: color, map: shapeLogotexture, linewidth:50})
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
      // root.add(ring)

      // Add root group to the scene
      scene.add(root)

      // Setup Renderers
      CSSRenderer = new CSS3DRenderer();
      CSSRenderer.setSize(innerWidth, innerHeight);
      document.querySelector('#css').appendChild(CSSRenderer.domElement);
      
      // Put the mainRenderer on top
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true,  preserveDrawingBuffer: true
 });
      renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1)

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
      renderer.outputColorSpace = THREE.SRGBColorSpace; // optional with post-processing

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


    init()
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

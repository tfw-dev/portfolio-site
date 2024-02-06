"use client"; 
import Image from 'next/image'
import { useEffect } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

import fragmentShader from '../app/shaders/fragmentShader'
import vertexShader from '../app/shaders/vertex.glsl'

import topographicPattern from '../../public/topographic-pattern.png'
import bgGradient from '../../public/newtop.png'

export default function Home() {
  useEffect(() => {
    let camera, scene, light, renderer, CSSRenderer
    let root, ring
    THREE.ColorManagement.enabled = true;

    // function makeElementObject( width, height,css3dObject) {

    //   const obj = new THREE.Object3D

    //   obj.css3dObject = css3dObject
    //   obj.add(css3dObject)

    //   // make an invisible plane for the DOM element to chop
    //   // clip a WebGL geometry with it.
    //   var material = new THREE.MeshPhongMaterial({
    //       opacity	: 0.1,
    //       color	: new THREE.Color( 0x101010 ),
    //       blending: THREE.CustomBlending,
    //       blendEquation: THREE.SubtractEquation,
    //       blendSrc: THREE.SrcAlphaFactor,
    //       blendDst: THREE.OneFactor,
    //       // blendEquation: THREE.SubtractEquation,
    //       // blendSrc: THREE.SrcAlphaFactor,
    //       // blendDst: THREE.OneMinusSrcAlphaFactor,
    //       transparent: true,
    //       // side	: THREE.DoubleSide,
    //   });

    //   var geometry = new THREE.BoxGeometry( width + 3, height, 1 );
    //   var mesh2 = new THREE.Mesh( geometry, material );
    //   mesh2.castShadow = false
    //   mesh2.receiveShadow = false
    //   obj.lightShadowMesh = mesh2
    //   obj.add( mesh2 );
  
    //   obj.position.set(0,0,-50)

    //   return obj
    // }


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
      
      // let CSSPlane = makeElementObject( squareWidth, squareHeight, css3dObject)  

      
      // root.add( CSSPlane  );
      let x = 1; let y = 1; let width = 50; let height1 = 35; let radius = 10

      const svgLoader = new SVGLoader();

      // const topoTexture = new THREE.TextureLoader().load('topographic-pattern.png'); 
      // topoTexture.encoding = THREE.sRGBEncoding;
      // topoTexture.repeat.x = 1;
      // topoTexture.repeat.y = 1;

      const loadingManager = new THREE.LoadingManager()
      loadingManager.onStart = () => {
        console.log('onStart')

      }
      loadingManager.onLoad = () => {
        console.log('onLoad')

      }
      loadingManager.onProgress = () => {
        console.log('onProgress')

      }
      loadingManager.onError = () => {
        console.log('onError')

      }
      const textureLoader = new THREE.TextureLoader(loadingManager)
      const texture = textureLoader.load(topographicPattern.src)
      const textureBG = textureLoader.load(bgGradient.src)
      texture.anisotropy =  16;
      texture.needsUpdate = true;
      textureBG.anisotropy =  16;
      textureBG.needsUpdate = true;

      texture.offset.set(0.25,0.4)
        // scale x2 horizontal
        texture.repeat.set(0.65, 1);
        // scale x2 vertical
        texture.repeat.set(1, 0.2);
        // scale x2 proportional
        texture.repeat.set(0.60, 0.60);
        const squareShapeTop = new THREE.Shape();
        const squareShapeBot = new THREE.Shape();

        texture.colorSpace = THREE.SRGBColorSpace
        textureBG.colorSpace = THREE.SRGBColorSpace

        squareShapeTop.moveTo( x, y + radius );
        squareShapeTop.lineTo( x, y + height1 - radius );
        squareShapeTop.quadraticCurveTo( x, y + height1, x + radius, y + height1 );
        squareShapeTop.lineTo( x + width - radius, y + height1 );
        squareShapeTop.quadraticCurveTo( x + width, y + height1, x + width, y + height1 - radius );
        squareShapeTop.lineTo( x + width , y + radius );



        squareShapeBot.moveTo( x, y + radius );
        squareShapeBot.lineTo( x, y + height1 - radius );
        squareShapeBot.quadraticCurveTo( x, y + height1, x + radius, y + height1 );
        squareShapeBot.lineTo( x + width - radius, y + height1 );
        squareShapeBot.quadraticCurveTo( x + width, y + height1, x + width, y + height1 - radius );
        squareShapeBot.lineTo( x + width , y + radius );

       

        const squareShapeTopGeometry = new THREE.ShapeGeometry( squareShapeTop );
        const squareShapeBotGeometry = new THREE.ShapeGeometry( squareShapeTop );


          
            console.log(squareShapeTop)
   

        const points1 = new Float32Array([
          1,11,0,  // First vertex
          1, 26, 0
      ])

      console.log(points1)
      let points = [ 1, 0, 0 ]

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3( 1, 36, 0 ),
        new THREE.Vector3( 11, 31, 0 ),
        new THREE.Vector3( 11, 10, 0 )
      ]);

      const curvePoints = curve.getPoints( 50 );
      for (let index = 0; index < curvePoints.length ; index++) {
        points.push(
          curvePoints[index].x,
          curvePoints[index].y,
          curvePoints[index].z
        );
      }

      console.log(points)

				const geometry1 = new LineGeometry()
        geometry1.setPositions(points)

				let matLine = new LineMaterial( {

					color: 0xffffff,
					linewidth: .01, // in world units with size attenuation, pixels otherwise


				} );
        var uniforms = {
          texture: bgGradient.src
      };
      
     
				let line = new Line2( geometry1, matLine );
                line.scale.set( 1, 1, 1 );

        scene.add(line)

        line.position.z = -50;
        line.position.x = -25;
        line.position.y = 12;



        const heartMaterial = new THREE.MeshBasicMaterial( {map: texture, transparent: true } );
        
        const squareShapeTopMesh = new THREE.Mesh( squareShapeTopGeometry, heartMaterial ) ;
        const squareShapeBotMesh = new THREE.Mesh( squareShapeTopGeometry, heartMaterial ) ;

        const squareShapeTopEdges = new THREE.EdgesGeometry( squareShapeTopGeometry ); 
        const squareShapeBotEdges = new THREE.EdgesGeometry( squareShapeBotGeometry ); 
        const squareEdgesMaterial = new THREE.LineBasicMaterial( { map: textureBG } );


        const squareShapeTopLine = new THREE.LineSegments(squareShapeTopEdges, squareEdgesMaterial ); 
        const squareShapeBotLine = new THREE.LineSegments(squareShapeBotEdges, squareEdgesMaterial ); 

        scene.add( squareShapeTopLine );
        scene.add( squareShapeBotLine );


        squareShapeTopLine.position.z = -50;
        squareShapeTopLine.position.x = -25;
        squareShapeTopLine.position.y = -10;


        squareShapeBotLine.position.z = -50;
        squareShapeBotLine.position.x = 27;
        squareShapeBotLine.position.y = 12;
        squareShapeBotLine.rotation.z =  Math.PI / 1;

        let pos = squareShapeTopGeometry.attributes.position;
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
        squareShapeTopGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));

        
        squareShapeTopMesh.position.z = -50;
        squareShapeTopMesh.position.x = -25;
        squareShapeTopMesh.position.y = -10;

        squareShapeBotMesh.position.z = -50;
        squareShapeBotMesh.position.x = 27;
        squareShapeBotMesh.position.y = 12;
        squareShapeBotMesh.rotation.z =  Math.PI / 1;




        scene.add( squareShapeTopMesh );
        scene.add( squareShapeBotMesh );

      
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
      root.add(ring)

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


});
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
       <div  className="rounded-lg">
        <div id="css"></div>
          <div className="loading-pattern rounded-lg">
          <fragmentShader></fragmentShader>
          <vertexShader></vertexShader>
          </div>
       </div>
    </main>
  )
}

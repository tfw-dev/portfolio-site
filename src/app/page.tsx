"use client"; 
import { useEffect } from 'react';
import Image from 'next/image'
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import{ FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import{ TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline'
import { gsap } from "gsap";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* The following plugin is a Club GSAP perk */
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import {Text} from 'troika-three-text'

import scrollingIndicator from "../../public/Arrow down.png"
import RodinPro from "../../public/FOT-RodinProL2.otf"

// Textures
import topoPattern from '../../public/topographic-pattern.png'
console.log(topoPattern)
import topoTextPattern from '../../public/topographic Pattern Text.png'
import backgroundGradient from '../../public/newtop.png'
import { text } from 'node:stream/consumers';

export default function Home() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother,ScrambleTextPlugin);


    // create the scrollSmoother before your scrollTriggers
    ScrollSmoother.create({
      smooth: 2, // how long (in seconds) it takes to "catch up" to the native scroll position
      effects: true, // looks for data-speed and data-lag attributes on elements
      smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
    });


    // Three.js Variables

    let 
    camera: THREE.PerspectiveCamera, 
    scene: THREE.Scene, 
    ambientLight: THREE.AmbientLight , 
    renderer:THREE.WebGLRenderer,
    CSSRenderer: CSS3DRenderer,
    root: THREE.Object3D


    // THREE.ColorManagement.enabled = true;
    function init() {
      

      // create root object group

      // Set Scene
      scene = new THREE.Scene();
      const axesHelper = new THREE.AxesHelper( 5 );
      scene.add( axesHelper );
      // Set Camera
      camera = new THREE.PerspectiveCamera(
        45, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near
        10000 // Far
      );

      // Set light
      var ambientLight = new THREE.AmbientLight( 0xffffff,9);
      // scene.add( new THREE.PointLightHelper( light, 10 ) )
      scene.add( ambientLight );

      let directionalLight = new THREE.DirectionalLight('#ffffff', 10)
      directionalLight.position.set(1,-5, 10)
      directionalLight.point

      scene.add(directionalLight)

      // Create a target object
      const targetObject = new THREE.Object3D();
      targetObject.position.set(0, 0, -50); // Set to the position of the geometry
      scene.add(targetObject);

      // Set the target of the light
      directionalLight.target = targetObject;

      // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
      // scene.add( helper );

      //Texture Loader
      const textureLoader = new THREE.TextureLoader()
      const textureTop = textureLoader.load(topoPattern.src)
      const textureBot = textureLoader.load(topoPattern.src)
      const textureText = textureLoader.load(topoTextPattern.src)
      const textureBG = textureLoader.load( backgroundGradient.src)

      //Text

      // Load font and create text
      const fontLoader = new FontLoader()
     

  // Create:


  // Create a div element
const element = document.createElement('p');
element.id = "dynamicText"

element.style.color = "#ffffff"

// Create a CSS3DObject
const cssObject = new CSS3DObject(element);
cssObject.position.set(0, 30,  -55);
scene.add(cssObject);



const myText = new Text()
scene.add(myText)

myText.material.transparent = true;

// Set properties to configure:
myText.text = 'Loading...'
myText.fontSize = 2
myText.color = 0xffffff;

myText.position.set(-20,-25,-50)


// Update the rendering:
myText.sync()

   let textMarquee;
   let textMarqueeDesigner
      fontLoader.load(
          "helvetiker_regular.typeface.json",
          (font) => 
          { 
              const textGeometry = new TextGeometry(
                  "FRONT END DEVELOPER", 
                  {
                      font: font,
                      size: 6,
                      depth: 1
                  
                  }
              )

              const textGeometryDesigner = new TextGeometry(
                "Designer", 
                {
                    font: font,
                    size: 2,
                    depth: 1
                
                }
            )
              textGeometry.computeBoundingBox()
              // textGeometry.translate(
              //     - (textGeometry.boundingBox.max.x - 0.02) * 0.5,
              //     - (textGeometry.boundingBox.max.y - 0.02) * 0.5,
              //     - textGeometry.boundingBox.max.z * 0.5,
              // )

              // scale x2 horizontal
              textureText.repeat.set(0.65, 1);
            // scale x2 vertical
            textureText.repeat.set(1, 0.2);
            // scale x2 proportional
            textureText.repeat.set(0.03, 0.03);
            textureText.offset.set(0.25,0.4)
            textureText.wrapS = THREE.RepeatWrapping;
            textureText.wrapT = THREE.RepeatWrapping;
              const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
              textMarquee = new THREE.Mesh(textGeometry, material )
              textMarquee.position.x = 150
              textMarquee.position.z = -30

              textMarqueeDesigner = new THREE.Mesh(textGeometryDesigner, material )
              textMarqueeDesigner.position.x = 150
              textMarqueeDesigner.position.z = -30
              scene.add(textMarqueeDesigner)
              scene.add(textMarquee)

            }
          )


      /* Topo Square start */

      let topoSquareTop = new THREE.Group
      let topoSquareBottom = new THREE.Group

      scene.add(topoSquareTop)
      scene.add(topoSquareBottom)

      let clippingConstant = -8;

      const clipPlanes = [
				new THREE.Plane( new THREE.Vector3( 0 ,-Math.PI, 0 ), clippingConstant )
			];

      //Set Shape
      const squareTopHalf = new THREE.Shape();
      const squareBotHalf = new THREE.Shape();
      
      interface ShapeObject {
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
      }

      // Define Topographic Square Size
      let topoSquareDimensions =  {
        x: 1, 
        y: 1,
        width:50,
        height: 27,
        radius: 3
      }

      function setTopHalfTopoSquare(shape: ShapeObject) {
        let { x, y, width, height, radius } = topoSquareDimensions

          shape.moveTo( x, y + radius ),
          shape.lineTo( x, y + height - radius );
          shape.quadraticCurveTo( x, y + height, x + radius, y + height );
          shape.lineTo( x + width - radius, y + height );
          shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
          shape.lineTo( x + width , y + radius );
      }

      function setBotHalfTopoSquare(shape: ShapeObject) {
        let { x, y, width, height, radius } = topoSquareDimensions

        shape.moveTo( x, y - radius ),
        shape.lineTo( x, y - height + radius );
        shape.quadraticCurveTo( x, y - height , x + radius, y - height );
        shape.lineTo( x + width - radius, y - height );
        shape.quadraticCurveTo( x + width ,y - height, x + width, y - height + radius );
         shape.lineTo( x + width  , y - radius );
      }

      setTopHalfTopoSquare(squareTopHalf)
      setBotHalfTopoSquare(squareBotHalf)

      const topoSquareTopHalfGeometry = new THREE.ShapeGeometry( squareTopHalf );
      const topoSquareBottomHalfGeometry = new THREE.ShapeGeometry( squareBotHalf );

      let topoSquareTopPosition = {
        x: -25,
        y: -3.5,
        z: -50
      }

      let topoSquareBotPosition = {
        x: -25,
        y: 2.5,
        z: -50
      }

      //Topographic Square Border
      const meshLineMaterial = new MeshLineMaterial({  color: new THREE.Color(0xffffff), // White color
        lineWidth: 1, // Adjust as needed
        transparent: true,
        opacity: 1})

      const meshLineGeometryTop = new MeshLineGeometry()
      meshLineGeometryTop.setPoints(topoSquareTopHalfGeometry,(p) => .5)
      const meshLineTop = new THREE.Mesh(meshLineGeometryTop, meshLineMaterial)
      meshLineTop.position.x = topoSquareTopPosition.x
      meshLineTop.position.y = topoSquareTopPosition.y
      meshLineTop.position.z = topoSquareTopPosition.z
      topoSquareTop.add(meshLineTop)

      const meshLineGeometryBot = new MeshLineGeometry()
      meshLineGeometryBot.setPoints(topoSquareBottomHalfGeometry,(p) => .5)
      const meshLineBot = new THREE.Mesh(meshLineGeometryBot, meshLineMaterial)
      meshLineBot.position.z = topoSquareBotPosition.z
      meshLineBot.position.x = topoSquareBotPosition.x
      meshLineBot.position.y = topoSquareBotPosition.y

      topoSquareBottom.add(meshLineBot)

      const loadingAnimationLineGeometry = new THREE.CapsuleGeometry( .1, 4, 4, 8 ); 
      const loadingAnimationLineMaterial = new THREE.MeshBasicMaterial( { opacity: 0, transparent: true } ); 
      const loadingAnimationLine1 = new THREE.Mesh( loadingAnimationLineGeometry, loadingAnimationLineMaterial );
      const loadingAnimationLine2 = new THREE.Mesh( loadingAnimationLineGeometry, loadingAnimationLineMaterial );

      loadingAnimationLine1.position.set(-27,28, -50)
      loadingAnimationLine1.rotation.z = Math.PI / 4
      
      loadingAnimationLine2.position.set(29,-26, -50)
      loadingAnimationLine2.rotation.z = Math.PI / 4
      

      scene.add(loadingAnimationLine1 )
      scene.add(loadingAnimationLine2)

       /* Topo Square end */
      
      textureTop.anisotropy =  16;
      textureBot.anisotropy =  16;
      textureText.anisotropy =  16;
      textureBG.anisotropy =  16;

      setTimeout( function() {
		
        textureTop.needsUpdate = true;
        textureBot.needsUpdate = true;
        textureText.needsUpdate = true;
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
      textureText.colorSpace = THREE.SRGBColorSpace
      textureBG.colorSpace = THREE.SRGBColorSpace

      let points = new Float32Array([ 1, 0, 0 ])

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3( 1, 36, 0 ),
        new THREE.Vector3( 11, 31, 0 ),
        new THREE.Vector3( 11, 10, 0 )
      ]);

      const curvePoints = curve.getPoints( 50 );

      var uniforms = {
          lineTexture: { value: textureBG }
      };



      // var shaderMaterial1 = new LineMaterial({
      //   color: "0xffffff",
      //   linewidth: 0.1
      // } );
			

      const squareTopMat = new THREE.MeshBasicMaterial( {map: textureTop, transparent: true, clippingPlanes: clipPlanes, clipIntersection: true     } );
      const squareBotMat = new THREE.MeshBasicMaterial( {map: textureBot, transparent: true, clippingPlanes: clipPlanes, clipIntersection: true     } );


      const squareTopMatFaded = new THREE.MeshBasicMaterial( {map: textureTop, transparent: true, opacity: 0.5    } );
      const squareBotMatFaded = new THREE.MeshBasicMaterial( {map: textureBot, transparent: true, opacity: 0.5     } );


      const squareTopHalfMesh = new THREE.Mesh( topoSquareTopHalfGeometry, squareTopMat ) ;
      const squareBotHalfMesh = new THREE.Mesh( topoSquareBottomHalfGeometry, squareBotMat) ;
      topoSquareTop.add( squareTopHalfMesh );
      topoSquareBottom.add( squareBotHalfMesh );

      const squareTopHalfMeshFaded = new THREE.Mesh( topoSquareTopHalfGeometry, squareTopMatFaded ) ;
      const squareBotHalfMeshFaded = new THREE.Mesh( topoSquareBottomHalfGeometry, squareBotMatFaded) ;
      topoSquareTop.add( squareTopHalfMeshFaded );
      topoSquareBottom.add( squareBotHalfMeshFaded );

      let pos = topoSquareTopHalfGeometry.attributes.position;
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
      topoSquareTopHalfGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      topoSquareBottomHalfGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));

    
      squareTopHalfMesh.position.x = topoSquareTopPosition.x;
      squareTopHalfMesh.position.y = topoSquareTopPosition.y;
      squareTopHalfMesh.position.z = topoSquareTopPosition.z;
      squareTopHalfMeshFaded.position.x = topoSquareTopPosition.x;
      squareTopHalfMeshFaded.position.y = topoSquareTopPosition.y;
      squareTopHalfMeshFaded.position.z = topoSquareTopPosition.z;


      squareBotHalfMesh.position.x = topoSquareBotPosition.x;
      squareBotHalfMesh.position.y = topoSquareBotPosition.y;
      squareBotHalfMesh.position.z = topoSquareBotPosition.z;
      squareBotHalfMeshFaded.position.x = topoSquareBotPosition.x;
      squareBotHalfMeshFaded.position.y = topoSquareBotPosition.y;
      squareBotHalfMeshFaded.position.z = topoSquareBotPosition.z;

      const ring = new THREE.Group();


      // Create shape logo
      const shapeLogotexture = new THREE.TextureLoader().load( "/newtop.png" );
 
      const squareLogo = new THREE.Shape();
      const circleLogo = new THREE.Shape();
      const triangleLogo = new THREE.Shape();

      let squareLogoDimensions = {
        x: 2, 
        y: 0,
        width:4,
        height: 4,
        radius: 1.2
      }


      function setSquareLogo(shape: ShapeObject) {
        const { x, y, width, height, radius } = squareLogoDimensions;
        shape.moveTo(x + radius, y);
        shape.lineTo(x + width - radius, y);
        shape.quadraticCurveTo(x + width, y, x + width, y + radius);
        shape.lineTo(x + width, y + height - radius);
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        shape.lineTo(x + radius, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - radius);
        shape.lineTo(x, y + radius);
        shape.quadraticCurveTo(x, y, x + radius, y);
        shape.lineTo(x + width - radius , y );

    }


    let circleLogoDimensions = {
      x:1, // Center x-coordinate
      y: 1, // Center y-coordinate
      radius: 2// Radius of the circle
    };
    
    function setCircleLogo(shape) {
      const { x, y, radius } = circleLogoDimensions;
    
      shape.moveTo(x + radius, y);
      shape.arc(x, y, radius, 0, Math.PI * 2);
    }

    let triangleDimensions = {
      x1: 1, y1: .12, // First vertex
      x2: 5.2, y2: .1, // Second vertex
      x3: 3.2, y3: 4.1, // Third vertex
      radius: 1.2// Radius for rounded corners
    };
    
    function setTriangleLogo(shape) {
      const { x1, y1, x2, y2, x3, y3, radius } = triangleDimensions;
    
      // Move to the starting point, offset by the radius
      shape.moveTo(x1 + radius, y1);
    
      // Draw the first edge with a rounded corner
      shape.lineTo(x2 - radius, y2);
      shape.quadraticCurveTo(x2, y2, x2 - radius * Math.cos(Math.PI / 3), y2 + radius * Math.sin(Math.PI / 3));
    
      // Draw the second edge with a rounded corner
      shape.lineTo(x3 + radius * Math.cos(Math.PI / 3), y3 - radius * Math.sin(Math.PI / 3));
      shape.quadraticCurveTo(x3, y3, x3 - radius * Math.cos(Math.PI / 3), y3 - radius * Math.sin(Math.PI / 3));
    
      // Draw the third edge with a rounded corner
      shape.lineTo(x1 + radius * Math.cos(Math.PI / 3), y1 + radius * Math.sin(Math.PI / 3));
      shape.quadraticCurveTo(x1, y1, x1 + radius, y1);

      shape.lineTo(x1 + x2 - radius - x1, y1);

    }
    

    setCircleLogo(circleLogo)
    setSquareLogo(squareLogo)
    setTriangleLogo(triangleLogo)

    const squareLogoGeometry = new THREE.ShapeGeometry( squareLogo );
    const circleLogoGeometry = new THREE.ShapeGeometry( circleLogo );
    const triangleLogoGeometry = new THREE.ShapeGeometry( triangleLogo );

    //Topographic Square Border
    const logoMaterial = new MeshLineMaterial({useMap: true, map: textureBG, lineWidth: 1 })

    const squareLogoMeshLineGeometry = new MeshLineGeometry()
    squareLogoMeshLineGeometry .setPoints(squareLogoGeometry,(p) => .6)
    const circleLogoMeshLineGeometry = new MeshLineGeometry()
    circleLogoMeshLineGeometry .setPoints(circleLogoGeometry,(p) => .6)
    const triangleLogoMeshLineGeometry = new MeshLineGeometry()
    triangleLogoMeshLineGeometry .setPoints(triangleLogoGeometry,(p) => .6)

// Helper function to create a mesh and set its position
function createMesh(geometry, material, position, rotation) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) {
      mesh.position.set(position.x || 0, position.y || 0, position.z || 0);
      mesh.rotation.set(0,rotation.y || 0,0)
  }
  return mesh;
}

// Create the logo meshes
const logoShapes = new THREE.Group();

const squareLogoMesh = createMesh(squareLogoMeshLineGeometry, logoMaterial, { x: -8.5, y: -2,z: 35},{y: -0.1});
const triangleLogoMesh = createMesh(triangleLogoMeshLineGeometry, logoMaterial, { x: -1.5, y: -2,z: 35.5 }, {y: 0});
const circleLogoMesh = createMesh(circleLogoMeshLineGeometry, logoMaterial, { x: 4, y: -2, z: 35}, {y: 0.15});

// Add the meshes to the scene (or any parent group)
logoShapes.add(squareLogoMesh);;
logoShapes.add(circleLogoMesh);
logoShapes.add(triangleLogoMesh);


ring.add(logoShapes)

    // const box = new THREE.BoxHelper( circleLogoMesh, 0xffffff );
    // const box2 = new THREE.BoxHelper( squareLogoMesh, 0xffffff );
    // const box3 = new THREE.BoxHelper( triangleLogoMesh, 0xffffff );

    // scene.add(box,box2, box3)


    



      const shapeLogoMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, map:shapeLogotexture   } );



      
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


      // Create ringBand
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


      let ringBand: THREE.Mesh;
      ringBand = new THREE.Mesh(geometry, material);
      ringBand.position.set(0, 0, 0);  // Move the group 2 units along the x-axis
      ring.position.set(0,100,-50)
      ringBand.castShadow = true;
      ringBand.receiveShadow = false;
      ring.add(ringBand)

      // Add root group to the scene
      scene.add(ring)

      
      // Setup Renderers
      CSSRenderer = new CSS3DRenderer();
      CSSRenderer.setSize(innerWidth, innerHeight);
      document.querySelector('#canvas').appendChild(CSSRenderer.domElement);
      
      // Put the mainRenderer on top
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true,  preserveDrawingBuffer: true, 
 });
 renderer.localClippingEnabled  = true;
      renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1)

      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = 0;
      renderer.domElement.style.zIndex = 1;
      renderer.setSize(innerWidth, innerHeight);
      // Enable sRGB encoding for the renderer output

      CSSRenderer.domElement.appendChild(renderer.domElement);
      

      // const controls = new OrbitControls( camera, renderer.domElement );
      // controls.update();

      camera.position.set( 0, 0, 150)

      renderer.outputColorSpace = THREE.SRGBColorSpace; // optional with post-processing
      renderer.localClippingEnabled = true;

   


        
      
  //   startScrollAnimations()
      /* Animations */
      const allowScroll = () => {
        document.body.style.overflow = "auto"; // Unlock scroll after animations

        gsap.timeline({
          scrollTrigger: {
            trigger: "#canvas",
            start: "top top",
            pin: true,
            end: "+=" + window.innerHeight * 3,
            scrub: 0.5,
  
          },
          onComplete: animate
        })
        .to(ring.position, {y: 0})
        .to(cssObject.element.style, { opacity: 0, duration: 1 })
  
        .to(topoSquareTop.position, {y: 50}, )
        .to(clipPlanes[0], { constant: 50, duration: 1 }, "<")
        .to(topoSquareBottom.position, {y: -50}, "<")
        .to(ring.rotation, {y: .2, z: 1, x: .35}, ">")
        .to(ring.position, {y: -10}, "<")
        .to(textMarquee.position , {x: -200, duration: 20}, ">")
        .to(textMarqueeDesigner.position , {x: -200, duration: 15}, "<")
        .to(ring.rotation, {
          x: "+=2", 
          y: "+=2", 
          z: "+=2", }, ">")
        .to(ring.rotation, {y: 0, z: 0, x: 0}, ">")
        .to(ring.position, {y: 0}, "<")
        .to(topoSquareTop.position, {y: 0})
        .to(topoSquareBottom.position, {y: 0}, "<")

      }

      
      ScrollTrigger.create({
        trigger: '#headline',
        start: 'top top',
        pin: true,
        endTrigger: '#otherID',
        end: 'bottom 50%+=500px',
        markers: true
    });

        // Animation loop
        function animate() {

      

          // Rotate the ring
          ring.rotation.y += 0.01; // Adjust this value for different rotation speeds

          renderer.render(scene, camera);
          
      }

     

      const clock = new THREE.Clock()
      
      // Function to animate the clipping plane constant
      // function loadingAnimation() {

      //   const elapsedTime = clock.getElapsedTime()

      //   clippingConstnpmant +=  0.01; // Adjust this value for different speeds
      //   if (clippingConstant > 8) { clippingConstant = -10; }// Reset to keep it within a range
 
      //   // Update the clipping planes
      //   if( clippingConstant > -7 ) {
      //   clipPlanes[0].constant = clippingConstant;
      //   }
      // }

      
      // function animateringBand() {
      //   if (clippingConstant > 2 && defaultringBandYIndex > 0) {
      //     ringBand.position.y -= .2; 
      //     defaultringBandYIndex -= .2; 
      //   }
      // }


      // const tick = () => {
      //   const elapsedTime = clock.getElapsedTime()
      //   console.log(elapsedTime)
      //   if(elapsedTime > 5 && ringBand.position.y > 0 ) {

      //   }
      // }


      function render() {
        requestAnimationFrame(render);

        renderer.render(scene, camera);
        CSSRenderer.render( scene, camera );

         
      }

      render();

        
        var loadingAnimation = gsap.timeline({repeat: 0, repeatDelay: 0,  onComplete: allowScroll  });
        loadingAnimation.to(myText, {duration: 1, delay: 1, text:"loading experience"} );
        loadingAnimation.to(clipPlanes[0], {constant: -8, duration: 0, ease: "slow" }, "0");
        loadingAnimation.to(loadingAnimationLineMaterial, {duration: 1, opacity: 1,ease: "slow" }, "<")
        loadingAnimation.to(loadingAnimationLine1.position , {x: 29, duration: 1, ease: "slow"}, 1);
        loadingAnimation.to(loadingAnimationLine1.rotation , {z: - Math.PI / 3.8, duration: 2}, 1);
        loadingAnimation.to(loadingAnimationLine2.position , {x: -27, duration: 1, ease: "slow"}, 1);
        loadingAnimation.to(loadingAnimationLine2.rotation , {z: - Math.PI / 3.8, duration: 2}, 1);
        loadingAnimation.to(loadingAnimationLine1.position , {y: -26, duration: 1, ease: "slow"}, 3);
        loadingAnimation.to(loadingAnimationLine1.rotation , {z: Math.PI / 4, duration: 1}, 3);
        loadingAnimation.to(loadingAnimationLine2.position , {y: 28, duration: 1, ease: "slow"}, 3);
        loadingAnimation.to(loadingAnimationLine2.rotation , {z: Math.PI / 4, duration: 1}, 3);
        loadingAnimation.to(clipPlanes[0], {constant: 6, duration: 1 }, 2);
        loadingAnimation.to(clipPlanes[0], {constant: 8, duration: 1 }, 4);
        loadingAnimation.from("#dynamicText", {duration: 1, opacity: 0 }, ">");
        loadingAnimation.to(myText.material, { opacity: 0, duration: 1 });
        loadingAnimation.to("#dynamicText", {duration: 1, scrambleText:{text:"Hello", chars:".*.*9", delimiter: " ", speed: .4, revealDelay:0.25, tweenLength:true}}, "<" )
        loadingAnimation.to("#dynamicText", {duration: 1, scrambleText:{text:"I am Taylor Ward", chars:".*.*8", delimiter: " ", speed: .4, revealDelay:0.25, tweenLength:true}}, ">" )
        loadingAnimation.from("#scrollingIndicator", {duration: 1, opacity: 0 }, "<");
  
      
      // //Helpers
      // const axesHelper = new THREE.AxesHelper(10 );
      // scene.add( axesHelper );
  
    }


    init()

    
});
  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
      <main className="flex min-h-screen flex-col items-center justify-between ">
        <div  className="rounded-lg">
          <div id="canvas"></div>

            <div className="loading-pattern rounded-lg">
    
            </div>
            <div>Content</div>
        </div>
      </main>
      </div>
      <img id="scrollingIndicator" src={scrollingIndicator.src}></img>

    </div>
  )
}

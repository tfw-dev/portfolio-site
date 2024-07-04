"use client"; 
import Image from 'next/image'
import { useEffect } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import{ FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import{ TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline'
import { gsap } from "gsap";



// Textures
import topoPattern from '../../public/topographic-pattern.png'
import topoTextPattern from '../../public/topographic Pattern Text.png'
import backgroundGradient from '../../public/newtop.png'


export default function Home() {
  useEffect(() => {
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
      root = new THREE.Object3D()

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
      root.add( ambientLight );

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

      // fontLoader.load('Rodin Pro M Regular (1).json', function (font) {
      //     const textGeometry = new TextGeometry('Hello!', {
      //         font: font,
      //         size: 5,
      //         height: 0.1,
      //         curveSegments: 10,
      //         bevelEnabled: false,
      //         bevelThickness: 0.01,
      //         bevelSize: 0.01,
      //         bevelSegments: 1
      //     });
      //     textGeometry.center()

      //     const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      //     const textMesh = new THREE.Mesh(textGeometry, textMaterial);


      //     scene.add(textMesh);
      //     textMesh.position.set(0, 25, 0);

      // });


      fontLoader.load(
          "helvetiker_regular.typeface.json",
          (font) => 
          { 
            console.log(font)
              const textGeometry = new TextGeometry(
                  "FRONT END DEVELOPER", 
                  {
                      font: font,
                      size: 6,
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
              const material = new THREE.MeshBasicMaterial({map: textureText, transparent: true })
              const text = new THREE.Mesh(textGeometry, material )
              // scene.add(text)

            }
          )


      /* Topo Square start */

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
      const meshLineMaterial = new MeshLineMaterial({useMap: true, map: textureBG})

      const meshLineGeometryTop = new MeshLineGeometry()
      meshLineGeometryTop.setPoints(topoSquareTopHalfGeometry,(p) => .5)
      const meshLineTop = new THREE.Mesh(meshLineGeometryTop, meshLineMaterial)
      meshLineTop.position.x = topoSquareTopPosition.x
      meshLineTop.position.y = topoSquareTopPosition.y
      meshLineTop.position.z = topoSquareTopPosition.z
      scene.add(meshLineTop)
      console.log(meshLineTop.position)

      console.log(topoSquareTopPosition)

      const meshLineGeometryBot = new MeshLineGeometry()
      meshLineGeometryBot.setPoints(topoSquareBottomHalfGeometry,(p) => .5)
      const meshLineBot = new THREE.Mesh(meshLineGeometryBot, meshLineMaterial)
      meshLineBot.position.z = topoSquareBotPosition.z
      meshLineBot.position.x = topoSquareBotPosition.x
      meshLineBot.position.y = topoSquareBotPosition.y

      scene.add(meshLineBot)


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
      scene.add( squareTopHalfMesh );
      scene.add( squareBotHalfMesh );

      const squareTopHalfMeshFaded = new THREE.Mesh( topoSquareTopHalfGeometry, squareTopMatFaded ) ;
      const squareBotHalfMeshFaded = new THREE.Mesh( topoSquareBottomHalfGeometry, squareBotMatFaded) ;
      scene.add( squareTopHalfMeshFaded );
      scene.add( squareBotHalfMeshFaded );

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


      // Create shape logo
      const shapeLogotexture = new THREE.TextureLoader().load( "/newtop.png" );
 
      const squareLogo = new THREE.Shape();
      const circleLogo = new THREE.Shape();
      const triangleLogo = new THREE.Shape();

      let squareLogoDimensions = {
        x: 1, 
        y: 1,
        width:3.5,
        height: 3.5,
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
      x: 2.75, // Center x-coordinate
      y: 2.75, // Center y-coordinate
      radius: 2 // Radius of the circle
    };
    
    function setCircleLogo(shape) {
      const { x, y, radius } = circleLogoDimensions;
    
      shape.moveTo(x + radius, y);
      shape.arc(x, y, radius, 0, Math.PI * 2);
    }

    let triangleDimensions = {
      x1: 0.6, y1: .7, // First vertex
      x2: 5.3, y2: .7, // Second vertex
      x3: 3, y3: 4.8, // Third vertex
      radius: 2 // Radius for rounded corners
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
    const logoMaterial = new MeshLineMaterial({useMap: true, map: textureBG})

    const squareLogoMeshLineGeometry = new MeshLineGeometry()
    squareLogoMeshLineGeometry .setPoints(squareLogoGeometry,(p) => .2)
    const circleLogoMeshLineGeometry = new MeshLineGeometry()
    circleLogoMeshLineGeometry .setPoints(circleLogoGeometry,(p) => .2)
    const triangleLogoMeshLineGeometry = new MeshLineGeometry()
    triangleLogoMeshLineGeometry .setPoints(triangleLogoGeometry,(p) => .2)

    const squareLogoMesh = new THREE.Mesh(squareLogoMeshLineGeometry, logoMaterial)
    const circleLogoMesh = new THREE.Mesh(circleLogoMeshLineGeometry, logoMaterial)
    const triangleLogoMesh = new THREE.Mesh(triangleLogoMeshLineGeometry, logoMaterial)


    squareLogoMesh.position.set (-8, -3, 0)

    circleLogoMesh.position.set (0, -5.5, 0)
    triangleLogoMesh.position.set (-2, -2.5, 0)

    
    // scene.add(circleLogoMesh)
    // scene.add(squareLogoMesh)
    // scene.add(triangleLogoMesh)




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

      let defaultRingYIndex = 100
      let ring: THREE.Mesh;
      ring = new THREE.Mesh(geometry, material);
      ring.position.z = -50
      ring.position.y = defaultRingYIndex
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
      // Enable sRGB encoding for the renderer output

        // Enable ACES tone mapping
      CSSRenderer.domElement.appendChild(renderer.domElement);
      

      // const controls = new OrbitControls( camera, renderer.domElement );

      //controls.update() must be called after any manual changes to the camera's transform
      camera.position.set( 0, 0, 100)
      // controls.update();
      renderer.outputColorSpace = THREE.SRGBColorSpace; // optional with post-processing
      renderer.localClippingEnabled = true;

      /* Scroll */
      let scrollY = window.scrollY

      window.addEventListener('scroll', () => {
        scrollY = window.scrollY
      })


      /* Animations */

      const clock = new THREE.Clock()
      
      // Function to animate the clipping plane constant
      // function loadingAnimation() {

      //   const elapsedTime = clock.getElapsedTime()

      //   clippingConstant +=  0.01; // Adjust this value for different speeds
      //   if (clippingConstant > 8) { clippingConstant = -10; }// Reset to keep it within a range
 
      //   // Update the clipping planes
      //   if( clippingConstant > -7 ) {
      //   clipPlanes[0].constant = clippingConstant;
      //   }
      // }

      
      // function animateRing() {
      //   if (clippingConstant > 2 && defaultRingYIndex > 0) {
      //     ring.position.y -= .2; 
      //     defaultRingYIndex -= .2; 
      //   }
      // }


      const tick = () => {
        const elapsedTime = clock.getElapsedTime()
        console.log(elapsedTime)
        if(elapsedTime > 5 && ring.position.y > 0 ) {

        }
      }


      function render() {
        renderer.render(scene, camera);
        CSSRenderer.render( scene, camera );

        requestAnimationFrame(render);
        // Animate the clipping plane constant
        
        window.requestAnimationFrame(tick)
       
        CSSRenderer.render( scene, camera );
  
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
             <h1>hello</h1>
          
       <div  className="rounded-lg">
        <div id="css"></div>

          <div className="loading-pattern rounded-lg">
  
          </div>
       </div>
    </main>
  )
}

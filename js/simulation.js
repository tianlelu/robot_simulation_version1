//import Math;
var camera, scene, renderer;
var robot, plane, skybox;
var controls;
var light;
var ambientlight;
var thirdPerson; 
var directionalLight;
var distancex;
var distancey;
var distance;

var outsideGeo, outsideMaterial;
var outsideMesh;
var cubeGeo, cubeMaterial;
var cubeMesh;

var invisiblePlane;
var raycaster;
var mouse;

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var WIDTH = 500, HEIGHT = 500;
var step = 100;
var size = 1000;

shiftDown = false;

var objects = [];

//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


function initCamera(){

    var FOV = 75,
        ASPECT_RATIO = window.innerWidth / window.innerHeight,
        NEAR = 0.1,
        FAR = 10000; 

    camera = new THREE.PerspectiveCamera( FOV, ASPECT_RATIO, NEAR, FAR );
    
    camera.rotation.z = (Math.PI);
    camera.rotation.y = (Math.PI);
    // had to rotate camera angles due to odd inversion after adding as child element of robot
    camera.position.set(0,100,-150);
    thirdPerson = true;

}

function initEnvironment(){
    
    // Plane
    var planeTexture = new THREE.ImageUtils.loadTexture( '/images/checkerboard.jpg');
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set ( 10,10 );
    
    var planeGeometry = new THREE.PlaneGeometry( 1000,1000, 10, 10);
    
    var planeMaterial = new THREE.MeshBasicMaterial ( { map: planeTexture, side: THREE.DoubleSide } )
    plane = new THREE.Mesh ( planeGeometry, planeMaterial );
    
    plane.position.z = 13.5;
    
// Light
//
//    light = new THREE.PointLight( 0xffffff, 10 );
//    light.position.x = -100;
//    light.position.y = -200;
//    light.position.z = 300;
    
    ambientLight = new THREE.AmbientLight( 0x606060 );
    
    directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( -1, -1, -1 ).normalize();
    
    // Skybox
    
    //var skyboxGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
	//var skyboxMaterial = new THREE.MeshBasicMaterial( { color: 0x9e9e9e, side: THREE.BackSide } );
	//skybox = new THREE.Mesh( skyboxGeometry, skyboxMaterial );
    
}

function initObjects(){
    
    // Robot
    var robotGeometry = new THREE.CylinderGeometry( 50, 50, 25, 32 );
	var robotGeometry1 = new THREE.CylinderGeometry( 50, 50, 25, 32 );
    var robotMaterial = new THREE.MeshLambertMaterial ( { color: 0xCFD8DC } )
	var robotMaterial1 = new THREE.MeshLambertMaterial ( { color: 0xffcb05 } )
    robot = new THREE.Mesh( robotGeometry, robotMaterial );
	robot1 = new THREE.Mesh( robotGeometry, robotMaterial );
    
}

function initScene(){
    scene = new THREE.Scene();
    
    scene.fog = new THREE.FogExp2( 0xffffff, 0.00025 );


    //scene.backgroundColor = new THREE.color(0xffffff);
    scene.add( robot );
	scene.add(robot1)
    robot.lookAt(new THREE.Vector3(0,1,0));
	robot1.lookAt (new THREE.Vector3(0,1,0));
    robot1.position.set(200,300,0);
    robot.add( camera );
   // scene.add( plane );
    scene.add( light );
    scene.add( ambientlight );
    scene.add( skybox );
    scene.add( directionalLight );
    
    outsideGeo = new THREE.BoxGeometry( 100, 100, 100 );
    outsideMaterial = new THREE.MeshBasicMaterial( {color:0xff0000, opacity: 0.5, transparent: true});
    outsideMesh = new THREE.Mesh(outsideGeo, outsideMaterial);
    scene.add(outsideMesh);
    
    
    cubeGeo = new THREE.BoxGeometry(100, 100, 100);
    cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( "textures/texture.png" ) } );
    
    
    
    var geometry = new THREE.Geometry();
    for ( var i = - size; i <= size; i += step ) {
					geometry.vertices.push( new THREE.Vector3( - size, i, 0 ) );
					geometry.vertices.push( new THREE.Vector3(   size, i, 0 ) );
					geometry.vertices.push( new THREE.Vector3( i, -size, 0 ) );
					geometry.vertices.push( new THREE.Vector3( i, size, 0 ) );
    }
    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );
    var line = new THREE.LineSegments( geometry, material );
    scene.add( line );
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    var planeBuffer = new THREE.PlaneBufferGeometry( size * 2, size * 2 );
    invisiblePlane = new THREE.Mesh(planeBuffer, new THREE.MeshBasicMaterial( { visible: false, color: 0x996600 } ));
    planeBuffer.rotateX( - Math.PI );
    
    scene.add(invisiblePlane);
    objects.push(invisiblePlane);
    
    
    
    renderer = new THREE.WebGLRenderer(); 
    renderer.setClearColor( 0xf0f0f0 );
    container = document.getElementById( 'simulation' );
    
    
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement ); 
    
    
    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener( 'mousedown', mouseDown, false );
    document.addEventListener('keydown', addBlockKeyDown, false);
    document.addEventListener('keyup', addBlockKeyUp, false);

}




//function mouseDown(event){
//    renderer.setClearColor( 0xfff0f0 );
//    render();
//}


function mouseMove( event ){
//  
    event.preventDefault();
    
    mouse.set( (event.clientX/window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    
    raycaster.setFromCamera(mouse, camera);
    
    var intersects = raycaster.intersectObjects(objects);
    //
    if (intersects.length > 0){
       // renderer.setClearColor( 0xfff0f0 );
        var intersect = intersects[0];
        outsideMesh.position.copy( intersect.point ).add(intersect.face.normal);
        outsideMesh.position.divideScalar( 100 ).floor().multiplyScalar( 100 ).addScalar( 50 );
        
        if (shiftDown){
            
             renderer.setClearColor( 0xfff0f0 );
            
        }
        
        
    }
   //render();
            
}

function mouseDown( event ) {
//
   
}



function init(){
    
    initCamera();
    initEnvironment();
    initObjects();
    initScene();
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.minDistance = 300;
    controls.maxDistance = 2000;
    animate();
    
    
    
    // create the outside box

}

//window.addEventListener( 'resize', onWindowResize, false );


function render() {
    renderer.render( scene, camera );
    requestAnimationFrame( render );
    update();
    update1();
    
}

init();
//animate();
render();

var delta = clock.getDelta();
var moveDistance = 20;
var rotateAngle = Math.PI / 2 * delta;


function update() {
    
    // Continuous controls
    if (keyboard.pressed("A")) {
        robot.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle * 1200 );
    }
    else if (keyboard.pressed("D")) {
        robot.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle * 1200 );
    }
    else if (keyboard.pressed("W")){
        //robotVelY = robotSpeed;
       
       
        robot.translateZ( moveDistance );
        
            if( (robot.position.x) > size - 50)
            {
                robot.position.x = size - 50;
            }
        if((robot.position.x) < -size + 50)
            {
                robot.position.x = -size + 50;
            }
        if( (robot.position.y) > size -50)
            {
                robot.position.y = size - 50;
            }
        if( (robot.position.y) < -size + 50)
            {
                robot.position.y = -size + 50;
            }
        distancex= (robot.position.x - robot1.position.x);
        distancey= (robot.position.y - robot1.position.y);
        
        distance = (distancex*distancex + distancey*distancey);
         if( distance < 10000 )
             {
                  robot.translateZ( -moveDistance );
             }
         
    }
    else if (keyboard.pressed("S")){
        //robotVelY = -robotSpeed;
    
        robot.translateZ( -moveDistance );
         if( (robot.position.x) > size - 50)
            {
                robot.position.x = size - 50;
            }
        if((robot.position.x) < -size + 50)
            {
                robot.position.x = -size + 50;
            }
        if( (robot.position.y) > size -50)
            {
                robot.position.y = size - 50;
            }
        if( (robot.position.y) < -size + 50)
            {
                robot.position.y = -size + 50;
            }
        distancex= Math.abs(robot.position.x - robot1.position.x);
        distancey= Math.abs(robot.position.y - robot1.position.y);      
        distance = (distancex*distancex + distancey*distancey);
         if( distance < 10000 )
             {
                 robot.translateZ( moveDistance );
             }
    }
    
    //add block * TRY
   
}


function update1() {
    
    // Continuous controls
    if (keyboard.pressed("J")) {
        robot1.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle * 600 );
    }
    else if (keyboard.pressed("L")) {
        robot1.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle * 600 );
    }
    else if (keyboard.pressed("I")){
        //robotVelY = robotSpeed;
       
        robot1.translateZ( moveDistance );
        
         if( (robot1.position.x) > size - 50)
            {
                robot1.position.x = size - 50;
            }
        if((robot1.position.x) < -size + 50)
            {
                robot1.position.x = -size + 50;
            }
        if( (robot1.position.y) > size -50)
            {
                robot1.position.y = size - 50;
            }
        if( (robot1.position.y) < -size + 50)
            {
                robot1.position.y = -size + 50;
            }
        distancex= (robot.position.x - robot1.position.x);
        distancey= (robot.position.y - robot1.position.y);
        
        distance = (distancex*distancex + distancey*distancey);
         if( distance < 10000 )
             {
                  robot1.translateZ( -moveDistance );
             }
        
        //  {
        //       robot.position.x -= moveDistance;
        //     robot.position.y -= moveDistance;
        //}
          
         
    }
    else if (keyboard.pressed("K")){
        //robotVelY = -robotSpeed;
    
        robot1.translateZ( -moveDistance );
        
         if( (robot1.position.x) > size - 50)
            {
                robot1.position.x = size - 50;
            }
        if((robot1.position.x) < -size + 50)
            {
                robot1.position.x = -size + 50;
            }
        if( (robot1.position.y) > size -50)
            {
                robot1.position.y = size - 50;
            }
        if( (robot1.position.y) < -size + 50)
            {
                robot1.position.y = -size + 50;
            }
        distancex= Math.abs(robot.position.x - robot1.position.x);
        distancey= Math.abs(robot.position.y - robot1.position.y);      
        distance = (distancex*distancex + distancey*distancey);
         if( distance < 10000 )
             {
                 robot1.translateZ( moveDistance );
             }
    }
}

function animate(){
    requestAnimationFrame( animate );
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function changeCamera() {
    if (thirdPerson){
    controls.object.position.setLength( 2000 );
       // camera.position.set(0,0,0);
        thirdPerson = false; 
    }
    else {
    controls.object.position.setLength( 300 );
        //controls.Distance = 300;
       // camera.position.set(0,-50,-150);
        thirdPerson = true;
    }
}


function addBlockKeyDown(event){
   // renderer.setClearColor( 0xfff0f0 );
    switch (event.keycode){
            
        case 16: shiftDown = true;break;
    }
}


function addBlockKeyUp(event){
    switch (event.keycode){
        case 16: shiftDown = false;break;
    }
}



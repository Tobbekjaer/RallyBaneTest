// Create Konva stage and layer
var sceneWidth = 948 * 2;
var sceneHeight = 632 * 2;

var signs = [];
var elements = [];
var arrows = [];

var backgroundLayer = new Konva.Layer();
var signLayer = new Konva.Layer();
var arrowLayer = new Konva.Layer();

var stage = new Konva.Stage({
    container: 'trackContainer', // ID of the container <div>
    width: sceneWidth,
    height: sceneHeight,
});

function fitStageIntoParentContainer() {
    var container = document.querySelector('#trackContainer');
    // now we need to fit stage into parent container
    var containerWidth = container.offsetWidth;

    // but we also make the full scene visible
    // so we need to scale all objects on canvas
    var scale = containerWidth / sceneWidth;

    stage.width(sceneWidth * scale);
    stage.height(sceneHeight * scale);
    stage.scale({ x: scale, y: scale });
}
fitStageIntoParentContainer();
// adapt the stage on any window resize
window.addEventListener('resize', fitStageIntoParentContainer);

// IMAGE FUNCTIONALITY //

// Add background image to the stage
var backgroundImage = new Image();
backgroundImage.src = '/images/RallyBane.png'; // Path to the background image
backgroundImage.onload = function() {
    var background = new Konva.Image({
        image: backgroundImage,
        width: sceneWidth,
        height: sceneHeight,        
    });
    backgroundLayer.add(background);
    background.moveToBottom();
    backgroundLayer.draw();
};

stage.add(backgroundLayer);
stage.add(arrowLayer);
stage.add(signLayer);


// DRAG AND DROP FUNCTIONALITY //

// Handle drag and drop for sign images inside accordion containers
document.querySelectorAll('.obstacle-image, .obstacleElement-image').forEach(function (image) {
    image.addEventListener('dragstart', function (e) {
        // Set the image source as drag data
        e.dataTransfer.setData('text/plain', e.target.src);
        // Set custom data attribute to mark the source container
        if (image.classList.contains('obstacle-image')) {
            e.dataTransfer.setData('sourceContainer', 'obstacle-image');
        } else if (image.classList.contains('obstacleElement-image')) {
            e.dataTransfer.setData('sourceContainer', 'obstacleElement-image');
        }
    });
});

// Handle dragging over the container
stage.container().addEventListener('dragover', function(e) {
    e.preventDefault();
});
// Handle dropping inside the container
stage.container().addEventListener('drop', function(e) {
    e.preventDefault();
    // Get the dropped image source from drag data
    let itemURL = e.dataTransfer.getData('text/plain');

    // We find pointer position by registering it manually
    stage.setPointersPositions(e);
    let position = stage.getPointerPosition();
    let positionScaled = {
        x: position.x / stage.scaleX(),
        y: position.y / stage.scaleY()
    };

    let sourceContainer = e.dataTransfer.getData('sourceContainer');
    let isElement = false;
    if (sourceContainer === 'obstacleElement-image') {
        isElement = true;
    }
    // Create Konva image from dropped URL
    createSign(isElement, itemURL, positionScaled, 0);
});

// ARROW FUNCTIONALITY //
function createArrow(startSign, endSign) {
    var startPos = startSign.position();
    var endPos = endSign.position();
    var dx = endPos.x - startPos.x;
    var dy = endPos.y - startPos.y;
    var angle = Math.atan2(dy, dx);

    var radius = 20;

    var arrow = new Konva.Arrow({
        x: startPos.x,
        y: startPos.y,
        points: [0, 0, Math.sqrt(dx * dx + dy * dy), 0],
        pointerLength: 10,
        pointerWidth: 10,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 2,
        rotation: angle * (180 / Math.PI)
    });
    arrows.push(arrow);
    arrowLayer.add(arrow);
    arrowLayer.batchDraw();
}

function updateArrows() {
    for (var i = 0; i < arrows.length; i++) {
        arrows[i].destroy();
    }
    for (var i = 0; i < signs.length - 1; i++) {
        var startSign = signs[i];
        var endSign = signs[i + 1];
        createArrow(startSign, endSign);
    }
}

// ---- SEQUENCE TABLE ----
function updateSignSequenceTable() {
    var table = document.getElementById("sign-sequence").getElementsByTagName('table')[0];
    table.innerHTML = "";
    var row = table.insertRow(0); // Insert a single row
    for (var i = 0; i < signs.length; i++) {        
        let signId = signs[i].id();
        if (signId > 2) {
            var cell = row.insertCell(row.cells.length); // Insert cells horizontally
            cell.innerHTML = " " + (row.cells.length) + ": Skilt: " + signId + " ";
        }       
    }
    updateArrows();
}

function clearSequenceTable() {
    var table = document.getElementById("sign-sequence").getElementsByTagName('table')[0];
    table.innerHTML = "";
}

// ---- CREATE Sign ----
function createSign(isElement, itemURL, position, rotation) {
    let signId;
    if (!isElement) {
    let filename = itemURL.substring(itemURL.lastIndexOf("/") + 1);
    signId = filename.match(/\d+/)[0];
    // Check if there's already a sign at the dropped position
    var existingSign = signs.find(function (sign) {
        var signX = sign.x() - sign.width() / 2;
        var signY = sign.y() - sign.height() / 2;
        var signWidth = sign.width();
        var signHeight = sign.height();

        return position.x >= signX && position.x <= signX + signWidth &&
            position.y >= signY && position.y <= signY + signHeight;
    });

    if (existingSign) {
        var img = new Image();
        img.onload = function () {
            existingSign.image(img);
            existingSign.id(signId);
            setSignBorderStroke(existingSign);
            updateSignSequenceTable(existingSign);
        };
        img.src = itemURL;
        return;
    }
    }
    Konva.Image.fromURL(itemURL, function (image) {        
        image.width(sceneWidth / 10);
        image.height(sceneHeight / 10);        
        image.offsetX(image.width() / 2);
        image.offsetY(image.height() / 2);
        image.dragBoundFunc(function (pos) {
            var newX = Math.max(stage.x() + image.width() / 4, Math.min(stage.x() + stage.width() - image.width() / 4, pos.x));
            var newY = Math.max(stage.y() + image.height() / 4, Math.min(stage.y() + stage.height() - image.height() / 4, pos.y));
            return {
                x: newX,
                y: newY
            }
        });
        image.position(position);
        image.rotation(rotation);
        image.draggable(true); 

        if (isElement) {
            image.name("Element");
            elements.push(image);
        } else {
            image.id(signId);
            setSignBorderStroke(image);
            image.strokeWidth(image.width()/15);
            image.name("Sign");
            signs.push(image);
            updateArrows();
            updateSignSequenceTable();
        }
        // Add image to layer
        signLayer.add(image);

        // Attach Transformer to the image with rotation only
        var transformer = new Konva.Transformer({
            centeredScaling: true,
            rotationSnaps: [0, 90, 180, 270],
            resizeEnabled: false
        });
       
        signLayer.add(transformer);
        transformer.nodes([image]);

        // Event listener to show/hide Transformer when image is clicked
        image.on('click', function (evt) {
            var isSelected = transformer.nodes().includes(image);
            transformer.nodes(isSelected ? [] : [image]); // Toggle selection
            signLayer.batchDraw();
            evt.cancelBubble = true;
        });

        // Event listener to clear selection when clicking away from the selected image or stage
        stage.on('click', function (evt) {
            // Check if the clicked target is not the image or stage
            if (evt.target === stage || !image.isAncestorOf(evt.target)) {
                transformer.nodes([]); // Clear selection for all images
                signLayer.batchDraw();
            }
        });

        // Event listener to destroy the image on double tap
        image.on('dblclick dbltap', function () {
            deleteSign(this);
        });
        image.on('dragmove', function () {
            updateArrows();
            image.moveToTop();
        });
        // Batch draw to update the stage
        signLayer.batchDraw();
    });
}

function deleteSign(sign) {
    getSignTransformer(sign).destroy();
    let signPlace = signs.indexOf(sign);
    if (signPlace !== -1) {
        signs.splice(signPlace, 1); // Remove the image from the signs array
        updateSignSequenceTable();
    }
    sign.destroy();
    signLayer.batchDraw();
}

function getSignTransformer(sign) {
    var transformer = signLayer.find('Transformer').filter(function (tr) {
        return tr.nodes()[0] === sign;
    })[0];

    return transformer;
}

function setSignBorderStroke(sign) {
    let id = sign.id();
    if (id < 3) {
        sign.stroke('black');
    } else if (id >= 3 && id < 100) {
        sign.stroke('green');
    } else if (id >= 100 && id < 200) {
        sign.stroke('blue');
    } else if (id >= 200 && id < 300) {
        sign.stroke('yellow');
    } else if (id >= 300) {
        sign.stroke('red');
    }
}

// ---- CLEAR ----
function clearStage() {
    signs = [];
    elements = [];
    var children = signLayer.children;
    for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (child.name() === 'Element' || child.name() === 'Sign' || child.getClassName() == 'Transformer') {
            child.destroy();
        }
    }
    clearSequenceTable();
    updateArrows();
}

// ---- SAVE ----
function saveToJSON() {
    var konvaData = [];
    var trackName = document.getElementById('track-name').value;
    konvaData.push(trackName);

    var children = signLayer.children;
    for (var i = 0; i < children.length; i++) {
        var shape = children[i];
        if (shape.name() === 'Sign') {
            var data = {
                id: shape.id(),
                name: shape.name(),
                height: shape.height(),
                rotation: shape.rotation(),
                stroke: shape.stroke(),
                strokeWidth: shape.strokeWidth(),
                offsetX: shape.offsetX(),
                offsetY: shape.offsetY(),
                x: shape.x(),
                y: shape.y(),
                src: shape.attrs.image.src,
                draggable: 'true',
            };
            konvaData.push(data);
        } else if (shape.name() === 'Element') {            
            var data = {
                name: shape.name(),
                height: shape.height(),
                rotation: shape.rotation(),
                offsetX: shape.offsetX(),
                offsetY: shape.offsetY(),
                x: shape.x(),
                y: shape.y(),
                src: shape.attrs.image.src,
                draggable: 'true',
            };
            konvaData.push(data);
        }
    }

    var jsonData = JSON.stringify(konvaData, null, 2);

    var blob = new Blob([jsonData], { type: "application/json" });

    var a = document.createElement('a');
    a.download = 'konva_data.json';
    a.href = window.URL.createObjectURL(blob);
    a.click();
}

// ---- LOAD ----
function loadFromJSON(jsonData) {
    clearStage();
    var jsonArray = JSON.parse(jsonData);    

    var trackName = jsonArray[0];
    document.getElementById('track-name').value = trackName;

    jsonArray.forEach(obj => {
        let itemURL = obj.src;
        let position = {
            x: obj.x,
            y: obj.y
        };
        let rotation = obj.rotation;
        let isElement = false;
        if (obj.name === 'Element') {
            isElement = true;
        }
        createSign(isElement, itemURL, position, rotation);
    });
}
function handleFileInputChange(event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        var jsonData = event.target.result;
        loadFromJSON(jsonData);
    };
    reader.readAsText(file);
}
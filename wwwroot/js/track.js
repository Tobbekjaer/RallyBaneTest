// Create Konva stage and layer
var sceneWidth = 948 * 2;
var sceneHeight = 632 * 2;

var signSequence = [];

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

var imageLayer = new Konva.Layer();

// Add background image to the stage
var backgroundImage = new Image();
backgroundImage.src = '/images/RallyBane.png'; // Path to the background image
backgroundImage.onload = function() {
    var background = new Konva.Image({
        image: backgroundImage,
        width: sceneWidth,
        height: sceneHeight,        
    });
    imageLayer.add(background);
    background.moveToBottom();
    imageLayer.draw();
};

stage.add(imageLayer);


// DRAG AND DROP FUNCTIONALITY //

// Handle drag and drop for sign images inside accordion containers
document.querySelectorAll('.obstacle-image').forEach(function(image) {
    image.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', e.target.src); // Set the image source as drag data
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
    
    // Create Konva image from dropped URL
    createSign(itemURL, positionScaled, 0);
    
});

// ARROW FUNCTIONALITY //
var arrow;
stage.on('dblclick dbltap', function() {
    const stagePos = stage.getPointerPosition();
    const containerPos = stage.container().getBoundingClientRect();

    // Calculate the offset between the stage position and the container position
    const offsetX = stagePos.x - containerPos.left;
    const offsetY = stagePos.y - containerPos.top;

    // Create the arrow at the stage position but set its logical position relative to the container
    arrow = new Konva.Arrow({
        pointerLength: 15,
        pointerWidth: 12,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 3,
        draggable: true,
        x: stagePos.x,
        y: stagePos.y,
        points: [0, 0, 60, 0], // Set points relative to arrow's logical position // [pos.x, pos.y, pos.x + 60, pos.y]
    });
    var tr = new Konva.Transformer({
        enabledAnchors: ['top-center'], // Enable only the rotate anchor
        rotateAnchorOffset: 40, // Set rotation handle position
    });
    imageLayer.add(tr);
    tr.nodes([arrow]);

    // Event listener to show/hide Transformer when arrow is clicked
    arrow.on('click', function(evt) {
        var isSelected = tr.nodes().includes(arrow);
        tr.nodes(isSelected ? [] : [arrow]); // Toggle selection
        imageLayer.batchDraw();

        evt.cancelBubble = true;
    });

    // Event listener to clear selection when clicking away from the selected arrow or stage
    stage.on('click', function(evt) {
        // Check if the clicked target is not the arrow or stage
        if (evt.target === stage || !arrow.isAncestorOf(evt.target)) {
            tr.nodes([]); // Clear selection for all arrows
            imageLayer.batchDraw();
        }
    });

    // Event listener to destroy the arrow on double tap
    arrow.on('dblclick dbltap', function() {
        tr.destroy();
        this.destroy();
        imageLayer.batchDraw();
    });

    imageLayer.add(arrow);
    imageLayer.batchDraw();
});

// ---- SEQUENCE TABLE ----
function updateSignSequenceTable() {
    var table = document.getElementById("sign-sequence").getElementsByTagName('table')[0];
    table.innerHTML = "";
    var row = table.insertRow(0); // Insert a single row
    for (var i = 0; i < signSequence.length; i++) {        
        let signId = signSequence[i].id();
        var cell = row.insertCell(i); // Insert cells horizontally
        cell.innerHTML = " " + (i + 1) + ": Skilt: " + signId + " ";
    }
}

function clearSequenceTable() {
    var table = document.getElementById("sign-sequence").getElementsByTagName('table')[0];
    table.innerHTML = "";
}

// ---- CREATE Sign ----
function createSign(itemURL, position, rotation) {
    // Check if there's already a sign at the dropped position
    var existingSign = signSequence.find(function (sign) {
        var signX = sign.x() - sign.width() / 2;
        var signY = sign.y() - sign.height() / 2;
        var signWidth = sign.width();
        var signHeight = sign.height();

        return position.x >= signX && position.x <= signX + signWidth &&
            position.y >= signY && position.y <= signY + signHeight;
    });

    if (existingSign) {
        position = existingSign.position();
        rotation = existingSign.rotation();
        getSignTransformer(existingSign).destroy();
        existingSign.destroy();
        var index = signSequence.indexOf(existingSign);
        signSequence.splice(index, 1);
    }

    Konva.Image.fromURL(itemURL, function (image) {
        image.name("Sign");
        image.width(sceneWidth / 10);
        image.height(sceneHeight / 10);
        image.stroke('black');
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
        let filename = itemURL.substring(itemURL.lastIndexOf("/") + 1);
        let signId = filename.match(/\d+/)[0]
        image.id(signId);
        signSequence.push(image);
        updateSignSequenceTable();

        // Add image to layer
        imageLayer.add(image);

        // Attach Transformer to the image with rotation only
        var transformer = new Konva.Transformer({
            centeredScaling: true,
            rotationSnaps: [0, 90, 180, 270],
            resizeEnabled: false,
        });
        imageLayer.add(transformer);
        transformer.nodes([image]);

      

        // Event listener to show/hide Transformer when image is clicked
        image.on('click', function (evt) {
            var isSelected = transformer.nodes().includes(image);
            transformer.nodes(isSelected ? [] : [image]); // Toggle selection
            imageLayer.batchDraw();
            evt.cancelBubble = true;
        });

        // Event listener to clear selection when clicking away from the selected image or stage
        stage.on('click', function (evt) {
            // Check if the clicked target is not the image or stage
            if (evt.target === stage || !image.isAncestorOf(evt.target)) {
                transformer.nodes([]); // Clear selection for all images
                imageLayer.batchDraw();
            }
        });

        // Event listener to destroy the image on double tap
        image.on('dblclick dbltap', function () {
            deleteSign(this);
        });

        // Batch draw to update the stage
        imageLayer.batchDraw();
    });
}

function deleteSign(sign) {
    getSignTransformer(sign).destroy();
    let signPlace = signSequence.indexOf(sign);
    if (signPlace !== -1) {
        signSequence.splice(signPlace, 1); // Remove the image from the signSequence array
        updateSignSequenceTable();
    }
    sign.destroy();
    imageLayer.batchDraw();
}

function getSignTransformer(sign) {
    var transformer = imageLayer.find('Transformer').filter(function (tr) {
        return tr.nodes()[0] === sign;
    })[0];

    return transformer;
}

// ---- CLEAR ----
function clearStage() {
    signSequence = [];
    var children = imageLayer.children;
    for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (child.name() === 'Sign' || child.getClassName() == 'Transformer') {
            child.destroy();
        }
    }
    clearSequenceTable();
}

// ---- SAVE ----
function saveToJSON() {
    var konvaData = [];

    var children = imageLayer.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].name() === 'Sign') {
            var shape = children[i];

            var data = {
                id: shape.id(),
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
    idCount = jsonArray.length;
    jsonArray.forEach(obj => {
        let itemURL = obj.src;
        let position = {
            x: obj.x,
            y: obj.y
        };
        let rotation = obj.rotation;
        let sign = createSign(itemURL, position, rotation);
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
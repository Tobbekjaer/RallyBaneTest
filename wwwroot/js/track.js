// Create Konva stage and layer

var stage = new Konva.Stage({
    container: 'trackContainer', // ID of the container <div>
    width: window.innerWidth / 3,
    height: window.innerHeight / 3,
});
// IMAGE FUNCTIONALITY //

var imageLayer = new Konva.Layer();

var text = new Konva.Text({
    x: 5,
    y: 5,
});

imageLayer.add(text);

// Add background image to the stage
var backgroundImage = new Image();
backgroundImage.src = '/images/RallyBane.png'; // Path to the background image
backgroundImage.onload = function() {
    var background = new Konva.Image({
        image: backgroundImage,
        width: stage.width(),
        height: stage.height(),
    });
    imageLayer.add(background);
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

var idCount = 0;
var signSequence = [];
// Handle dropping inside the container
stage.container().addEventListener('drop', function(e) {
    e.preventDefault();

    // Get the dropped image source from drag data
    var itemURL = e.dataTransfer.getData('text/plain');

    // We find pointer position by registering it manually
    stage.setPointersPositions(e);
    var pointerPos = stage.getPointerPosition();
    
    // Create Konva image from dropped URL
    Konva.Image.fromURL(itemURL, function(image) {
        var aspectRatio = image.image().height / image.image().width;
        var newWidth = 40 / aspectRatio;
        image.width(newWidth);
        image.height(40);
        image.offsetX(image.width() / 2);
        image.offsetY(image.height() / 2);
        image.dragBoundFunc(function (pos) {
            var newX = Math.max(stage.x() + image.width() / 2, Math.min(stage.x() + stage.width() - image.width() / 2, pos.x));
            var newY = Math.max(stage.y() + image.height() / 2, Math.min(stage.y() + stage.height() - image.height() / 2, pos.y));
            return {
                x: newX,
                y: newY
            }
        });
        image.position(pointerPos);
        image.draggable(true);
        image.id(idCount);
        idCount++;
        signSequence.push(image);
        updateSignSequenceTable();

        // Add image to layer
        imageLayer.add(image);

        // Attach Transformer to the image with rotation only
        var transformer = new Konva.Transformer({
            enabledAnchors: ['rotate'], // Enable only the rotate anchor
            rotateAnchorOffset: 40, // Set rotation handle position
        });
        imageLayer.add(transformer);
        transformer.nodes([image]);

        // Update text on drop
        updateText(pointerPos, image);

        // Batch draw to update the stage
        imageLayer.batchDraw();

        // Event listener to show/hide Transformer when image is clicked
        image.on('click', function(evt) {
            var isSelected = transformer.nodes().includes(image);
            transformer.nodes(isSelected ? [] : [image]); // Toggle selection
            imageLayer.batchDraw();
            evt.cancelBubble = true;
        });

        // Event listener to clear selection when clicking away from the selected image or stage
        stage.on('click', function(evt) {
            // Check if the clicked target is not the image or stage
            if (evt.target === stage || !image.isAncestorOf(evt.target)) {
                transformer.nodes([]); // Clear selection for all images
                imageLayer.batchDraw();
            }
        });

        // Event listener to update text on drag
        image.on('dragmove', function() {
            updateText(image.position(), image);
        });

        // Event listener to update text on rotation
        image.on('transform', function() {
            updateText(image.position(), image);
        });

        // Event listener to destroy the image on double tap
        image.on('dblclick dbltap', function() {
            transformer.destroy();
            this.destroy();
            text.text('');
            imageLayer.batchDraw();
        });
    });
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
        enabledAnchors: ['rotate'], // Enable only the rotate anchor
        rotateAnchorOffset: 40, // Set rotation handle position
    });
    imageLayer.add(tr);
    tr.nodes([arrow]);

    updateText(arrow.position(), arrow);

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

    // Event listener to update text on drag
    arrow.on('dragmove', function() {
        updateText(arrow.position(), arrow);
    });

    // Event listener to update text on rotation
    arrow.on('transform', function() {
        updateText(arrow.position(), arrow);
    });

    // Event listener to destroy the arrow on double tap
    arrow.on('dblclick dbltap', function() {
        tr.destroy();
        this.destroy();
        text.text('');
        imageLayer.batchDraw();
    });

    imageLayer.add(arrow);
    imageLayer.batchDraw();
});

// Function to update text
function updateText(position, obj) {
    var lines = [
        'x: ' + position.x.toFixed(2),
        'y: ' + position.y.toFixed(2),
        'rotation: ' + obj.rotation().toFixed(2),
    ];
    text.text(lines.join('\n'));
    imageLayer.batchDraw();
}

function updateSignSequenceTable() {
    var table = document.getElementById("sign-sequence").getElementsByTagName('table')[0];
    table.innerHTML = "";
    var row = table.insertRow(0); // Insert a single row
    for (var i = 0; i < signSequence.length; i++) {
        let path = signSequence[i].attrs.image.src;
        let filename = path.substring(path.lastIndexOf("/") + 1);
        let signId = filename.match(/\d+/)[0];
        var cell = row.insertCell(i); // Insert cells horizontally
        cell.innerHTML = " " + (i + 1) + ": Skilt: " + signId + " ";
    }
}
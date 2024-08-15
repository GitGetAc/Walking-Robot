// retrieve canvas object
const canvas = document.getElementById("main-screen-id");

// build 2D graphics context
const ctx = canvas.getContext("2d");

// background vars
var backgroundImage = new Image();
backgroundImage.src = "./images/DungeonTopView_03.png";

// sprite sheet for actual Sprite() object
var skelsSpriteSheet = new Image();
skelsSpriteSheet.src = "./images/Skeletons_56x72_RLUD_03.png";

// bitmap for gate overhang on the top of everything
var gateOverhangImage = new Image();
gateOverhangImage.src = "./images/DungeonBridgeOverhang_02.png";

function DrawBitmapFromSpriteSheet(cellX, cellY, borderWidth, spriteWidth, spriteHeight, spriteImageSheet, x, y) {
    // draw an image to the canvas from the sprite sheet
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    var offsetX = (cellX + 1) * borderWidth + cellX * spriteWidth;
    var offsetY = (cellY + 1) * borderWidth + cellY * spriteHeight;

    ctx.drawImage(
        spriteImageSheet,
        offsetX,
        offsetY,
        spriteWidth,
        spriteHeight,
        Math.floor(x + 0.5),
        Math.floor(y + 0.5),
        spriteWidth,
        spriteHeight
    );
} // end DrawBitmapFromSpriteSheet

// constants for sprite; dead, alive, dying, etc.
const SPRITE_DEAD = 0;
const SPRITE_ALIVE = 1;

// sprite object / constructor
function Sprite(x, y, w, h, xv, yv, state, spriteSheetImage, cx = 0, cy = 0) {
    this.state = state;

    // position
    this.x = x;
    this.y = y;

    // size
    this.w = w;
    this.h = h;

    // velocity
    this.xv = xv;
    this.yv = yv;

    // sprite sheet cell and reference to image
    this.cx = cx;
    this.cy = cy;
    this.spriteSheetImage = spriteSheetImage;

    // an object to hold animations (in the form of named arrays)
    this.animations = {};
    // reference to the current animation to be played and frame
    this.currAnimation = null;
    this.currFrame = 0;

    // how many counts until the frame is updated
    this.frameUpdateCounter = 0;

    // methods

    this.animate = () => {
        // test for valid animation
        if (this.currAnimation) {
            // extract the cellx, celly from the animation record
            // format = { [frames per animation], [ counts per frame ],
            //            [ cx0,cy0)], [cx1,cy1]...[cxn, cyn] }
            this.cx = this.currAnimation[2 + 2 * this.currFrame];
            this.cy = this.currAnimation[2 + 2 * this.currFrame + 1];

            if (++this.frameUpdateCounter >= this.currAnimation[1]) {
                // reset counter
                this.frameUpdateCounter = 0;
                // update animation frame
                if (++this.currFrame >= this.currAnimation[0]) this.currFrame = 0;
            } // end if
        } // end if animation
    };

    this.draw = () => {
        DrawBitmapFromSpriteSheet(this.cx, this.cy, 1, this.w, this.h, this.spriteSheetImage, this.x, this.y);
    };

    this.move = () => {
        // move the sprite
        this.x += this.xv;
        this.y += this.yv;

        // test boundary conditions (simple wrap around logic...)
        if (this.x > canvas.width) this.x = -this.w;
        else if (this.x < -this.w) this.x = canvas.width;

        if (this.y > canvas.height) this.y = -this.h;
        else if (this.y < -this.h) this.y = canvas.height;
    };
} // end Sprite object

var player = new Sprite(400, 400, 56, 72, 0, 0, SPRITE_ALIVE, skelsSpriteSheet);

// Spritesheet handlig
player.animations.right = [4, 10, 0, 0, 1, 0, 0, 0, 2, 0];
player.animations.left = [4, 10, 0, 2, 1, 2, 0, 2, 2, 2];
player.animations.up = [4, 10, 0, 4, 1, 4, 0, 4, 2, 4];
player.animations.down = [4, 10, 0, 6, 1, 6, 0, 6, 2, 6];

// set initial animation
player.currAnimation = player.animations.down;
player.currFrame = 0;

// globals to track frames and animation help
var counter = 0;
var frameIndex = 0;

function GameUpdateFrame() {
    // erase canvas
    ctx.drawImage(backgroundImage, 0, 0);

    //Keyboard handling
    if (keyState["ArrowRight"]) {
        player.x += 1;
        player.currAnimation = player.animations.right;
        player.animate();
    } else if (keyState["ArrowLeft"]) {
        player.x -= 1;
        player.currAnimation = player.animations.left;
        player.animate();
    }

    if (keyState["ArrowUp"]) {
        player.y -= 1;
        player.currAnimation = player.animations.up;
        player.animate();
    } else if (keyState["ArrowDown"]) {
        player.y += 1;
        player.currAnimation = player.animations.down;
        player.animate();
    }

    // call the move to check for collisions, etc.
    player.move();

    // draw everything
    player.draw();

    // And draw the bridge overhangs on top of every other thing
    ctx.drawImage(gateOverhangImage, 151, 263);
    ctx.drawImage(gateOverhangImage, 549, 263);

    ctx.drawImage(gateOverhangImage, 151, 530);
    ctx.drawImage(gateOverhangImage, 549, 530);

    // draw my text
    ctx.font = "20px 'Consolas'";
    ctx.textAlign = "center";
    ctx.fillStyle = "#80FF80";
    ctx.fillText("The Dungeon", canvas.width / 2, 270);
} // end GameUpdateFrame

// start the animation loop
setInterval(GameUpdateFrame, 16);

// keyboard state array
var keyState = [];

document.addEventListener("keydown", KeyDownHandler);
document.addEventListener("keyup", KeyUpHandler);
//document.addEventListener( "keypress", KeyPressHandler );

function KeyPressHandler(event) {
    // extract event information
    var ctrl = event.ctrlKey;
    var code = event.code;
    var key = event.key;
    console.log(ctrl, code, key);
} // end KeyPressHandler

function KeyDownHandler(event) {
    // extract event information
    var code = event.code;
    var key = event.key;

    // update keyState array
    keyState[code] = true;

    //console.log("keydown", code, key );
} // end KeyDownHandler

function KeyUpHandler(event) {
    // extract event information
    var code = event.code;
    var key = event.key;

    // update keyState array
    keyState[code] = false;

    //console.log( "keyup", code, key );
} // end KeyUpHandler

// update console every 100ms with information about state
window.setInterval(PrintHandler, 100);

function PrintHandler() {
    var controlString = "Keys Pressed: ";

    if (keyState["ControlLeft"]) controlString += "CTRL Left,";
    if (keyState["ControlRight"]) controlString += "CTRL Right,";

    if (keyState["ArrowLeft"]) controlString += "Left,";
    else if (keyState["ArrowRight"]) controlString += "Right,";

    if (keyState["ArrowUp"]) controlString += "Up,";
    else if (keyState["ArrowDown"]) controlString += "Down,";

    if (keyState["Space"]) controlString += "Fire,";

    console.log(controlString);
} // end PrintHandler

function RandomInt(start, end) {
    // generates a random integer number from [start, end] inclusive
    return start + Math.floor(Math.random() * (end - start + 1));
}

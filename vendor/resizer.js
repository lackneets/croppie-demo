"use strict";

function resize(file, max_width, max_height, callback) {
  var fileLoader = new FileReader(),
    canvas = document.createElement('canvas'),
    context = null,
    imageObj = new Image(),
    blob = null;

  //create a hidden canvas object we can use to create the new resized image data
  canvas.id = "hiddenCanvas";
  canvas.width = max_width;
  canvas.height = max_height;
  canvas.style.visibility = "hidden";
  document.body.appendChild(canvas);

  //get the context to use
  context = canvas.getContext('2d');

  // check for an image then
  //trigger the file loader to get the data from the image
  if (file.type.match('image.*')) {
    fileLoader.readAsDataURL(file);
  } else {
    alert('File is not an image');
  }

  // setup the file loader onload function
  // once the file loader has the data it passes it to the
  // image object which, once the image has loaded,
  // triggers the images onload function
  fileLoader.onload = function() {
    var data = this.result;
    imageObj.src = data;
  };

  fileLoader.onabort = function() {
    alert("The upload was aborted.");
  };

  fileLoader.onerror = function() {
    alert("An error occured while reading the file.");
  };

  var stepScale = 0.5;
  var scaleDown = function(image, targetScale) {
    var currentScale;
    currentScale = 1;
    while (currentScale * stepScale > targetScale) {
      currentScale *= stepScale;
      image = stepDown(image);
    }
    return {
      image: image,
      remainingScale: targetScale / currentScale
    };
  };

  var stepDown = function(image) {
    var temp;
    temp = {};
    temp.canvas = document.createElement('canvas');
    temp.ctx = temp.canvas.getContext('2d');
    temp.canvas.width = (image.width * stepScale) + 1;
    temp.canvas.height = (image.height * stepScale) + 1;
    temp.ctx.scale(stepScale, stepScale);
    temp.ctx.drawImage(image, 0, 0);
    return temp.canvas;
  };


  // set up the images onload function which clears the hidden canvas context,
  // draws the new image then gets the blob data from it
  imageObj.onload = function() {

    // Check for empty images
    if (this.width == 0 || this.height == 0) {
      alert('Image is empty');
    } else {

      var targetScale = Math.min(Math.min(max_width / this.width, 1), Math.min(max_height / this.height, 1));

      var scaledData = scaleDown(imageObj, targetScale);

      canvas.width = this.width * targetScale;
      canvas.height = this.height * targetScale;

      context.scale(scaledData.remainingScale, scaledData.remainingScale);
      context.drawImage(scaledData.image, 0, 0);

      var dataURL = canvas.toDataURL('image/jpeg', 0.7);
      // callback(dataURL);

      if (EXIF && EXIF.getData) {
        EXIF.getData(imageObj, function() {
          callback(dataURL, EXIF.getTag(this, "Orientation") || 1);
        });
      } else {
        callback(dataURL);
      }


    }
  };

  imageObj.onabort = function() {
    alert("Image load was aborted.");
  };

  imageObj.onerror = function() {
    alert("An error occured while loading image.");
  };
}

function resizeImage(image, callback) {

  var img = document.createElement("img");
  var canvas = document.createElement("canvas");
  img.src = image;
  img.onload = function() {
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var MAX_WIDTH = 800;
    var MAX_HEIGHT = 800;
    var width = img.width;
    var height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    // return canvas.toDataURL("image/png");

    if (EXIF && EXIF.getData) {
      EXIF.getData(img, function() {
        // console.log(EXIF.pretty(this))
        callback(canvas.toDataURL("image/png"), EXIF.getTag(this, "Orientation") || 1);
      });
    } else {
      callback(canvas.toDataURL("image/png"));
    }


  }
  // var reader = new FileReader();
  // reader.onload = function(e) {img.src = e.target.result}
  // reader.readAsDataURL(file);
}
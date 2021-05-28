// To avoid race problem, the following should not be in window.onload as the PaperScript might run before.
window.globals = {}
window.globals.deflate = function() {
  console.log('Deflate function not set in PaperScript yet');
};
window.globals.resetDeflation = function() {
  console.log('Reset deflation function not set in PaperScript yet');
};
window.globals.setZoom = function() {
  console.log('Set zoom function not set in PaperScript yet');
};
window.globals.zoomFactor = 1;
window.globals.dragType = 'dragTiling';

// Update the path from the JavaScript code.
window.onload = function() {
  // Show Modal
  $('#infoModal').modal(options={})

  var scaleFactor = 1.1;

  var clamp = function(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  var zoom = function(clicks){
        var factor = Math.pow(scaleFactor,clicks);
        window.globals.zoomFactor *= factor;
        window.globals.zoomFactor = clamp(window.globals.zoomFactor, 0.85, 5);
        console.log(window.globals.zoomFactor);
        window.globals.setZoom();
      }

var handleScroll = function(evt){
          var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
          if (delta) zoom(delta);
          return evt.preventDefault() && false;
      };

  canvas.addEventListener('DOMMouseScroll',handleScroll,false);
  canvas.addEventListener('mousewheel',handleScroll,false);
}

let deflationLevel = 1;
const deflate = function() {

  document.getElementById('deflate-info-alert').style.display = 'none';

  if(deflationLevel < 9) {
   deflationLevel++;
   document.getElementById('loading-spinner').style.display = 'inline-block';
   requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.globals.deflate();
      document.getElementById("loading-spinner").style.display = "none";
    });
  });     
  } else {
    document.getElementById('deflate-info-alert').innerHTML = 'Max tiling level reached';
    document.getElementById('deflate-info-alert').style.display = 'inline-block';

    setTimeout( () => {
      document.getElementById('deflate-info-alert').style.display = 'none'; 
    }, 2000);
  }
}

const inflate = function() {
  document.getElementById('deflate-info-alert').style.display = 'none';

  if(deflationLevel > 1) {
   deflationLevel--;
   document.getElementById('loading-spinner').style.display = 'inline-block';
   requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.globals.resetDeflation();
      for(let i = 0; i < deflationLevel; i++) {
        window.globals.deflate();
      }
      document.getElementById("loading-spinner").style.display = "none";
    });
  });     
  } else {
    document.getElementById('deflate-info-alert').innerHTML = 'Min tiling level reached';
    document.getElementById('deflate-info-alert').style.display = 'inline-block';

    setTimeout( () => {
      document.getElementById('deflate-info-alert').style.display = 'none'; 
    }, 2000);
  }
}

const setLargeRhombusColor = function(color) {
  window.globals.penroseLargeRhombusColor = color;
  reset();
}

const setSmallRhombusColor = function(color) {
  window.globals.penroseSmallRhombusColor = color;
  reset();
}

const reset = function() {
  console.log('We here');
  document.getElementById('loading-spinner').style.display = 'inline-block';
  requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    window.globals.resetDeflation();
    for(let i = 0; i < deflationLevel; i++) {
      window.globals.deflate();
    }
    document.getElementById("loading-spinner").style.display = "none";
  });
});
}

const toggleDrag = function() {
  const dragIcon = document.getElementById('dragIcon');
  console.log(dragIcon.classList);
  dragIcon.classList.toggle("fa-hand-rock");
  dragIcon.classList.toggle("fa-arrows-alt"); 
  window.globals.dragType = window.globals.dragType === 'dragTiling' ? 'paneWindow' : 'dragTiling';
}

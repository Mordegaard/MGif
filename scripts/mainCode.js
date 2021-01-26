function getRand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function id(node) {
  return document.getElementById(node);
}
function cl(node) {
  return document.getElementsByClassName(node);
}

window.onload = function() {
  var selectedFrame = null;
  id("sectionOverflow").addEventListener("mouseenter",function(){
    id("frameInfo").style.visibility = "hidden";
  });
  var gif = new SuperGif({
    gif: id("gif"),
    auto_play: 0,
  });
  gif.load(function(){
	   console.log('gif is loaded. Number of frames: ' + gif.get_length());
     var addBlock = document.createElement('div');
     addBlock.classList.add("add-frame-btn");
     addBlock.innerHTML = `<div class="flexed">+</div>`;
     id("frames").append(addBlock);
     for (var i=0; i<gif.get_length(); i++) {
       var img = new Image();
       img.setAttribute('id', 'frame'+i);
       img.classList.add("frame-thumbnail");
       gif.move_to(i);
       img.src = gif.get_canvas().toDataURL();
       var imgCont = document.createElement('div');
       imgCont.classList.add("frame");
       imgCont.innerHTML = `
        <div class="frame-overflow flexed">Кадр #${i+1}</div>
       `;
       imgCont.prepend(img);
       id("frames").append(imgCont);
       var addBlock = document.createElement('div');
       addBlock.classList.add("add-frame-btn");
       addBlock.innerHTML = `<div class="flexed">+</div>`;
       id("frames").append(addBlock);
     }
     [].forEach.call(cl("frame-thumbnail"), function(el, ind){
       el.addEventListener("mouseover", function(){
         id("frameNumber").innerText = "Кадр #"+(ind+1);
         id("bigFrameThumbnail").src = this.src;
         var bl = id("frameInfo");
         bl.style.visibility = "visible";
         bl.style.top = this.getBoundingClientRect().top + 'px';
         bl.style.left = this.getBoundingClientRect().left + 'px';
       });
     });
	});

  function generateGif() {
    console.log("Gif generation started");
    var delay = gif.get_delays()[0];
    if (delay < 50) {delay = 50; console.log("Delay is too small. Delay changed to "+delay+"ms");}
    var canv = document.createElement('canvas');
    var c = canv.getContext('2d');
    canv.width = gif.get_canvas().width;
    canv.height = gif.get_canvas().height;
    var encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(delay);
    encoder.start();
    [].forEach.call(id("frames").getElementsByClassName("frame-thumbnail"), function(el,ind){
      c.clearRect(0,0,canv.width,canv.height);
      c.drawImage(el,0,0);
      encoder.addFrame(c);
    });
    encoder.finish();
    encoder.download("MGif.gif");
    console.log("Gif generation has finished");
  }

}

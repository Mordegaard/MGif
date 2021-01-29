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
function toggleVisible(block) {
  if ( block.classList.contains("visible") ) {block.classList.remove("visible"); return false;}
  else {block.classList.add("visible"); return true;}
}
function openOverflowBox(name) {
  toggleVisible(id("overflowContainer"));
  var block = id("overflow");
  for (var i=0; i<block.children.length; i++) block.children[i].style.display = "none";
  id(name).style.display = "flex";
}

Element.prototype.reset = function() {
  if (this.type == "file") {
    var par = this.parentElement;
    par.classList.remove("selected");
    par.getElementsByTagName("span")[0].innerText = this.getAttribute("title");
  }
}

window.onload = function() {
  var frame = {
    selectedFrame: null,
    initialFrameCount: null,
    totalFrameCount: null,
    initialWidth: null,
    initialHeight: null,
    width: null,
    height: null,
  }
  var isDeleting = false;
  id("sectionOverflow").addEventListener("mouseenter",function(){
    id("frameInfo").style.visibility = "hidden";
  });
  var gif = new SuperGif({
    gif: id("gif"),
    auto_play: 0,
  });
  gif.load(gifCallback);

  Image.prototype.download = function() {
    var canv = document.createElement('canvas');
    var c = canv.getContext('2d');
    canv.width = gif.get_canvas().width;
    canv.height = gif.get_canvas().height;
    c.drawImage(this, 0, 0);
    var link = document.createElement('a');
    link.download = this.getAttribute('id') + ".png";
    link.href = canv.toDataURL();
    link.click();
  }

  function generateGif() {
    console.log("Gif generation started");
    var delay = id("gifDelay").value;
    var mDelay = id("gifDelay").getAttribute("min");
    if (delay < mDelay) {delay = mDelay; console.log("Delay is too small. Delay changed to "+delay+"ms");}
    var canv = document.createElement('canvas');
    var c = canv.getContext('2d');
    canv.width = frame.width;
    canv.height = frame.height;
    var encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(delay);
    encoder.start();
    [].forEach.call(id("frames").getElementsByClassName("frame-thumbnail"), function(el,ind){
      c.clearRect(0,0,canv.width,canv.height);
      c.drawImage(el,0,0,canv.width,canv.height);
      encoder.addFrame(c);
    });
    encoder.finish();
    encoder.download("MGif.gif");
    console.log("Gif generation has finished");
  }

  [].forEach.call([id("uploadImageInput"), id("uploadGifInput"), id("uploadSequenceInput")], function(el){
    el.addEventListener("input", function(e){
      var par = this.parentElement;
      par.classList.add("selected");
      if (!el.getAttribute("multiple")) par.getElementsByTagName("span")[0].innerText = this.files[0].name;
      else par.getElementsByTagName("span")[0].innerText = "Выбрано " + this.files.length + " кадров";
    });
  });

  id("overflowDark").addEventListener("click", function(){
    [].forEach.call(this.parentElement.getElementsByTagName('input'), (el) => {
      el.value = "";
      el.reset();
    });
    toggleVisible(this.parentElement);
  });

  id("frames").parentElement.addEventListener("wheel", function(event) {
      this.scrollLeft += (event.deltaY * 3);
      event.preventDefault();
   });

   id("deleteFrame").addEventListener("click", function(){
     isDeleting = true;
     id("frameInfo").style.visibility = "hidden";
     var fr = cl("frame")[frame.selectedFrame];
     cl("add-frame-btn")[frame.selectedFrame].remove();
     fr.classList.add("removed");
     fr.style.marginLeft = "-" + gif.get_canvas().width / gif.get_canvas().height * fr.offsetHeight + 'px';
     setTimeout(()=>{fr.remove(); isDeleting = false;},250);
   });

   id("downloadFrame").addEventListener("click", function(){
     cl("frame")[frame.selectedFrame].getElementsByTagName('img')[0].download();
   });

   id("uploadGifInput").addEventListener("input", function(e){
     var file = this.files[0];
     if (file.type == "image/gif") {
       var img = new Image();
       var reader = new FileReader();
       reader.onload = function() {
         img.onload = () => {
           if (cl("jsgif")[0]) cl("jsgif")[0].remove();
           id("frames").innerHTML = "";
           cl("main")[0].prepend(img);
           gif = new SuperGif({
             gif: img,
             auto_play: 0,
           });
           gif.load(gifCallback);
         }
         img.src = reader.result;
       }
       reader.readAsDataURL(file);
     } else {
       alert("Выбранный файл — не gif-изображение");
       this.value = "";
       this.reset();
     }
   });

   id("uploadSequenceInput").addEventListener("input", function(e){
     var err = false;
     var w = null, h = null;
     var canv = document.createElement('canvas');
     var c = canv.getContext('2d');
     if (!this.files.length) return;
     [].forEach.call(this.files, (el) => {
       if (el.type != "image/png" && el.type != "image/jpeg") {
         alert("Поддерживаются лишь изображения формата PNG и JPEG");
         err = true;
         throw "Only PNG and JPEG images are supported";
       }
     });
     if (err) return;
     if (cl("jsgif")[0]) cl("jsgif")[0].remove();
     id("frames").innerHTML = "";
     var addBlock = document.createElement('div');
     addBlock.classList.add("add-frame-btn");
     addBlock.innerHTML = `<div class="flexed">+</div>`;
     id("frames").append(addBlock);
     [].forEach.call(this.files, (el,ind,arr) => {
       var img = new Image();
       var reader = new FileReader();
       reader.onload = function() {
         img.onload = () => {
           if (w === null && h === null) {
             w = img.width; h = img.height;
             canv.width = w; canv.height = h;
             frame.width = w; frame.height = h;
           }
           if (img.width != w || img.height != h) {
             c.clearRect(0,0,w,h);
             c.drawImage(img,0,0,w,h);
             img.src = canv.toDataURL();
             return;
           }
           img.setAttribute('id', 'frame'+ind);
           img.classList.add("frame-thumbnail");
           var imgCont = document.createElement('div');
           imgCont.classList.add("frame");
           imgCont.innerHTML = `
            <div class="frame-overflow flexed">Кадр #${ind+1}</div>
           `;
           imgCont.prepend(img);
           id("frames").append(imgCont);
           var addBlock = document.createElement('div');
           addBlock.classList.add("add-frame-btn");
           addBlock.innerHTML = `<div class="flexed">+</div>`;
           id("frames").append(addBlock);
           img.addEventListener("mouseover", function(){
             if (!isDeleting) {
               id("frameNumber").innerText = "Кадр #"+(ind+1);
               id("bigFrameThumbnail").src = this.src;
               var bl = id("frameInfo");
               bl.style.visibility = "visible";
               bl.style.top = this.getBoundingClientRect().top + 'px';
               bl.style.left = this.getBoundingClientRect().left + 'px';
               frame.selectedFrame = [].indexOf.call(arr, this);
             }
           });
         }
         img.src = reader.result;
       }
       reader.readAsDataURL(el);
     });
     console.log("frames sequences are loaded. Number of frames: " + this.files.length);
   });

   id("downloadGif").addEventListener("click", function() {
     generateGif();
   });

   id("enterURL").addEventListener("click", function() {
     var err = false;
     var url = id("urlGifInput").value;
     var img = new Image();
     img.setAttribute("crossorigin","anonymous");
     img.onload = () => {
       if (cl("jsgif")[0]) cl("jsgif")[0].remove();
       id("frames").innerHTML = "";
       cl("main")[0].prepend(img);
       id("uploadGifInput").parentElement.classList.remove("selected");
       id("uploadGifInput").parentElement.getElementsByTagName("span")[0].innerText = "Выберите файл";
       id("uploadGifInput").value = null;
       gif = new SuperGif({
         gif: img,
         auto_play: 0,
       });
       gif.load(gifCallback);
     }
     img.onerror = () => {
       if (!err) {img.src = "https://cors-anywhere.herokuapp.com/"+url; err = true;}
     }
     img.src = url;
   });

   id("openFrameSequenceContainer").addEventListener("click", function(){
     openOverflowBox("uploadSequenceContainer");
   });

   function gifCallback() {
     console.log('gif is loaded. Number of frames: ' + gif.get_length());
     frame.width = gif.get_canvas().width; frame.height = gif.get_canvas().height;
     var mDelay = id("gifDelay").getAttribute("min");
     gif.get_delays[0] >= mDelay ? id("gifDelay").value = gif.get_delays[0] : id("gifDelay").value = mDelay;
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
     [].forEach.call(cl("frame-thumbnail"), function(el,ind,arr){
       el.addEventListener("mouseover", function(){
         if (!isDeleting) {
           id("frameNumber").innerText = "Кадр #"+(ind+1);
           id("bigFrameThumbnail").src = this.src;
           var bl = id("frameInfo");
           bl.style.visibility = "visible";
           bl.style.top = this.getBoundingClientRect().top + 'px';
           bl.style.left = this.getBoundingClientRect().left + 'px';
           frame.selectedFrame = [].indexOf.call(arr, this);
         }
       });
     });
     [].forEach.call(cl("add-frame-btn"), function(el, ind){
       el.addEventListener("click", function(){
         openOverflowBox("uploadImageContainer");
       });
     });
   }

}

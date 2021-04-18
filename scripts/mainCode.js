var frame = {
  selectedFrame: null,
  selectedBtn: null,
  initialFrameCount: null,
  totalFrameCount: null,
  width: null,
  height: null,
};
var dragged = null;

function openOverflowBox(name) {
  id("overflowContainer").classList.add('visible');
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

Image.prototype.download = function() {
  var canv = document.createElement('canvas');
  var c = canv.getContext('2d');
  canv.width = frame.width;
  canv.height = frame.height;
  c.drawImage(this, 0, 0);
  var link = document.createElement('a');
  link.download = "frame" + (frame.selectedFrame+1) + ".png";
  link.href = canv.toDataURL();
  link.click();
}

window.onload = function() {
  var isDeleting = false;
  id("sectionOverflow").addEventListener("mouseenter",function(){
    id("frameInfo").style.visibility = "hidden";
  });
  var gif = null;

  function updateInfoText() {
    id("gifInfo").innerText = `Текущее количество кадров: ${frame.totalFrameCount} • Начальное количество кадров: ${frame.initialFrameCount} • Начальная ширина: ${frame.width} • Начальная высота: ${frame.height}`;
  }

  function toastMsg(str) {
    var msg = document.createElement('div');
    msg.classList.add("toast");
    msg.innerText = str;
    id("toastContainer").prepend(msg);
    setTimeout(() => {
      msg.remove();
    }, 3000);
  }

  function frameThumbnailEvent() {
    if (!isDeleting) {
      frame.selectedFrame = [].indexOf.call(cl("frame-thumbnail"), this);
      id("frameNumber").innerText = "Кадр #"+(frame.selectedFrame+1);
      this.parentElement.getElementsByClassName("frame-overflow")[0].innerText = "Кадр #"+(frame.selectedFrame+1);
      id("bigFrameThumbnail").src = this.src;
      var bl = id("frameInfo");
      var sizes = this.getBoundingClientRect()
      bl.style.visibility = "visible";
      bl.style.top = sizes.top + 'px';
      let left = sizes.left + sizes.width/2 - bl.offsetWidth / 2;
      console.log(left + bl.offsetWidth, window.innerWidth);
      if (left < 0) left = 0;
      else if (left + bl.offsetWidth > window.innerWidth) left = window.innerWidth - bl.offsetWidth;
      bl.style.left = left + 'px';
    }
  }

  function addBlockEvent() {
    frame.selectedBtn = [].indexOf.call(cl("add-frame-btn"), this);
    openOverflowBox("uploadImageContainer");
  }

  function imageDragStartEvent(event) {
    event.currentTarget.classList.add('draggable');
    dragged = event.currentTarget;
  }
  function imageDropEvent(event) {
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.classList.remove('draggable');
    dragged.classList.remove('draggable');
    if (dragged != event.currentTarget) {
      var img1 = dragged.children[0], img2 = event.currentTarget.children[0];
      dragged.append(img2); event.currentTarget.append(img1);
    }
  }
  function imageDragOverEvent(event) {
    event.preventDefault();
  }
  function imageDragEndEvent(event) {
    event.currentTarget.classList.remove('draggable');
  }

  function createFrame(src, pos=undefined) {
    var img = new Image();
    img.classList.add("frame-thumbnail");
    img.src = src;
    img.addEventListener("mouseover", frameThumbnailEvent);
    var imgCont = document.createElement('div');
    imgCont.classList.add("frame");
    imgCont.innerHTML = `
     <div class="frame-overflow flexed"></div>
    `;
    imgCont.prepend(img);
    var addBlock = document.createElement('div');
    addBlock.classList.add("add-frame-btn");
    addBlock.innerHTML = `<div class="flexed">+</div>`;
    addBlock.addEventListener("click", addBlockEvent);
    if (pos === undefined || pos > frame.totalFrameCount) {
      id("frames").append(imgCont);
      id("frames").append(addBlock);
    }
    else {
      var fr = cl("frame")[frame.selectedBtn];
      id("frames").insertBefore(imgCont, fr);
      id("frames").insertBefore(addBlock, fr);
    }
  }

  function generateGif() {
    console.log("Gif generation started");
    var delay = parseInt(id("gifDelay").value), w = id("gifWidth").value, h = id("gifHeight").value;
    var mDelay = id("gifDelay").getAttribute("min"), mWidth = id("gifWidth").getAttribute("min"), mHeight = id("gifHeight").getAttribute("min");
    if (delay < mDelay) {delay = mDelay; console.log("Delay is too small. Delay changed to "+delay+"ms");}
    if (w < mWidth) {w = mWidth; console.log("Width is too small. Width changed to "+w+"px");}
    if (h < mHeight) {h = mHeight; console.log("Height is too small. Height changed to "+h+"px");}
    var canv = document.createElement('canvas');
    var c = canv.getContext('2d');
    cl("main")[0].prepend(canv);
    canv.width = w;
    canv.height = h;
    var encoder = new GIFEncoder();
    encoder.setTransparent(0xffffff);
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
    id("sequences").innerHTML = "";
    this.parentElement.changeVisible();
  });

  id("frames").addEventListener("wheel", function(event) {
      this.scrollLeft += (event.deltaY * 3);
      event.preventDefault();
   });

   id("deleteFrame").addEventListener("click", function(){
     isDeleting = true;
     id("frameInfo").style.visibility = "hidden";
     var fr = cl("frame")[frame.selectedFrame];
     cl("add-frame-btn")[frame.selectedFrame].remove();
     fr.classList.add("removed");
     fr.style.marginLeft = "-" + frame.width / frame.height * fr.offsetHeight + 'px';
     setTimeout(()=>{fr.remove(); frame.totalFrameCount--; updateInfoText(); isDeleting = false;},250);
   });

   id("downloadFrame").addEventListener("click", function(){
     cl("frame")[frame.selectedFrame].getElementsByTagName('img')[0].download();
   });

   id("uploadImageInput").addEventListener("input", function(e){
     var file = this.files[0];
     if (file.type != "image/png" && file.type != "image/jpeg") {
       toastMsg("Поддерживаются лишь изображения формата PNG и JPEG");
       return;
     }
     var reader = new FileReader();
     reader.onload = function() {
       var img = new Image();
       img.onload = function() {
         if (img.width != frame.width || img.height != frame.height) {
           var canv = document.createElement('canvas');
           var c = canv.getContext('2d');
           canv.width = frame.width; canv.height = frame.height;
           c.drawImage(img,0,0,canv.width,canv.height);
           img.src = canv.toDataURL();
           return;
         }
         createFrame(img.src, frame.selectedBtn);
         frame.totalFrameCount++;
         updateInfoText();
         id("uploadImageInput").value = "";
         id("overflowContainer").changeVisible();
       }
       img.src = reader.result;
     }
     reader.readAsDataURL(file);
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
       toastMsg("Выбранный файл — не gif-изображение");
       this.value = "";
       this.reset();
     }
   });

   id("uploadSequenceInput").addEventListener("input", function(e){
     var err = false;
     if (!this.files.length) return;
     [].forEach.call(this.files, (el) => {
       if (el.type != "image/png" && el.type != "image/jpeg") {
         toastMsg("Поддерживаются лишь изображения формата PNG и JPEG");
         err = true;
         throw "Only PNG and JPEG images are supported";
       }
     });
     if (err) return;
     [].forEach.call(this.files, (el,ind,arr) => {
       var img = new Image();
       var reader = new FileReader();
       reader.onload = function() {
         img.onload = () => {
           var container = document.createElement('div');
           container.append(img);
           container.setAttribute("id", "frame"+ind);
           container.setAttribute("draggable", "true");
           container.addEventListener("dragover", imageDragOverEvent);
           container.addEventListener("dragstart", imageDragStartEvent);
           container.addEventListener("dragend", imageDragEndEvent);
           container.addEventListener("drop", imageDropEvent);
           id("sequences").append(container);
           if (ind == arr.length - 1) openOverflowBox("selectSequenceContainer");
         }
         img.src = reader.result;
       }
       reader.readAsDataURL(el);
     });
     console.log("frames sequences are loaded. Number of frames: " + this.files.length);
   });

   id("applySequences").addEventListener("click", function() {
     var canv = document.createElement('canvas');
     var c = canv.getContext('2d');
     if (cl("jsgif")[0]) cl("jsgif")[0].remove();
     id("frames").innerHTML = "";
     var addBlock = document.createElement('div');
     addBlock.classList.add("add-frame-btn");
     addBlock.innerHTML = `<div class="flexed">+</div>`;
     addBlock.addEventListener("click", addBlockEvent);
     id("frames").append(addBlock);
     frames = id("sequences").getElementsByTagName("img");
     var w = frames[0].naturalWidth, h = frames[0].naturalHeight;
     canv.width = w; canv.height = h;
     [].forEach.call(frames, function(img, ind){
       if (img.width != w || img.height != h) {
         c.clearRect(0,0,w,h);
         c.drawImage(img,0,0,w,h);
         createFrame(canv.toDataURL());
       } else createFrame(img.src);
     });
     frame.totalFrameCount = frames.length;
     frame.initialFrameCount = frame.totalFrameCount;
     frame.width = w; frame.height = h;
     id("gifWidth").value = frame.width; id("gifHeight").value = frame.height;
     updateInfoText();
     id("overflowContainer").changeVisible();
   });

   id("downloadGif").addEventListener("click", function() {
     generateGif();
   });

   id("enterGifURL").addEventListener("click", function() {
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
       if (!err) {img.src = "https://rocky-retreat-60875.herokuapp.com/"+url; err = true;}
       else {toastMsg("Ошибка при загрузке гифки")}
     }
     img.src = url;
   });

   id("openFrameSequenceContainer").addEventListener("click", function(){
     openOverflowBox("uploadSequenceContainer");
   });

   id("toLeftFrame").addEventListener("click", function(){
     if (frame.selectedFrame > 0) {
       var btn = cl("add-frame-btn")[frame.selectedFrame+1];
       var th = cl("frame")[frame.selectedFrame];
       var prev = cl("frame")[frame.selectedFrame-1];
       var par = th.parentElement;
       th.classList.add("to-left");
       prev.classList.add("to-right");
       setTimeout(()=>{
         th.classList.remove("to-left");
         prev.classList.remove("to-right");
         par.insertBefore(th, prev);
         par.insertBefore(prev, btn);
         id("bigFrameThumbnail").src = cl("frame-thumbnail")[frame.selectedFrame].src;
       }, 250);
     }
   });

   id("toRightFrame").addEventListener("click", function(){
     if (frame.selectedFrame < frame.totalFrameCount-1) {
       var btn = cl("add-frame-btn")[frame.selectedFrame+2];
       var th = cl("frame")[frame.selectedFrame];
       var next = cl("frame")[frame.selectedFrame+1];
       var par = th.parentElement;
       th.classList.add("to-right");
       next.classList.add("to-left");
       setTimeout(()=>{
         th.classList.remove("to-right");
         next.classList.remove("to-left");
         par.insertBefore(next, th);
         par.insertBefore(th, btn);
         id("bigFrameThumbnail").src = cl("frame-thumbnail")[frame.selectedFrame].src;
       }, 250);
     }
   });

   function gifCallback() {
     console.log('gif is loaded. Number of frames: ' + gif.get_length());
     frame.width = gif.get_canvas().width; frame.height = gif.get_canvas().height;
     frame.totalFrameCount = gif.get_length();
     frame.initialFrameCount = frame.totalFrameCount;
     id("gifWidth").value = frame.width; id("gifHeight").value = frame.height;
     var mDelay = id("gifDelay").getAttribute("min");
     gif.get_delays[0] >= mDelay ? id("gifDelay").value = gif.get_delays[0] : id("gifDelay").value = mDelay;
     var addBlock = document.createElement('div');
     addBlock.classList.add("add-frame-btn");
     addBlock.innerHTML = `<div class="flexed">+</div>`;
     addBlock.addEventListener("click", addBlockEvent);
     id("frames").append(addBlock);
     for (var i=0; i<gif.get_length(); i++) {
       gif.move_to(i);
       createFrame(gif.get_canvas().toDataURL());
     }
     updateInfoText();
   }

}

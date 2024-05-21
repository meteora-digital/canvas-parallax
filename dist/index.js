var t={d:(e,i)=>{for(var s in i)t.o(i,s)&&!t.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:i[s]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{c:()=>i});class i{constructor(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.settings={alpha:!1,depth:50,preload:!0,throttle:100,precision:5};for(const e in this.settings)Object.hasOwnProperty.call(this.settings,e)&&t[e]&&(this.settings[e]=t[e]);this.canvas=new h,this.buffer=new h,this.image=null,this.timeouts={},this.calculations={},this.events={},this.cache={scrollY:-1,static:!1,canvasOffset:0},this.ResizeObserver=new ResizeObserver((()=>{this.resize()})),this.IntersectionObserver=new IntersectionObserver((t=>{t.forEach((t=>{t.isIntersecting&&this.resize()}))})),this.ResizeObserver.observe(this.canvas.element),this.IntersectionObserver.observe(this.canvas.element),this.status={active:!1,loaded:!1,depth:this.settings.depth,initialized:!1,view:{top:0,bottom:0}},this.enable(),this.start()}enable(){this.cache.scrollY=-1}load(){let t=arguments.length>0&&void 0!==arguments[0]&&arguments[0],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"50% 50%";const i=new Image;this.status.loaded=!1;const h=()=>{this.status.loaded=!0,this.image=new s(i,{focus:e,depth:this.settings.depth}),this.resize(),this.enable(),this.draw(),clearTimeout(this.timeouts.loaded),this.timeouts.loaded=setTimeout((()=>{this.canvas.element.classList.contains("loaded")||this.canvas.element.classList.add("loaded")}),100)};if(i.complete&&i.src?h():i.addEventListener("load",h),t instanceof Element){const e=t.getAttribute("viewBox"),s=t.getAttribute("width")||e?e.split(" ")[2]:1,h=t.getAttribute("height")||e?e.split(" ")[3]:1;t.setAttribute("width",s),t.setAttribute("height",h),t.setAttribute("viewBox","0 0 ".concat(s," ").concat(h)),i.width=parseInt(s)+"px",i.height=parseInt(h)+"px",i.src="data:image/svg+xml;base64,"+btoa(t.outerHTML),t.parentElement.removeChild(t)}else i.src=t}calculateScrollPercent(){const t=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:0)+window.innerHeight-this.canvas.pageYOffset,e=this.settings.precision,i=.5*e;return(2*(t/((window.innerHeight+this.canvas.element.clientHeight)/e)-i)/e).toFixed(e)}getScrollPercentages(){if(this.calculations={},this.status.initialized||this.settings.preload){const t=this.canvas.pageYOffset-window.innerHeight,e=t+this.canvas.element.clientHeight+window.innerHeight;for(let i=t;i<e;i++)this.calculations[i]=this.calculateScrollPercent(i),this.image&&this.image.parallax(this.calculations[i],{width:this.canvas.element.clientWidth,height:this.canvas.element.clientHeight});this.status.initialized=!0}}getScrollPercent(){const t=Math.round(window.scrollY);return this.calculations[t]||(this.calculations[t]=this.calculateScrollPercent(t)),this.calculations[t]}draw(){if(this.image&&window.scrollY+window.innerHeight>this.status.view.top&&window.scrollY<this.status.view.bottom){const t=this.getScrollPercent();this.settings.alpha&&(this.buffer.ctx.clearRect(0,0,this.buffer.element.width,this.buffer.element.height),this.canvas.ctx.clearRect(0,0,this.canvas.element.width,this.canvas.element.height));try{let e=this.image.parallax(t,{width:this.canvas.element.clientWidth,height:this.canvas.element.clientHeight});this.buffer.ctx.drawImage(this.image.canvas.element,e.x,e.y)}catch(t){}try{this.canvas.ctx.drawImage(this.buffer.element,0,0),this.callback("draw")}catch(t){}}}update(){window.requestAnimationFrame((()=>{this.update(),this.cache.scrollY!=window.scrollY&&(this.cache.scrollY=window.scrollY,this.draw())}))}start(){window.requestAnimationFrame((()=>{this.status.loaded?this.update():this.start()}))}resize(){clearTimeout(this.timeouts.resize),this.timeouts.resize=setTimeout((()=>{this.canvas.resize(this.canvas.element.clientWidth,this.canvas.element.clientHeight),this.buffer.resize(this.canvas.element.clientWidth,this.canvas.element.clientHeight),this.image&&this.image.resize(this.canvas.element.clientWidth,this.canvas.element.clientHeight),this.status.view.top=this.canvas.pageYOffset,this.status.view.bottom=this.canvas.pageYOffset+this.canvas.element.clientHeight,this.cache.canvasOffset=this.canvas.pageYOffset,this.enable(),this.calculations={},this.getScrollPercentages(),this.callback("resize")}),this.settings.throttle)}callback(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this.events[t]&&this.events[t].forEach((t=>t(e)))}on(t,e){t&&"on"!=t&&"callback"!=t&&this[t]&&e&&"function"==typeof e&&(null==this.events[t]&&(this.events[t]=[]),this.events[t].push(e))}}class s{constructor(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.image=t,this.depth=e.depth||50,this.focus=e.focus||"50% 50%",this.canvas=new h,this.height=0,this.width=0,this.calculations={};let i=[];this.focus.split(" ").forEach((t=>{t.indexOf("%")>-1&&(t=parseFloat(t)/100,i.push(Math.abs(t)))}));let s=i[0],a=i[1]||i[0];this.focus={x:s,y:a}}resize(t,e){this.calculations={};let i=e*(2*this.depth/100);this.canvas.resize(t,e+i),this.width=this.canvas.element.width,this.height=this.canvas.element.height,this.draw()}draw(){let t,e,i=this.width/this.height;this.image.naturalWidth/this.image.naturalHeight>i?(t=this.image.naturalWidth*(this.height/this.image.naturalHeight),e=this.height):(t=this.width,e=this.image.naturalHeight*(this.width/this.image.naturalWidth));let s=(this.width-t)*this.focus.x,h=(this.height-e)*this.focus.y;this.canvas.ctx.drawImage(this.image,s,h,t,e)}parallax(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!this.calculations[t]){let i={x:(e.width-this.width)/2,y:(e.height-this.height)/2},s=e.height*(this.depth/100)*t,h={x:i.x,y:i.y+s};this.calculations[t]=h}return this.calculations[t]}}class h{constructor(){this.element=document.createElement("canvas"),this.ctx=this.element.getContext("2d"),this.pageYOffset=0}resize(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,i=0,s=this.element;for(;s;)i+=s.offsetTop,s=s.offsetParent;this.element.width=t,this.element.height=e,this.pageYOffset=i}}var a=e.c;export{a as default};
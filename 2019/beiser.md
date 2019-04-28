```html
  <!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Get Cubic Bezier Curve</title>
	<style>
		body{
			margin: 0;
			text-align: center;
			font-family: 'Courier'
		}
	</style>
</head>
<body>
	<canvas width="600" height="600">Your browser doesn't support canvas.</canvas>
	<br>
	change stroke speed:<input type="range" id='tRange' min="1" max="20">
	<button id="redraw" disabled>Redraw</button><br>
	you can refresh current page to change the points' position
	<script>
		var oCanvas = document.querySelector('canvas');
		var oRange = document.querySelector('#tRange');
		var redraw = document.querySelector('#redraw');

		window.requesetAnimFrame = function () {
			return window.requesetAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (fn) {
					window.setTimeout(fn, 1000/60);
				};
		}();

		var ctx = oCanvas.getContext('2d');
		ctx.font = '12px Courier'

		class DotSet{
			constructor(){
				this.dots = [];
			}

			addDot(dotObject){
				this.dots.push(dotObject);
			}

			_linkAll(){

				if( this.dots.length < 2 ) return;

				ctx.beginPath();

				this.dots.reduce(function(former,latter){

					if( former ){
						ctx.moveTo(former.x,former.y);
					}

					ctx.lineTo(latter.x,latter.y);
				})

				ctx.strokeStyle = 'rgba(12,32,21,0.2)'
				ctx.stroke();

			}

			_fillDot(color){

				this.dots.forEach(function({x,y},index){
					ctx.beginPath();
					ctx.arc(x,y,2,0,2*Math.PI,false);
					ctx.fillStyle = color;
					ctx.fill();
				})

			}

			_mark(mark,color){
				this.dots.forEach(function(dot,index){
					ctx.beginPath();
					ctx.fillStyle = color;
					ctx.fillText(mark + index,dot.x,dot.y)
				})
			}

			draw(mark='dot',color="grey"){
				ctx.beginPath();

				this._mark(mark,color);
				this._linkAll();
				this._fillDot(color);
			}
		}

		var P = new DotSet();
		var t = 0;
		var tSpeed = 0.005;

		oRange.value = tSpeed*1000;

		oRange.oninput = function(){
			tSpeed = oRange.value/1000;
		}

		var area = ([
			{x:rnd(100,300),y:rnd(100,300)},
			{x:rnd(300,600),y:rnd(100,300)},
			{x:rnd(100,300),y:rnd(300,600)},
			{x:rnd(300,600),y:rnd(300,600)}
		]).sort(function(){ return Math.random() - 0.5 });

		for( var i = 0; i< 4; i++ ){
			P.addDot(area[i])
		}

		function draw(){

			redraw.setAttribute('disabled','1');

			var Q = new DotSet();
				Q.addDot(getTDot(P.dots[0],P.dots[1]));
				Q.addDot(getTDot(P.dots[1],P.dots[2]));
				Q.addDot(getTDot(P.dots[2],P.dots[3]));

			var A = new DotSet();
				A.addDot(getTDot(Q.dots[0],Q.dots[1]));
				A.addDot(getTDot(Q.dots[1],Q.dots[2]));

			var B = new DotSet();
				B.addDot(getTDot(A.dots[0],A.dots[1]));

			ctx.clearRect(0,0,oCanvas.width,oCanvas.height)
			ctx.beginPath();

			P.draw('P');
			Q.draw('Q');
			A.draw('A');
			B.draw('B','#50E3C2');

			ctx.beginPath();
			ctx.moveTo(P.dots[0].x,P.dots[0].y)
			ctx.bezierCurveTo(
				Q.dots[0].x,Q.dots[0].y,
				A.dots[0].x,A.dots[0].y,
				B.dots[0].x,B.dots[0].y
			)

			ctx.strokeStyle = '#50E3C2';
			ctx.stroke();

			t += tSpeed;
			if( t <= 1 + tSpeed ){
				requestAnimationFrame(draw);
			} else {
				redraw.removeAttribute('disabled');
			}
		}

		draw();

		redraw.onclick = function(){
			t=0;
			draw();
		}

		function rnd(n,m){
			return parseInt(Math.random()*(m-n)+n);
		}

		function getTDot(P1,P2){
			return {
				x : P1.x + ( P2.x - P1.x ) * t,
				y : P1.y + ( P2.y - P1.y ) * t
			}
		}
	</script>
</body>
</html>

```

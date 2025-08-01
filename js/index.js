function animationTimeline() {
    console.log("animationTimeline dipanggil");
    // Di sini kamu bisa menambahkan kode untuk memulai animasi utama
    // Misalnya, kamu bisa memanggil S.init() di sini jika itu bagian dari alur animasimu
}

function startHeartAnimation() {
    console.log("startHeartAnimation dipanggil");
    // Kode untuk animasi hati, jika ada
    // S.isAnimationComplete = true; // Jika ini memang untuk menandai animasi hati selesai
}


window.addEventListener("load", () => {
    Swal.fire({
        title: "Mau lagu latar? Biar gagal lo ada soundtrack-nya!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
    }).then((result) => {
        if (result.isConfirmed) {
            const song = document.querySelector(".song");
            if (song) {
                song.play().catch(error => {
                    console.error("Error saat memutar lagu:", error);
                    Swal.fire("Oops!", "Gagal memutar lagu. Browser mungkin memblokir autoplay atau file tidak ditemukan.", "error");
                });
            } else {
                console.warn("Elemen audio dengan kelas 'song' tidak ditemukan.");
            }
            animationTimeline(); // Panggil fungsi ini setelah opsi musik
        } else {
            animationTimeline(); // Panggil fungsi ini meskipun musik tidak diputar
        }
    });
});

// Pastikan kode S.init(), S.Drawing, dll. ada di file JS ini
// Contoh:
var S = {
    init: function () {
        // ... (seluruh kode inisialisasi S) ...
        S.Drawing.init('.canvas'); // Inisialisasi canvas utama
        document.body.classList.add('body--ready');

        var action = window.location.href,
            i = action.indexOf('?a=');
        if (i !== -1) {
            S.UI.simulate(decodeURI(action).substring(i + 3));
        } else {
            S.UI.simulate("|#countdown 3||You|Are|My|Love||#rectangle|");
        }

        S.isAnimationComplete = false; // Add a flag to track animation completion

        S.Drawing.loop(function () {
            S.Shape.render();
            if (S.isAnimationComplete) {
                startHeartAnimation();
            }
        });
    }
};


S.Drawing = (function () {
  var canvas,
    context,
    renderFn
  requestFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  return {
    init: function (el) {
      canvas = document.querySelector(el);
      context = canvas.getContext('2d');
      this.adjustCanvas();

      window.addEventListener('resize', function (e) {
        S.Drawing.adjustCanvas();
      });
    },

    loop: function (fn) {
      renderFn = !renderFn ? fn : renderFn;
      this.clearFrame();
      renderFn();
      requestFrame.call(window, this.loop.bind(this));
    },

    adjustCanvas: function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    },

    clearFrame: function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
    },

    getArea: function () {
      return { w: canvas.width, h: canvas.height };
    },

    drawCircle: function (p, c) {
      context.fillStyle = c.render();
      context.beginPath();
      context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
      context.closePath();
      context.fill();
    }
  }
}());


S.UI = (function () {
  var canvas = document.querySelector('.canvas'),
    interval,
    isTouch = false, //('ontouchstart' in window || navigator.msMaxTouchPoints),
    currentAction,
    resizeTimer,
    time,
    maxShapeSize = 30,
    firstAction = true,
    sequence = [],
    cmd = '#';

  function formatTime(date) {
    var h = date.getHours(),
      m = date.getMinutes(),
      m = m < 10 ? '0' + m : m;
    return h + ':' + m;
  }

  function getValue(value) {
    return value && value.split(' ')[1];
  }

  function getAction(value) {
    value = value && value.split(' ')[0];
    return value && value[0] === cmd && value.substring(1);
  }

  function timedAction(fn, delay, max, reverse) {
    clearInterval(interval);
    currentAction = reverse ? max : 1;
    fn(currentAction);

    if (!max || (!reverse && currentAction < max) || (reverse && currentAction > 0)) {
      interval = setInterval(function () {
        currentAction = reverse ? currentAction - 1 : currentAction + 1;
        fn(currentAction);

        if ((!reverse && max && currentAction === max) || (reverse && currentAction === 0)) {
          clearInterval(interval);
        }
      }, delay);
    }
  }

  function reset(destroy) {
    clearInterval(interval);
    sequence = [];
    time = null;
    destroy && S.Shape.switchShape(S.ShapeBuilder.letter(''));
  }

  function performAction(value) {
    var action,
      value,
      current;

    // overlay.classList.remove('overlay--visible');
    sequence = typeof (value) === 'object' ? value : sequence.concat(value.split('|'));
    // input.value = '';
    // checkInputWidth();

    timedAction(function (index) {
      current = sequence.shift();
      action = getAction(current);
      value = getValue(current);

      switch (action) {
        case 'countdown':
          value = parseInt(value) || 10;
          value = value > 0 ? value : 10;

          timedAction(function (index) {
            if (index === 0) {
              if (sequence.length === 0) {
                S.Shape.switchShape(S.ShapeBuilder.letter(''));
              } else {
                performAction(sequence);
              }
            } else {
              S.Shape.switchShape(S.ShapeBuilder.letter(index), true);
            }
          }, 1000, value, true);
          break;

        case 'rectangle':
          value = value && value.split('x');
          value = (value && value.length === 2) ? value : [maxShapeSize, maxShapeSize / 2];

          S.Shape.switchShape(S.ShapeBuilder.rectangle(Math.min(maxShapeSize, parseInt(value[0])), Math.min(maxShapeSize, parseInt(value[1]))));

          break;

        case 'circle':
          value = parseInt(value) || maxShapeSize;
          value = Math.min(value, maxShapeSize);
          S.Shape.switchShape(S.ShapeBuilder.circle(value));
          break;

        case 'time':
          var t = formatTime(new Date());

          if (sequence.length > 0) {
            S.Shape.switchShape(S.ShapeBuilder.letter(t));
          } else {
            timedAction(function () {
              t = formatTime(new Date());
              if (t !== time) {
                time = t;
                S.Shape.switchShape(S.ShapeBuilder.letter(time));
              }
            }, 1000);
          }
          break;

        default:
          S.Shape.switchShape(S.ShapeBuilder.letter(current[0] === cmd ? 'What?' : current));
      }
    }, 2000, sequence.length);
  }

  function checkInputWidth(e) {
    if (input.value.length > 18) {
      ui.classList.add('ui--wide');
    } else {
      ui.classList.remove('ui--wide');
    }

    if (firstAction && input.value.length > 0) {
      ui.classList.add('ui--enter');
    } else {
      ui.classList.remove('ui--enter');
    }
  }

  function bindEvents() {
    document.body.addEventListener('keydown', function (e) {
      input.focus();

      if (e.keyCode === 13) {
        firstAction = false;
        reset();
        performAction(input.value);
      }
    });

    // input.addEventListener('input', checkInputWidth);
    // input.addEventListener('change', checkInputWidth);
    // input.addEventListener('focus', checkInputWidth);

    // help.addEventListener('click', function (e) {
    //   overlay.classList.toggle('overlay--visible');
    //   overlay.classList.contains('overlay--visible') && reset(true);
    // });

    // commands.addEventListener('click', function (e) {
    //   var el,
    //       info,
    //       demo,
    //       tab,
    //       active,
    //       url;
    //
    //   if (e.target.classList.contains('commands-item')) {
    //     el = e.target;
    //   } else {
    //     el = e.target.parentNode.classList.contains('commands-item') ? e.target.parentNode : e.target.parentNode.parentNode;
    //   }
    //
    //   info = el && el.querySelector('.commands-item-info');
    //   demo = el && info.getAttribute('data-demo');
    //   url = el && info.getAttribute('data-url');
    //
    //   if (info) {
    //     overlay.classList.remove('overlay--visible');
    //
    //     if (demo) {
    //       input.value = demo;
    //
    //       if (isTouch) {
    //         reset();
    //         performAction(input.value);
    //       } else {
    //         input.focus();
    //       }
    //     } else if (url) {
    //       //window.location = url;
    //     }
    //   }
    // });

    canvas.addEventListener('click', function (e) {
      overlay.classList.remove('overlay--visible');
    });
  }

  function init() {
    bindEvents();
    // input.focus();
    isTouch && document.body.classList.add('touch');
  }

  // Init
  init();

  return {
    simulate: function (action) {
      performAction(action);
    }
  }
}());


S.UI.Tabs = (function () {
  var tabs = document.querySelector('.tabs'),
    labels = document.querySelector('.tabs-labels'),
    triggers = document.querySelectorAll('.tabs-label'),
    panels = document.querySelectorAll('.tabs-panel');

  function activate(i) {
    triggers[i].classList.add('tabs-label--active');
    panels[i].classList.add('tabs-panel--active');
  }

  function bindEvents() {
    labels.addEventListener('click', function (e) {
      var el = e.target,
        index;

      if (el.classList.contains('tabs-label')) {
        for (var t = 0; t < triggers.length; t++) {
          triggers[t].classList.remove('tabs-label--active');
          panels[t].classList.remove('tabs-panel--active');

          if (el === triggers[t]) {
            index = t;
          }
        }

        activate(index);
      }
    });
  }

  function init() {
    activate(0);
    bindEvents();
  }

  // Init
  init();
}());


S.Point = function (args) {
  this.x = args.x;
  this.y = args.y;
  this.z = args.z;
  this.a = args.a;
  this.h = args.h;
};


S.Color = function (r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

S.Color.prototype = {
  render: function () {
    return 'rgba(' + this.r + ',' + + this.g + ',' + this.b + ',' + this.a + ')';
  }
};


S.Dot = function (x, y) {
  this.p = new S.Point({
    x: x,
    y: y,
    z: 5,
    a: 1,
    h: 0
  });

  this.e = 0.07;
  this.s = true;

  this.c = new S.Color(255, 255, 255, this.p.a);

  this.t = this.clone();
  this.q = [];
};

S.Dot.prototype = {
  clone: function () {
    return new S.Point({
      x: this.x,
      y: this.y,
      z: this.z,
      a: this.a,
      h: this.h
    });
  },

  _draw: function () {
    this.c.a = this.p.a;
    S.Drawing.drawCircle(this.p, this.c);
  },

  _moveTowards: function (n) {
    var details = this.distanceTo(n, true),
      dx = details[0],
      dy = details[1],
      d = details[2],
      e = this.e * d;

    if (this.p.h === -1) {
      this.p.x = n.x;
      this.p.y = n.y;
      return true;
    }

    if (d > 1) {
      this.p.x -= ((dx / d) * e);
      this.p.y -= ((dy / d) * e);
    } else {
      if (this.p.h > 0) {
        this.p.h--;
      } else {
        return true;
      }
    }

    return false;
  },

  _update: function () {
    if (this._moveTowards(this.t)) {
      var p = this.q.shift();

      if (p) {
        this.t.x = p.x || this.p.x;
        this.t.y = p.y || this.p.y;
        this.t.z = p.z || this.p.z;
        this.t.a = p.a || this.p.a;
        this.p.h = p.h || 0;
      } else {
        if (this.s) {
          this.p.x -= Math.sin(Math.random() * 3.142);
          this.p.y -= Math.sin(Math.random() * 3.142);
        } else {
          this.move(new S.Point({
            x: this.p.x + (Math.random() * 50) - 25,
            y: this.p.y + (Math.random() * 50) - 25,
          }));
        }
      }
    }

    d = this.p.a - this.t.a;
    this.p.a = Math.max(0.1, this.p.a - (d * 0.05));
    d = this.p.z - this.t.z;
    this.p.z = Math.max(1, this.p.z - (d * 0.05));
  },

  distanceTo: function (n, details) {
    var dx = this.p.x - n.x,
      dy = this.p.y - n.y,
      d = Math.sqrt(dx * dx + dy * dy);

    return details ? [dx, dy, d] : d;
  },

  move: function (p, avoidStatic) {
    if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
      this.q.push(p);
    }
  },

  render: function () {
    this._update();
    this._draw();
  }
}


S.ShapeBuilder = (function () {
  var gap = 13,
    shapeCanvas = document.createElement('canvas'),
    shapeContext = shapeCanvas.getContext('2d'),
    fontSize = 500,
    fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';

  function fit() {
    shapeCanvas.width = Math.floor(window.innerWidth / gap) * gap;
    shapeCanvas.height = Math.floor(window.innerHeight / gap) * gap;
    shapeContext.fillStyle = 'red';
    shapeContext.textBaseline = 'middle';
    shapeContext.textAlign = 'center';
  }

  function processCanvas() {
    var pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data;
    dots = [],
      pixels,
      x = 0,
      y = 0,
      fx = shapeCanvas.width,
      fy = shapeCanvas.height,
      w = 0,
      h = 0;

    for (var p = 0; p < pixels.length; p += (4 * gap)) {
      if (pixels[p + 3] > 0) {
        dots.push(new S.Point({
          x: x,
          y: y
        }));

        w = x > w ? x : w;
        h = y > h ? y : h;
        fx = x < fx ? x : fx;
        fy = y < fy ? y : fy;
      }

      x += gap;

      if (x >= shapeCanvas.width) {
        x = 0;
        y += gap;
        p += gap * 4 * shapeCanvas.width;
      }
    }

    return { dots: dots, w: w + fx, h: h + fy };
  }

  function setFontSize(s) {
    shapeContext.font = 'bold ' + s + 'px ' + fontFamily;
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function init() {
    fit();
    window.addEventListener('resize', fit);
  }

  // Init
  init();

  return {
    imageFile: function (url, callback) {
      var image = new Image(),
        a = S.Drawing.getArea();

      image.onload = function () {
        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        shapeContext.drawImage(this, 0, 0, a.h * 0.6, a.h * 0.6);
        callback(processCanvas());
      };

      image.onerror = function () {
        callback(S.ShapeBuilder.letter('What?'));
      }

      image.src = url;
    },

    circle: function (d) {
      var r = Math.max(0, d) / 2;
      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
      shapeContext.beginPath();
      shapeContext.arc(r * gap, r * gap, r * gap, 0, 2 * Math.PI, false);
      shapeContext.fill();
      shapeContext.closePath();

      return processCanvas();
    },

    letter: function (l) {
      var s = 0;

      setFontSize(fontSize);
      s = Math.min(fontSize,
        (shapeCanvas.width / shapeContext.measureText(l).width) * 0.8 * fontSize,
        (shapeCanvas.height / fontSize) * (isNumber(l) ? 1 : 0.45) * fontSize);
      setFontSize(s);

      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
      shapeContext.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2);

      return processCanvas();
    },

    rectangle: function (w, h) {

      var elements = document.getElementsByClassName('namebox');
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.opacity = 1; // Set opacity to 100%
      }
      var settings = {
        particles: {
          length: 500, // maximum amount of particles
          duration: 2, // particle duration in sec
          velocity: 100, // particle velocity in pixels/sec
          effect: -0.75, // play with this for a nice effect
          size: 30, // particle size in pixels
        },
      };
      (
        function () {
          var b = 0;
          var c = ["ms", "moz", "webkit", "o"];
          for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
            window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
            window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"]
          }
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (h, e) {
              var d = new Date().getTime();
              var f = Math.max(0, 16 - (d - b));
              var g = window.setTimeout(function () { h(d + f) }, f); b = d + f; return g
            }
          } if (!window.cancelAnimationFrame) { window.cancelAnimationFrame = function (d) { clearTimeout(d) } }
        }());
      var Point = (function () {
        function Point(x, y) {
          this.x = (typeof x !== 'undefined') ? x : 0;
          this.y = (typeof y !== 'undefined') ? y : 0;
        }
        Point.prototype.clone = function () {
          return new Point(this.x, this.y);
        };
        Point.prototype.length = function (length) {
          if (typeof length == 'undefined')
            return Math.sqrt(this.x * this.x + this.y * this.y);
          this.normalize();
          this.x *= length;
          this.y *= length;
          return this;
        };

        Point.prototype.normalize = function () {
          var length = this.length();
          this.x /= length;
          this.y /= length;
          return this;
        };
        return Point;
      })();

      var Particle = (function () {
        function Particle() {
          this.position = new Point();
          this.velocity = new Point();
          this.acceleration = new Point();
          this.age = 0;
        }
        Particle.prototype.initialize = function (x, y, dx, dy) {
          this.position.x = x;
          this.position.y = y;
          this.velocity.x = dx;
          this.velocity.y = dy;
          this.acceleration.x = dx * settings.particles.effect;
          this.acceleration.y = dy * settings.particles.effect;
          this.age = 0;
        };
        Particle.prototype.update = function (deltaTime) {
          this.position.x += this.velocity.x * deltaTime;
          this.position.y += this.velocity.y * deltaTime;
          this.velocity.x += this.acceleration.x * deltaTime;
          this.velocity.y += this.acceleration.y * deltaTime;
          this.age += deltaTime;
        };

        Particle.prototype.draw = function (context, image) {
          function ease(t) {
            return (--t) * t * t + 1;
          }
          var size = image.width * ease(this.age / settings.particles.duration);
          context.globalAlpha = 1 - this.age / settings.particles.duration;
          context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
        };
        return Particle;
      })();
      /*
      
      * ParticlePool class
      
      */
      var ParticlePool = (function () {
        var particles,
          firstActive = 0,
          firstFree = 0,
          duration = settings.particles.duration;
        function ParticlePool(length) {
          // create and populate particle pool
          particles = new Array(length);
          for (var i = 0; i < particles.length; i++)
            particles[i] = new Particle();
        }
        ParticlePool.prototype.add = function (x, y, dx, dy) {
          particles[firstFree].initialize(x, y, dx, dy);
          // handle circular queue
          firstFree++;
          if (firstFree == particles.length) firstFree = 0;
          if (firstActive == firstFree) firstActive++;
          if (firstActive == particles.length) firstActive = 0;
        };
        ParticlePool.prototype.update = function (deltaTime) {
          var i;
          // update active particles
          if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
              particles[i].update(deltaTime);
          }
          if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
              particles[i].update(deltaTime);
            for (i = 0; i < firstFree; i++)
              particles[i].update(deltaTime);
          }
          // remove inactive particles
          while (particles[firstActive].age >= duration && firstActive != firstFree) {
            firstActive++;
            if (firstActive == particles.length) firstActive = 0;
          }
        };
        ParticlePool.prototype.draw = function (context, image) {
          // draw active particles
          if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
              particles[i].draw(context, image);
          }
          if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
              particles[i].draw(context, image);
            for (i = 0; i < firstFree; i++)
              particles[i].draw(context, image);
          }
        };
        return ParticlePool;
      })();
      /*
      
      * Putting it all together
      
      */
      (function (canvas) {
        var context = canvas.getContext('2d'),
          particles = new ParticlePool(settings.particles.length),
          particleRate = settings.particles.length / settings.particles.duration, // particles/sec
          time;
        // get point on heart with -PI <= t <= PI
        function pointOnHeart(t) {
          return new Point(
            160 * Math.pow(Math.sin(t), 3),
            130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
          );

        }

        // creating the particle image using a dummy canvas

        var image = (function () {
          var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
          canvas.width = settings.particles.size;
          canvas.height = settings.particles.size;
          // helper function to create the path
          function to(t) {
            var point = pointOnHeart(t);
            point.x = settings.particles.size / 2 + point.x * settings.particles.size / 350;
            point.y = settings.particles.size / 2 - point.y * settings.particles.size / 350;
            return point;
          }
          // create the path
          context.beginPath();
          var t = -Math.PI;
          var point = to(t);
          context.moveTo(point.x, point.y);
          while (t < Math.PI) {
            t += 0.01; // baby steps!
            point = to(t);
            context.lineTo(point.x, point.y);
          }
          context.closePath();
          // create the fill
          context.fillStyle = '#ff30c5';
          // context.fillStyle = '#ea80b0';
          context.fill();
          // create the image
          var image = new Image();
          image.src = canvas.toDataURL();
          return image;
        })();
        // render that thing!
        function render() {
          // next animation frame
          requestAnimationFrame(render);
          // update time
          var newTime = new Date().getTime() / 1000,
            deltaTime = newTime - (time || newTime);
          time = newTime;
          // clear canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          // create new particles
          var amount = particleRate * deltaTime;
          for (var i = 0; i < amount; i++) {
            var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
            var dir = pos.clone().length(settings.particles.velocity);
            particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
          }
          // update and draw particles
          particles.update(deltaTime);
          particles.draw(context, image);
        }
        // handle (re-)sizing of the canvas
        function onResize() {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
        window.onresize = onResize;
        // delay rendering bootstrap
        setTimeout(function () {
          onResize();
          render();
        }, 10);
      })(document.getElementById('pinkboard'));

    }
  };
}());


S.Shape = (function () {
  var dots = [],
    width = 0,
    height = 0,
    cx = 0,
    cy = 0;

  function compensate() {
    var a = S.Drawing.getArea();

    cx = a.w / 2 - width / 2;
    cy = a.h / 2 - height / 2;
  }

  return {
    shuffleIdle: function () {
      var a = S.Drawing.getArea();

      for (var d = 0; d < dots.length; d++) {
        if (!dots[d].s) {
          dots[d].move({
            x: Math.random() * a.w,
            y: Math.random() * a.h
          });
        }
      }
    },

    switchShape: function (n, fast) {
      var size,
        a = S.Drawing.getArea();

      width = n.w;
      height = n.h;

      compensate();

      if (n.dots.length > dots.length) {
        size = n.dots.length - dots.length;
        for (var d = 1; d <= size; d++) {
          dots.push(new S.Dot(a.w / 2, a.h / 2));
        }
      }

      var d = 0,
        i = 0;

      while (n.dots.length > 0) {
        i = Math.floor(Math.random() * n.dots.length);
        dots[d].e = fast ? 0.25 : (dots[d].s ? 0.14 : 0.11);

        if (dots[d].s) {
          dots[d].move(new S.Point({
            z: Math.random() * 20 + 10,
            a: Math.random(),
            h: 18
          }));
        } else {
          dots[d].move(new S.Point({
            z: Math.random() * 5 + 5,
            h: fast ? 18 : 30
          }));
        }

        dots[d].s = true;
        dots[d].move(new S.Point({
          x: n.dots[i].x + cx,
          y: n.dots[i].y + cy,
          a: 1,
          z: 5,
          h: 0
        }));

        n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1));
        d++;
      }

      for (var i = d; i < dots.length; i++) {
        if (dots[i].s) {
          dots[i].move(new S.Point({
            z: Math.random() * 20 + 10,
            a: Math.random(),
            h: 20
          }));

          dots[i].s = false;
          dots[i].e = 0.04;
          dots[i].move(new S.Point({
            x: Math.random() * a.w,
            y: Math.random() * a.h,
            a: 0.3, //.4
            z: Math.random() * 4,
            h: 0
          }));
        }
      }
    },

    render: function () {
      for (var d = 0; d < dots.length; d++) {
        dots[d].render();
      }
    }
  }
}());


S.init();
